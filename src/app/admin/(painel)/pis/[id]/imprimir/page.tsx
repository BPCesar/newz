import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { brDate, brl, calcPi, sanitizePi } from "@/lib/pi";
import PrintButton from "./PrintButton";

export default async function ImprimirPi({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const sql = await db();
  const [row] = await sql<{ number: string; data: unknown }[]>`SELECT number, data FROM pis WHERE id = ${Number(id) || 0}`;
  if (!row) notFound();
  const pi = sanitizePi(row.data);
  pi.number = row.number;
  const t = calcPi(pi);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="no-print mb-4 flex justify-end"><PrintButton /></div>
      <article className="print-area bg-white p-10 text-[13px] leading-relaxed text-navy shadow">
        <header className="flex flex-wrap items-start justify-between gap-6 border-b-4 border-navy pb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/logo.png" alt="Newz Mídia" className="h-14 w-auto" />
          <div className="text-right">
            <p className="font-display text-2xl">PEDIDO DE INSERÇÃO</p>
            <p className="font-bold">Nº {pi.number}</p>
            <p>Emissão: {brDate(pi.issueDate)}</p>
          </div>
        </header>

        <section className="mt-6 grid grid-cols-2 gap-6">
          <div>
            <p className="font-bold uppercase tracking-wider">Agência</p>
            <p>Newz Mídia</p>
            <p>[CNPJ DA AGÊNCIA]</p>
            <p>Pindamonhangaba/SP</p>
          </div>
          <div>
            <p className="font-bold uppercase tracking-wider">Anunciante</p>
            <p>{pi.advertiser}</p>
            {pi.advertiserDoc && <p>CNPJ/CPF: {pi.advertiserDoc}</p>}
            {pi.advertiserContact && <p>{pi.advertiserContact}</p>}
          </div>
          <div>
            <p className="font-bold uppercase tracking-wider">Veículo</p>
            <p>{pi.vehicle}</p>
            {pi.vehicleDoc && <p>CNPJ: {pi.vehicleDoc}</p>}
            {pi.vehicleContact && <p>{pi.vehicleContact}</p>}
          </div>
          <div>
            <p className="font-bold uppercase tracking-wider">Campanha</p>
            <p>{pi.campaign || "—"}</p>
            {pi.product && <p>Peça: {pi.product}</p>}
            <p>Período: {brDate(t.campaignStart)} a {brDate(t.campaignEnd)}</p>
          </div>
        </section>

        <table className="mt-6 w-full border-collapse text-left">
          <thead>
            <tr className="bg-navy text-cream">
              <th className="p-2">Formato / peça</th><th className="p-2">Praça / local</th><th className="p-2">Período</th><th className="p-2 text-right">Qtd.</th><th className="p-2 text-right">Unitário</th><th className="p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {pi.items.map((it, i) => (
              <tr key={i} className="border-b border-navy/20">
                <td className="p-2">{it.description}</td>
                <td className="p-2">{it.location}</td>
                <td className="p-2">{brDate(it.startDate)} a {brDate(it.endDate || it.startDate)}</td>
                <td className="p-2 text-right">{it.quantity}</td>
                <td className="p-2 text-right">{brl(it.unitPrice)}</td>
                <td className="p-2 text-right">{brl(t.itemTotals[i])}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <section className="mt-6 flex justify-end">
          <dl className="grid w-full max-w-sm grid-cols-[1fr_auto] gap-x-6 gap-y-1">
            <dt>Valor bruto (tabela)</dt><dd className="text-right">{brl(t.gross)}</dd>
            <dt>(−) Desconto negociado ({pi.negotiatedDiscountPct}%)</dt><dd className="text-right">{brl(t.negotiatedDiscount)}</dd>
            <dt className="font-bold">Valor bruto negociado</dt><dd className="text-right font-bold">{brl(t.grossNegotiated)}</dd>
            <dt>(−) Comissão de agência ({pi.agencyCommissionPct}%)</dt><dd className="text-right">{brl(t.commission)}</dd>
            <dt className="font-bold">Valor líquido</dt><dd className="text-right font-bold">{brl(t.net)}</dd>
            {pi.extraFees > 0 && (<><dt>(+) Produção / taxas</dt><dd className="text-right">{brl(pi.extraFees)}</dd></>)}
            <dt className="border-t border-navy pt-1 font-bold">Total a faturar</dt><dd className="border-t border-navy pt-1 text-right font-bold">{brl(t.totalToBill)}</dd>
          </dl>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-6 border-t border-navy/30 pt-4">
          <div>
            <p className="font-bold uppercase tracking-wider">Faturamento</p>
            <p>{pi.billingDays} dias após o {pi.billingBase === "inicio" ? "início" : "fim"} da veiculação</p>
            <p>Vencimento: <b>{brDate(t.dueDate)}</b></p>
            <p>Pagamento: {pi.paymentMethod}</p>
          </div>
          <div>
            <p className="font-bold uppercase tracking-wider">Observações</p>
            <p className="whitespace-pre-line">{pi.notes || "—"}</p>
          </div>
        </section>

        <section className="mt-16 grid grid-cols-2 gap-10 text-center">
          <div className="border-t border-navy pt-2">Newz Mídia</div>
          <div className="border-t border-navy pt-2">{pi.vehicle || "Veículo"}</div>
        </section>
      </article>
    </div>
  );
}
