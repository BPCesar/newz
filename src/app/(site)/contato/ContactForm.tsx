"use client";

import { useActionState } from "react";
import { sendContact, type ContactState } from "./actions";

export default function ContactForm({ defaultSubject }: { defaultSubject: string }) {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContact, { ok: false, message: "" });

  if (state.ok) {
    return (
      <div className="card" role="status">
        <p className="font-display text-2xl">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="card grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">Nome *</label>
          <input id="name" name="name" required className="input" autoComplete="name" />
        </div>
        <div>
          <label className="label" htmlFor="company">Empresa</label>
          <input id="company" name="company" className="input" autoComplete="organization" />
        </div>
        <div>
          <label className="label" htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" className="input" autoComplete="email" />
        </div>
        <div>
          <label className="label" htmlFor="phone">WhatsApp / telefone</label>
          <input id="phone" name="phone" className="input" autoComplete="tel" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="subject">Assunto</label>
        <select id="subject" name="subject" className="input" defaultValue={defaultSubject}>
          <option value="midia">Plano de mídia</option>
          <option value="consultoria">Consultoria</option>
          <option value="backseat">Anunciar em carros de aplicativo / ônibus</option>
          <option value="outro">Outro assunto</option>
        </select>
      </div>
      <div>
        <label className="label" htmlFor="message">Mensagem</label>
        <textarea id="message" name="message" rows={5} className="input" />
      </div>
      {/* armadilha para robôs */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor="website">Site</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {state.message && <p className="font-bold text-orange-dark" role="alert">{state.message}</p>}
      <button type="submit" className="btn btn-orange justify-self-start" disabled={pending}>
        {pending ? "Enviando..." : "Enviar mensagem"}
      </button>
    </form>
  );
}
