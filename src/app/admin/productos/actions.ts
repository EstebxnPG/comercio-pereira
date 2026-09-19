"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { logBusinessAudit } from "@/lib/business-audit";
import { getSupabaseServiceRoleClient } from "@/lib/supabase";

export async function moderateProductAction(formData: FormData) {
  const { user } = await requireAdmin();
  const supabase = getSupabaseServiceRoleClient();

  if (!supabase) {
    throw new Error("Supabase service role no esta configurado.");
  }

  const productId = getRequiredString(formData.get("productId"), "productId");
  const action = getRequiredString(formData.get("action"), "action");

  const { data: product, error: readError } = await supabase
    .from("products")
    .select("id, business_id, slug, featured, businesses(slug)")
    .eq("id", productId)
    .single();

  if (readError || !product) {
    throw new Error("No se encontro el producto.");
  }

  const nextValues = getModerationUpdate(action, product.featured);
  const { error } = await supabase
    .from("products")
    .update(nextValues)
    .eq("id", productId);

  if (error) {
    throw new Error(`No se pudo moderar el producto: ${error.message}`);
  }

  await logBusinessAudit({
    action: getAuditAction(action),
    actorUserId: user.id,
    businessId: product.business_id,
    metadata: { product_id: productId },
    supabase,
  });

  revalidatePath("/admin/productos");
  revalidatePath("/admin/moderacion");
  revalidatePath("/productos");
  revalidatePath(`/productos/${product.slug}`);

  const businessSlug = getJoinedSlug(product.businesses);

  if (businessSlug) {
    revalidatePath(`/comercios/${businessSlug}`);
  }
}

function getModerationUpdate(action: string, currentFeatured: boolean) {
  if (action === "approve") {
    return {
      moderation_status: "approved",
      published_at: new Date().toISOString(),
      rejection_reason: null,
      status: "published",
    };
  }

  if (action === "reject") {
    return {
      moderation_status: "rejected",
      published_at: null,
      rejection_reason: "Rechazado por moderacion.",
      status: "rejected",
    };
  }

  if (action === "hide") {
    return {
      published_at: null,
      status: "hidden",
    };
  }

  if (action === "feature") {
    return {
      featured: !currentFeatured,
    };
  }

  throw new Error("Accion de moderacion invalida.");
}

function getAuditAction(action: string) {
  if (action === "approve") return "product_approved";
  if (action === "reject") return "product_rejected";
  if (action === "hide") return "product_hidden";
  return "product_featured";
}

function getRequiredString(value: FormDataEntryValue | null, field: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} es obligatorio.`);
  }

  return value.trim();
}

function getJoinedSlug(value: unknown) {
  if (Array.isArray(value)) {
    return typeof value[0]?.slug === "string" ? value[0].slug : "";
  }

  return typeof (value as { slug?: unknown } | null)?.slug === "string"
    ? (value as { slug: string }).slug
    : "";
}
