"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { STAGES } from "@/lib/crm";

const s = (f: FormData, k: string, max = 300) => String(f.get(k) || "").trim().slice(0, max);

export async function saveContact(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id") || 0);
  const kind = formData.get("kind") === "cliente" ? "cliente" : "lead";
  const stageRaw = s(formData, "stage", 30);
  const stage = STAGES.some(([k]) => k === stageRaw) ? stageRaw : "novo";
  const name = s(formData, "name", 160) || "Sem nome";
  const value = Math.max(0, parseFloat(s(formData, "estimated_value", 30).replace(/\./g, "").replace(",", ".")) || 0);
  const fields = {
    company: s(formData, "company", 160),
    email: s(formData, "email", 160),
    phone: s(formData, "phone", 40),
    city: s(formData, "city", 80),
    segment: s(formData, "segment", 80),
    source: s(formData, "source", 120),
    message: s(formData, "message", 5000),
  };
  const sql = await db();
  let savedId = id;
  if (id) {
    await sql`
      UPDATE contacts SET kind = ${kind}, stage = ${stage}, name = ${name}, company = ${fields.company}, email = ${fields.email},
        phone = ${fields.phone}, city = ${fields.city}, segment = ${fields.segment}, source = ${fields.source},
        estimated_value = ${value}, message = ${fields.message}, updated_at = NOW()
      WHERE id = ${id}`;
  } else {
    const [row] = await sql<{ id: number }[]>`
      INSERT INTO contacts (kind, stage, name, company, email, phone, city, segment, source, estimated_value, message)
      VALUES (${kind}, ${stage}, ${name}, ${fields.company}, ${fields.email}, ${fields.phone}, ${fields.city},
        ${fields.segment}, ${fields.source}, ${value}, ${fields.message})
      RETURNING id`;
    savedId = row.id;
  }
  revalidatePath("/admin/crm");
  redirect(`/admin/crm/${savedId}?salvo=1`);
}

export async function moveStage(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id") || 0);
  const stage = s(formData, "stage", 30);
  if (!STAGES.some(([k]) => k === stage)) return;
  const sql = await db();
  // ao ganhar, o lead vira cliente automaticamente
  await sql`UPDATE contacts SET stage = ${stage}, kind = CASE WHEN ${stage} = 'ganho' THEN 'cliente' ELSE kind END, updated_at = NOW() WHERE id = ${id}`;
  revalidatePath("/admin/crm");
  revalidatePath(`/admin/crm/${id}`);
}

export async function addNote(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id") || 0);
  const body = s(formData, "body", 10000);
  if (!body) return;
  const sql = await db();
  await sql`INSERT INTO contact_notes (contact_id, body) VALUES (${id}, ${body})`;
  await sql`UPDATE contacts SET updated_at = NOW() WHERE id = ${id}`;
  revalidatePath(`/admin/crm/${id}`);
}

export async function deleteNote(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id") || 0);
  const noteId = Number(formData.get("noteId") || 0);
  const sql = await db();
  await sql`DELETE FROM contact_notes WHERE id = ${noteId} AND contact_id = ${id}`;
  revalidatePath(`/admin/crm/${id}`);
}

export async function addLink(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id") || 0);
  let url = s(formData, "url", 2000);
  const label = s(formData, "label", 160);
  if (!url) return;
  if (!/^https?:\/\//i.test(url)) url = "https://" + url; // só links web (bloqueia javascript: etc.)
  try {
    new URL(url);
  } catch {
    return;
  }
  const sql = await db();
  await sql`INSERT INTO contact_links (contact_id, label, url) VALUES (${id}, ${label}, ${url})`;
  revalidatePath(`/admin/crm/${id}`);
}

export async function deleteLink(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id") || 0);
  const linkId = Number(formData.get("linkId") || 0);
  const sql = await db();
  await sql`DELETE FROM contact_links WHERE id = ${linkId} AND contact_id = ${id}`;
  revalidatePath(`/admin/crm/${id}`);
}

export async function deleteContact(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id") || 0);
  const sql = await db();
  await sql`DELETE FROM contacts WHERE id = ${id}`;
  revalidatePath("/admin/crm");
  redirect("/admin/crm");
}
