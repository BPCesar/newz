import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { emptyPi } from "@/lib/pi";
import PiEditor from "../PiEditor";

export default async function NovoPi({ searchParams }: { searchParams: Promise<{ cliente?: string }> }) {
  await requireAdmin();
  const { cliente } = await searchParams;
  const sql = await db();
  const contacts = await sql<{ id: number; name: string; company: string; email: string; phone: string }[]>`
    SELECT id, name, company, email, phone FROM contacts ORDER BY kind = 'cliente' DESC, company, name`;
  const pi = emptyPi("");
  const c = contacts.find((x) => String(x.id) === cliente);
  if (c) {
    pi.contactId = c.id;
    pi.advertiser = c.company || c.name;
    pi.advertiserContact = [c.name, c.email, c.phone].filter(Boolean).join(" · ");
  }
  return (
    <div className="space-y-6">
      <Link href="/admin/pis" className="underline">← PIs</Link>
      <h1 className="font-display text-3xl">Novo PI</h1>
      <PiEditor id={0} initial={pi} contacts={contacts} />
    </div>
  );
}
