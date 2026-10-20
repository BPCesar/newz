import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logout } from "../login/actions";

export const metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const nav = [
  ["/admin", "Painel"],
  ["/admin/paginas", "Páginas do site"],
  ["/admin/lps", "Landing pages"],
  ["/admin/pis", "PIs"],
  ["/admin/crm", "CRM"],
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="flex min-h-screen flex-wrap bg-paper">
      <aside className="no-print w-full bg-navy text-cream md:min-h-screen md:w-60">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 md:block">
          <Link href="/admin">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/logo-light.png" alt="Newz Mídia" className="h-10 w-auto" />
          </Link>
          <nav aria-label="Menu do admin" className="flex flex-wrap gap-1 md:mt-8 md:flex-col">
            {nav.map(([href, label]) => (
              <Link key={href} href={href} className="rounded px-3 py-2.5 font-bold hover:bg-navy-deep">
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-wrap gap-2 md:mt-10 md:flex-col">
            <a href="/" target="_blank" rel="noopener noreferrer" className="rounded px-3 py-2.5 text-sm underline">
              Ver site
            </a>
            <form action={logout}>
              <button className="rounded px-3 py-2.5 text-left text-sm underline">Sair</button>
            </form>
          </div>
        </div>
      </aside>
      <div className="min-w-0 flex-[999_1_600px] p-4 sm:p-8">{children}</div>
    </div>
  );
}
