"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { calcPi, sanitizePi } from "@/lib/pi";

export type PiSaveState = { error: string };

async function nextNumber() {
  const sql = await db();
  const year = new Date().getFullYear();
  const [row] = await sql<{ n: number }[]>`
    SELECT COALESCE(MAX(NULLIF(split_part(number, '-', 2), '')::int), 0)::int AS n
    FROM pis WHERE number LIKE ${year + "-%"} AND split_part(number, '-', 2) ~ '^[0-9]+$'`;
  return `${year}-${String((row?.n ?? 0) + 1).padStart(4, "0")}`;
}

export async function savePi(_prev: PiSaveState, formData: FormData): Promise<PiSaveState> {
  await requireAdmin();
  const id = Number(formData.get("id") || 0);
  let parsed: unknown;
  try {
    parsed = JSON.parse(String(formData.get("payload") || "{}"));
  } catch {
    return { error: "Não foi possível ler os dados do PI." };
  }
  const pi = sanitizePi(parsed);
  if (!pi.advertiser) return { error: "Informe o anunciante." };
  if (!pi.vehicle) return { error: "Informe o veículo." };
  if (pi.items.length === 0) return { error: "Inclua ao menos um item de veiculação." };

  const sql = await db();
  if (pi.contactId) {
    const [c] = await sql`SELECT id FROM contacts WHERE id = ${pi.contactId}`;
    if (!c) pi.contactId = null;
  }

  let savedId = id;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (!id || !pi.number) pi.number = pi.number || (await nextNumber());
    const t = calcPi(pi);
    const due = t.dueDate || null;
    try {
      if (id) {
        await sql`
          UPDATE pis SET number = ${pi.number}, status = ${pi.status}, contact_id = ${pi.contactId}, advertiser = ${pi.advertiser},
            vehicle = ${pi.vehicle}, campaign = ${pi.campaign}, gross = ${t.grossNegotiated}, net = ${t.net}, due_date = ${due},
            data = ${sql.json(pi as never)}, updated_at = NOW()
          WHERE id = ${id}`;
      } else {
        const [row] = await sql<{ id: number }[]>`
          INSERT INTO pis (number, status, contact_id, advertiser, vehicle, campaign, gross, net, due_date, data)
          VALUES (${pi.number}, ${pi.status}, ${pi.contactId}, ${pi.advertiser}, ${pi.vehicle}, ${pi.campaign},
            ${t.grossNegotiated}, ${t.net}, ${due}, ${sql.json(pi as never)})
          RETURNING id`;
        savedId = row.id;
      }
      break;
    } catch (e: unknown) {
      const code = (e as { code?: string }).code;
      if (code === "23505") {
        if (id) return { error: `Já existe um PI com o número ${pi.number}.` };
        pi.number = ""; // número repetido: gera o próximo e tenta de novo
        continue;
      }
      throw e;
    }
  }
  revalidatePath("/admin/pis");
  redirect(`/admin/pis/${savedId}?salvo=1`);
}

export async function deletePi(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id") || 0);
  const sql = await db();
  await sql`DELETE FROM pis WHERE id = ${id}`;
  revalidatePath("/admin/pis");
  redirect("/admin/pis");
}

export async function duplicatePi(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id") || 0);
  const sql = await db();
  const [row] = await sql<{ data: Record<string, unknown> }[]>`SELECT data FROM pis WHERE id = ${id}`;
  if (!row) redirect("/admin/pis");
  const pi = sanitizePi({ ...row.data, number: "", status: "rascunho", issueDate: new Date().toISOString().slice(0, 10) });
  pi.number = await nextNumber();
  const t = calcPi(pi);
  const [created] = await sql<{ id: number }[]>`
    INSERT INTO pis (number, status, contact_id, advertiser, vehicle, campaign, gross, net, due_date, data)
    VALUES (${pi.number}, 'rascunho', ${pi.contactId}, ${pi.advertiser}, ${pi.vehicle}, ${pi.campaign},
      ${t.grossNegotiated}, ${t.net}, ${t.dueDate || null}, ${sql.json(pi as never)})
    RETURNING id`;
  redirect(`/admin/pis/${created.id}`);
}

export async function nextPiNumber() {
  await requireAdmin();
  return nextNumber();
}
