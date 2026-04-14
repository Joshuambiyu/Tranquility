import { prisma } from "@/lib/prisma";

const splitEmails = (value?: string | null) =>
  (value ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

type AdminAccessReadModel = {
  findUnique: (args: {
    where: { email: string };
    select: { id: true };
  }) => Promise<{ id: string } | null>;
  findMany: (args: {
    orderBy: { email: "asc" };
    select: {
      email: true;
      createdAt: true;
    };
  }) => Promise<Array<{ email: string; createdAt: Date }>>;
  create: (args: {
    data: {
      email: string;
      createdById?: string;
    };
  }) => Promise<unknown>;
  deleteMany: (args: {
    where: { email: string };
  }) => Promise<{ count: number }>;
};

function getAdminAccessModel() {
  return (prisma as unknown as { adminAccess: AdminAccessReadModel }).adminAccess;
}

function isAdminAccessTableUnavailable(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as { code?: string; message?: string };
  if (candidate.code === "P2021") {
    return true;
  }

  if (typeof candidate.message === "string" && candidate.message.toLowerCase().includes("adminaccess")) {
    return true;
  }

  return false;
}

export function normalizeEmail(input?: string | null) {
  return (input ?? "").trim().toLowerCase();
}

export function isValidEmail(input?: string | null) {
  const email = normalizeEmail(input);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function getAdminEmails() {
  const explicitAdmins = splitEmails(process.env.ADMIN_EMAILS);
  const fallbackAdmin = splitEmails(process.env.CONTACT_NOTIFY_TO);

  return new Set([...explicitAdmins, ...fallbackAdmin]);
}

export function isAdminEmail(email?: string | null) {
  const normalized = normalizeEmail(email);
  if (!normalized) {
    return false;
  }

  return getAdminEmails().has(normalized);
}

export async function hasAdminAccess(email?: string | null) {
  const normalized = normalizeEmail(email);
  if (!normalized) {
    return false;
  }

  if (isAdminEmail(normalized)) {
    return true;
  }

  try {
    const record = await getAdminAccessModel().findUnique({
      where: { email: normalized },
      select: { id: true },
    });

    return Boolean(record);
  } catch (error) {
    if (isAdminAccessTableUnavailable(error)) {
      return false;
    }

    throw error;
  }
}

export async function listManagedAdminEmails() {
  try {
    return await getAdminAccessModel().findMany({
      orderBy: { email: "asc" },
      select: {
        email: true,
        createdAt: true,
      },
    });
  } catch (error) {
    if (isAdminAccessTableUnavailable(error)) {
      return [];
    }

    throw error;
  }
}

export async function addManagedAdminEmail(email: string, createdById?: string) {
  const normalized = normalizeEmail(email);

  if (!isValidEmail(normalized)) {
    throw new Error("Please provide a valid email address.");
  }

  if (isAdminEmail(normalized)) {
    return;
  }

  let existing: { id: string } | null = null;

  try {
    existing = await getAdminAccessModel().findUnique({
      where: { email: normalized },
      select: { id: true },
    });
  } catch (error) {
    if (isAdminAccessTableUnavailable(error)) {
      throw new Error("Admin role storage is not ready yet. Run database migrations, then try again.");
    }

    throw error;
  }

  if (existing) {
    return;
  }

  try {
    await getAdminAccessModel().create({
      data: {
        email: normalized,
        ...(createdById ? { createdById } : {}),
      },
    });
  } catch (error) {
    if (isAdminAccessTableUnavailable(error)) {
      throw new Error("Admin role storage is not ready yet. Run database migrations, then try again.");
    }

    throw error;
  }
}

export async function removeManagedAdminEmail(email: string) {
  const normalized = normalizeEmail(email);

  if (!normalized) {
    throw new Error("Email is required.");
  }

  try {
    await getAdminAccessModel().deleteMany({
      where: { email: normalized },
    });
  } catch (error) {
    if (isAdminAccessTableUnavailable(error)) {
      throw new Error("Admin role storage is not ready yet. Run database migrations, then try again.");
    }

    throw error;
  }
}
