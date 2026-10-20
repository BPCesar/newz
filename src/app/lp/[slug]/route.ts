import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Lp = { html: string; status: string; noindex: boolean; isolated: boolean; title: string };

const notFound = () =>
  new Response("<!doctype html><meta charset=utf-8><title>Página não encontrada</title><p style='font-family:sans-serif'>Página não encontrada.</p>", {
    status: 404,
    headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex" },
  });

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return notFound();

  const sql = await db();
  const [lp] = await sql<Lp[]>`SELECT html, status, noindex, isolated, title FROM landing_pages WHERE slug = ${slug}`;
  if (!lp) return notFound();

  const admin = await isAdmin();
  const live = lp.status === "no_ar";
  // Rascunho: só o administrador logado vê. Visitantes recebem 404.
  if (!live && !admin) return notFound();

  const headers: Record<string, string> = {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
  };
  if (lp.noindex || !live) headers["X-Robots-Tag"] = "noindex, nofollow";
  // Isolamento: o código da LP roda numa "caixa de areia", sem acesso à sessão do admin.
  // A pré-visualização de rascunho é sempre isolada.
  if (lp.isolated || !live) {
    headers["Content-Security-Policy"] =
      "sandbox allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation allow-modals";
  }

  let html = lp.html || `<!doctype html><meta charset="utf-8"><title>${lp.title}</title><p>LP sem conteúdo.</p>`;
  if (!live && admin) {
    html = html.replace(
      /<body([^>]*)>/i,
      `<body$1><div style="position:sticky;top:0;z-index:2147483647;background:#b8441a;color:#fefdf5;font:700 14px/1.4 sans-serif;padding:8px 12px;text-align:center">RASCUNHO – só você está vendo esta LP</div>`,
    );
  }
  return new Response(html, { status: 200, headers });
}
