"use server";

import { revalidatePath } from "next/cache";
import { requireBusinessRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const ROLES = ["owner", "manager", "editor", "viewer"] as const;

export async function inviteTeamMemberAction(formData: FormData) {
  const businessId = getRequiredString(formData.get("businessId"), "businessId");
  const email = normalizeEmail(getRequiredString(formData.get("email"), "Correo"));
  const role = parseRole(formData.get("role"));
  await requireBusinessRole(businessId, ["owner"]);
  const supabase = await getAuthedClient();

  const { data: existing, error: existingError } = await supabase
    .from("business_members")
    .select("id")
    .eq("business_id", businessId)
    .eq("invited_email", email)
    .eq("status", "invited")
    .maybeSingle();

  if (existingError) {
    throw new Error(`No se pudo validar la invitacion: ${existingError.message}`);
  }

  if (existing) {
    throw new Error("Ya existe una invitacion pendiente para ese correo.");
  }

  const { error } = await supabase.from("business_members").insert({
    business_id: businessId,
    invited_email: email,
    role,
    status: "invited",
  });

  if (error) {
    throw new Error(`No se pudo invitar al miembro: ${error.message}`);
  }

  revalidatePath(`/dashboard/negocios/${businessId}/equipo`);
}

export async function updateTeamMemberRoleAction(formData: FormData) {
  const businessId = getRequiredString(formData.get("businessId"), "businessId");
  const memberId = getRequiredString(formData.get("memberId"), "memberId");
  const role = parseRole(formData.get("role"));
  await requireBusinessRole(businessId, ["owner"]);
  const supabase = await getAuthedClient();
  const member = await getMemberRole(supabase, businessId, memberId);

  if (member.role === "owner" && role !== "owner") {
    await assertNotLastOwner(supabase, businessId, memberId);
  }

  const { error } = await supabase
    .from("business_members")
    .update({ role })
    .eq("id", memberId)
    .eq("business_id", businessId);

  if (error) {
    throw new Error(`No se pudo cambiar el rol: ${error.message}`);
  }

  revalidatePath(`/dashboard/negocios/${businessId}/equipo`);
}

export async function removeTeamMemberAction(formData: FormData) {
  const businessId = getRequiredString(formData.get("businessId"), "businessId");
  const memberId = getRequiredString(formData.get("memberId"), "memberId");
  await requireBusinessRole(businessId, ["owner"]);
  const supabase = await getAuthedClient();
  const member = await getMemberRole(supabase, businessId, memberId);

  if (member.role === "owner") {
    await assertNotLastOwner(supabase, businessId, memberId);
  }

  const { error } = await supabase
    .from("business_members")
    .update({ status: "removed" })
    .eq("id", memberId)
    .eq("business_id", businessId);

  if (error) {
    throw new Error(`No se pudo remover el acceso: ${error.message}`);
  }

  revalidatePath(`/dashboard/negocios/${businessId}/equipo`);
}

async function getAuthedClient() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    throw new Error("Supabase Auth no esta configurado.");
  }

  return supabase;
}

async function getMemberRole(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  businessId: string,
  memberId: string,
) {
  const { data, error } = await supabase
    .from("business_members")
    .select("role")
    .eq("id", memberId)
    .eq("business_id", businessId)
    .single();

  if (error || !data) {
    throw new Error("No se encontro el miembro del equipo.");
  }

  return data;
}

async function assertNotLastOwner(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  businessId: string,
  memberId: string,
) {
  const { data, error } = await supabase
    .from("business_members")
    .select("id")
    .eq("business_id", businessId)
    .eq("role", "owner")
    .eq("status", "active");

  if (error) {
    throw new Error(`No se pudo validar los propietarios: ${error.message}`);
  }

  const remainingOwners = (data ?? []).filter((row) => row.id !== memberId);

  if (remainingOwners.length === 0) {
    throw new Error(
      "No puedes remover o cambiar de rol al unico propietario activo del negocio.",
    );
  }
}

function parseRole(value: FormDataEntryValue | null) {
  if (typeof value === "string" && ROLES.includes(value as (typeof ROLES)[number])) {
    return value;
  }

  throw new Error("Rol invalido.");
}

function getRequiredString(value: FormDataEntryValue | null, field: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} es obligatorio.`);
  }

  return value.trim();
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}
