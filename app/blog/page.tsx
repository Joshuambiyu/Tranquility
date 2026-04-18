"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FeaturedArticleSection } from "@/app/components/FeaturedArticleSection";
import { Card, SectionBlock, SectionTitle } from "@/app/components/ui";
import { blogPageIntro } from "@/app/data/homepageData";

const BLOG_PAGE_SIZE = 3;

type ApiArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  imageSrc: string;
  imageAlt: string;
  reflectionMoment: string;
  publishedAt: string;
  isFeatured: boolean;
};

type ArticleApiResponse = {
  featured: ApiArticle | null;
  articles: ApiArticle[];
  pagination?: {
    page?: number;
    hasMore?: boolean;
  };
};

function truncateAtWordBoundary(text: string, maxLength: number) {
  const normalized = text.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const candidate = normalized.slice(0, maxLength);
  const lastSpace = candidate.lastIndexOf(" ");
  const safeCut = lastSpace > Math.floor(maxLength * 0.6) ? candidate.slice(0, lastSpace) : candidate;

  return `${safeCut.trim()}...`;
}

export default function BlogPage() {
  const [query, setQuery] = useState("");
  const [queryInput, setQueryInput] = useState("");
  const [featuredPost, setFeaturedPost] = useState<ApiArticle | null>(null);
  const [articles, setArticles] = useState<ApiArticle[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadArticles = useCallback(async (nextPage: number, append: boolean) => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch(
        `/api/articles?page=${nextPage}&pageSize=${BLOG_PAGE_SIZE}&search=${encodeURIComponent(query.trim())}`,
        { cache: "no-store" },
      );

      if (!response.ok) {
        throw new Error("Unable to load articles right now.");
      }

      const result = (await response.json()) as ArticleApiResponse;
      setFeaturedPost(result.featured ?? null);
      setArticles((current) => {
        const payload = result.articles ?? [];
        if (!append) {
          return payload;
        }

        const existingIds = new Set(current.map((item) => item.id));
        const nextItems = payload.filter((item) => !existingIds.has(item.id));
        return [...current, ...nextItems];
      });
      setPage(result.pagination?.page ?? nextPage);
      setHasMore(Boolean(result.pagination?.hasMore));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load articles right now.");
      if (!append) {
        setArticles([]);
        setFeaturedPost(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const handler = setTimeout(() => {
      void loadArticles(1, false);
    }, 180);

    return () => clearTimeout(handler);
  }, [loadArticles]);

  const visiblePosts = useMemo(() => {
    if (!featuredPost) {
      return articles;
    }

    return articles.filter((post) => post.id !== featuredPost.id);
  }, [articles, featuredPost]);

  const handleLoadMore = async () => {
    if (isLoading || !hasMore) {
      return;
    }

    await loadArticles(page + 1, true);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextQuery = queryInput.trim();

    if (nextQuery === query) {
      void loadArticles(1, false);
      return;
    }

    setQuery(nextQuery);
  };

  return (
    <div className="grid min-h-screen bg-background text-foreground">
      <main className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <SectionBlock className="gap-4">
          <SectionTitle title="Articles" description={blogPageIntro} />
          <form onSubmit={handleSearchSubmit} className="grid gap-2 text-sm font-medium text-[var(--text-muted)]">
            <label htmlFor="blog-search-input">Search articles</label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                id="blog-search-input"
                type="search"
                value={queryInput}
                onChange={(event) => setQueryInput(event.target.value)}
                placeholder="Search by title, author, or topic"
                className="min-w-0 flex-1 rounded-xl border border-[var(--border-muted)] bg-[var(--surface)] px-4 py-3 text-[var(--text-strong)] outline-none ring-emerald-400 transition focus:ring"
              />
              <button
                type="submit"
                className="w-full rounded-xl border border-[var(--border-muted)] px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-[var(--accent-soft)] sm:w-auto"
              >
                Search
              </button>
            </div>
          </form>
        </SectionBlock>

        <FeaturedArticleSection featuredPost={featuredPost} />

        <SectionBlock>
          <SectionTitle title="Latest Articles" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visiblePosts.map((post) => {
              return (
                <Card key={post.id} className="min-w-0 gap-3">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    {post.author} • {new Date(post.publishedAt).toLocaleDateString()}
                  </p>
                  <h3 className="break-words text-2xl font-semibold text-slate-950">{post.title}</h3>
                  <p className="break-words text-base text-slate-800">{post.excerpt}</p>
                  <p className="min-w-0 break-words rounded-xl bg-[var(--card-in-section-bg)] px-3 py-2 text-base text-slate-800 ring-1 ring-[var(--border-muted)]">
                    Reflection moment: {truncateAtWordBoundary(post.reflectionMoment, 130)}
                  </p>
                  <Link href={`/blog/${post.slug}`} className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
                    Read article
                  </Link>
                </Card>
              );
            })}
          </div>
          {hasMore ? (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoading}
                className="rounded-full border border-[var(--border-muted)] px-5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-[var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Loading articles..." : "See more articles"}
              </button>
            </div>
          ) : null}
          {error ? (
            <Card>
              <p className="text-[var(--text-muted)]">{error}</p>
            </Card>
          ) : null}
          {!isLoading && !error && visiblePosts.length === 0 ? (
            <Card>
              <p className="text-[var(--text-muted)]">No articles matched your search yet. Try another keyword.</p>
            </Card>
          ) : null}
        </SectionBlock>
      </main>
    </div>
  );
}
