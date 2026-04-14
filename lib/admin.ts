import { prisma } from "@/lib/prisma";

type UserRoleModel = {
  findUnique: (args: {
    where: { email?: string; id?: string };
    select: {
      id?: true;
      role?: true;
      email?: true;
      name?: true;
      updatedAt?: true;
    };
  }) => Promise<{ id?: string; role?: string; email?: string | null; name?: string | null; updatedAt?: Date } | null>;
  findMany: (args: {
    where: { role: string };
    orderBy: { email: "asc" };
    select: {
      id: true;
      email: true;
      name: true;
      updatedAt: true;
    };
  }) => Promise<Array<{ id: string; email: string | null; name: string | null; updatedAt: Date }>>;
  update: (args: {
    where: { id: string };
    data: { role: string };
  }) => Promise<unknown>;
};

function getUserRoleModel() {
  return (prisma as unknown as { user: UserRoleModel }).user;
}

export function normalizeEmail(input?: string | null) {
  return (input ?? "").trim().toLowerCase();
}

export function isValidEmail(input?: string | null) {
  const email = normalizeEmail(input);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function hasAdminAccess(email?: string | null) {
  const normalized = normalizeEmail(email);
  if (!normalized) {
    return false;
  }

  const user = await getUserRoleModel().findUnique({
    where: { email: normalized },
    select: { role: true },
  });

  return user?.role === "admin";
}

export async function listAdminUsers() {
  const users = await getUserRoleModel().findMany({
    where: { role: "admin" },
    orderBy: { email: "asc" },
    select: {
      id: true,
      email: true,
      name: true,
      updatedAt: true,
    },
  });

  return users
    .filter((user): user is { id: string; email: string; name: string | null; updatedAt: Date } => Boolean(user.email))
    .map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      updatedAt: user.updatedAt,
    }));
}

export async function addManagedAdminEmail(email: string) {
  const normalized = normalizeEmail(email);

  if (!isValidEmail(normalized)) {
    throw new Error("Please provide a valid email address.");
  }

  const existingUser = await getUserRoleModel().findUnique({
    where: { email: normalized },
    select: { id: true, role: true },
  });

  if (!existingUser?.id) {
    throw new Error("User not found. They need to sign in at least once before you can assign admin role.");
  }

  if (existingUser.role !== "admin") {
    await getUserRoleModel().update({
      where: { id: existingUser.id },
      data: { role: "admin" },
    });
  }
}

export async function removeManagedAdminEmail(email: string) {
  const normalized = normalizeEmail(email);

  if (!normalized) {
    throw new Error("Email is required.");
  }

  const existingUser = await getUserRoleModel().findUnique({
    where: { email: normalized },
    select: { id: true, role: true },
  });

  if (!existingUser?.id) {
    throw new Error("User not found.");
  }

  if (existingUser.role === "admin") {
    await getUserRoleModel().update({
      where: { id: existingUser.id },
      data: { role: "user" },
    });
  }
}
