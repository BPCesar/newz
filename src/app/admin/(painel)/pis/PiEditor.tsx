"use client";

import { useActionState, useMemo, useState } from "react";
import { calcPi, brl, brDate, PI_STATUS, type PiData, type PiItem } from "@/lib/pi";
import { savePi, type PiSaveState } from "./actions";

type ContactOpt = { id: number; name: string; company: string; email: string; phone: string };

const BILLING_PRESETS = [15, 30];

export default function PiEditor({ id, initial, contacts }: { id: number; initial: PiData; contacts: ContactOpt[] }) {
  const [pi, setPi] = useState<PiData>(initial);
  const [state, action, pending] = useActionState<PiSaveState, FormData>(savePi, { error: "" });
  const t = useMemo(() => calcPi(pi), [pi]);
  const customDays = !BILLING_PRESETS.includes(pi.billingDays);

  const set = <K extends keyof PiData>(k: K, v: PiData[K]) => setPi((p) => ({ ...p, [k]: v }));
  const setItem = (i: number, k: keyof PiItem, v: string | number) =>
    setPi((p) => ({ ...p, items: p.items.map((it, idx) => (idx === i ? { ...it, [k]: v } : it)) }));
  const addItem = () =>
    setPi((p) => {
      const last = p.items[p.items.length - 1];
      return {
        ...p,
        items: [...p.items, { description: "", location: "", startDate: last?.startDate || "", endDate: last?.endDate || "", quantity: 1, unitPrice: 0 }],
      };
    });
  const removeItem = (i: number) => setPi((p) => ({ ...p, items: p.items.filter((_, idx) => idx !== i) }));

  const pickContact = (value: string) => {
    const c = contacts.find((x) => String(x.id) === value);
    setPi((p) => ({
      ...p,
      contactId: c ? c.id : null,
      advertiser: c ? c.company || c.name : p.advertiser,
      advertiserContact: c ? [c.name, c.email, c.phone].filter(Boolean).join(" · ") : p.advertiserContact,
    }));
  };

  const n = (v: string) => (v === "" ? 0 : Number(v));

  return (
    <form action={action} className="grid gap-6">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="payload" value={JSON.stringify(pi)} />

      <section className="card grid gap-4 md:grid-cols-4">
        <div>
          <label className="label" htmlFor="number">Nº do PI</label>
          <input id="number" className="input" value={pi.number} onChange={(e) => set("number", e.target.value)} placeholder="gerado ao salvar" />
        </div>
        <div>
          <label className="label" htmlFor="issueDate">Emissão</label>
          <input id="issueDate" type="date" className="input" value={pi.issueDate} onChange={(e) => set("issueDate", e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="status">Status</label>
          <select id="status" className="input" value={pi.status} onChange={(e) => set("status", e.target.value)}>
            {PI_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="contact">Cliente do CRM</label>
          <select id="contact" className="input" value={pi.contactId ?? ""} onChange={(e) => pickContact(e.target.value)}>
            <option value="">— nenhum —</option>
            {contacts.map((c) => <option key={c.id} value={c.id}>{c.company ? `${c.company} (${c.name})` : c.name}</option>)}
          </select>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="card grid gap-3">
          <h2 className="font-bold uppercase tracking-wider">Anunciante</h2>
          <div><label className="label" htmlFor="advertiser">Razão social / nome *</label><input id="advertiser" className="input" value={pi.advertiser} onChange={(e) => set("advertiser", e.target.value)} /></div>
          <div><label className="label" htmlFor="advertiserDoc">CNPJ / CPF</label><input id="advertiserDoc" className="input" value={pi.advertiserDoc} onChange={(e) => set("advertiserDoc", e.target.value)} /></div>
          <div><label className="label" htmlFor="advertiserContact">Contato</label><input id="advertiserContact" className="input" value={pi.advertiserContact} onChange={(e) => set("advertiserContact", e.target.value)} /></div>
        </div>
        <div className="card grid gap-3">
          <h2 className="font-bold uppercase tracking-wider">Veículo</h2>
          <div><label className="label" htmlFor="vehicle">Veículo *</label><input id="vehicle" className="input" value={pi.vehicle} onChange={(e) => set("vehicle", e.target.value)} placeholder="Rádio, jornal, outdoor, plataforma..." /></div>
          <div><label className="label" htmlFor="vehicleDoc">CNPJ</label><input id="vehicleDoc" className="input" value={pi.vehicleDoc} onChange={(e) => set("vehicleDoc", e.target.value)} /></div>
          <div><label className="label" htmlFor="vehicleContact">Contato</label><input id="vehicleContact" className="input" value={pi.vehicleContact} onChange={(e) => set("vehicleContact", e.target.value)} /></div>
        </div>
      </section>

      <section className="card grid gap-4 md:grid-cols-2">
        <div><label className="label" htmlFor="campaign">Campanha</label><input id="campaign" className="input" value={pi.campaign} onChange={(e) => set("campaign", e.target.value)} /></div>
        <div><label className="label" htmlFor="product">Produto / peça</label><input id="product" className="input" value={pi.product} onChange={(e) => set("product", e.target.value)} /></div>
      </section>

      <section className="card overflow-x-auto">
        <h2 className="mb-3 font-bold uppercase tracking-wider">Veiculação</h2>
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-navy/20 uppercase tracking-wider">
              <th className="py-2">Formato / peça</th><th>Praça / programa / local</th><th>Início</th><th>Fim</th><th>Qtd.</th><th>Valor unit. (tabela)</th><th>Total</th><th></th>
            </tr>
          </thead>
          <tbody>
            {pi.items.map((it, i) => (
              <tr key={i} className="border-b border-navy/10 align-top">
                <td className="py-2 pr-2"><input aria-label="Formato" className="input" value={it.description} onChange={(e) => setItem(i, "description", e.target.value)} placeholder={'Spot 30"'} /></td>
                <td className="pr-2"><input aria-label="Praça" className="input" value={it.location} onChange={(e) => setItem(i, "location", e.target.value)} /></td>
                <td className="pr-2"><input aria-label="Início" type="date" className="input" value={it.startDate} onChange={(e) => setItem(i, "startDate", e.target.value)} /></td>
                <td className="pr-2"><input aria-label="Fim" type="date" className="input" value={it.endDate} onChange={(e) => setItem(i, "endDate", e.target.value)} /></td>
                <td className="w-20 pr-2"><input aria-label="Quantidade" type="number" min="0" step="1" className="input" value={it.quantity} onChange={(e) => setItem(i, "quantity", n(e.target.value))} /></td>
                <td className="w-36 pr-2"><input aria-label="Valor unitário" type="number" min="0" step="0.01" className="input" value={it.unitPrice} onChange={(e) => setItem(i, "unitPrice", n(e.target.value))} /></td>
                <td className="whitespace-nowrap pr-2 pt-3 font-bold">{brl(t.itemTotals[i] || 0)}</td>
                <td><button type="button" className="btn btn-ghost px-3" onClick={() => removeItem(i)} aria-label={`Remover item ${i + 1}`}>✕</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" className="btn btn-ghost mt-3" onClick={addItem}>+ Adicionar item</button>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card grid gap-4 sm:grid-cols-2">
          <h2 className="font-bold uppercase tracking-wider sm:col-span-2">Negociação e faturamento</h2>
          <div><label className="label" htmlFor="disc">Desconto negociado (%)</label><input id="disc" type="number" min="0" max="100" step="0.01" className="input" value={pi.negotiatedDiscountPct} onChange={(e) => set("negotiatedDiscountPct", n(e.target.value))} /></div>
          <div><label className="label" htmlFor="comm">Comissão da agência (%)</label><input id="comm" type="number" min="0" max="100" step="0.01" className="input" value={pi.agencyCommissionPct} onChange={(e) => set("agencyCommissionPct", n(e.target.value))} /></div>
          <div><label className="label" htmlFor="fees">Produção / taxas extras (R$)</label><input id="fees" type="number" min="0" step="0.01" className="input" value={pi.extraFees} onChange={(e) => set("extraFees", n(e.target.value))} /></div>
          <div><label className="label" htmlFor="pay">Forma de pagamento</label><input id="pay" className="input" value={pi.paymentMethod} onChange={(e) => set("paymentMethod", e.target.value)} /></div>
          <fieldset className="sm:col-span-2">
            <legend className="label">Faturamento: dias após a veiculação</legend>
            <div className="flex flex-wrap items-center gap-2">
              {BILLING_PRESETS.map((d) => (
                <button key={d} type="button" className={`btn ${pi.billingDays === d ? "" : "btn-ghost"}`} onClick={() => set("billingDays", d)}>{d} dias</button>
              ))}
              <label className="flex items-center gap-2">
                <span className={`text-sm font-bold ${customDays ? "" : "opacity-60"}`}>Outro:</span>
                <input aria-label="Dias personalizados" type="number" min="0" step="1" className="input w-24" value={pi.billingDays} onChange={(e) => set("billingDays", n(e.target.value))} />
              </label>
              <select aria-label="Contar a partir de" className="input w-auto" value={pi.billingBase} onChange={(e) => set("billingBase", e.target.value as PiData["billingBase"])}>
                <option value="fim">após o fim da veiculação</option>
                <option value="inicio">após o início da veiculação</option>
              </select>
            </div>
          </fieldset>
          <div className="sm:col-span-2"><label className="label" htmlFor="notes">Observações</label><textarea id="notes" rows={3} className="input" value={pi.notes} onChange={(e) => set("notes", e.target.value)} /></div>
        </div>

        <div className="card bg-navy text-cream" aria-live="polite">
          <h2 className="font-bold uppercase tracking-wider">Resumo (cálculo automático)</h2>
          <dl className="mt-4 grid grid-cols-[1fr_auto] gap-x-6 gap-y-2 text-lg">
            <dt>Valor bruto (tabela)</dt><dd className="text-right">{brl(t.gross)}</dd>
            <dt>(−) Desconto negociado {pi.negotiatedDiscountPct}%</dt><dd className="text-right">{brl(t.negotiatedDiscount)}</dd>
            <dt className="font-bold">Valor bruto negociado</dt><dd className="text-right font-bold">{brl(t.grossNegotiated)}</dd>
            <dt>(−) Comissão agência {pi.agencyCommissionPct}%</dt><dd className="text-right">{brl(t.commission)}</dd>
            <dt className="font-bold">Valor líquido (veículo)</dt><dd className="text-right font-bold">{brl(t.net)}</dd>
            <dt>(+) Produção / taxas</dt><dd className="text-right">{brl(pi.extraFees || 0)}</dd>
            <dt className="font-display text-xl">Total a faturar</dt><dd className="font-display text-right text-xl">{brl(t.totalToBill)}</dd>
          </dl>
          <dl className="mt-6 grid grid-cols-[1fr_auto] gap-x-6 gap-y-2 border-t border-cream/30 pt-4">
            <dt>Período de veiculação</dt><dd className="text-right">{brDate(t.campaignStart)} a {brDate(t.campaignEnd)}</dd>
            <dt>Faturamento</dt><dd className="text-right">{pi.billingDays} dias após o {pi.billingBase === "inicio" ? "início" : "fim"}</dd>
            <dt className="font-bold">Vencimento</dt><dd className="text-right font-bold">{brDate(t.dueDate)}</dd>
          </dl>
        </div>
      </section>

      {state.error && <p className="font-bold text-orange-dark" role="alert">{state.error}</p>}
      <div className="flex flex-wrap gap-3">
        <button className="btn btn-orange" disabled={pending}>{pending ? "Salvando..." : "Salvar PI"}</button>
      </div>
    </form>
  );
}
