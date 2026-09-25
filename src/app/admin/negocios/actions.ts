"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import type { BusinessAuditAction } from "@/lib/business-audit";
import { logBusinessAudit } from "@/lib/business-audit";
import { getSupabaseServiceRoleClient } from "@/lib/supabase";

const ACTIONS = [
  "publish",
  "unpublish",
  "verify",
  "unverify",
  "feature",
  "unfeature",
  "suspend",
  "reactivate",
] as const;

export async function moderateBusinessAction(formData: FormData) {
  const { user } = await requireAdmin();
  const supabase = getSupabaseServiceRoleClient();

  if (!supabase) {
    throw new Error("Supabase service role no esta configurado.");
  }

  const businessId = getRequiredString(formData.get("businessId"), "businessId");
  const action = getRequiredString(formData.get("action"), "action");
  const { auditAction, field, value } = getModerationUpdate(action);

  const { data: business, error } = await supabase
    .from("businesses")
    .update({ [field]: value })
    .eq("id", businessId)
    .select("id, slug")
    .single();

  if (error || !business) {
    throw new Error(`No se pudo actualizar el negocio: ${error?.message}`);
  }

  await logBusinessAudit({
    action: auditAction,
    actorUserId: user.id,
    businessId,
    metadata: { field, value },
    supabase,
  });

  revalidatePath("/admin/negocios");
  revalidatePath(`/admin/negocios/${businessId}`);
  revalidatePath("/comercios");
  revalidatePath(`/comercios/${business.slug}`);
}

function getModerationUpdate(action: string): {
  auditAction: BusinessAuditAction;
  field: "featured" | "published" | "suspended" | "verified";
  value: boolean;
} {
  if (!ACTIONS.includes(action as (typeof ACTIONS)[number])) {
    throw new Error("Accion de moderacion invalida.");
  }

  switch (action) {
    case "publish":
      return { auditAction: "business_profile_updated", field: "published", value: true };
    case "unpublish":
      return { auditAction: "business_profile_updated", field: "published", value: false };
    case "verify":
      return { auditAction: "business_profile_updated", field: "verified", value: true };
    case "unverify":
      return { auditAction: "business_profile_updated", field: "verified", value: false };
    case "feature":
      return { auditAction: "business_profile_updated", field: "featured", value: true };
    case "unfeature":
      return { auditAction: "business_profile_updated", field: "featured", value: false };
    case "suspend":
      return { auditAction: "business_moderated", field: "suspended", value: true };
    default:
      return { auditAction: "business_moderated", field: "suspended", value: false };
  }
}

function getRequiredString(value: FormDataEntryValue | null, field: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} es obligatorio.`);
  }

  return value.trim();
}
