"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export type LpState = { error: string };

function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function saveLp(_prev: LpState, formData: FormData): Promise<LpState> {
  await requireAdmin();
  const id = Number(formData.get("id") || 0);
  const title = String(formData.get("title") || "").trim().slice(0, 200);
  const slug = slugify(String(formData.get("slug") || "") || title);
  const html = String(formData.get("html") || "");
  const status = formData.get("status") === "no_ar" ? "no_ar" : "rascunho";
  const noindex = formData.get("noindex") === "on";
  const isolated = formData.get("isolated") === "on";
  const notes = String(formData.get("notes") || "").slice(0, 5000);

  if (!title) return { error: "Dê um nome para a LP." };
  if (!slug) return { error: "Endereço inválido. Use letras, números e hífen." };
  if (html.length > 2_000_000) return { error: "Código muito grande (máximo 2 MB). Hospede imagens fora e use links." };

  const sql = await db();
  const [clash] = await sql<{ id: number }[]>`SELECT id FROM landing_pages WHERE slug = ${slug} AND id <> ${id}`;
  if (clash) return { error: `Já existe uma LP com o endereço /lp/${slug}.` };

  let savedId = id;
  if (id) {
    await sql`
      UPDATE landing_pages SET title = ${title}, slug = ${slug}, html = ${html}, status = ${status},
        noindex = ${noindex}, isolated = ${isolated}, notes = ${notes}, updated_at = NOW()
      WHERE id = ${id}`;
  } else {
    const [row] = await sql<{ id: number }[]>`
      INSERT INTO landing_pages (title, slug, html, status, noindex, isolated, notes)
      VALUES (${title}, ${slug}, ${html}, ${status}, ${noindex}, ${isolated}, ${notes}) RETURNING id`;
    savedId = row.id;
  }
  revalidatePath("/admin/lps");
  redirect(`/admin/lps/${savedId}?salvo=1`);
}

export async function toggleLpStatus(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id") || 0);
  const sql = await db();
  await sql`UPDATE landing_pages SET status = CASE WHEN status = 'no_ar' THEN 'rascunho' ELSE 'no_ar' END, updated_at = NOW() WHERE id = ${id}`;
  revalidatePath("/admin/lps");
}

export async function deleteLp(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id") || 0);
  const sql = await db();
  await sql`DELETE FROM landing_pages WHERE id = ${id}`;
  revalidatePath("/admin/lps");
  redirect("/admin/lps");
}

export async function duplicateLp(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id") || 0);
  const sql = await db();
  const [lp] = await sql<{ title: string; slug: string; html: string; noindex: boolean; isolated: boolean; notes: string }[]>`
    SELECT title, slug, html, noindex, isolated, notes FROM landing_pages WHERE id = ${id}`;
  if (!lp) redirect("/admin/lps");
  const newSlug = `${lp.slug}-copia-${Date.now().toString(36)}`.slice(0, 80);
  const [row] = await sql<{ id: number }[]>`
    INSERT INTO landing_pages (title, slug, html, status, noindex, isolated, notes)
    VALUES (${lp.title + " (cópia)"}, ${newSlug}, ${lp.html}, 'rascunho', ${lp.noindex}, ${lp.isolated}, ${lp.notes}) RETURNING id`;
  redirect(`/admin/lps/${row.id}`);
}
