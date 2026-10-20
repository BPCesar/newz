import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { STAGES, stageLabel, type Contact } from "@/lib/crm";
import { brl } from "@/lib/pi";
import { moveStage } from "./actions";

export default async function Crm({ searchParams }: { searchParams: Promise<{ tipo?: string; q?: string; ver?: string }> }) {
  await requireAdmin();
  const { tipo = "", q = "", ver = "quadro" } = await searchParams;
  const sql = await db();
  const like = `%${q}%`;
  const rows = await sql<Contact[]>`
    SELECT id, kind, stage, name, company, email, phone, city, segment, source, estimated_value, message,
      to_char(created_at AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY') AS created
    FROM contacts
    WHERE (${tipo} = '' OR kind = ${tipo})
      AND (${q} = '' OR name ILIKE ${like} OR company ILIKE ${like} OR email ILIKE ${like} OR phone ILIKE ${like} OR segment ILIKE ${like})
    ORDER BY updated_at DESC LIMIT 500`;

  const qs = (extra: Record<string, string>) => new URLSearchParams({ tipo, q, ver, ...extra }).toString();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl">CRM</h1>
        <Link href="/admin/crm/novo" className="btn btn-orange">Novo lead / cliente</Link>
      </div>
      <form className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="ver" value={ver} />
        <div>
          <label className="label" htmlFor="q">Buscar</label>
          <input id="q" name="q" defaultValue={q} className="input" placeholder="Nome, empresa, telefone..." />
        </div>
        <div>
          <label className="label" htmlFor="tipo">Tipo</label>
          <select id="tipo" name="tipo" defaultValue={tipo} className="input">
            <option value="">Todos</option>
            <option value="lead">Leads</option>
            <option value="cliente">Clientes</option>
          </select>
        </div>
        <button className="btn">Filtrar</button>
        <div className="ml-auto flex gap-2">
          <Link href={`/admin/crm?${qs({ ver: "quadro" })}`} className={`btn ${ver === "quadro" ? "" : "btn-ghost"}`}>Quadro</Link>
          <Link href={`/admin/crm?${qs({ ver: "lista" })}`} className={`btn ${ver === "lista" ? "" : "btn-ghost"}`}>Lista</Link>
        </div>
      </form>

      {ver === "lista" ? (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-navy/20 uppercase tracking-wider">
                <th className="py-2">Nome</th><th>Empresa</th><th>Tipo</th><th>Etapa</th><th>Telefone</th><th>Valor est.</th><th>Desde</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-b border-navy/10">
                  <td className="py-2 font-bold"><Link href={`/admin/crm/${c.id}`} className="underline">{c.name}</Link></td>
                  <td>{c.company}</td><td>{c.kind}</td><td>{stageLabel(c.stage)}</td><td>{c.phone}</td>
                  <td>{brl(Number(c.estimated_value))}</td><td>{c.created}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map(([key, label]) => {
            const col = rows.filter((c) => c.stage === key);
            const total = col.reduce((a, c) => a + Number(c.estimated_value), 0);
            return (
              <section key={key} className="w-64 shrink-0 rounded-lg bg-white/60 p-3">
                <h2 className="flex justify-between text-sm font-bold uppercase tracking-wider">
                  <span>{label}</span><span>{col.length}</span>
                </h2>
                <p className="mb-3 text-xs">{brl(total)}</p>
                <div className="space-y-3">
                  {col.map((c) => (
                    <article key={c.id} className="card p-3">
                      <Link href={`/admin/crm/${c.id}`} className="font-bold underline">{c.name}</Link>
                      {c.company && <p className="text-sm">{c.company}</p>}
                      <p className="mt-1 text-xs">{c.kind === "cliente" ? "Cliente" : "Lead"} · {c.source || "sem origem"}</p>
                      <form action={moveStage} className="mt-2">
                        <input type="hidden" name="id" value={c.id} />
                        <label className="sr-only" htmlFor={`st-${c.id}`}>Mover etapa</label>
                        <div className="flex gap-1">
                          <select id={`st-${c.id}`} name="stage" defaultValue={c.stage} className="input py-1 text-xs">
                            {STAGES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                          </select>
                          <button className="btn min-h-0 px-2 py-1 text-xs">OK</button>
                        </div>
                      </form>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
