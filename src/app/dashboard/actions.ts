"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { logBusinessAudit } from "@/lib/business-audit";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function claimBusinessInvitesAction() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    throw new Error("Supabase Auth no esta configurado.");
  }

  const { data, error } = await supabase.rpc("claim_business_invites");

  if (error) {
    throw new Error(`No se pudieron activar invitaciones: ${error.message}`);
  }

  if (typeof data === "number" && data > 0) {
    const { data: memberships, error: membershipsError } = await supabase
      .from("business_members")
      .select("business_id")
      .eq("user_id", user.id)
      .eq("status", "active");

    if (membershipsError) {
      throw new Error(
        `No se pudieron consultar membresias activadas: ${membershipsError.message}`,
      );
    }

    await Promise.all(
      (memberships ?? []).map((membership) =>
        logBusinessAudit({
          action: "business_invites_claimed",
          actorUserId: user.id,
          businessId: membership.business_id,
          metadata: {
            claimed_count: data,
          },
          supabase,
        }),
      ),
    );
  }

  revalidatePath("/dashboard");
  redirect("/dashboard?claimed=1");
}
