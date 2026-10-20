import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import ContactForm from "../ContactForm";

export default async function NovoContato() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <Link href="/admin/crm" className="underline">← CRM</Link>
      <h1 className="font-display text-3xl">Novo lead / cliente</h1>
      <ContactForm c={{ id: 0 }} />
    </div>
  );
}
