"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { hasAdminAccess } from "@/lib/admin";
import { getServerSession } from "@/lib/auth";
import {
  clearVoiceOfWeek,
  setVoiceOfWeek,
  updateVoiceSubmissionStatus,
} from "@/lib/voice-submissions";

async function ensureAdminAccess() {
  const session = await getServerSession();

  if (!session?.user?.email || !(await hasAdminAccess(session.user.email))) {
    throw new Error("Admin access is required.");
  }
}

function getVoiceId(formData: FormData) {
  const voiceId = formData.get("voiceId");

  if (typeof voiceId !== "string" || voiceId.length === 0) {
    throw new Error("Voice submission id is required.");
  }

  return voiceId;
}

function revalidateVoicePages() {
  revalidatePath("/voices");
  revalidatePath("/search");
  revalidatePath("/admin/voices");
}

export async function approveVoiceSubmissionAction(formData: FormData) {
  await ensureAdminAccess();
  await updateVoiceSubmissionStatus(getVoiceId(formData), "approved");
  revalidateVoicePages();
  redirect("/admin/voices?result=approved");
}

export async function rejectVoiceSubmissionAction(formData: FormData) {
  await ensureAdminAccess();
  await updateVoiceSubmissionStatus(getVoiceId(formData), "rejected");
  revalidateVoicePages();
  redirect("/admin/voices?result=rejected");
}

export async function featureVoiceSubmissionAction(formData: FormData) {
  await ensureAdminAccess();
  await setVoiceOfWeek(getVoiceId(formData));
  revalidateVoicePages();
  redirect("/admin/voices?result=featured");
}

export async function clearVoiceOfWeekAction(formData: FormData) {
  await ensureAdminAccess();
  await clearVoiceOfWeek(getVoiceId(formData));
  revalidateVoicePages();
  redirect("/admin/voices?result=cleared");
}