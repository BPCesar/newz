import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, timingSafeEqual } from "crypto";
import { db } from "./db";

export const SESSION_COOKIE = "newz_admin";
const SESSION_HOURS = 12;
const MAX_FAILS = 5; // tentativas erradas
const WINDOW_MIN = 15; // em 15 minutos

function secretKey() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET ausente ou curta (mínimo 32 caracteres)");
  return new TextEncoder().encode(s);
}

function safeEqual(a: string, b: string) {
  // compara os hashes para não vazar tamanho nem tempo
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export async function clientIp() {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "desconhecido").trim();
}

export async function isLockedOut(ip: string) {
  const sql = await db();
  const [row] = await sql<{ fails: number }[]>`
    SELECT COUNT(*)::int AS fails FROM login_attempts
    WHERE ip = ${ip} AND ok = FALSE AND created_at > NOW() - (${WINDOW_MIN} || ' minutes')::interval`;
  return (row?.fails ?? 0) >= MAX_FAILS;
}

export async function checkCredentials(user: string, password: string, ip: string) {
  const expectedUser = process.env.ADMIN_USER || "";
  const expectedPass = process.env.ADMIN_PASSWORD || "";
  if (!expectedUser || !expectedPass) throw new Error("ADMIN_USER/ADMIN_PASSWORD não configurados");
  const ok = safeEqual(user.trim().toUpperCase(), expectedUser.toUpperCase()) && safeEqual(password, expectedPass);
  const sql = await db();
  await sql`INSERT INTO login_attempts (ip, ok) VALUES (${ip}, ${ok})`;
  await sql`DELETE FROM login_attempts WHERE created_at < NOW() - interval '7 days'`;
  return ok;
}

export async function createSession() {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(secretKey());
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function verifyToken(token?: string) {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function isAdmin() {
  const jar = await cookies();
  return verifyToken(jar.get(SESSION_COOKIE)?.value);
}

/** Use no topo de toda página e ação do admin. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
