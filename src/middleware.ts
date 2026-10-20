import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Primeira barreira: sem sessão válida, /admin manda para o login.
// (Cada página e ação do admin confere a sessão de novo no servidor.)
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin/login")) return NextResponse.next();

  const token = req.cookies.get("newz_admin")?.value;
  const secret = process.env.SESSION_SECRET;
  let ok = false;
  if (token && secret && secret.length >= 32) {
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ["HS256"] });
      ok = payload.role === "admin";
    } catch {
      ok = false;
    }
  }
  if (!ok) return NextResponse.redirect(new URL("/admin/login", req.url));
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
