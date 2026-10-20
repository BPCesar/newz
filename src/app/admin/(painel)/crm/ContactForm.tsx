import { STAGES, type Contact } from "@/lib/crm";
import { saveContact } from "./actions";

export default function ContactForm({ c }: { c: Partial<Contact> & { id: number } }) {
  return (
    <form action={saveContact} className="card grid gap-4 md:grid-cols-3">
      <input type="hidden" name="id" value={c.id} />
      <div>
        <label className="label" htmlFor="kind">Tipo</label>
        <select id="kind" name="kind" defaultValue={c.kind || "lead"} className="input">
          <option value="lead">Lead</option>
          <option value="cliente">Cliente</option>
        </select>
      </div>
      <div>
        <label className="label" htmlFor="stage">Etapa</label>
        <select id="stage" name="stage" defaultValue={c.stage || "novo"} className="input">
          {STAGES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="estimated_value">Valor estimado (R$/mês)</label>
        <input id="estimated_value" name="estimated_value" defaultValue={c.estimated_value ? String(Number(c.estimated_value)).replace(".", ",") : ""} className="input" inputMode="decimal" />
      </div>
      <div><label className="label" htmlFor="name">Nome do contato *</label><input id="name" name="name" defaultValue={c.name} required className="input" /></div>
      <div><label className="label" htmlFor="company">Empresa</label><input id="company" name="company" defaultValue={c.company} className="input" /></div>
      <div><label className="label" htmlFor="segment">Segmento</label><input id="segment" name="segment" defaultValue={c.segment} className="input" placeholder="Clínica, escola, varejo..." /></div>
      <div><label className="label" htmlFor="email">E-mail</label><input id="email" name="email" type="email" defaultValue={c.email} className="input" /></div>
      <div><label className="label" htmlFor="phone">WhatsApp / telefone</label><input id="phone" name="phone" defaultValue={c.phone} className="input" /></div>
      <div><label className="label" htmlFor="city">Cidade</label><input id="city" name="city" defaultValue={c.city} className="input" /></div>
      <div className="md:col-span-3"><label className="label" htmlFor="source">Origem</label><input id="source" name="source" defaultValue={c.source} className="input" placeholder="Indicação, site, Instagram, visita..." /></div>
      <div className="md:col-span-3"><label className="label" htmlFor="message">Resumo / necessidade</label><textarea id="message" name="message" defaultValue={c.message} rows={3} className="input" /></div>
      <div className="md:col-span-3"><button className="btn btn-orange">Salvar</button></div>
    </form>
  );
}
