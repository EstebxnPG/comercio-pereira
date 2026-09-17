"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireBusinessRole } from "@/lib/auth";
import { logBusinessAudit } from "@/lib/business-audit";
import { slugifyProduct } from "@/lib/products";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const EDITABLE_ROLES = ["owner", "manager", "editor"] as const;
const PRODUCT_IMAGE_BUCKET =
  process.env.SUPABASE_PRODUCT_IMAGES_BUCKET ?? "product-images";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/heic",
  "image/heif",
  "image/png",
  "image/jpeg",
  "image/webp",
];

export async function createProductAction(formData: FormData) {
  const businessId = getRequiredString(formData.get("businessId"), "businessId");
  const { user } = await requireBusinessRole(businessId, [...EDITABLE_ROLES]);
  const supabase = await getAuthedClient();
  const business = await getBusinessSlug(supabase, businessId);
  const name = getRequiredString(formData.get("name"), "Nombre");
  const slug = await buildUniqueProductSlug(supabase, business.slug, name);
  const status = parseRequestedStatus(formData.get("intent"));

  const { data, error } = await supabase
    .from("products")
    .insert({
      availability: parseAvailability(formData.get("availability")),
      business_id: businessId,
      created_by: user.id,
      currency: "COP",
      description: getOptionalString(formData.get("description")),
      moderation_status: status === "pending_review" ? "pending" : "draft",
      name,
      price_cents: parsePriceCents(formData.get("price")),
      price_label: getOptionalString(formData.get("priceLabel")),
      short_description: getRequiredString(
        formData.get("shortDescription"),
        "Descripcion corta",
      ),
      slug,
      status,
      updated_by: user.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`No se pudo crear el producto: ${error?.message}`);
  }

  await logBusinessAudit({
    action: "product_created",
    actorUserId: user.id,
    businessId,
    metadata: { product_id: data.id, status },
    supabase,
  });

  revalidateProductPaths(businessId, business.slug);
  redirect(`/dashboard/negocios/${businessId}/productos/${data.id}?saved=1`);
}

export async function updateProductAction(formData: FormData) {
  const businessId = getRequiredString(formData.get("businessId"), "businessId");
  const productId = getRequiredString(formData.get("productId"), "productId");
  const { user } = await requireBusinessRole(businessId, [...EDITABLE_ROLES]);
  const supabase = await getAuthedClient();
  const status = parseRequestedStatus(formData.get("intent"));

  const { data: product, error } = await supabase
    .from("products")
    .update({
      availability: parseAvailability(formData.get("availability")),
      description: getOptionalString(formData.get("description")),
      moderation_status: status === "pending_review" ? "pending" : "draft",
      name: getRequiredString(formData.get("name"), "Nombre"),
      price_cents: parsePriceCents(formData.get("price")),
      price_label: getOptionalString(formData.get("priceLabel")),
      short_description: getRequiredString(
        formData.get("shortDescription"),
        "Descripcion corta",
      ),
      status,
      updated_by: user.id,
    })
    .eq("id", productId)
    .eq("business_id", businessId)
    .select("slug, businesses(slug)")
    .single();

  if (error || !product) {
    throw new Error(`No se pudo actualizar el producto: ${error?.message}`);
  }

  await logBusinessAudit({
    action: "product_updated",
    actorUserId: user.id,
    businessId,
    metadata: { product_id: productId, status },
    supabase,
  });

  const businessSlug = getJoinedSlug(product.businesses);
  revalidateProductPaths(businessId, businessSlug, product.slug);
  redirect(`/dashboard/negocios/${businessId}/productos/${productId}?saved=1`);
}

export async function uploadProductImageAction(formData: FormData) {
  const businessId = getRequiredString(formData.get("businessId"), "businessId");
  const productId = getRequiredString(formData.get("productId"), "productId");
  const file = getRequiredFile(formData.get("image"));
  const { user } = await requireBusinessRole(businessId, [...EDITABLE_ROLES]);
  const supabase = await getAuthedClient();

  validateImageFile(file);

  if (!(await hasValidImageSignature(file))) {
    throw new Error("El archivo no coincide con un tipo de imagen permitido.");
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("slug, business_id, businesses(slug)")
    .eq("id", productId)
    .eq("business_id", businessId)
    .single();

  if (productError || !product) {
    throw new Error("No se encontro el producto para subir imagen.");
  }

  const path = `${businessId}/${productId}/main-${Date.now()}.${getImageExtension(file)}`;
  const { error: uploadError } = await supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`No se pudo subir la imagen: ${uploadError.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path);

  const { error: updateError } = await supabase
    .from("products")
    .update({
      primary_image_url: publicUrl,
      updated_by: user.id,
    })
    .eq("id", productId)
    .eq("business_id", businessId);

  if (updateError) {
    throw new Error(`No se pudo actualizar la imagen: ${updateError.message}`);
  }

  await supabase.from("product_images").insert({
    alt_text: `Imagen de ${product.slug}`,
    bucket: PRODUCT_IMAGE_BUCKET,
    is_primary: true,
    product_id: productId,
    public_url: publicUrl,
    storage_path: path,
  });

  await logBusinessAudit({
    action: "product_image_updated",
    actorUserId: user.id,
    businessId,
    metadata: { bucket: PRODUCT_IMAGE_BUCKET, path, product_id: productId },
    supabase,
  });

  revalidateProductPaths(businessId, getJoinedSlug(product.businesses), product.slug);
  redirect(`/dashboard/negocios/${businessId}/productos/${productId}?saved=1`);
}

async function getAuthedClient() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    throw new Error("Supabase Auth no esta configurado.");
  }

  return supabase;
}

async function getBusinessSlug(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  businessId: string,
) {
  if (!supabase) {
    throw new Error("Supabase Auth no esta configurado.");
  }

  const { data, error } = await supabase
    .from("businesses")
    .select("slug")
    .eq("id", businessId)
    .single();

  if (error || !data) {
    throw new Error("No se encontro el negocio.");
  }

  return data;
}

async function buildUniqueProductSlug(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  businessSlug: string,
  name: string,
) {
  if (!supabase) {
    throw new Error("Supabase Auth no esta configurado.");
  }

  const base = `${businessSlug}-${slugifyProduct(name) || "producto"}`.slice(0, 82);

  for (let index = 0; index < 20; index += 1) {
    const candidate = index === 0 ? base : `${base}-${index + 1}`;
    const { data } = await supabase
      .from("products")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (!data) {
      return candidate;
    }
  }

  return `${base}-${Date.now()}`;
}

function parseRequestedStatus(value: FormDataEntryValue | null) {
  if (value === "hide") {
    return "hidden";
  }

  return value === "submit" ? "pending_review" : "draft";
}

function parseAvailability(value: FormDataEntryValue | null) {
  const allowed = ["available", "out_of_stock", "on_request", "discontinued"];

  if (typeof value === "string" && allowed.includes(value)) {
    return value;
  }

  return "available";
}

function parsePriceCents(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const normalized = Number(value.replace(/[^\d]/g, ""));

  if (!Number.isFinite(normalized) || normalized < 0) {
    throw new Error("El precio no es valido.");
  }

  return normalized * 100;
}

function getRequiredString(value: FormDataEntryValue | null, field: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} es obligatorio.`);
  }

  return value.trim();
}

function getOptionalString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() || null : null;
}

function getRequiredFile(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size === 0) {
    throw new Error("Selecciona una imagen.");
  }

  return value;
}

function validateImageFile(file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("La imagen debe ser PNG, JPG, WebP, HEIC o HEIF.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("La imagen debe pesar 5 MB o menos.");
  }
}

function getImageExtension(file: File) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/heic") return "heic";
  if (file.type === "image/heif") return "heif";
  return "jpg";
}

async function hasValidImageSignature(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());

  if (file.type === "image/png") {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    );
  }

  if (file.type === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (file.type === "image/webp") {
    return (
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    );
  }

  if (file.type === "image/heic" || file.type === "image/heif") {
    const brand = String.fromCharCode(...bytes.slice(4, 12));
    return brand.startsWith("ftyp");
  }

  return false;
}

function getJoinedSlug(value: unknown) {
  if (Array.isArray(value)) {
    return typeof value[0]?.slug === "string" ? value[0].slug : "";
  }

  return typeof (value as { slug?: unknown } | null)?.slug === "string"
    ? (value as { slug: string }).slug
    : "";
}

function revalidateProductPaths(
  businessId: string,
  businessSlug?: string,
  productSlug?: string,
) {
  revalidatePath(`/dashboard/negocios/${businessId}/productos`);
  revalidatePath(`/dashboard/negocios/${businessId}/estadisticas`);
  revalidatePath("/productos");

  if (businessSlug) {
    revalidatePath(`/comercios/${businessSlug}`);
  }

  if (productSlug) {
    revalidatePath(`/productos/${productSlug}`);
  }
}
