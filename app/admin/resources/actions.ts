"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { isAdminEmail } from "@/lib/admin";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeMonthKey } from "@/lib/resources";

async function ensureAdminAccess() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.email || !isAdminEmail(session.user.email)) {
    throw new Error("Admin access is required.");
  }

  return session.user;
}

function revalidateResourcePages() {
  revalidatePath("/");
  revalidatePath("/resources");
  revalidatePath("/admin");
  revalidatePath("/admin/resources");
}

function parseResourceId(formData: FormData) {
  const resourceId = formData.get("resourceId");

  if (typeof resourceId !== "string" || resourceId.length === 0) {
    throw new Error("Resource id is required.");
  }

  return resourceId;
}

export async function createOrUpdateResourceAction(formData: FormData) {
  const user = await ensureAdminAccess();

  const monthKey = normalizeMonthKey(String(formData.get("monthKey") ?? ""));
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const linkUrlRaw = String(formData.get("linkUrl") ?? "").trim();
  const linkLabelRaw = String(formData.get("linkLabel") ?? "").trim();
  const shouldPublish = formData.get("publishNow") === "on";
  const shouldSetCurrent = formData.get("setAsCurrent") === "on";

  if (!monthKey) {
    throw new Error("Month must be in YYYY-MM format.");
  }

  if (title.length < 4) {
    throw new Error("Title must be at least 4 characters.");
  }

  if (description.length < 20) {
    throw new Error("Description must be at least 20 characters.");
  }

  const linkUrl = linkUrlRaw.length > 0 ? linkUrlRaw : null;
  const linkLabel = linkLabelRaw.length > 0 ? linkLabelRaw : null;

  if (linkUrl && !/^https?:\/\//i.test(linkUrl)) {
    throw new Error("Link URL must start with http:// or https://.");
  }

  if (linkUrl && !linkLabel) {
    throw new Error("Provide a link label when adding a link URL.");
  }

  if (!linkUrl && linkLabel) {
    throw new Error("Provide a link URL when adding a link label.");
  }

  const status = shouldPublish ? "published" : "draft";

  await prisma.$transaction(async (tx) => {
    if (shouldSetCurrent) {
      await tx.resourceOfMonth.updateMany({
        where: {
          isCurrent: true,
        },
        data: {
          isCurrent: false,
        },
      });
    }

    await tx.resourceOfMonth.upsert({
      where: { monthKey },
      create: {
        monthKey,
        title,
        description,
        linkUrl,
        linkLabel,
        status,
        isCurrent: shouldSetCurrent,
        publishedAt: shouldPublish ? new Date() : null,
        createdById: user.id,
      },
      update: {
        title,
        description,
        linkUrl,
        linkLabel,
        status,
        isCurrent: shouldSetCurrent,
        publishedAt: shouldPublish ? new Date() : null,
      },
    });
  });

  revalidateResourcePages();
}

export async function publishResourceAction(formData: FormData) {
  await ensureAdminAccess();

  await prisma.resourceOfMonth.update({
    where: { id: parseResourceId(formData) },
    data: {
      status: "published",
      publishedAt: new Date(),
    },
  });

  revalidateResourcePages();
}

export async function archiveResourceAction(formData: FormData) {
  await ensureAdminAccess();

  await prisma.resourceOfMonth.update({
    where: { id: parseResourceId(formData) },
    data: {
      status: "archived",
      isCurrent: false,
    },
  });

  revalidateResourcePages();
}

export async function setCurrentResourceAction(formData: FormData) {
  await ensureAdminAccess();

  const resourceId = parseResourceId(formData);

  await prisma.$transaction(async (tx) => {
    await tx.resourceOfMonth.updateMany({
      where: { isCurrent: true },
      data: { isCurrent: false },
    });

    await tx.resourceOfMonth.update({
      where: { id: resourceId },
      data: {
        isCurrent: true,
        status: "published",
        publishedAt: new Date(),
      },
    });
  });

  revalidateResourcePages();
}
