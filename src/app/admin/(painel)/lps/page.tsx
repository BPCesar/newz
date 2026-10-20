import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { toggleLpStatus } from "./actions";

export default async function Lps() {
  await requireAdmin();
  const sql = await db();
  const lps = await sql<{ id: number; title: string; slug: string; status: string; noindex: boolean; updated: string }[]>`
    SELECT id, title, slug, status, noindex, to_char(updated_at AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI') AS updated
    FROM landing_pages ORDER BY updated_at DESC`;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl">Landing pages</h1>
        <Link href="/admin/lps/nova" className="btn btn-orange">Criar LP</Link>
      </div>
      <p className="max-w-2xl">
        <b>Rascunho</b>: só você vê (visitantes recebem “não encontrada”). <b>No ar</b>: qualquer pessoa com o link acessa, ideal para anúncios.
        LPs nunca aparecem no menu do site.
      </p>
      <div className="card overflow-x-auto">
        {lps.length === 0 ? (
          <p>Nenhuma LP ainda. Clique em “Criar LP” e cole o código.</p>
        ) : (
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-navy/20 text-sm uppercase tracking-wider">
                <th className="py-2">Nome</th>
                <th>Endereço</th>
                <th>Status</th>
                <th>Google</th>
                <th>Atualizada</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {lps.map((lp) => (
                <tr key={lp.id} className="border-b border-navy/10">
                  <td className="py-3 font-bold">
                    <Link href={`/admin/lps/${lp.id}`} className="underline">{lp.title}</Link>
                  </td>
                  <td>
                    <a href={`/lp/${lp.slug}`} target="_blank" rel="noopener noreferrer" className="underline">/lp/{lp.slug}</a>
                  </td>
                  <td>
                    <form action={toggleLpStatus}>
                      <input type="hidden" name="id" value={lp.id} />
                      <button className={`btn min-w-28 ${lp.status === "no_ar" ? "btn-orange" : "btn-ghost"}`}>
                        {lp.status === "no_ar" ? "No ar" : "Rascunho"}
                      </button>
                    </form>
                  </td>
                  <td className="text-sm">{lp.noindex ? "Não indexar" : "Indexar"}</td>
                  <td className="text-sm">{lp.updated}</td>
                  <td>
                    <Link href={`/admin/lps/${lp.id}`} className="underline">Editar</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
