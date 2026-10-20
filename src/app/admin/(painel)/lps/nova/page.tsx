import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import LpForm from "../LpForm";

export default async function NovaLp() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <Link href="/admin/lps" className="underline">← Landing pages</Link>
      <h1 className="font-display text-3xl">Criar LP</h1>
      <p className="max-w-2xl">Cole o código completo da página. Ela começa como rascunho: confira a pré-visualização e depois coloque no ar.</p>
      <LpForm lp={{ id: 0, title: "", slug: "", html: "", status: "rascunho", noindex: true, isolated: true, notes: "" }} />
    </div>
  );
}
