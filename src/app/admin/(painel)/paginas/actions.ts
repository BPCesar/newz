"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function togglePage(formData: FormData) {
  await requireAdmin();
  const key = String(formData.get("key") || "");
  const field = String(formData.get("field") || "");
  const sql = await db();
  if (field === "visible") await sql`UPDATE site_pages SET visible = NOT visible WHERE key = ${key}`;
  if (field === "in_menu") await sql`UPDATE site_pages SET in_menu = NOT in_menu WHERE key = ${key}`;
  revalidatePath("/", "layout");
}
