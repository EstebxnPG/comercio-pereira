import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export type BusinessAuditAction =
  | "business_profile_updated"
  | "business_logo_updated"
  | "business_cover_updated"
  | "business_invites_claimed"
  | "business_owner_assigned"
  | "product_created"
  | "product_updated"
  | "product_image_updated"
  | "product_approved"
  | "product_rejected"
  | "product_hidden"
  | "product_featured";

export async function logBusinessAudit({
  action,
  actorUserId,
  businessId,
  metadata = {},
  supabase,
}: {
  action: BusinessAuditAction;
  actorUserId: string | null;
  businessId: string;
  metadata?: Record<string, unknown>;
  supabase: SupabaseClient;
}) {
  const { error } = await supabase.from("business_audit_logs").insert({
    action,
    actor_user_id: actorUserId,
    business_id: businessId,
    metadata,
  });

  if (error) {
    throw new Error(`No se pudo guardar auditoria: ${error.message}`);
  }
}
