"use server";

import {
  approveAndPublishSubmission,
  updateBusinessSubmission,
  updateSubmissionStatus,
  type SubmissionStatus,
} from "@/lib/admin-submissions";
import { requireAdmin } from "@/lib/auth";
import { signOutAction } from "@/app/login/actions";

const MANUAL_STATUSES = new Set<SubmissionStatus>(["rejected", "needs_info", "pending"]);

export async function signOutAdminAction() {
  await signOutAction();
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

export async function updateBusinessSubmissionAction(formData: FormData) {
  await assertAdminSession();
  await updateBusinessSubmission(formData);
}

export async function updateAndApproveBusinessSubmissionAction(
  formData: FormData,
) {
  await assertAdminSession();
  await updateBusinessSubmission(formData);
  await approveAndPublishSubmission(
    getString(formData.get("submissionId")),
    getString(formData.get("notes")),
  );
}

async function assertAdminSession() {
  await requireAdmin();
}

function getString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}
