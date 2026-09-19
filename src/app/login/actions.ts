"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function signInAction(formData: FormData) {
  const email = getString(formData.get("email")).toLowerCase();
  const password = getString(formData.get("password"));

  if (!email || !password) {
    redirect("/login?error=missing_credentials");
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/login?error=supabase_not_configured");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect("/login?error=invalid_credentials");
  }

  redirect("/admin/postulaciones");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/login");
}

function getString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}
