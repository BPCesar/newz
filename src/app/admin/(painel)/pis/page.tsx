import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { brl, brDate, PI_STATUS } from "@/lib/pi";

type Row = { id: number; number: string; status: string; advertiser: string; vehicle: string; campaign: string; gross: string; net: string; due_date: string | null };

export default async function Pis({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  await requireAdmin();
  const { status = "", q = "" } = await searchParams;
  const sql = await db();
  const like = `%${q}%`;
  const rows = await sql<Row[]>`
    SELECT id, number, status, advertiser, vehicle, campaign, gross, net, to_char(due_date, 'YYYY-MM-DD') AS due_date
    FROM pis
    WHERE (${status} = '' OR status = ${status})
      AND (${q} = '' OR advertiser ILIKE ${like} OR vehicle ILIKE ${like} OR campaign ILIKE ${like} OR number ILIKE ${like})
    ORDER BY created_at DESC LIMIT 300`;
  const totalNet = rows.reduce((a, r) => a + Number(r.net), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl">Pedidos de Inserção (PI)</h1>
        <Link href="/admin/pis/novo" className="btn btn-orange">Novo PI</Link>
      </div>
      <form className="flex flex-wrap items-end gap-3">
        <div>
          <label className="label" htmlFor="q">Buscar</label>
          <input id="q" name="q" defaultValue={q} className="input" placeholder="Anunciante, veículo, nº..." />
        </div>
        <div>
          <label className="label" htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={status} className="input">
            <option value="">Todos</option>
            {PI_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button className="btn">Filtrar</button>
      </form>
      <div className="card overflow-x-auto">
        {rows.length === 0 ? (
          <p>Nenhum PI encontrado.</p>
        ) : (
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-navy/20 uppercase tracking-wider">
                <th className="py-2">Nº</th><th>Anunciante</th><th>Veículo</th><th>Campanha</th><th>Bruto neg.</th><th>Líquido</th><th>Vencimento</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-navy/10">
                  <td className="py-2 font-bold"><Link href={`/admin/pis/${r.id}`} className="underline">{r.number}</Link></td>
                  <td>{r.advertiser}</td><td>{r.vehicle}</td><td>{r.campaign}</td>
                  <td>{brl(Number(r.gross))}</td><td>{brl(Number(r.net))}</td><td>{brDate(r.due_date || "")}</td>
                  <td><span className="rounded bg-paper px-2 py-1 font-bold">{r.status}</span></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr><td colSpan={5} className="py-2 text-right font-bold">Total líquido listado</td><td className="font-bold">{brl(totalNet)}</td><td colSpan={2}></td></tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}
