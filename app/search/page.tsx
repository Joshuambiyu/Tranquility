"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchResultsLoading } from "@/app/components/loading/PageSkeletons";
import { Card, SectionBlock, SectionTitle } from "@/app/components/ui";
import type { GlobalSearchResult, SearchItem } from "@/lib/global-search";

const EMPTY_RESULT: GlobalSearchResult = {
  query: "",
  total: 0,
  articles: [],
  voices: [],
};

function normalizeSearchParam(value: string | null) {
  return (value ?? "").trim();
}

function SearchResultGroup({
  title,
  items,
}: {
  title: string;
  items: SearchItem[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <SectionBlock>
      <SectionTitle title={`${title} (${items.length})`} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id} className="gap-3">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">{item.meta}</p>
            <h2 className="text-xl font-semibold text-[var(--text-strong)]">{item.title}</h2>
            <p className="text-[var(--text-muted)]">{item.excerpt}</p>
            <Link href={item.href} className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
              Open {title.toLowerCase()} result
            </Link>
          </Card>
        ))}
      </div>
    </SectionBlock>
  );
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryFromUrl = useMemo(() => normalizeSearchParam(searchParams.get("q")), [searchParams]);

  const [queryInput, setQueryInput] = useState(queryFromUrl);
  const [result, setResult] = useState<GlobalSearchResult>({ ...EMPTY_RESULT, query: queryFromUrl });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setQueryInput(queryFromUrl);

    if (queryFromUrl.length < 2) {
      setResult({ ...EMPTY_RESULT, query: queryFromUrl });
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/search?q=${encodeURIComponent(queryFromUrl)}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to search right now.");
        }

        const payload = (await response.json()) as GlobalSearchResult;
        if (!cancelled) {
          setResult(payload);
        }
      } catch {
        if (!cancelled) {
          setResult({ ...EMPTY_RESULT, query: queryFromUrl });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [queryFromUrl]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextQuery = queryInput.trim();
    if (!nextQuery) {
      router.push("/search");
      return;
    }

    router.push(`/search?q=${encodeURIComponent(nextQuery)}`);
  };

  return (
    <div className="grid min-h-screen bg-background text-foreground">
      <main className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <SectionBlock className="gap-4">
          <SectionTitle
            title="Search"
            description="Find articles and community voices in one place."
          />
          <form onSubmit={handleSearchSubmit} className="grid gap-2 text-sm font-medium text-[var(--text-muted)]">
            Search everything
            <div className="flex items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true">
                  <span className="relative block h-4 w-4">
                    <span className="absolute left-0 top-0 h-3 w-3 rounded-full border-2 border-current" />
                    <span className="absolute bottom-0 right-0 h-2 w-0.5 rotate-[-45deg] rounded-full bg-current" />
                  </span>
                </span>
                <input
                  name="q"
                  type="search"
                  value={queryInput}
                  onChange={(event) => setQueryInput(event.target.value)}
                  placeholder="Try: clarity, gratitude, exam"
                  className="w-full rounded-xl border border-[var(--border-muted)] bg-[var(--surface)] py-3 pl-10 pr-4 text-[var(--text-strong)] outline-none ring-emerald-400 transition focus:ring"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl border border-[var(--border-muted)] px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-[var(--accent-soft)]"
              >
                Search
              </button>
            </div>
          </form>
        </SectionBlock>

        {queryFromUrl.length < 2 ? (
          <SectionBlock>
            <Card>
              <p className="text-[var(--text-muted)]">Type at least 2 characters to start searching.</p>
            </Card>
          </SectionBlock>
        ) : null}

        {queryFromUrl.length >= 2 ? (
          <SectionBlock>
            <Card>
              <p className="text-[var(--text-muted)]">
                {isLoading ? "Searching..." : `Showing ${result.total} results for `}
                {!isLoading ? <span className="font-semibold text-[var(--text-strong)]">&quot;{result.query}&quot;</span> : null}
              </p>
            </Card>
          </SectionBlock>
        ) : null}

        {queryFromUrl.length >= 2 && isLoading ? (
          <SectionBlock>
            <SectionTitle title="Searching..." />
            <SearchResultsLoading />
          </SectionBlock>
        ) : null}

        {queryFromUrl.length >= 2 && !isLoading ? (
          <>
            <SearchResultGroup title="Articles" items={result.articles} />
            <SearchResultGroup title="Voices" items={result.voices} />
          </>
        ) : null}

        {queryFromUrl.length >= 2 && !isLoading && result.total === 0 ? (
          <SectionBlock>
            <Card>
              <p className="text-[var(--text-muted)]">No matches yet. Try a different keyword.</p>
            </Card>
          </SectionBlock>
        ) : null}
      </main>
    </div>
  );
}
