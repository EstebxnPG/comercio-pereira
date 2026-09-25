"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { getSupabaseServiceRoleClient } from "@/lib/supabase";

export async function createCategoryAction(formData: FormData) {
  await requireAdmin();
  const supabase = getRequiredClient();
  const name = getRequiredString(formData.get("name"), "Nombre");
  const slug = await buildUniqueSlug(supabase, getOptionalString(formData.get("slug")) || name);

  const { error } = await supabase.from("categories").insert({
    description: getRequiredString(formData.get("description"), "Descripcion"),
    icon: getRequiredString(formData.get("icon"), "Icono"),
    name,
    show_on_home: formData.get("showOnHome") === "on",
    slug,
    sort_order: parseSortOrder(formData.get("sortOrder")),
  });

  if (error) {
    throw new Error(`No se pudo crear la categoria: ${error.message}`);
  }

  revalidatePath("/admin/categorias");
}

export async function updateCategoryAction(formData: FormData) {
  await requireAdmin();
  const supabase = getRequiredClient();
  const categoryId = getRequiredString(formData.get("categoryId"), "categoryId");

  const { error } = await supabase
    .from("categories")
    .update({
      description: getRequiredString(formData.get("description"), "Descripcion"),
      icon: getRequiredString(formData.get("icon"), "Icono"),
      name: getRequiredString(formData.get("name"), "Nombre"),
      show_on_home: formData.get("showOnHome") === "on",
      slug: getRequiredString(formData.get("slug"), "Slug"),
      sort_order: parseSortOrder(formData.get("sortOrder")),
    })
    .eq("id", categoryId);

  if (error) {
    throw new Error(`No se pudo actualizar la categoria: ${error.message}`);
  }

  revalidatePath("/admin/categorias");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();
  const supabase = getRequiredClient();
  const categoryId = getRequiredString(formData.get("categoryId"), "categoryId");

  const { count, error: countError } = await supabase
    .from("businesses")
    .select("id", { count: "exact", head: true })
    .eq("category_id", categoryId);

  if (countError) {
    throw new Error(`No se pudo validar la categoria: ${countError.message}`);
  }

  if ((count ?? 0) > 0) {
    throw new Error(
      "No puedes eliminar una categoria con negocios asociados. Reasigna esos negocios primero.",
    );
  }

  const { error } = await supabase.from("categories").delete().eq("id", categoryId);

  if (error) {
    throw new Error(`No se pudo eliminar la categoria: ${error.message}`);
  }

  revalidatePath("/admin/categorias");
}

function getRequiredClient() {
  const supabase = getSupabaseServiceRoleClient();

  if (!supabase) {
    throw new Error("Supabase service role no esta configurado.");
  }

  return supabase;
}

async function buildUniqueSlug(
  supabase: NonNullable<ReturnType<typeof getSupabaseServiceRoleClient>>,
  source: string,
) {
  const base = slugify(source) || "categoria";

  for (let index = 0; index < 20; index += 1) {
    const candidate = index === 0 ? base : `${base}-${index + 1}`;
    const { data } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (!data) {
      return candidate;
    }
  }

  return `${base}-${Date.now()}`;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

function parseSortOrder(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) {
    return 0;
  }

  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) ? parsed : 0;
}

function getRequiredString(value: FormDataEntryValue | null, field: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} es obligatorio.`);
  }

  return value.trim();
}

function getOptionalString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}
