"use server";

import { redirect } from "next/navigation";
import { checkCredentials, clientIp, createSession, destroySession, isLockedOut } from "@/lib/auth";

export async function login(_prev: string, formData: FormData): Promise<string> {
  const ip = await clientIp();
  if (await isLockedOut(ip)) return "Muitas tentativas erradas. Aguarde 15 minutos e tente de novo.";
  const user = String(formData.get("user") || "").slice(0, 100);
  const password = String(formData.get("password") || "").slice(0, 200);
  const ok = await checkCredentials(user, password, ip);
  if (!ok) {
    await new Promise((r) => setTimeout(r, 600)); // atrasa tentativas automáticas
    return "Usuário ou senha incorretos.";
  }
  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}
