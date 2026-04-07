import { prisma } from "@/lib/prisma";

type SearchItemKind = "article" | "voice";

export interface SearchItem {
  id: string;
  kind: SearchItemKind;
  title: string;
  excerpt: string;
  href: string;
  meta: string;
}

export interface GlobalSearchResult {
  query: string;
  total: number;
  articles: SearchItem[];
  voices: SearchItem[];
}

function normalizeQuery(input: string) {
  return input.trim();
}

export async function searchGlobalContent(rawQuery: string): Promise<GlobalSearchResult> {
  const query = normalizeQuery(rawQuery);

  if (query.length < 2) {
    return {
      query,
      total: 0,
      articles: [],
      voices: [],
    };
  }

  const [articles, voices] = await prisma.$transaction([
    prisma.article.findMany({
      where: {
        status: "published",
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { excerpt: { contains: query, mode: "insensitive" } },
          { author: { contains: query, mode: "insensitive" } },
          { reflectionMoment: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
      take: 8,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        author: true,
      },
    }),
    prisma.voiceSubmission.findMany({
      where: {
        status: "approved",
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { reflection: { contains: query, mode: "insensitive" } },
          { author: { contains: query, mode: "insensitive" } },
          { descriptor: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: [{ isVoiceOfWeek: "desc" }, { approvedAt: "desc" }, { createdAt: "desc" }],
      take: 8,
      select: {
        id: true,
        title: true,
        reflection: true,
        author: true,
      },
    }),
  ]);

  const articleResults: SearchItem[] = articles.map((article) => ({
    id: article.id,
    kind: "article",
    title: article.title,
    excerpt: article.excerpt,
    href: `/blog/${article.slug}`,
    meta: `Article by ${article.author}`,
  }));

  const voiceResults: SearchItem[] = voices.map((voice) => ({
    id: voice.id,
    kind: "voice",
    title: voice.title,
    excerpt: voice.reflection,
    href: "/voices",
    meta: `Voice by ${voice.author}`,
  }));

  return {
    query,
    total: articleResults.length + voiceResults.length,
    articles: articleResults,
    voices: voiceResults,
  };
}
