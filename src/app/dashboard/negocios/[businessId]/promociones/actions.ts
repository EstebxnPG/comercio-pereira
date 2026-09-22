"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireBusinessRole } from "@/lib/auth";
import { logBusinessAudit } from "@/lib/business-audit";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const PROMOTION_TYPES = [
  "coupon_amount",
  "custom_message",
  "free_shipping",
  "store_percentage",
] as const;
const PROMOTION_STATUSES = ["active", "draft", "paused"] as const;

export async function savePromotionAction(formData: FormData) {
  const businessId = getRequiredString(formData.get("businessId"), "businessId");
  const promotionId = getOptionalString(formData.get("promotionId"));
  const { user } = await requireBusinessRole(businessId, ["owner", "manager"]);
  const supabase = await getAuthedClient();
  const business = await getBusinessSlug(supabase, businessId);
  const type = parsePromotionType(formData.get("type"));
  const payload = {
    business_id: businessId,
    created_by: user.id,
    description: getOptionalString(formData.get("description")),
    ends_at: parseOptionalDateTime(formData.get("endsAt")),
    minimum_order_amount: parseMoneyCents(formData.get("minimumOrderAmount")),
    starts_at: parseOptionalDateTime(formData.get("startsAt")),
    status: parsePromotionStatus(formData.get("status")),
    title: getRequiredString(formData.get("title"), "Titulo"),
    type,
    updated_by: user.id,
    value: parsePromotionValue(type, formData.get("value")),
  };

  if (promotionId) {
    const { error } = await supabase
      .from("business_promotions")
      .update({
        description: payload.description,
        ends_at: payload.ends_at,
        minimum_order_amount: payload.minimum_order_amount,
        starts_at: payload.starts_at,
        status: payload.status,
        title: payload.title,
        type: payload.type,
        updated_by: payload.updated_by,
        value: payload.value,
      })
      .eq("id", promotionId)
      .eq("business_id", businessId);

    if (error) {
      throw new Error(`No se pudo actualizar la promocion: ${error.message}`);
    }

    await logBusinessAudit({
      action: "promotion_updated",
      actorUserId: user.id,
      businessId,
      metadata: { promotion_id: promotionId, type },
      supabase,
    });
  } else {
    const { data, error } = await supabase
      .from("business_promotions")
      .insert(payload)
      .select("id")
      .single();

    if (error || !data) {
      throw new Error(`No se pudo crear la promocion: ${error?.message}`);
    }

    await logBusinessAudit({
      action: "promotion_created",
      actorUserId: user.id,
      businessId,
      metadata: { promotion_id: data.id, type },
      supabase,
    });
  }

  revalidatePromotionPaths(businessId, business.slug);
  redirect(`/dashboard/negocios/${businessId}/promociones?saved=1`);
}

export async function deletePromotionAction(formData: FormData) {
  const businessId = getRequiredString(formData.get("businessId"), "businessId");
  const promotionId = getRequiredString(formData.get("promotionId"), "promotionId");
  const { user } = await requireBusinessRole(businessId, ["owner", "manager"]);
  const supabase = await getAuthedClient();
  const business = await getBusinessSlug(supabase, businessId);

  const { error } = await supabase
    .from("business_promotions")
    .delete()
    .eq("id", promotionId)
    .eq("business_id", businessId);

  if (error) {
    throw new Error(`No se pudo eliminar la promocion: ${error.message}`);
  }

  await logBusinessAudit({
    action: "promotion_deleted",
    actorUserId: user.id,
    businessId,
    metadata: { promotion_id: promotionId },
    supabase,
  });

  revalidatePromotionPaths(businessId, business.slug);
  redirect(`/dashboard/negocios/${businessId}/promociones?saved=1`);
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

function parsePromotionType(value: FormDataEntryValue | null) {
  if (
    typeof value === "string" &&
    PROMOTION_TYPES.includes(value as (typeof PROMOTION_TYPES)[number])
  ) {
    return value;
  }

  throw new Error("El tipo de promocion no es valido.");
}

function parsePromotionStatus(value: FormDataEntryValue | null) {
  if (
    typeof value === "string" &&
    PROMOTION_STATUSES.includes(value as (typeof PROMOTION_STATUSES)[number])
  ) {
    return value;
  }

  return "draft";
}

function parsePromotionValue(type: string, value: FormDataEntryValue | null) {
  if (type === "coupon_amount") {
    const parsed = parseMoneyCents(value);

    if (parsed === null) {
      throw new Error("El cupon en pesos necesita un valor.");
    }

    return parsed;
  }

  if (type === "store_percentage") {
    const parsed = parsePercentage(value);

    if (parsed === null) {
      throw new Error("El descuento de tienda necesita un porcentaje.");
    }

    return parsed;
  }

  return null;
}

function parseMoneyCents(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const normalized = Number(value.replace(/[^\d]/g, ""));

  if (!Number.isFinite(normalized) || normalized < 0) {
    throw new Error("El valor monetario no es valido.");
  }

  return normalized * 100;
}

function parsePercentage(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 90) {
    throw new Error("El porcentaje debe ser un entero entre 1 y 90.");
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

function revalidatePromotionPaths(businessId: string, businessSlug: string) {
  revalidatePath(`/dashboard/negocios/${businessId}`);
  revalidatePath(`/dashboard/negocios/${businessId}/promociones`);
  revalidatePath(`/dashboard/negocios/${businessId}/estadisticas`);
  revalidatePath(`/comercios/${businessSlug}`);
}
