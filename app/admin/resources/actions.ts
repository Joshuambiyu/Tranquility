"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { hasAdminAccess } from "@/lib/admin";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeMonthKey } from "@/lib/resources";

const SUBMIT_TOKEN_COOKIE = "resource_submit_tokens";
const SUBMIT_TOKEN_TTL_MS = 10 * 60 * 1000;
const MAX_TRACKED_TOKENS = 40;

type SubmitTokenEntry = {
  token: string;
  timestamp: number;
};

type ResourceOfMonthWriteModel = {
  updateMany: (args: {
    where: { isCurrent: boolean };
    data: { isCurrent: boolean };
  }) => Promise<unknown>;
  upsert: (args: {
    where: { monthKey: string };
    create: {
      monthKey: string;
      title: string;
      description: string;
      linkUrl: string | null;
      linkLabel: string | null;
      status: string;
      isCurrent: boolean;
      publishedAt: Date | null;
      createdById: string;
    };
    update: {
      title: string;
      description: string;
      linkUrl: string | null;
      linkLabel: string | null;
      status: string;
      isCurrent: boolean;
      publishedAt: Date | null;
    };
  }) => Promise<unknown>;
  update: (args: {
    where: { id: string };
    data:
      | {
          status: string;
          publishedAt: Date;
        }
      | {
          status: string;
          isCurrent: boolean;
        }
      | {
          isCurrent: boolean;
          status: string;
          publishedAt: Date;
        };
  }) => Promise<unknown>;
};

function getResourceOfMonthWriteModel(client: unknown) {
  return (client as { resourceOfMonth: ResourceOfMonthWriteModel }).resourceOfMonth;
}

async function ensureAdminAccess() {
  const session = await getServerSession();

  if (!session?.user?.id || !session.user.email || !(await hasAdminAccess(session.user.email))) {
    throw new Error("Admin access is required.");
  }

  return session.user;
}

async function assertSameOriginRequest() {
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");

  if (!origin) {
    throw new Error("Missing request origin.");
  }

  const forwardedProto = requestHeaders.get("x-forwarded-proto");
  const forwardedHost = requestHeaders.get("x-forwarded-host");
  const host = requestHeaders.get("host");

  const requestHost = (forwardedHost ?? host ?? "").split(",")[0].trim();
  const requestProto = forwardedProto?.split(",")[0].trim() || (requestHost.includes("localhost") ? "http" : "https");
  const expectedOrigin = `${requestProto}://${requestHost}`;

  if (!requestHost || origin !== expectedOrigin) {
    throw new Error("Cross-origin request blocked.");
  }
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

function parseSubmitTokenCookie(value: string | undefined) {
  if (!value) {
    return [] as SubmitTokenEntry[];
  }

  return value
    .split("|")
    .map((entry) => {
      const [token, timestampRaw] = entry.split(":");
      const timestamp = Number(timestampRaw);

      if (!token || !Number.isFinite(timestamp)) {
        return null;
      }

      return { token, timestamp } as SubmitTokenEntry;
    })
    .filter((entry): entry is SubmitTokenEntry => entry !== null);
}

function serializeSubmitTokenCookie(entries: SubmitTokenEntry[]) {
  return entries.map((entry) => `${entry.token}:${entry.timestamp}`).join("|");
}

async function consumeSubmitToken(formData: FormData) {
  const token = String(formData.get("submitToken") ?? "").trim();

  if (!token) {
    throw new Error("Missing submit token.");
  }

  const cookieStore = await cookies();
  const currentRaw = cookieStore.get(SUBMIT_TOKEN_COOKIE)?.value;
  const now = Date.now();

  const validEntries = parseSubmitTokenCookie(currentRaw).filter(
    (entry) => now - entry.timestamp <= SUBMIT_TOKEN_TTL_MS,
  );

  if (validEntries.some((entry) => entry.token === token)) {
    return { isDuplicate: true };
  }

  const nextEntries = [...validEntries, { token, timestamp: now }].slice(-MAX_TRACKED_TOKENS);

  cookieStore.set(SUBMIT_TOKEN_COOKIE, serializeSubmitTokenCookie(nextEntries), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: Math.floor(SUBMIT_TOKEN_TTL_MS / 1000),
  });

  return { isDuplicate: false };
}

export async function createOrUpdateResourceAction(formData: FormData) {
  const user = await ensureAdminAccess();
  await assertSameOriginRequest();

  const submitTokenState = await consumeSubmitToken(formData);
  if (submitTokenState.isDuplicate) {
    redirect("/admin/resources?saved=1&duplicate=1");
  }

  const monthKey = normalizeMonthKey(String(formData.get("monthKey") ?? ""));
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const linkUrlRaw = String(formData.get("linkUrl") ?? "").trim();
  const linkLabelRaw = String(formData.get("linkLabel") ?? "").trim();
  const submitIntent = String(formData.get("submitIntent") ?? "publish").trim().toLowerCase();
  const shouldPublish = submitIntent !== "draft";
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
    if (shouldSetCurrent && shouldPublish) {
      await getResourceOfMonthWriteModel(tx).updateMany({
        where: {
          isCurrent: true,
        },
        data: {
          isCurrent: false,
        },
      });
    }

    await getResourceOfMonthWriteModel(tx).upsert({
      where: { monthKey },
      create: {
        monthKey,
        title,
        description,
        linkUrl,
        linkLabel,
        status,
        isCurrent: shouldSetCurrent && shouldPublish,
        publishedAt: shouldPublish ? new Date() : null,
        createdById: user.id,
      },
      update: {
        title,
        description,
        linkUrl,
        linkLabel,
        status,
        isCurrent: shouldSetCurrent && shouldPublish,
        publishedAt: shouldPublish ? new Date() : null,
      },
    });
  });

  revalidateResourcePages();
  redirect("/admin/resources?saved=1");
}

export async function publishResourceAction(formData: FormData) {
  await ensureAdminAccess();

  await getResourceOfMonthWriteModel(prisma).update({
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

  await getResourceOfMonthWriteModel(prisma).update({
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
    await getResourceOfMonthWriteModel(tx).updateMany({
      where: { isCurrent: true },
      data: { isCurrent: false },
    });

    await getResourceOfMonthWriteModel(tx).update({
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
