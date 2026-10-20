import { guardPage, WHATSAPP, WHATSAPP_LABEL } from "@/lib/site";
import HiddenBanner from "@/components/HiddenBanner";
import ContactForm from "./ContactForm";

export const metadata = { title: "Contato" };

export default async function Contato({ searchParams }: { searchParams: Promise<{ assunto?: string }> }) {
  const { hiddenPreview } = await guardPage("contato");
  const { assunto } = await searchParams;
  const subject = ["midia", "consultoria", "backseat", "outro"].includes(assunto || "") ? (assunto as string) : "midia";
  return (
    <>
      <HiddenBanner show={hiddenPreview} />
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="masthead">
          <span>Seção · Contato</span>
          <span>Fale com a gente</span>
        </div>
        <div className="mt-8 flex flex-wrap gap-10">
          <div className="min-w-0 flex-[1_1_320px]">
            <h1 className="font-display text-5xl leading-tight sm:text-6xl">Vamos conversar?</h1>
            <p className="mt-4 text-lg leading-relaxed">Conte sobre o seu negócio. A gente responde com um caminho claro para a sua marca aparecer.</p>
            <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="btn btn-orange mt-6">
              WhatsApp {WHATSAPP_LABEL}
            </a>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/mascote.png" alt="" className="mt-10 hidden w-56 md:block" />
          </div>
          <div className="min-w-0 flex-[999_1_480px]">
            <ContactForm defaultSubject={subject} />
          </div>
        </div>
      </section>
    </>
  );
}
