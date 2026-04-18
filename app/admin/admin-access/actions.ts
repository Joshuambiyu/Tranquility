"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
  let adminAccessResult: "added" | "user-not-found" | "invalid-email" | "add-failed" = "added";

  try {
    const email = parseEmail(formData, "email");

    await addManagedAdminEmail(email);
    revalidateAdminPages();
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (message.includes("sign in at least once") || message.includes("User not found")) {
      adminAccessResult = "user-not-found";
    } else if (message.includes("valid email") || message.includes("Email is required")) {
      adminAccessResult = "invalid-email";
    } else {
      adminAccessResult = "add-failed";
    }
  }

  redirect(`/admin?adminAccess=${adminAccessResult}`);
}

export async function removeAdminEmailAction(formData: FormData) {
  const user = await ensureAdminAccess();
  const email = parseEmail(formData, "email");

  if (normalizeEmail(user.email) === email) {
    redirect("/admin?adminAccess=self-remove-blocked");
  }

  await removeManagedAdminEmail(email);
  revalidateAdminPages();
  redirect("/admin?adminAccess=removed");
}
