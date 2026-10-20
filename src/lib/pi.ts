// Cálculo do Pedido de Inserção (PI). Usado no navegador (cálculo ao vivo) e no servidor (ao salvar).

export type PiItem = {
  description: string; // formato / peça (ex.: Spot 30", Outdoor 9x3, Backbus)
  location: string; // praça, programa, placa, linha...
  startDate: string; // AAAA-MM-DD
  endDate: string;
  quantity: number;
  unitPrice: number; // valor unitário de tabela
};

export type PiData = {
  number: string;
  issueDate: string;
  status: string;
  contactId: number | null;
  advertiser: string; // anunciante
  advertiserDoc: string; // CNPJ/CPF
  advertiserContact: string;
  vehicle: string; // veículo
  vehicleDoc: string;
  vehicleContact: string;
  campaign: string;
  product: string;
  items: PiItem[];
  negotiatedDiscountPct: number; // desconto negociado sobre a tabela
  agencyCommissionPct: number; // comissão / desconto-padrão de agência
  extraFees: number; // produção, taxas extras (somadas ao valor a faturar)
  billingDays: number; // dias após o fim da veiculação
  billingBase: "fim" | "inicio"; // conta a partir do fim (padrão) ou do início da veiculação
  paymentMethod: string;
  notes: string;
};

export type PiTotals = {
  gross: number; // bruto de tabela
  negotiatedDiscount: number;
  grossNegotiated: number; // bruto negociado
  commission: number; // comissão da agência
  net: number; // líquido do veículo
  totalToBill: number; // bruto negociado + taxas extras
  campaignStart: string;
  campaignEnd: string;
  dueDate: string;
  itemTotals: number[];
};

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const num = (v: unknown) => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

export function addDays(isoDate: string, days: number) {
  if (!isoDate) return "";
  const d = new Date(isoDate + "T12:00:00Z");
  if (Number.isNaN(d.getTime())) return "";
  d.setUTCDate(d.getUTCDate() + Math.round(days));
  return d.toISOString().slice(0, 10);
}

export function calcPi(pi: PiData): PiTotals {
  const itemTotals = pi.items.map((it) => round2(num(it.quantity) * num(it.unitPrice)));
  const gross = round2(itemTotals.reduce((a, b) => a + b, 0));
  const negotiatedDiscount = round2(gross * (num(pi.negotiatedDiscountPct) / 100));
  const grossNegotiated = round2(gross - negotiatedDiscount);
  const commission = round2(grossNegotiated * (num(pi.agencyCommissionPct) / 100));
  const net = round2(grossNegotiated - commission);
  const totalToBill = round2(grossNegotiated + num(pi.extraFees));

  const starts = pi.items.map((i) => i.startDate).filter(Boolean).sort();
  const ends = pi.items.map((i) => i.endDate || i.startDate).filter(Boolean).sort();
  const campaignStart = starts[0] || "";
  const campaignEnd = ends[ends.length - 1] || "";
  const base = pi.billingBase === "inicio" ? campaignStart : campaignEnd;
  const dueDate = addDays(base, num(pi.billingDays));

  return { gross, negotiatedDiscount, grossNegotiated, commission, net, totalToBill, campaignStart, campaignEnd, dueDate, itemTotals };
}

export function emptyPi(number: string): PiData {
  const today = new Date().toISOString().slice(0, 10);
  return {
    number,
    issueDate: today,
    status: "rascunho",
    contactId: null,
    advertiser: "",
    advertiserDoc: "",
    advertiserContact: "",
    vehicle: "",
    vehicleDoc: "",
    vehicleContact: "",
    campaign: "",
    product: "",
    items: [{ description: "", location: "", startDate: today, endDate: today, quantity: 1, unitPrice: 0 }],
    negotiatedDiscountPct: 0,
    agencyCommissionPct: 20,
    extraFees: 0,
    billingDays: 15,
    billingBase: "fim",
    paymentMethod: "Boleto / PIX",
    notes: "",
  };
}

/** Limpa e valida o que veio do formulário antes de salvar. */
export function sanitizePi(raw: unknown): PiData {
  const r = (raw ?? {}) as Record<string, unknown>;
  const s = (v: unknown, max = 500) => String(v ?? "").slice(0, max);
  const items = Array.isArray(r.items) ? r.items.slice(0, 100) : [];
  return {
    number: s(r.number, 40),
    issueDate: s(r.issueDate, 10),
    status: ["rascunho", "enviado", "aprovado", "veiculado", "faturado", "pago", "cancelado"].includes(String(r.status))
      ? String(r.status)
      : "rascunho",
    contactId: r.contactId ? Math.trunc(num(r.contactId)) || null : null,
    advertiser: s(r.advertiser),
    advertiserDoc: s(r.advertiserDoc, 40),
    advertiserContact: s(r.advertiserContact),
    vehicle: s(r.vehicle),
    vehicleDoc: s(r.vehicleDoc, 40),
    vehicleContact: s(r.vehicleContact),
    campaign: s(r.campaign),
    product: s(r.product),
    items: items.map((it) => {
      const i = (it ?? {}) as Record<string, unknown>;
      return {
        description: s(i.description),
        location: s(i.location),
        startDate: s(i.startDate, 10),
        endDate: s(i.endDate, 10),
        quantity: Math.max(0, num(i.quantity)),
        unitPrice: Math.max(0, num(i.unitPrice)),
      };
    }),
    negotiatedDiscountPct: Math.min(100, Math.max(0, num(r.negotiatedDiscountPct))),
    agencyCommissionPct: Math.min(100, Math.max(0, num(r.agencyCommissionPct))),
    extraFees: Math.max(0, num(r.extraFees)),
    billingDays: Math.min(3650, Math.max(0, Math.round(num(r.billingDays)))),
    billingBase: r.billingBase === "inicio" ? "inicio" : "fim",
    paymentMethod: s(r.paymentMethod, 120),
    notes: s(r.notes, 5000),
  };
}

export const PI_STATUS = ["rascunho", "enviado", "aprovado", "veiculado", "faturado", "pago", "cancelado"];

export const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const brDate = (iso: string) => (iso ? iso.split("-").reverse().join("/") : "—");
