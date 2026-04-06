import { prisma } from "@/lib/prisma";

export const DEFAULT_ARTICLE_PAGE_SIZE = 4;
export const MAX_ARTICLE_PAGE_SIZE = 20;

function normalizePositiveInteger(value: number, fallback: number) {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  const rounded = Math.floor(value);
  return rounded >= 1 ? rounded : fallback;
}

function parseContentArray(content: unknown): string[] {
  if (!Array.isArray(content)) {
    return [];
  }

  return content.filter((entry): entry is string => typeof entry === "string");
}

const articleSelect = {
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
} as const;

export async function getPublishedArticlesPage(options?: {
  page?: number;
  pageSize?: number;
  search?: string;
  excludeArticleId?: string;
}) {
  const page = normalizePositiveInteger(options?.page ?? 1, 1);
  const requestedPageSize = normalizePositiveInteger(
    options?.pageSize ?? DEFAULT_ARTICLE_PAGE_SIZE,
    DEFAULT_ARTICLE_PAGE_SIZE,
  );
  const pageSize = Math.min(requestedPageSize, MAX_ARTICLE_PAGE_SIZE);
  const search = options?.search?.trim() ?? "";
  const excludeArticleId = options?.excludeArticleId;

  const where = {
    status: "published",
    ...(excludeArticleId ? { id: { not: excludeArticleId } } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { excerpt: { contains: search, mode: "insensitive" as const } },
            { author: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const skip = (page - 1) * pageSize;

  const [articles, total] = await prisma.$transaction([
    prisma.article.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
      skip,
      take: pageSize,
      select: articleSelect,
    }),
    prisma.article.count({ where }),
  ]);

  return {
    articles: articles.map((article) => ({
      ...article,
      content: parseContentArray(article.content),
    })),
    pagination: {
      page,
      pageSize,
      total,
      hasMore: skip + articles.length < total,
    },
  };
}

export async function getFeaturedArticle() {
  const featured = await prisma.article.findFirst({
    where: {
      status: "published",
      isFeatured: true,
    },
    orderBy: { publishedAt: "desc" },
    select: articleSelect,
  });

  if (featured) {
    return {
      ...featured,
      content: parseContentArray(featured.content),
    };
  }

  const fallback = await prisma.article.findFirst({
    where: {
      status: "published",
    },
    orderBy: { publishedAt: "desc" },
    select: articleSelect,
  });

  if (!fallback) {
    return null;
  }

  return {
    ...fallback,
    content: parseContentArray(fallback.content),
  };
}

export async function getPublishedArticleBySlug(slug: string) {
  const article = await prisma.article.findFirst({
    where: {
      slug,
      status: "published",
    },
    select: articleSelect,
  });

  if (!article) {
    return null;
  }

  return {
    ...article,
    content: parseContentArray(article.content),
  };
}

export async function getRelatedPublishedArticles(currentId: string, take = 2) {
  const related = await prisma.article.findMany({
    where: {
      status: "published",
      id: { not: currentId },
    },
    orderBy: { publishedAt: "desc" },
    take,
    select: articleSelect,
  });

  return related.map((article) => ({
    ...article,
    content: parseContentArray(article.content),
  }));
}