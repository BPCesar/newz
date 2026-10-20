import { requireAdmin } from "@/lib/auth";
import { getSitePages, PAGE_PATHS } from "@/lib/site";
import { togglePage } from "./actions";

export default async function Paginas() {
  await requireAdmin();
  const pages = await getSitePages();
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Páginas do site</h1>
      <p className="max-w-2xl">
        <b>Visível</b>: desligado, a página some para os visitantes (você continua vendo, com um aviso). <b>No menu</b>: desligado, a
        página continua acessível pelo link, mas não aparece no menu.
      </p>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[560px] text-left">
          <thead>
            <tr className="border-b border-navy/20 text-sm uppercase tracking-wider">
              <th className="py-2">Página</th>
              <th>Endereço</th>
              <th>Visível</th>
              <th>No menu</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.key} className="border-b border-navy/10">
                <td className="py-3 font-bold">{p.title}</td>
                <td>
                  <a href={PAGE_PATHS[p.key]} target="_blank" rel="noopener noreferrer" className="underline">
                    {PAGE_PATHS[p.key]}
                  </a>
                </td>
                <td>
                  <form action={togglePage}>
                    <input type="hidden" name="key" value={p.key} />
                    <input type="hidden" name="field" value="visible" />
                    <button className={`btn min-w-24 ${p.visible ? "" : "btn-ghost"}`} aria-label={`Visível: ${p.visible ? "sim" : "não"}. Alternar`}>
                      {p.visible ? "Sim" : "Oculta"}
                    </button>
                  </form>
                </td>
                <td>
                  <form action={togglePage}>
                    <input type="hidden" name="key" value={p.key} />
                    <input type="hidden" name="field" value="in_menu" />
                    <button className={`btn min-w-24 ${p.in_menu ? "" : "btn-ghost"}`} aria-label={`No menu: ${p.in_menu ? "sim" : "não"}. Alternar`}>
                      {p.in_menu ? "Sim" : "Não"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm">Landing pages de campanha ficam em <a href="/admin/lps" className="underline">Landing pages</a>.</p>
    </div>
  );
}
