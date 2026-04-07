import { prisma } from "@/lib/prisma";

export type ResourceStatus = "draft" | "published" | "archived";

export function normalizeMonthKey(input: string) {
  const value = input.trim();
  if (!/^\d{4}-\d{2}$/.test(value)) {
    return "";
  }

  const month = Number(value.slice(5, 7));
  if (month < 1 || month > 12) {
    return "";
  }

  return value;
}

export async function getCurrentResourceOfMonth() {
  const current = await prisma.resourceOfMonth.findFirst({
    where: {
      status: "published",
      isCurrent: true,
    },
    orderBy: [{ monthKey: "desc" }, { publishedAt: "desc" }],
    select: {
      id: true,
      monthKey: true,
      title: true,
      description: true,
      linkUrl: true,
      linkLabel: true,
      status: true,
      isCurrent: true,
      publishedAt: true,
    },
  });

  if (current) {
    return current;
  }

  return prisma.resourceOfMonth.findFirst({
    where: {
      status: "published",
    },
    orderBy: [{ monthKey: "desc" }, { publishedAt: "desc" }],
    select: {
      id: true,
      monthKey: true,
      title: true,
      description: true,
      linkUrl: true,
      linkLabel: true,
      status: true,
      isCurrent: true,
      publishedAt: true,
    },
  });
}
