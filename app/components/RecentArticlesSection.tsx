"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, SectionBlock, SectionTitle } from "@/app/components/ui";

type ArticleSummary = {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
};

const HOME_ARTICLE_PAGE_SIZE = 4;

export function RecentArticlesSection() {
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadArticles = async (nextPage: number, append: boolean) => {
    try {
      setIsLoading(true);

      const response = await fetch(
        `/api/articles?page=${nextPage}&pageSize=${HOME_ARTICLE_PAGE_SIZE}`,
        { cache: "no-store" },
      );
      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as {
        articles?: Array<{ id: string; title: string; excerpt: string; slug: string }>;
        pagination?: { page?: number; hasMore?: boolean };
      };

      setArticles((current) => {
        const incoming = payload.articles ?? [];
        if (!append) {
          return incoming;
        }

        const existingIds = new Set(current.map((article) => article.id));
        const nextItems = incoming.filter((article) => !existingIds.has(article.id));
        return [...current, ...nextItems];
      });
      setPage(payload.pagination?.page ?? nextPage);
      setHasMore(Boolean(payload.pagination?.hasMore));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadArticles(1, false);
  }, []);

  const visibleArticles = useMemo(() => {
    return articles.slice(0, 8);
  }, [articles]);

  const handleLoadMore = async () => {
    if (isLoading || !hasMore) {
      return;
    }

    await loadArticles(page + 1, true);
  };

  return (
    <SectionBlock>
      <SectionTitle title="Recent Articles" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {visibleArticles.map((article) => (
          <Card key={article.id} className="gap-3">
            <h3 className="text-lg font-semibold text-[var(--text-strong)] lg:text-xl">{article.title}</h3>
            <p className="text-sm leading-relaxed text-[var(--text-muted)] lg:text-base">{article.excerpt}</p>
            <a
              href={`/blog/${article.slug}`}
              className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
            >
              Read More
            </a>
          </Card>
        ))}
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
    </SectionBlock>
  );
}
