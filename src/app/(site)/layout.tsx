import Link from "next/link";
import { getSitePages, PAGE_PATHS, WHATSAPP, WHATSAPP_LABEL } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const pages = await getSitePages();
  const menu = pages.filter((p) => p.visible && p.in_menu && p.key !== "home");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-navy/15 bg-cream">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" aria-label="Newz Mídia – página inicial">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/logo.png" alt="Newz Mídia" className="h-12 w-auto" />
          </Link>
          <nav aria-label="Menu principal" className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-bold uppercase tracking-wider">
            {menu.map((p) => (
              <Link key={p.key} href={PAGE_PATHS[p.key]} className="py-2 hover:text-orange-dark">
                {p.title}
              </Link>
            ))}
            <a href={`https://wa.me/${WHATSAPP}`} className="btn btn-orange text-xs" target="_blank" rel="noopener noreferrer">
              Fale no WhatsApp
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-navy text-cream">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/logo-light.png" alt="Newz Mídia" className="h-12 w-auto" />
            <p className="mt-4 text-sm opacity-90">Sua marca é a notícia.</p>
          </div>
          <div className="text-sm leading-7">
            <p className="font-bold uppercase tracking-wider">Onde estamos</p>
            <p>Pindamonhangaba · Vale do Paraíba · SP</p>
          </div>
          <div className="text-sm leading-7">
            <p className="font-bold uppercase tracking-wider">Contato</p>
            <p>
              WhatsApp:{" "}
              <a className="underline" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer">
                {WHATSAPP_LABEL}
              </a>
            </p>
          </div>
        </div>
        <div className="border-t border-cream/20 py-4 text-center text-xs opacity-80">© {new Date().getFullYear()} Newz Mídia</div>
      </footer>
    </div>
  );
}
