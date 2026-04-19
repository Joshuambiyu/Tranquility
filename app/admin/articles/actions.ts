"use server";

import type { Prisma } from "@prisma/client";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { hasAdminAccess } from "@/lib/admin";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type JsonObject = Record<string, unknown>;

const EMPTY_TIPTAP_DOC = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [],
    },
  ],
} as const;

const SUBMIT_TOKEN_COOKIE = "article_submit_tokens";
const SUBMIT_TOKEN_TTL_MS = 10 * 60 * 1000;
const MAX_TRACKED_TOKENS = 40;
const DEFAULT_COVER_PLACEHOLDER_SRC = "/featured-reflection.svg";

type SubmitTokenEntry = {
  token: string;
  timestamp: number;
};

type ArticleUpdateSnapshot = {
  slug: string;
  title: string;
  excerpt: string;
  content: unknown;
  author: string;
  imageSrc: string;
  imageAlt: string;
  reflectionMoment: string;
  isFeatured: boolean;
  status: string;
  publishedAt: Date;
};

type ResolvedArticleUpdate = {
  slug: string;
  title: string;
  excerpt: string;
  content: Prisma.InputJsonValue;
  author: string;
  imageSrc: string;
  imageAlt: string;
  reflectionMoment: string;
  isFeatured: boolean;
  status: string;
  publishedAt: Date;
};

type ArticleCreateSnapshot = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: unknown;
  author: string;
  imageSrc: string;
  imageAlt: string;
  reflectionMoment: string;
  isFeatured: boolean;
  status: string;
  createdAt: Date;
  createdById?: string | null;
};

type ResolvedArticleCreate = {
  title: string;
  excerpt: string;
  content: Prisma.InputJsonValue;
  author: string;
  imageSrc: string;
  imageAlt: string;
  reflectionMoment: string;
  isFeatured: boolean;
  status: string;
};

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

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTiptapDocument(value: unknown): value is JsonObject {
  if (!isJsonObject(value)) {
    return false;
  }

  if (value.type !== "doc") {
    return false;
  }

  const content = value.content;
  return content === undefined || Array.isArray(content);
}

function extractTextFromTiptapNode(node: unknown): string {
  if (!isJsonObject(node)) {
    return "";
  }

  if (typeof node.text === "string") {
    return node.text;
  }

  if (node.type === "hardBreak") {
    return "\n";
  }

  if (!Array.isArray(node.content)) {
    return "";
  }

  return node.content.map((entry) => extractTextFromTiptapNode(entry)).join("");
}

function extractParagraphsFromTiptapDoc(doc: JsonObject) {
  const content = Array.isArray(doc.content) ? doc.content : [];

  return content
    .map((node) => extractTextFromTiptapNode(node).replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function resolveContentPayload(formData: FormData, options?: { allowEmpty?: boolean }) {
  const allowEmpty = Boolean(options?.allowEmpty);
  const contentJsonRaw = String(formData.get("contentJson") ?? "").trim();
  const legacyContentRaw = String(formData.get("content") ?? "").trim();

  if (contentJsonRaw.length > 0) {
    let parsedContent: unknown;

    try {
      parsedContent = JSON.parse(contentJsonRaw);
    } catch {
      throw new Error("Editor content JSON is invalid.");
    }

    if (!isTiptapDocument(parsedContent)) {
      throw new Error("Editor content is not a valid TipTap document.");
    }

    const paragraphsFromJson = extractParagraphsFromTiptapDoc(parsedContent);

    if (paragraphsFromJson.length === 0 && !allowEmpty) {
      throw new Error("Please provide article content with at least one paragraph.");
    }

    const plainTextLength = paragraphsFromJson.join(" ").length;
    if (plainTextLength > 50000) {
      throw new Error("Article content is too long. Please keep it under 50,000 characters.");
    }

    return {
      content: parsedContent,
      paragraphsForExcerpt: paragraphsFromJson,
    };
  }

  const legacyParagraphs = parseParagraphs(legacyContentRaw);
  if (legacyParagraphs.length === 0 && !allowEmpty) {
    throw new Error("Please provide article content with at least one paragraph.");
  }

  if (legacyParagraphs.length === 0) {
    return {
      content: EMPTY_TIPTAP_DOC,
      paragraphsForExcerpt: [],
    };
  }

  return {
    content: legacyParagraphs,
    paragraphsForExcerpt: legacyParagraphs,
  };
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

async function resolveImageSource(formData: FormData, fallbackImageSrc?: string) {
  // If the user explicitly removed the image, clear it regardless of fallback.
  if (formData.get("removeImage") === "1") {
    return "";
  }

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

  const normalizedFallback = (fallbackImageSrc ?? "").trim();

  if (!normalizedFallback || normalizedFallback === DEFAULT_COVER_PLACEHOLDER_SRC) {
    return "";
  }

  return normalizedFallback;
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

async function resolveUniqueSlug(baseSlug: string, excludeArticleId?: string) {
  let slug = baseSlug;
  let suffix = 1;

  while (true) {
    const existing = await prisma.article.findUnique({ where: { slug }, select: { id: true } });

    if (!existing || existing.id === excludeArticleId) {
      return slug;
    }

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
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

function doesArticleMatchResolvedUpdate(article: ArticleUpdateSnapshot, next: ResolvedArticleUpdate) {
  return (
    article.slug === next.slug &&
    article.title === next.title &&
    article.excerpt === next.excerpt &&
    JSON.stringify(article.content) === JSON.stringify(next.content) &&
    article.author === next.author &&
    article.imageSrc === next.imageSrc &&
    article.imageAlt === next.imageAlt &&
    article.reflectionMoment === next.reflectionMoment &&
    article.isFeatured === next.isFeatured &&
    article.status === next.status &&
    article.publishedAt.getTime() === next.publishedAt.getTime()
  );
}

function doesArticleMatchResolvedCreate(article: ArticleCreateSnapshot, next: ResolvedArticleCreate, userId: string) {
  return (
    article.createdById === userId &&
    article.title === next.title &&
    article.excerpt === next.excerpt &&
    JSON.stringify(article.content) === JSON.stringify(next.content) &&
    article.author === next.author &&
    article.imageSrc === next.imageSrc &&
    article.imageAlt === next.imageAlt &&
    article.reflectionMoment === next.reflectionMoment &&
    article.isFeatured === next.isFeatured &&
    article.status === next.status
  );
}

function isSlugUniqueConstraintError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeError = error as { code?: unknown; meta?: { target?: unknown } };
  if (maybeError.code !== "P2002") {
    return false;
  }

  const target = maybeError.meta?.target;
  return Array.isArray(target) ? target.includes("slug") : target === "slug";
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

export async function createArticleAction(formData: FormData) {
  const user = await ensureAdminAccess();
  await assertSameOriginRequest();

  const submitTokenState = await consumeSubmitToken(formData);
  if (submitTokenState.isDuplicate) {
    redirect("/admin/articles?created=1&duplicate=1");
  }

  const submitIntent = String(formData.get("submitIntent") ?? "publish").trim().toLowerCase();
  const isPublishIntent = submitIntent !== "draft";

  const title = String(formData.get("title") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const requestedExcerpt = String(formData.get("excerpt") ?? "").trim();
  const resolvedContent = resolveContentPayload(formData, { allowEmpty: !isPublishIntent });
  const reflectionMoment = String(formData.get("reflectionMoment") ?? "").trim();
  const imageSrc = await resolveImageSource(formData);
  const titleForStorage = title || "Untitled draft";
  const imageAlt = String(formData.get("imageAlt") ?? "").trim() || titleForStorage;
  const requestedSlug = String(formData.get("slug") ?? "").trim();
  const shouldFeature = formData.get("isFeatured") === "on";
  const resolvedAuthor = author || user.name || user.email || "Editorial";

  if (isPublishIntent && title.length < 4) {
    throw new Error("Title must be at least 4 characters.");
  }

  if (isPublishIntent && reflectionMoment.length < 10) {
    throw new Error("Reflection moment must be at least 10 characters when publishing.");
  }

  const excerpt = requestedExcerpt || buildExcerptFallback(resolvedContent.paragraphsForExcerpt);

  const resolvedCreate: ResolvedArticleCreate = {
    title: titleForStorage,
    excerpt,
    content: resolvedContent.content as Prisma.InputJsonValue,
    author: resolvedAuthor,
    imageSrc,
    imageAlt,
    reflectionMoment,
    isFeatured: isPublishIntent ? shouldFeature : false,
    status: isPublishIntent ? "published" : "draft",
  };

  const recentDuplicate = await prisma.article.findFirst({
    where: {
      createdById: user.id,
      title: titleForStorage,
      status: isPublishIntent ? "published" : "draft",
      createdAt: {
        gte: new Date(Date.now() - 3 * 60 * 1000),
      },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      content: true,
      author: true,
      imageSrc: true,
      imageAlt: true,
      reflectionMoment: true,
      isFeatured: true,
      status: true,
      createdAt: true,
      createdById: true,
    },
  });

  if (recentDuplicate && doesArticleMatchResolvedCreate(recentDuplicate, resolvedCreate, user.id)) {
    redirect("/admin/articles?created=1&duplicate=1");
  }

  const slugSource = requestedSlug || title;
  let baseSlug = toSlug(slugSource);

  if (!baseSlug && isPublishIntent) {
    throw new Error("Unable to build a valid slug from title.");
  }

  if (!baseSlug) {
    baseSlug = `draft-${Date.now()}`;
  }

  const publishedAt = new Date();
  let createdArticle;

  try {
    createdArticle = await prisma.article.create({
      data: {
        slug: baseSlug,
        ...resolvedCreate,
        isFeatured: false,
        publishedAt,
        createdById: user.id,
      },
    });
  } catch (error) {
    if (!isSlugUniqueConstraintError(error)) {
      throw error;
    }

    const conflictingArticle = await prisma.article.findUnique({
      where: { slug: baseSlug },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        content: true,
        author: true,
        imageSrc: true,
        imageAlt: true,
        reflectionMoment: true,
        isFeatured: true,
        status: true,
        createdAt: true,
        createdById: true,
      },
    });

    const isRecentConflict = conflictingArticle
      ? Date.now() - conflictingArticle.createdAt.getTime() <= 3 * 60 * 1000
      : false;

    if (
      conflictingArticle &&
      isRecentConflict &&
      doesArticleMatchResolvedCreate(conflictingArticle, resolvedCreate, user.id)
    ) {
      redirect("/admin/articles?created=1&duplicate=1");
    }

    const slug = await resolveUniqueSlug(baseSlug);
    createdArticle = await prisma.article.create({
      data: {
        slug,
        ...resolvedCreate,
        isFeatured: false,
        publishedAt,
        createdById: user.id,
      },
    });
  }

  if (resolvedCreate.isFeatured) {
    await prisma.article.updateMany({
      where: {
        isFeatured: true,
        id: { not: createdArticle.id },
      },
      data: { isFeatured: false },
    });

    await prisma.article.update({
      where: { id: createdArticle.id },
      data: { isFeatured: true },
    });
  }

  revalidateArticlePages();
  redirect("/admin/articles?created=1");
}

export async function updateArticleAction(formData: FormData) {
  await ensureAdminAccess();
  await assertSameOriginRequest();

  const articleId = getArticleId(formData);

  const submitTokenState = await consumeSubmitToken(formData);

  const existingArticle = await prisma.article.findUnique({
    where: { id: articleId },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      content: true,
      author: true,
      imageSrc: true,
      imageAlt: true,
      reflectionMoment: true,
      isFeatured: true,
      publishedAt: true,
      status: true,
    },
  });

  if (!existingArticle) {
    throw new Error("Article not found.");
  }

  const submitIntent = String(formData.get("submitIntent") ?? "publish").trim().toLowerCase();
  const isPublishIntent = submitIntent !== "draft";

  const title = String(formData.get("title") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const requestedExcerpt = String(formData.get("excerpt") ?? "").trim();
  const resolvedContent = resolveContentPayload(formData, { allowEmpty: !isPublishIntent });
  const reflectionMoment = String(formData.get("reflectionMoment") ?? "").trim();
  const imageSrc = await resolveImageSource(formData, existingArticle.imageSrc);
  const titleForStorage = title || "Untitled draft";
  const imageAlt = String(formData.get("imageAlt") ?? "").trim() || titleForStorage;
  const requestedSlug = String(formData.get("slug") ?? "").trim();
  const shouldFeature = formData.get("isFeatured") === "on";

  if (isPublishIntent && title.length < 4) {
    throw new Error("Title must be at least 4 characters.");
  }

  if (isPublishIntent && reflectionMoment.length < 10) {
    throw new Error("Reflection moment must be at least 10 characters when publishing.");
  }

  const excerpt = requestedExcerpt || buildExcerptFallback(resolvedContent.paragraphsForExcerpt);

  const slugSource = requestedSlug || title;
  const baseSlug = toSlug(slugSource);

  const slug = baseSlug
    ? await resolveUniqueSlug(baseSlug, articleId)
    : existingArticle.slug;

  if (isPublishIntent && !slug) {
    throw new Error("Unable to build a valid slug from title.");
  }

  const resolvedUpdate: ResolvedArticleUpdate = {
    slug,
    title: titleForStorage,
    excerpt,
    content: resolvedContent.content as Prisma.InputJsonValue,
    author: author || existingArticle.author,
    imageSrc,
    imageAlt,
    reflectionMoment,
    isFeatured: isPublishIntent ? shouldFeature : false,
    status: isPublishIntent ? "published" : "draft",
    publishedAt:
      isPublishIntent && existingArticle.status !== "published"
        ? new Date()
        : existingArticle.publishedAt,
  };

  if (doesArticleMatchResolvedUpdate(existingArticle, resolvedUpdate)) {
    redirect(
      `/admin/articles?updated=1&articleId=${articleId}${submitTokenState.isDuplicate ? "&duplicate=1" : ""}`,
    );
  }

  if (resolvedUpdate.isFeatured) {
    await prisma.article.updateMany({
      where: {
        isFeatured: true,
        id: { not: articleId },
      },
      data: { isFeatured: false },
    });
  }

  await prisma.article.update({
    where: { id: articleId },
    data: resolvedUpdate,
  });

  revalidateArticlePages();
  revalidatePath(`/admin/articles/edit/${articleId}`);
  redirect(`/admin/articles?updated=1&articleId=${articleId}`);
}

export async function deleteArticleAction(formData: FormData) {
  await ensureAdminAccess();
  await assertSameOriginRequest();

  const articleId = getArticleId(formData);

  await prisma.article.delete({
    where: { id: articleId },
  });

  revalidateArticlePages();
  redirect("/admin/articles?result=deleted");
}

export async function deleteAllArticlesAction(formData: FormData) {
  await ensureAdminAccess();
  await assertSameOriginRequest();

  const confirmation = String(formData.get("confirmation") ?? "").trim();
  if (confirmation !== "DELETE ALL ARTICLES") {
    redirect("/admin/articles/delete?result=confirm-required");
  }

  await prisma.article.deleteMany({});
  revalidateArticlePages();
  redirect("/admin/articles/delete?result=all-deleted");
}
