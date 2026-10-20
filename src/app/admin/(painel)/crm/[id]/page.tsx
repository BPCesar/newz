import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { stageLabel, type Contact } from "@/lib/crm";
import { brl, brDate } from "@/lib/pi";
import ContactForm from "../ContactForm";
import { addLink, addNote, deleteContact, deleteLink, deleteNote } from "../actions";

export default async function ContactCard({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ salvo?: string }> }) {
  await requireAdmin();
  const { id: idParam } = await params;
  const { salvo } = await searchParams;
  const id = Number(idParam) || 0;
  const sql = await db();
  const [c] = await sql<Contact[]>`
    SELECT id, kind, stage, name, company, email, phone, city, segment, source, estimated_value, message,
      to_char(created_at AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY') AS created
    FROM contacts WHERE id = ${id}`;
  if (!c) notFound();
  const notes = await sql<{ id: number; body: string; at: string }[]>`
    SELECT id, body, to_char(created_at AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI') AS at
    FROM contact_notes WHERE contact_id = ${id} ORDER BY created_at DESC`;
  const links = await sql<{ id: number; label: string; url: string }[]>`
    SELECT id, label, url FROM contact_links WHERE contact_id = ${id} ORDER BY created_at DESC`;
  const pis = await sql<{ id: number; number: string; status: string; vehicle: string; net: string; due_date: string | null }[]>`
    SELECT id, number, status, vehicle, net, to_char(due_date, 'YYYY-MM-DD') AS due_date FROM pis WHERE contact_id = ${id} ORDER BY created_at DESC`;
  const digits = c.phone.replace(/\D/g, "");
  const wa = digits ? `https://wa.me/${digits.length <= 11 ? "55" + digits : digits}` : "";

  return (
    <div className="space-y-6">
      <Link href="/admin/crm" className="underline">← CRM</Link>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">{c.name}</h1>
          <p>
            {c.company && <b>{c.company} · </b>}
            {c.kind === "cliente" ? "Cliente" : "Lead"} · {stageLabel(c.stage)} · desde {c.created}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-orange">WhatsApp</a>}
          {c.email && <a href={`mailto:${c.email}`} className="btn btn-ghost">E-mail</a>}
          <Link href={`/admin/pis/novo?cliente=${c.id}`} className="btn">Novo PI</Link>
          <form action={deleteContact}><input type="hidden" name="id" value={c.id} /><button className="btn btn-ghost">Excluir</button></form>
        </div>
      </div>
      {salvo && <p className="card font-bold" role="status">Salvo.</p>}

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <ContactForm c={c} />

          <section className="card space-y-4">
            <h2 className="text-lg font-bold">Anotações</h2>
            <form action={addNote} className="grid gap-2">
              <input type="hidden" name="id" value={c.id} />
              <label className="sr-only" htmlFor="body">Nova anotação</label>
              <textarea id="body" name="body" rows={3} className="input" placeholder="Resumo da reunião, próximos passos, objeções..." required />
              <button className="btn justify-self-start">Adicionar anotação</button>
            </form>
            <ul className="divide-y divide-navy/10">
              {notes.map((n) => (
                <li key={n.id} className="flex items-start justify-between gap-4 py-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider">{n.at}</p>
                    <p className="whitespace-pre-line">{n.body}</p>
                  </div>
                  <form action={deleteNote}>
                    <input type="hidden" name="id" value={c.id} /><input type="hidden" name="noteId" value={n.id} />
                    <button className="text-sm underline" aria-label="Excluir anotação">excluir</button>
                  </form>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="space-y-6">
          <section className="card space-y-4">
            <h2 className="text-lg font-bold">Links</h2>
            <form action={addLink} className="grid gap-2">
              <input type="hidden" name="id" value={c.id} />
              <div><label className="label" htmlFor="label">Descrição</label><input id="label" name="label" className="input" placeholder="Proposta, Drive, Instagram..." /></div>
              <div><label className="label" htmlFor="url">Link</label><input id="url" name="url" className="input" placeholder="https://" required /></div>
              <button className="btn justify-self-start">Adicionar link</button>
            </form>
            <ul className="space-y-2">
              {links.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3">
                  <a href={l.url} target="_blank" rel="noopener noreferrer" className="break-all underline">{l.label || l.url}</a>
                  <form action={deleteLink}>
                    <input type="hidden" name="id" value={c.id} /><input type="hidden" name="linkId" value={l.id} />
                    <button className="text-sm underline" aria-label="Excluir link">excluir</button>
                  </form>
                </li>
              ))}
            </ul>
          </section>

          <section className="card space-y-3">
            <h2 className="text-lg font-bold">PIs deste cliente</h2>
            {pis.length === 0 ? <p className="text-sm">Nenhum PI ainda.</p> : (
              <ul className="space-y-2 text-sm">
                {pis.map((p) => (
                  <li key={p.id} className="flex flex-wrap justify-between gap-2">
                    <Link href={`/admin/pis/${p.id}`} className="font-bold underline">PI {p.number}</Link>
                    <span>{p.vehicle}</span><span>{brl(Number(p.net))}</span><span>{brDate(p.due_date || "")}</span><span>{p.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
