import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { sanitizePi } from "@/lib/pi";
import PiEditor from "../PiEditor";
import { deletePi, duplicatePi } from "../actions";

export default async function EditPi({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ salvo?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { salvo } = await searchParams;
  const sql = await db();
  const [row] = await sql<{ id: number; number: string; data: unknown }[]>`SELECT id, number, data FROM pis WHERE id = ${Number(id) || 0}`;
  if (!row) notFound();
  const contacts = await sql<{ id: number; name: string; company: string; email: string; phone: string }[]>`
    SELECT id, name, company, email, phone FROM contacts ORDER BY kind = 'cliente' DESC, company, name`;
  const pi = sanitizePi(row.data);
  pi.number = row.number;

  return (
    <div className="space-y-6">
      <Link href="/admin/pis" className="underline">← PIs</Link>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl">PI {row.number}</h1>
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/pis/${row.id}/imprimir`} target="_blank" className="btn">Imprimir / PDF</Link>
          <form action={duplicatePi}><input type="hidden" name="id" value={row.id} /><button className="btn btn-ghost">Duplicar</button></form>
          <form action={deletePi}><input type="hidden" name="id" value={row.id} /><button className="btn btn-ghost">Excluir</button></form>
        </div>
      </div>
      {salvo && <p className="card font-bold" role="status">PI salvo.</p>}
      <PiEditor id={row.id} initial={pi} contacts={contacts} />
    </div>
  );
}
