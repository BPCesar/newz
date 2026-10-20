import Link from "next/link";
import { guardPage } from "@/lib/site";
import HiddenBanner from "@/components/HiddenBanner";

export const metadata = { title: "O que fazemos" };

const services = [
  {
    title: "Mídia de performance",
    tag: "Online",
    text: "Planejamento, criação de campanhas, otimização e relatórios em Google Ads, Meta Ads (Facebook e Instagram), TikTok Ads, LinkedIn Ads e Pinterest Ads.",
  },
  {
    title: "Marketplaces",
    tag: "Online",
    text: "Gestão de anúncios patrocinados no Mercado Livre e na Amazon para quem vende online e quer aparecer antes do concorrente.",
  },
  {
    title: "Portais",
    tag: "Online",
    text: "Campanhas em grandes portais, como Globo e UOL, para marcas que querem alcance com credibilidade.",
  },
  {
    title: "Rádio, TV e jornal",
    tag: "Offline",
    text: "Planejamento, negociação e veiculação em rádios, TV regional e jornais, com PI, comprovante de veiculação e acompanhamento.",
  },
  {
    title: "Outdoor e ônibus",
    tag: "Offline",
    text: "Outdoor, backbus (vidro traseiro) e backseat nos ônibus: sua marca circulando pela cidade todos os dias.",
  },
  {
    title: "Carros de aplicativo",
    tag: "Offline",
    text: "Backseat no encosto dos carros de aplicativo, com QR code para transformar atenção em visita, contato e venda.",
  },
  {
    title: "Pacotes on + off",
    tag: "Integrado",
    text: "O mesmo criativo e a mesma mensagem na rua e na tela, com mensuração por QR code, UTM e relatórios mensais.",
  },
];

export default async function Servicos() {
  const { hiddenPreview } = await guardPage("servicos");
  return (
    <>
      <HiddenBanner show={hiddenPreview} />
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="masthead">
          <span>Seção · Serviços</span>
          <span>Online + Offline</span>
        </div>
        <h1 className="font-display mt-8 text-5xl leading-tight sm:text-6xl">O que fazemos</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed">
          Você fala com uma agência. A gente cuida de todos os canais, negocia com os veículos e mostra o resultado.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <article key={s.title} className="card flex flex-col gap-3">
              <span className="self-start rounded bg-navy px-2 py-1 text-xs font-bold uppercase tracking-wider text-cream">{s.tag}</span>
              <h2 className="font-display text-2xl">{s.title}</h2>
              <p className="leading-relaxed">{s.text}</p>
            </article>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/contato" className="btn btn-orange">Quero um plano de mídia</Link>
          <Link href="/consultoria" className="btn btn-ghost">Conhecer a consultoria</Link>
        </div>
      </section>
    </>
  );
}
