import Link from "next/link";
import { guardPage, WHATSAPP } from "@/lib/site";
import HiddenBanner from "@/components/HiddenBanner";

const online = ["Google Ads", "Meta Ads", "TikTok Ads", "LinkedIn Ads", "Pinterest Ads", "Globo", "UOL Ads", "Mercado Livre Ads", "Amazon Ads"];
const offline = ["Jornais", "Rádio", "TV regional", "Outdoor", "Carros de aplicativo", "Ônibus"];

export default async function Home() {
  const { hiddenPreview } = await guardPage("home");
  return (
    <>
      <HiddenBanner show={hiddenPreview} />

      {/* Capa */}
      <section className="bg-navy text-cream">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6">
          <div className="masthead">
            <span>Edição Nº 01</span>
            <span>Pindamonhangaba · Vale do Paraíba</span>
          </div>
          <div className="mt-10 flex flex-wrap items-end gap-10">
            <div className="min-w-0 flex-[999_1_480px]">
              <span className="font-display inline-block bg-orange-dark px-4 py-1 text-2xl tracking-wide">EXTRA!</span>
              <h1 className="font-display mt-6 text-5xl leading-[1.02] sm:text-7xl">Sua marca é a notícia.</h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed sm:text-xl">
                Agência de mídia online e offline. Levamos a sua marca da rua à tela: ônibus, rádio, outdoor, jornal, carros de
                aplicativo, Google, Instagram, TikTok e marketplaces. Tudo num plano só.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/contato" className="btn btn-orange">Pedir um diagnóstico</Link>
                <Link href="/servicos" className="btn btn-ghost border-cream text-cream hover:bg-navy-deep">O que fazemos</Link>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/mascote.png" alt="Mascote da Newz: jornaleiro erguendo um jornal" className="mx-auto w-64 flex-[1_1_220px] sm:w-80" />
          </div>
        </div>
      </section>

      {/* Conceito */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="masthead">
          <span>O conceito</span>
          <span>Origem do nome</span>
        </div>
        <div className="mt-8 grid gap-10 md:grid-cols-2">
          <h2 className="font-display text-4xl leading-tight sm:text-5xl">
            Quem eram os <span className="text-orange-dark">newsies</span>?
          </h2>
          <div className="space-y-4 text-lg leading-relaxed">
            <p>No começo do século XX, os jornaleirinhos levavam a notícia de esquina em esquina, gritando as manchetes, direto ao público.</p>
            <p className="font-bold">A Newz Mídia nasceu desse espírito: levar a mensagem da sua marca até quem importa.</p>
          </div>
        </div>
      </section>

      {/* Canais */}
      <section className="bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-4xl sm:text-5xl">
            Da rua à tela. <span className="text-orange-dark">Num plano só.</span>
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <div className="border-t-[6px] border-navy pt-4">
              <h3 className="font-display text-3xl">Online</h3>
              <ul className="mt-4 grid grid-cols-2 gap-2 text-lg">
                {online.map((c) => <li key={c}>{c}</li>)}
              </ul>
            </div>
            <div className="border-t-[6px] border-orange pt-4">
              <h3 className="font-display text-3xl">Offline</h3>
              <ul className="mt-4 grid grid-cols-2 gap-2 text-lg">
                {offline.map((c) => <li key={c}>{c}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-4xl sm:text-5xl">Como trabalhamos</h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-4">
          {[
            ["Diagnóstico", "Entendemos o seu negócio, o público e a verba."],
            ["Plano de mídia", "Escolhemos os canais certos, online e offline."],
            ["Negociação e execução", "Fechamos com os veículos e colocamos tudo no ar."],
            ["Resultado", "Relatório claro, com números, QR codes e próximos passos."],
          ].map(([t, d], i) => (
            <li key={t} className="border-t border-navy pt-4">
              <span className="font-display text-5xl text-orange-dark">{i + 1}</span>
              <h3 className="mt-2 text-xl font-bold">{t}</h3>
              <p className="mt-2 leading-relaxed">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Chamada */}
      <section className="bg-orange-dark text-cream">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-4 py-12 sm:px-6">
          <h2 className="font-display text-3xl sm:text-4xl">Quantas pessoas viram a sua marca hoje?</h2>
          <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="btn bg-cream text-navy hover:bg-paper">
            Vamos conversar
          </a>
        </div>
      </section>
    </>
  );
}
