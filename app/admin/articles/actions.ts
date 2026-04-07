"use server";

import { revalidatePath } from "next/cache";

import { isAdminEmail } from "@/lib/admin";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function toSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseParagraphs(content: string) {
  return content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

async function ensureAdminAccess() {
  const session = await getServerSession();

  if (!session?.user?.id || !session.user.email || !isAdminEmail(session.user.email)) {
    throw new Error("Admin access is required.");
  }

  return session.user;
}

export async function createArticleAction(formData: FormData) {
  const user = await ensureAdminAccess();

  const title = String(formData.get("title") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const reflectionMoment = String(formData.get("reflectionMoment") ?? "").trim();
  const imageSrc = String(formData.get("imageSrc") ?? "").trim() || "/featured-reflection.svg";
  const imageAlt = String(formData.get("imageAlt") ?? "").trim() || title;
  const requestedSlug = String(formData.get("slug") ?? "").trim();
  const shouldFeature = formData.get("isFeatured") === "on";

  if (title.length < 4) {
    throw new Error("Title must be at least 4 characters.");
  }

  if (excerpt.length < 20) {
    throw new Error("Excerpt must be at least 20 characters.");
  }

  const paragraphs = parseParagraphs(content);
  if (paragraphs.length === 0) {
    throw new Error("Please provide article content with at least one paragraph.");
  }

  const baseSlug = toSlug(requestedSlug || title);
  if (!baseSlug) {
    throw new Error("Unable to build a valid slug from title.");
  }

  let slug = baseSlug;
  let suffix = 1;

  while (await prisma.article.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  if (shouldFeature) {
    await prisma.article.updateMany({
      where: { isFeatured: true },
      data: { isFeatured: false },
    });
  }

  await prisma.article.create({
    data: {
      slug,
      title,
      excerpt,
      content: paragraphs,
      author: author || user.name || user.email || "Editorial",
      imageSrc,
      imageAlt,
      reflectionMoment,
      isFeatured: shouldFeature,
      status: "published",
      publishedAt: new Date(),
      createdById: user.id,
    },
  });

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/admin/articles");
}