import "server-only";
import { notFound } from "next/navigation";
import { db } from "./db";
import { isAdmin } from "./auth";

export type SitePage = { key: string; title: string; visible: boolean; in_menu: boolean; position: number };

export const PAGE_PATHS: Record<string, string> = {
  home: "/",
  servicos: "/servicos",
  consultoria: "/consultoria",
  contato: "/contato",
};

const DEFAULT_PAGES: SitePage[] = [
  { key: "home", title: "Home", visible: true, in_menu: true, position: 1 },
  { key: "servicos", title: "O que fazemos", visible: true, in_menu: true, position: 2 },
  { key: "consultoria", title: "Consultoria", visible: true, in_menu: true, position: 3 },
  { key: "contato", title: "Contato", visible: true, in_menu: true, position: 4 },
];

/** Se o banco falhar, o site público continua no ar com todas as páginas visíveis. */
export async function getSitePages(): Promise<SitePage[]> {
  try {
    const sql = await db();
    return await sql<SitePage[]>`SELECT key, title, visible, in_menu, position FROM site_pages ORDER BY position`;
  } catch (err) {
    console.error("[newz] Banco indisponível, usando páginas padrão:", err);
    return DEFAULT_PAGES;
  }
}

/** Bloqueia a página se estiver oculta. O administrador logado continua vendo (pré-visualização). */
export async function guardPage(key: string) {
  const pages = await getSitePages();
  const page = pages.find((p) => p.key === key);
  if (page && !page.visible && !(await isAdmin())) notFound();
  return { hiddenPreview: page ? !page.visible : false };
}

export const WHATSAPP = "5511961814128";
export const WHATSAPP_LABEL = "(11) 96181-4128";
