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
const MAX_PRODUCT_IMAGES = 5;
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
  const images = getOptionalFiles(formData.getAll("images"));
  const imageRole = formData.get("imageRole") === "gallery" ? "gallery" : "primary";

  const { data, error } = await supabase
    .from("products")
    .insert({
      availability: parseAvailability(formData.get("availability")),
      business_id: businessId,
      created_by: user.id,
      currency: "COP",
      description: getOptionalString(formData.get("description")),
      discount_ends_at: parseOptionalDateTime(formData.get("discountEndsAt")),
      discount_label: getOptionalString(formData.get("discountLabel")),
      discount_percentage: parseDiscountPercentage(
        formData.get("discountPercentage"),
      ),
      discount_starts_at: parseOptionalDateTime(formData.get("discountStartsAt")),
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

  if (images.length > 0) {
    await uploadImagesToProduct({
      businessId,
      currentImageCount: 0,
      files: images,
      imageRole,
      productId: data.id,
      productSlug: slug,
      supabase,
      userId: user.id,
    });
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
      discount_ends_at: parseOptionalDateTime(formData.get("discountEndsAt")),
      discount_label: getOptionalString(formData.get("discountLabel")),
      discount_percentage: parseDiscountPercentage(
        formData.get("discountPercentage"),
      ),
      discount_starts_at: parseOptionalDateTime(formData.get("discountStartsAt")),
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

export async function hideProductAction(formData: FormData) {
  const businessId = getRequiredString(formData.get("businessId"), "businessId");
  const productId = getRequiredString(formData.get("productId"), "productId");
  const { user } = await requireBusinessRole(businessId, [...EDITABLE_ROLES]);
  const supabase = await getAuthedClient();

  const { data: product, error } = await supabase
    .from("products")
    .update({ status: "hidden", updated_by: user.id })
    .eq("id", productId)
    .eq("business_id", businessId)
    .select("slug, businesses(slug)")
    .single();

  if (error || !product) {
    throw new Error(`No se pudo ocultar el producto: ${error?.message}`);
  }

  await logBusinessAudit({
    action: "product_updated",
    actorUserId: user.id,
    businessId,
    metadata: { product_id: productId, status: "hidden" },
    supabase,
  });

  revalidateProductPaths(businessId, getJoinedSlug(product.businesses), product.slug);
}

export async function uploadProductImageAction(formData: FormData) {
  const businessId = getRequiredString(formData.get("businessId"), "businessId");
  const productId = getRequiredString(formData.get("productId"), "productId");
  const files = getRequiredFiles(formData.getAll("images"), formData.get("image"));
  const imageRole = formData.get("imageRole") === "gallery" ? "gallery" : "primary";
  const { user } = await requireBusinessRole(businessId, [...EDITABLE_ROLES]);
  const supabase = await getAuthedClient();

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("slug, business_id, businesses(slug)")
    .eq("id", productId)
    .eq("business_id", businessId)
    .single();

  if (productError || !product) {
    throw new Error("No se encontro el producto para subir imagen.");
  }

  const { count: currentImageCount, error: countError } = await supabase
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);

  if (countError) {
    throw new Error(`No se pudo validar la galeria: ${countError.message}`);
  }

  const insertedCount = await uploadImagesToProduct({
    businessId,
    currentImageCount: currentImageCount ?? 0,
    files,
    imageRole,
    productId,
    productSlug: product.slug,
    supabase,
    userId: user.id,
  });

  await logBusinessAudit({
    action: "product_image_updated",
    actorUserId: user.id,
    businessId,
    metadata: {
      bucket: PRODUCT_IMAGE_BUCKET,
      count: insertedCount,
      product_id: productId,
      role: imageRole,
    },
    supabase,
  });

  revalidateProductPaths(businessId, getJoinedSlug(product.businesses), product.slug);
  redirect(`/dashboard/negocios/${businessId}/productos/${productId}?saved=1`);
}

async function uploadImagesToProduct({
  businessId,
  currentImageCount,
  files,
  imageRole,
  productId,
  productSlug,
  supabase,
  userId,
}: {
  businessId: string;
  currentImageCount: number;
  files: File[];
  imageRole: "gallery" | "primary";
  productId: string;
  productSlug: string;
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>;
  userId: string;
}) {
  for (const file of files) {
    validateImageFile(file);

    if (!(await hasValidImageSignature(file))) {
      throw new Error("El archivo no coincide con un tipo de imagen permitido.");
    }
  }

  const availableSlots = MAX_PRODUCT_IMAGES - currentImageCount;

  if (availableSlots <= 0 || files.length > availableSlots) {
    throw new Error(`Cada producto puede tener maximo ${MAX_PRODUCT_IMAGES} imagenes.`);
  }

  const { data: orderRows, error: orderError } = await supabase
    .from("product_images")
    .select("sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: false })
    .limit(1);

  if (orderError) {
    throw new Error(`No se pudo preparar la galeria: ${orderError.message}`);
  }

  const firstSortOrder = (orderRows?.[0]?.sort_order ?? -1) + 1;

  for (const [index, file] of files.entries()) {
    const shouldBePrimary =
      (imageRole === "primary" && index === 0) ||
      (currentImageCount === 0 && index === 0);
    const path = `${businessId}/${productId}/${Date.now()}-${index}.${getImageExtension(file)}`;
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

    if (shouldBePrimary) {
      const { error: clearPrimaryError } = await supabase
        .from("product_images")
        .update({ is_primary: false })
        .eq("product_id", productId);

      if (clearPrimaryError) {
        throw new Error(
          `No se pudo actualizar la imagen principal: ${clearPrimaryError.message}`,
        );
      }
    }

    const { error: insertError } = await supabase.from("product_images").insert({
      alt_text: `Imagen de ${productSlug}`,
      bucket: PRODUCT_IMAGE_BUCKET,
      is_primary: shouldBePrimary,
      product_id: productId,
      public_url: publicUrl,
      sort_order: firstSortOrder + index,
      storage_path: path,
    });

    if (insertError) {
      throw new Error(`No se pudo registrar la imagen: ${insertError.message}`);
    }

    if (shouldBePrimary) {
      const { error: updateError } = await supabase
        .from("products")
        .update({
          primary_image_url: publicUrl,
          updated_by: userId,
        })
        .eq("id", productId)
        .eq("business_id", businessId);

      if (updateError) {
        throw new Error(`No se pudo actualizar la imagen: ${updateError.message}`);
      }
    }
  }

  return files.length;
}

export async function setPrimaryProductImageAction(formData: FormData) {
  const businessId = getRequiredString(formData.get("businessId"), "businessId");
  const productId = getRequiredString(formData.get("productId"), "productId");
  const imageId = getRequiredString(formData.get("imageId"), "imageId");
  const { user } = await requireBusinessRole(businessId, [...EDITABLE_ROLES]);
  const supabase = await getAuthedClient();
  const product = await getEditableProductForImageAction(supabase, businessId, productId);

  const { data: image, error: imageError } = await supabase
    .from("product_images")
    .select("public_url")
    .eq("id", imageId)
    .eq("product_id", productId)
    .single();

  if (imageError || !image) {
    throw new Error("No se encontro la imagen.");
  }

  const { error: clearError } = await supabase
    .from("product_images")
    .update({ is_primary: false })
    .eq("product_id", productId);

  if (clearError) {
    throw new Error(`No se pudo limpiar la imagen principal: ${clearError.message}`);
  }

  const { error: markError } = await supabase
    .from("product_images")
    .update({ is_primary: true })
    .eq("id", imageId)
    .eq("product_id", productId);

  if (markError) {
    throw new Error(`No se pudo marcar la imagen principal: ${markError.message}`);
  }

  const { error: productUpdateError } = await supabase
    .from("products")
    .update({
      primary_image_url: image.public_url,
      updated_by: user.id,
    })
    .eq("id", productId)
    .eq("business_id", businessId);

  if (productUpdateError) {
    throw new Error(
      `No se pudo actualizar la imagen principal: ${productUpdateError.message}`,
    );
  }

  await logBusinessAudit({
    action: "product_image_updated",
    actorUserId: user.id,
    businessId,
    metadata: { image_id: imageId, product_id: productId, role: "primary" },
    supabase,
  });

  revalidateProductPaths(businessId, getJoinedSlug(product.businesses), product.slug);
  redirect(`/dashboard/negocios/${businessId}/productos/${productId}?saved=1`);
}

export async function deleteProductImageAction(formData: FormData) {
  const businessId = getRequiredString(formData.get("businessId"), "businessId");
  const productId = getRequiredString(formData.get("productId"), "productId");
  const imageId = getRequiredString(formData.get("imageId"), "imageId");
  const { user } = await requireBusinessRole(businessId, [...EDITABLE_ROLES]);
  const supabase = await getAuthedClient();
  const product = await getEditableProductForImageAction(supabase, businessId, productId);

  const { data: image, error: imageError } = await supabase
    .from("product_images")
    .select("is_primary, storage_path")
    .eq("id", imageId)
    .eq("product_id", productId)
    .single();

  if (imageError || !image) {
    throw new Error("No se encontro la imagen.");
  }

  const { error: deleteRowError } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId)
    .eq("product_id", productId);

  if (deleteRowError) {
    throw new Error(`No se pudo eliminar la imagen: ${deleteRowError.message}`);
  }

  await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove([image.storage_path]);

  if (image.is_primary) {
    await promoteFallbackPrimaryImage({
      businessId,
      productId,
      supabase,
      userId: user.id,
    });
  }

  await logBusinessAudit({
    action: "product_image_updated",
    actorUserId: user.id,
    businessId,
    metadata: { deleted_image_id: imageId, product_id: productId },
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

async function getEditableProductForImageAction(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  businessId: string,
  productId: string,
) {
  if (!supabase) {
    throw new Error("Supabase Auth no esta configurado.");
  }

  const { data: product, error } = await supabase
    .from("products")
    .select("slug, business_id, businesses(slug)")
    .eq("id", productId)
    .eq("business_id", businessId)
    .single();

  if (error || !product) {
    throw new Error("No se encontro el producto.");
  }

  return product;
}

async function promoteFallbackPrimaryImage({
  businessId,
  productId,
  supabase,
  userId,
}: {
  businessId: string;
  productId: string;
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>;
  userId: string;
}) {
  const { data: fallback, error } = await supabase
    .from("product_images")
    .select("id, public_url")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo buscar imagen de respaldo: ${error.message}`);
  }

  if (fallback) {
    const { error: markError } = await supabase
      .from("product_images")
      .update({ is_primary: true })
      .eq("id", fallback.id)
      .eq("product_id", productId);

    if (markError) {
      throw new Error(`No se pudo promover la imagen: ${markError.message}`);
    }
  }

  const { error: productError } = await supabase
    .from("products")
    .update({
      primary_image_url: fallback?.public_url ?? null,
      updated_by: userId,
    })
    .eq("id", productId)
    .eq("business_id", businessId);

  if (productError) {
    throw new Error(`No se pudo actualizar el producto: ${productError.message}`);
  }
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

function parseDiscountPercentage(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 90) {
    throw new Error("El descuento debe ser un porcentaje entero entre 1 y 90.");
  }

  return parsed;
}

function parseOptionalDateTime(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error("La fecha de promocion no es valida.");
  }

  return parsed.toISOString();
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

function getOptionalFiles(values: FormDataEntryValue[]) {
  return values.filter(
    (value): value is File => value instanceof File && value.size > 0,
  );
}

function getRequiredFiles(
  values: FormDataEntryValue[],
  fallback: FormDataEntryValue | null,
) {
  const files = getOptionalFiles(values);

  if (files.length === 0 && fallback instanceof File && fallback.size > 0) {
    files.push(fallback);
  }

  if (files.length === 0) {
    throw new Error("Selecciona al menos una imagen.");
  }

  return files;
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
