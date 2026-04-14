"use server";

import { revalidatePath } from "next/cache";

import {
  addManagedAdminEmail,
  hasAdminAccess,
  normalizeEmail,
  removeManagedAdminEmail,
} from "@/lib/admin";
import { getServerSession } from "@/lib/auth";

async function ensureAdminAccess() {
  const session = await getServerSession();

  if (!session?.user?.email || !session.user.id || !(await hasAdminAccess(session.user.email))) {
    throw new Error("Admin access is required.");
  }

  return session.user;
}

function parseEmail(formData: FormData, fieldName: string) {
  const value = formData.get(fieldName);

  if (typeof value !== "string") {
    throw new Error("Email is required.");
  }

  const email = normalizeEmail(value);
  if (!email) {
    throw new Error("Email is required.");
  }

  return email;
}

function revalidateAdminPages() {
  revalidatePath("/admin");
}

export async function addAdminEmailAction(formData: FormData) {
  await ensureAdminAccess();
  const email = parseEmail(formData, "email");

  await addManagedAdminEmail(email);
  revalidateAdminPages();
}

export async function removeAdminEmailAction(formData: FormData) {
  const user = await ensureAdminAccess();
  const email = parseEmail(formData, "email");

  if (normalizeEmail(user.email) === email) {
    throw new Error("You cannot remove your own admin access.");
  }

  await removeManagedAdminEmail(email);
  revalidateAdminPages();
}
