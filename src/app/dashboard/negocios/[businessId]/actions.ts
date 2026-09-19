"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { requireBusinessRole } from "@/lib/auth";
import { logBusinessAudit } from "@/lib/business-audit";
import { BUSINESS_STATUSES, type BusinessStatus } from "@/types/business";

const EDITABLE_ROLES = ["owner", "manager"] as const;
const SOCIAL_PLATFORMS = ["instagram", "facebook", "tiktok", "website"] as const;
const BUSINESS_IMAGE_TYPES = ["logo", "cover"] as const;
const LOGO_BUCKET =
  process.env.SUPABASE_BUSINESS_LOGOS_BUCKET ?? "business-logos";
const COVER_BUCKET =
  process.env.SUPABASE_BUSINESS_COVERS_BUCKET ?? "business-covers";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/heic",
  "image/heif",
  "image/png",
  "image/jpeg",
  "image/webp",
];

export async function updateBusinessProfileAction(formData: FormData) {
  const businessId = getRequiredString(formData.get("businessId"), "businessId");
  const { user } = await requireBusinessRole(businessId, [...EDITABLE_ROLES]);

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    throw new Error("Supabase Auth no esta configurado.");
  }

  const name = getRequiredString(formData.get("name"), "Nombre comercial");
  const shortDescription = getRequiredString(
    formData.get("shortDescription"),
    "Descripcion corta",
  );
  const fullDescription = getOptionalString(formData.get("fullDescription"));
  const status = parseBusinessStatus(formData.get("status"));
  const phone = getOptionalString(formData.get("phone"));
  const whatsapp = cleanPhoneLike(formData.get("whatsapp"));
  const address = getOptionalString(formData.get("address"));
  const mapsUrl = normalizeOptionalUrl(
    getOptionalString(formData.get("mapsUrl")),
    "Maps",
  );
  const schedule = getOptionalString(formData.get("schedule"));

  if (name.length > 90) {
    throw new Error("El nombre comercial debe tener maximo 90 caracteres.");
  }

  if (shortDescription.length > 420) {
    throw new Error("La descripcion corta debe tener maximo 420 caracteres.");
  }

  if (fullDescription && fullDescription.length > 1200) {
    throw new Error("La descripcion completa debe tener maximo 1200 caracteres.");
  }

  if (phone && phone.length > 30) {
    throw new Error("El telefono debe tener maximo 30 caracteres.");
  }

  if (whatsapp && !/^\d{10,15}$/.test(whatsapp)) {
    throw new Error("El WhatsApp debe tener entre 10 y 15 digitos.");
  }

  if (address && address.length > 180) {
    throw new Error("La direccion debe tener maximo 180 caracteres.");
  }

  if (schedule && schedule.length > 160) {
    throw new Error("El horario debe tener maximo 160 caracteres.");
  }

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .update({
      name,
      short_description: shortDescription,
      full_description: fullDescription,
      status,
      phone,
      whatsapp: whatsapp || null,
      address,
      maps_url: mapsUrl,
      schedule,
    })
    .eq("id", businessId)
    .select("slug")
    .single();

  if (businessError || !business) {
    throw new Error(`No se pudo actualizar el negocio: ${businessError?.message}`);
  }

  await upsertSocialLinks(formData, businessId);
  await logBusinessAudit({
    action: "business_profile_updated",
    actorUserId: user.id,
    businessId,
    metadata: {
      fields: [
        "name",
        "short_description",
        "full_description",
        "status",
        "phone",
        "whatsapp",
        "address",
        "maps_url",
        "schedule",
        "social_links",
      ],
    },
    supabase,
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/negocios/${businessId}`);
  revalidatePath("/comercios");
  revalidatePath(`/comercios/${business.slug}`);
  redirect(`/dashboard/negocios/${businessId}?saved=1`);
}

export async function uploadBusinessImageAction(formData: FormData) {
  const businessId = getRequiredString(formData.get("businessId"), "businessId");
  const imageType = parseBusinessImageType(formData.get("imageType"));
  const file = getRequiredFile(formData.get("image"), imageType);
  const { user } = await requireBusinessRole(businessId, [...EDITABLE_ROLES]);

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    throw new Error("Supabase Auth no esta configurado.");
  }

  validateImageFile(file, imageType);

  if (!(await hasValidImageSignature(file))) {
    throw new Error("El archivo no coincide con un tipo de imagen permitido.");
  }

  const bucket = imageType === "logo" ? LOGO_BUCKET : COVER_BUCKET;
  const path = `${businessId}/${imageType}-${Date.now()}.${getImageExtension(file)}`;
  const { error: uploadError } = await supabase.storage
    .from(bucket)
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
  } = supabase.storage.from(bucket).getPublicUrl(path);
  const column = imageType === "logo" ? "logo_url" : "cover_image_url";
  const { data: business, error: updateError } = await supabase
    .from("businesses")
    .update({ [column]: publicUrl })
    .eq("id", businessId)
    .select("slug")
    .single();

  if (updateError || !business) {
    throw new Error(`No se pudo actualizar la imagen: ${updateError?.message}`);
  }

  await logBusinessAudit({
    action:
      imageType === "logo" ? "business_logo_updated" : "business_cover_updated",
    actorUserId: user.id,
    businessId,
    metadata: {
      bucket,
      path,
    },
    supabase,
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/negocios/${businessId}`);
  revalidatePath("/comercios");
  revalidatePath(`/comercios/${business.slug}`);
  redirect(`/dashboard/negocios/${businessId}?saved=1`);
}

async function upsertSocialLinks(formData: FormData, businessId: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    throw new Error("Supabase Auth no esta configurado.");
  }

  const links = SOCIAL_PLATFORMS.map((platform, index) => ({
    platform,
    url: normalizeOptionalUrl(getOptionalString(formData.get(platform)), platform),
    sort_order: index,
  }));

  for (const link of links) {
    if (!link.url) {
      const { error } = await supabase
        .from("business_social_links")
        .delete()
        .eq("business_id", businessId)
        .eq("platform", link.platform);

      if (error) {
        throw new Error(`No se pudo eliminar ${link.platform}: ${error.message}`);
      }

      continue;
    }

    const { error } = await supabase.from("business_social_links").upsert(
      {
        business_id: businessId,
        platform: link.platform,
        url: link.url,
        sort_order: link.sort_order,
      },
      { onConflict: "business_id,platform" },
    );

    if (error) {
      throw new Error(`No se pudo guardar ${link.platform}: ${error.message}`);
    }
  }
}

function parseBusinessStatus(value: FormDataEntryValue | null): BusinessStatus {
  const status = getRequiredString(value, "Estado operativo");

  if (!BUSINESS_STATUSES.includes(status as BusinessStatus)) {
    throw new Error("El estado operativo no es valido.");
  }

  return status as BusinessStatus;
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

function cleanPhoneLike(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.replace(/\D/g, "") : "";
}

function normalizeOptionalUrl(value: string | null, field: string) {
  if (!value) {
    return null;
  }

  const normalized = /^https?:\/\//i.test(value)
    ? value.replace(/^http:\/\//i, "https://")
    : `https://${value.replace(/^\/+/, "")}`;

  try {
    const url = new URL(normalized);

    if (url.protocol !== "https:") {
      throw new Error();
    }

    return url.toString();
  } catch {
    throw new Error(`${field} debe ser una URL https valida.`);
  }
}

function parseBusinessImageType(value: FormDataEntryValue | null) {
  if (
    typeof value === "string" &&
    BUSINESS_IMAGE_TYPES.includes(value as (typeof BUSINESS_IMAGE_TYPES)[number])
  ) {
    return value as (typeof BUSINESS_IMAGE_TYPES)[number];
  }

  throw new Error("El tipo de imagen no es valido.");
}

function getRequiredFile(value: FormDataEntryValue | null, imageType: string) {
  if (!(value instanceof File) || value.size === 0) {
    throw new Error(`Selecciona una imagen para ${imageType}.`);
  }

  return value;
}

function validateImageFile(file: File, imageType: string) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(`${imageType} debe ser PNG, JPG, WebP, HEIC o HEIF.`);
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(`${imageType} debe pesar 5 MB o menos.`);
  }
}

function getImageExtension(file: File) {
  if (file.type === "image/png") {
    return "png";
  }

  if (file.type === "image/webp") {
    return "webp";
  }

  if (file.type === "image/heic") {
    return "heic";
  }

  if (file.type === "image/heif") {
    return "heif";
  }

  return "jpg";
}

async function hasValidImageSignature(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());

  if (file.type === "image/png") {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
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

    return (
      brand.startsWith("ftyp") &&
      ["heic", "heix", "hevc", "hevx", "mif1", "msf1"].some((value) =>
        brand.includes(value),
      )
    );
  }

  return false;
}
