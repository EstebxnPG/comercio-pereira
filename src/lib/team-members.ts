import "server-only";

import type { BusinessMemberRole } from "@/lib/auth";
import { getSupabaseServiceRoleClient } from "@/lib/supabase";

export type TeamMember = {
  id: string;
  role: BusinessMemberRole;
  status: "active" | "invited";
  email: string | null;
  isSelf: boolean;
};

export async function getBusinessTeam(
  businessId: string,
  currentUserId: string,
): Promise<TeamMember[]> {
  const supabase = getSupabaseServiceRoleClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("business_members")
    .select("id, role, status, user_id, invited_email")
    .eq("business_id", businessId)
    .in("status", ["active", "invited"])
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  const userIds = data
    .map((row) => row.user_id)
    .filter((id): id is string => typeof id === "string");
  const emailById = await getEmailsByUserId(supabase, userIds);

  return data.map((row) => ({
    id: row.id,
    role: row.role as BusinessMemberRole,
    status: row.status as "active" | "invited",
    email: row.user_id ? emailById.get(row.user_id) ?? null : row.invited_email,
    isSelf: row.user_id === currentUserId,
  }));
}

async function getEmailsByUserId(
  supabase: NonNullable<ReturnType<typeof getSupabaseServiceRoleClient>>,
  userIds: string[],
) {
  const map = new Map<string, string>();

  if (userIds.length === 0) {
    return map;
  }

  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error || !data) {
    return map;
  }

  for (const user of data.users) {
    if (user.email && userIds.includes(user.id)) {
      map.set(user.id, user.email);
    }
  }

  return map;
}
