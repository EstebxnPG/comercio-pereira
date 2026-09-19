import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { requireUser } from "@/lib/auth";
import type { BusinessMemberRole } from "@/lib/auth";

export type DashboardBusiness = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  logoUrl: string;
  status: string;
  published: boolean;
  verified: boolean;
  role: BusinessMemberRole;
  categoryName: string;
  updatedAt: string;
};

export type PendingBusinessInvite = {
  id: string;
  businessName: string;
  role: BusinessMemberRole;
};

type BusinessMembershipRow = {
  role: BusinessMemberRole;
  businesses:
    | {
        id: string;
        slug: string;
        name: string;
        short_description: string;
        logo_url: string;
        status: string;
        published: boolean;
        verified: boolean;
        updated_at: string;
        categories: { name: string } | Array<{ name: string }> | null;
      }
    | Array<{
        id: string;
        slug: string;
        name: string;
        short_description: string;
        logo_url: string;
        status: string;
        published: boolean;
        verified: boolean;
        updated_at: string;
        categories: { name: string } | Array<{ name: string }> | null;
      }>
    | null;
};

type PendingBusinessInviteRow = {
  id: string;
  role: BusinessMemberRole;
  businesses:
    | { name: string }
    | Array<{ name: string }>
    | null;
};

export async function getDashboardBusinesses(): Promise<DashboardBusiness[]> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("business_members")
    .select(
      `
        role,
        businesses!inner(
          id,
          slug,
          name,
          short_description,
          logo_url,
          status,
          published,
          verified,
          updated_at,
          categories(name)
        )
      `,
    )
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`No se pudieron cargar tus negocios: ${error.message}`);
  }

  return ((data ?? []) as BusinessMembershipRow[])
    .map(mapDashboardBusiness)
    .filter((business) => business !== null);
}

export async function getPendingBusinessInvites(): Promise<
  PendingBusinessInvite[]
> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const email = user.email?.trim().toLowerCase();

  if (!supabase || !email) {
    return [];
  }

  const { data, error } = await supabase
    .from("business_members")
    .select("id, role, businesses!inner(name)")
    .is("user_id", null)
    .eq("status", "invited")
    .eq("invited_email", email);

  if (error) {
    throw new Error(`No se pudieron cargar invitaciones: ${error.message}`);
  }

  return ((data ?? []) as PendingBusinessInviteRow[]).map((invite) => {
    const business = Array.isArray(invite.businesses)
      ? invite.businesses[0]
      : invite.businesses;

    return {
      id: invite.id,
      businessName: business?.name ?? "Negocio sin nombre",
      role: invite.role,
    };
  });
}

function mapDashboardBusiness(row: BusinessMembershipRow) {
  const business = Array.isArray(row.businesses)
    ? row.businesses[0]
    : row.businesses;

  if (!business) {
    return null;
  }

  const category = Array.isArray(business.categories)
    ? business.categories[0]
    : business.categories;

  return {
    id: business.id,
    slug: business.slug,
    name: business.name,
    shortDescription: business.short_description,
    logoUrl: business.logo_url,
    status: business.status,
    published: business.published,
    verified: business.verified,
    role: row.role,
    categoryName: category?.name ?? "Sin categoria",
    updatedAt: business.updated_at,
  };
}
