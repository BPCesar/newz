import Link from "next/link";
import { guardPage } from "@/lib/site";
import HiddenBanner from "@/components/HiddenBanner";

export const metadata = { title: "Consultoria em marketing e mídia" };

const items = [
  ["Diagnóstico de mídia", "Análise do que você já investe, onde está o desperdício e onde está a oportunidade."],
  ["Plano de mídia sob medida", "Quais canais usar, quanto investir em cada um e em que ordem, para a sua verba."],
  ["Posicionamento e marca", "Mensagem, público e consistência visual para a sua marca ser lembrada."],
  ["Estrutura de marketing", "Funil, CRM, tracking, UTMs e pixels configurados para medir o que dá resultado."],
  ["Treinamento da equipe", "Sua equipe aprendendo a operar campanhas e ler relatórios."],
  ["Acompanhamento mensal", "Reuniões de revisão com indicadores e próximos passos."],
];

export default async function Consultoria() {
  const { hiddenPreview } = await guardPage("consultoria");
  return (
    <>
      <HiddenBanner show={hiddenPreview} />
      <section className="bg-navy text-cream">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="masthead">
            <span>Seção · Consultoria</span>
            <span>Marketing e mídia</span>
          </div>
          <h1 className="font-display mt-8 max-w-3xl text-5xl leading-tight sm:text-6xl">Consultoria em marketing e mídia</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed">
            Para empresas que querem investir melhor, com estratégia de quem já planejou e geriu cerca de R$ 1 milhão por mês em mídia
            online e offline.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map(([t, d], i) => (
            <article key={t} className="border-t border-navy pt-4">
              <span className="font-display text-4xl text-orange-dark">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="mt-2 text-xl font-bold">{t}</h2>
              <p className="mt-2 leading-relaxed">{d}</p>
            </article>
          ))}
        </div>
        <div className="card mt-14 flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-3xl">Comece pelo diagnóstico</h2>
            <p className="mt-2 max-w-xl">Conte o seu momento e retornamos com uma proposta de consultoria.</p>
          </div>
          <Link href="/contato?assunto=consultoria" className="btn btn-orange">Solicitar consultoria</Link>
        </div>
      </section>
    </>
  );
}
