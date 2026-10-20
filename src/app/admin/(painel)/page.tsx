import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { brl, brDate } from "@/lib/pi";

export default async function Painel() {
  await requireAdmin();
  const sql = await db();
  const [counts] = await sql<{ leads: number; clientes: number; lps: number; pis_abertos: number }[]>`
    SELECT
      (SELECT COUNT(*)::int FROM contacts WHERE kind = 'lead' AND stage NOT IN ('ganho','perdido')) AS leads,
      (SELECT COUNT(*)::int FROM contacts WHERE kind = 'cliente') AS clientes,
      (SELECT COUNT(*)::int FROM landing_pages WHERE status = 'no_ar') AS lps,
      (SELECT COUNT(*)::int FROM pis WHERE status NOT IN ('pago','cancelado')) AS pis_abertos`;
  const vencimentos = await sql<{ id: number; number: string; advertiser: string; net: string; due_date: string | null }[]>`
    SELECT id, number, advertiser, net, to_char(due_date, 'YYYY-MM-DD') AS due_date FROM pis
    WHERE status NOT IN ('pago','cancelado') AND due_date IS NOT NULL
    ORDER BY due_date ASC LIMIT 8`;
  const novosLeads = await sql<{ id: number; name: string; company: string; source: string }[]>`
    SELECT id, name, company, source FROM contacts WHERE kind = 'lead' AND stage = 'novo' ORDER BY created_at DESC LIMIT 8`;

  const cards = [
    ["Leads em aberto", counts.leads, "/admin/crm?tipo=lead"],
    ["Clientes", counts.clientes, "/admin/crm?tipo=cliente"],
    ["LPs no ar", counts.lps, "/admin/lps"],
    ["PIs em aberto", counts.pis_abertos, "/admin/pis"],
  ] as const;

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl">Painel</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value, href]) => (
          <Link key={label} href={href} className="card hover:border-navy">
            <p className="text-sm font-bold uppercase tracking-wider">{label}</p>
            <p className="font-display mt-2 text-4xl">{value}</p>
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/admin/lps/nova" className="btn btn-orange">Criar LP</Link>
        <Link href="/admin/pis/novo" className="btn">Novo PI</Link>
        <Link href="/admin/crm/novo" className="btn btn-ghost">Novo lead/cliente</Link>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card">
          <h2 className="text-lg font-bold">Próximos faturamentos</h2>
          {vencimentos.length === 0 ? (
            <p className="mt-3 text-sm">Nenhum PI com faturamento pendente.</p>
          ) : (
            <ul className="mt-3 divide-y divide-navy/10">
              {vencimentos.map((p) => (
                <li key={p.id} className="flex flex-wrap justify-between gap-2 py-2">
                  <Link href={`/admin/pis/${p.id}`} className="font-bold underline">PI {p.number}</Link>
                  <span>{p.advertiser}</span>
                  <span>{brl(Number(p.net))}</span>
                  <span>{brDate(p.due_date || "")}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card">
          <h2 className="text-lg font-bold">Leads novos</h2>
          {novosLeads.length === 0 ? (
            <p className="mt-3 text-sm">Nenhum lead novo.</p>
          ) : (
            <ul className="mt-3 divide-y divide-navy/10">
              {novosLeads.map((c) => (
                <li key={c.id} className="flex flex-wrap justify-between gap-2 py-2">
                  <Link href={`/admin/crm/${c.id}`} className="font-bold underline">{c.name}</Link>
                  <span>{c.company}</span>
                  <span className="text-sm">{c.source}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
