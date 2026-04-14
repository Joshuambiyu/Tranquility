"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { hasAdminAccess } from "@/lib/admin";
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

function buildExcerptFallback(paragraphs: string[]) {
  const maxLength = 220;
  const plainText = paragraphs.join(" ").replace(/\s+/g, " ").trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  const truncated = plainText.slice(0, maxLength);
  const lastWordBoundary = truncated.lastIndexOf(" ");
  const safeTruncated = (lastWordBoundary > 120 ? truncated.slice(0, lastWordBoundary) : truncated).trim();

  return `${safeTruncated}...`;
}

async function resolveImageSource(formData: FormData) {
  const uploadedImage = formData.get("imageFile");

  if (uploadedImage instanceof File && uploadedImage.size > 0) {
    if (!uploadedImage.type.startsWith("image/")) {
      throw new Error("Uploaded file must be an image.");
    }

    const maxUploadBytes = 5 * 1024 * 1024;
    if (uploadedImage.size > maxUploadBytes) {
      throw new Error("Uploaded image must be 5MB or less.");
    }

    const buffer = Buffer.from(await uploadedImage.arrayBuffer());
    return `data:${uploadedImage.type};base64,${buffer.toString("base64")}`;
  }

  const imageUrl = String(formData.get("imageSrc") ?? "").trim();
  return imageUrl || "/featured-reflection.svg";
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

function getArticleId(formData: FormData) {
  const articleId = formData.get("articleId");

  if (typeof articleId !== "string" || articleId.length === 0) {
    throw new Error("Article id is required.");
  }

  return articleId;
}

function revalidateArticlePages() {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/admin/articles");
  revalidatePath("/admin/articles/delete");
}

export async function createArticleAction(formData: FormData) {
  const user = await ensureAdminAccess();
  await assertSameOriginRequest();

  const title = String(formData.get("title") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const requestedExcerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const reflectionMoment = String(formData.get("reflectionMoment") ?? "").trim();
  const imageSrc = await resolveImageSource(formData);
  const imageAlt = String(formData.get("imageAlt") ?? "").trim() || title;
  const requestedSlug = String(formData.get("slug") ?? "").trim();
  const shouldFeature = formData.get("isFeatured") === "on";

  if (title.length < 4) {
    throw new Error("Title must be at least 4 characters.");
  }

  const paragraphs = parseParagraphs(content);
  if (paragraphs.length === 0) {
    throw new Error("Please provide article content with at least one paragraph.");
  }

  const excerpt = requestedExcerpt || buildExcerptFallback(paragraphs);

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

  revalidateArticlePages();
}

export async function deleteArticleAction(formData: FormData) {
  await ensureAdminAccess();
  await assertSameOriginRequest();

  const articleId = getArticleId(formData);

  await prisma.article.delete({
    where: { id: articleId },
  });

  revalidateArticlePages();
}

export async function deleteAllArticlesAction(formData: FormData) {
  await ensureAdminAccess();
  await assertSameOriginRequest();

  const confirmation = String(formData.get("confirmation") ?? "").trim();
  if (confirmation !== "DELETE ALL ARTICLES") {
    throw new Error("Type DELETE ALL ARTICLES to confirm.");
  }

  await prisma.article.deleteMany({});
  revalidateArticlePages();
}
