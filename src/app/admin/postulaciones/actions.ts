"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  approveAndPublishSubmission,
  isValidAdminToken,
  updateSubmissionStatus,
  type SubmissionStatus,
} from "@/lib/admin-submissions";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";

const MANUAL_STATUSES = new Set<SubmissionStatus>(["rejected", "needs_info", "pending"]);

export async function authenticateAdminAction(formData: FormData) {
  const token = getString(formData.get("token"));

  if (!isValidAdminToken(token)) {
    throw new Error("Token admin invalido.");
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    maxAge: 60 * 60 * 8,
    path: "/admin/postulaciones",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  redirect("/admin/postulaciones");
}

export async function signOutAdminAction() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);

  redirect("/admin/postulaciones");
}

export async function approveSubmissionAction(formData: FormData) {
  await assertAdminSession();

  await approveAndPublishSubmission(
    getString(formData.get("submissionId")),
    getString(formData.get("notes")),
  );
}

export async function updateSubmissionStatusAction(formData: FormData) {
  const status = getString(formData.get("status")) as SubmissionStatus;

  await assertAdminSession();

  if (!MANUAL_STATUSES.has(status)) {
    throw new Error("Estado invalido.");
  }

  await updateSubmissionStatus(
    getString(formData.get("submissionId")),
    status,
    getString(formData.get("notes")),
  );
}

async function assertAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!isValidAdminToken(token)) {
    throw new Error("Sesion admin invalida.");
  }
}

function getString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}
