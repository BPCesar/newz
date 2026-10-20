"use server";

import { db } from "@/lib/db";
import { clientIp } from "@/lib/auth";

export type ContactState = { ok: boolean; message: string };

export async function sendContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  // campo invisível contra robôs: humanos não preenchem
  if (String(formData.get("website") || "")) return { ok: true, message: "Mensagem enviada. Obrigado!" };

  const get = (k: string, max = 300) => String(formData.get(k) || "").trim().slice(0, max);
  const name = get("name", 120);
  const company = get("company", 160);
  const email = get("email", 160);
  const phone = get("phone", 40);
  const subject = get("subject", 60);
  const message = get("message", 3000);

  if (!name || (!email && !phone)) return { ok: false, message: "Preencha seu nome e um e-mail ou telefone." };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: "E-mail inválido." };

  const sql = await db();
  const ip = await clientIp();
  // limite simples: no máximo 5 envios por IP por hora
  const [{ n }] = await sql<{ n: number }[]>`
    SELECT COUNT(*)::int AS n FROM login_attempts WHERE ip = ${"form:" + ip} AND created_at > NOW() - interval '1 hour'`;
  if (n >= 5) return { ok: false, message: "Muitos envios seguidos. Tente de novo mais tarde ou chame no WhatsApp." };
  await sql`INSERT INTO login_attempts (ip, ok) VALUES (${"form:" + ip}, TRUE)`;

  await sql`
    INSERT INTO contacts (kind, stage, name, company, email, phone, source, message)
    VALUES ('lead', 'novo', ${name}, ${company}, ${email}, ${phone}, ${"Site" + (subject ? " – " + subject : "")}, ${message})`;

  return { ok: true, message: "Mensagem enviada! Retornamos em breve." };
}
