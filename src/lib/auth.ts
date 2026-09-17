import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export type CmsAdminRole = "admin" | "moderator" | "support";
export type BusinessMemberRole = "owner" | "manager" | "editor" | "viewer";

export const getCurrentUser = cache(async () => {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return user;
});

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function getCurrentAdminRole(): Promise<CmsAdminRole | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data.role as CmsAdminRole;
}

export async function requireAdmin() {
  const user = await requireUser();
  const role = await getCurrentAdminRole();

  if (!role) {
    redirect("/");
  }

  return { role, user };
}

export async function requireBusinessRole(
  businessId: string,
  allowedRoles: BusinessMemberRole[],
) {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("business_members")
    .select("role")
    .eq("business_id", businessId)
    .eq("user_id", user.id)
    .eq("status", "active")
    .in("role", allowedRoles)
    .maybeSingle();

  if (error || !data) {
    redirect("/dashboard");
  }

  return { role: data.role as BusinessMemberRole, user };
}
