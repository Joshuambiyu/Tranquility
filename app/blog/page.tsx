import Link from "next/link";
import { FeaturedArticleSection } from "@/app/components/FeaturedArticleSection";
import { Card, SectionBlock, SectionTitle } from "@/app/components/ui";
import { blogPageIntro } from "@/app/data/homepageData";
import { getFeaturedArticle, getPublishedArticlesPage } from "@/lib/articles";

const BLOG_PAGE_SIZE = 3;

export const revalidate = 300;

interface BlogPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

function normalizePositiveInteger(value: string | undefined, fallback = 1) {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : fallback;
}

function buildBlogHref(page: number, query: string) {
  const params = new URLSearchParams();
  if (query) {
    params.set("q", query);
  }
  if (page > 1) {
    params.set("page", String(page));
  }

  const serialized = params.toString();
  return serialized ? `/blog?${serialized}` : "/blog";
}

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

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = (resolvedSearchParams.q ?? "").trim();
  const page = normalizePositiveInteger(resolvedSearchParams.page, 1);

  const featured = await getFeaturedArticle();
  const articleResult = await getPublishedArticlesPage({
    page,
    pageSize: BLOG_PAGE_SIZE,
    search: query,
    excludeArticleId: featured?.id,
  });

  const fallbackFeatured = !featured && articleResult.articles.length > 0 ? articleResult.articles[0] : null;

  const featuredSource = featured ?? fallbackFeatured;

  const featuredPost = featuredSource
    ? {
        slug: featuredSource.slug,
        title: featuredSource.title,
        excerpt: featuredSource.excerpt,
        author: featuredSource.author,
        reflectionMoment: featuredSource.reflectionMoment,
        publishedAt: featuredSource.publishedAt.toISOString(),
      }
    : null;

  const { articles, pagination } = articleResult;
  const latestArticles = featuredPost
    ? articles.filter((post) => post.slug !== featuredPost.slug)
    : articles;
  const hasMore = Boolean(pagination.hasMore);

  return (
    <div className="grid min-h-screen bg-background text-foreground">
      <main className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <SectionBlock className="gap-4">
          <SectionTitle title="Articles" description={blogPageIntro} />
          <form action="/blog" method="get" className="grid gap-2 text-sm font-medium text-[var(--text-muted)]">
            <label htmlFor="blog-search-input">Search articles</label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                id="blog-search-input"
                name="q"
                type="search"
                defaultValue={query}
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
            {latestArticles.map((post) => {
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

          {hasMore || page > 1 ? (
            <div className="flex justify-center">
              <div className="flex flex-wrap justify-center gap-3">
                {page > 1 ? (
                  <Link
                    href={buildBlogHref(page - 1, query)}
                    className="rounded-full border border-[var(--border-muted)] px-5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-[var(--accent-soft)]"
                  >
                    Previous page
                  </Link>
                ) : null}
                {hasMore ? (
                  <Link
                    href={buildBlogHref(page + 1, query)}
                    className="rounded-full border border-[var(--border-muted)] px-5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-[var(--accent-soft)]"
                  >
                    See more articles
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}

          {latestArticles.length === 0 ? (
            <Card>
              <p className="text-[var(--text-muted)]">No articles matched your search yet. Try another keyword.</p>
            </Card>
          ) : null}
        </SectionBlock>
      </main>
    </div>
  );
}
