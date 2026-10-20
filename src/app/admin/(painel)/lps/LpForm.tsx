"use client";

import { useActionState, useState } from "react";
import { saveLp, type LpState } from "./actions";

export type LpValues = {
  id: number;
  title: string;
  slug: string;
  html: string;
  status: string;
  noindex: boolean;
  isolated: boolean;
  notes: string;
};

export default function LpForm({ lp }: { lp: LpValues }) {
  const [state, action, pending] = useActionState<LpState, FormData>(saveLp, { error: "" });
  const [slug, setSlug] = useState(lp.slug);

  return (
    <form action={action} className="grid gap-5">
      <input type="hidden" name="id" value={lp.id} />
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="label" htmlFor="title">Nome da LP</label>
          <input id="title" name="title" defaultValue={lp.title} className="input" required placeholder="Ex.: Campanha Dia das Mães – Clínica X" />
        </div>
        <div>
          <label className="label" htmlFor="slug">Endereço</label>
          <div className="flex items-center gap-1">
            <span className="text-sm">/lp/</span>
            <input id="slug" name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="input" placeholder="dia-das-maes" />
          </div>
        </div>
      </div>
      <div>
        <label className="label" htmlFor="html">Código da LP (HTML completo, com CSS e JS)</label>
        <textarea
          id="html"
          name="html"
          defaultValue={lp.html}
          rows={22}
          spellCheck={false}
          className="input font-mono text-xs leading-5"
          placeholder={"<!doctype html>\n<html lang=\"pt-BR\">\n<head>...</head>\n<body>...</body>\n</html>"}
        />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <fieldset className="card">
          <legend className="label">Status</legend>
          <label className="flex items-center gap-2 py-1">
            <input type="radio" name="status" value="rascunho" defaultChecked={lp.status !== "no_ar"} /> Rascunho (só eu vejo)
          </label>
          <label className="flex items-center gap-2 py-1">
            <input type="radio" name="status" value="no_ar" defaultChecked={lp.status === "no_ar"} /> No ar (quem tem o link vê)
          </label>
        </fieldset>
        <div className="card">
          <label className="flex items-start gap-2">
            <input type="checkbox" name="noindex" defaultChecked={lp.noindex} className="mt-1" />
            <span><b>Não aparecer no Google</b> (recomendado para LPs de anúncio)</span>
          </label>
        </div>
        <div className="card">
          <label className="flex items-start gap-2">
            <input type="checkbox" name="isolated" defaultChecked={lp.isolated} className="mt-1" />
            <span>
              <b>Isolamento de segurança</b> (recomendado). Desligue só se um pixel ou script da LP precisar de cookies; nesse caso
              use apenas códigos de fontes confiáveis.
            </span>
          </label>
        </div>
      </div>
      <div>
        <label className="label" htmlFor="notes">Anotações internas (campanha, público, links dos anúncios)</label>
        <textarea id="notes" name="notes" defaultValue={lp.notes} rows={3} className="input" />
      </div>
      {state.error && <p className="font-bold text-orange-dark" role="alert">{state.error}</p>}
      <div className="flex flex-wrap gap-3">
        <button className="btn btn-orange" disabled={pending}>{pending ? "Salvando..." : "Salvar"}</button>
      </div>
    </form>
  );
}
