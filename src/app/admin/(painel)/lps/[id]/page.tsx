import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import LpForm, { type LpValues } from "../LpForm";
import { deleteLp, duplicateLp } from "../actions";

export default async function EditLp({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ salvo?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { salvo } = await searchParams;
  const sql = await db();
  const [lp] = await sql<LpValues[]>`
    SELECT id, title, slug, html, status, noindex, isolated, notes FROM landing_pages WHERE id = ${Number(id) || 0}`;
  if (!lp) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/lps" className="underline">← Landing pages</Link>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl">{lp.title}</h1>
        <div className="flex flex-wrap gap-2">
          <a href={`/lp/${lp.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
            {lp.status === "no_ar" ? "Abrir LP" : "Pré-visualizar"}
          </a>
          <form action={duplicateLp}>
            <input type="hidden" name="id" value={lp.id} />
            <button className="btn btn-ghost">Duplicar</button>
          </form>
          <form action={deleteLp}>
            <input type="hidden" name="id" value={lp.id} />
            <button className="btn btn-ghost">Excluir</button>
          </form>
        </div>
      </div>
      {salvo && <p className="card font-bold" role="status">LP salva.</p>}
      <p className="text-sm">
        Link para anúncios: <code className="rounded bg-white px-1">/lp/{lp.slug}</code> (use o domínio do site antes, ex.: https://seudominio.com.br/lp/{lp.slug})
      </p>
      <LpForm lp={lp} />
    </div>
  );
}
