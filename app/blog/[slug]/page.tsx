import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RichArticleRenderer from "@/app/components/RichArticleRenderer";
import { Card, SectionBlock, SectionTitle } from "@/app/components/ui";
import { getPublishedArticleBySlug, getRelatedPublishedArticles } from "@/lib/articles";

interface BlogArticlePageProps {
  params: Promise<{ slug: string }>;
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

export async function generateMetadata({ params }: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);

  if (!article) {
    return { title: "Article Not Found" };
  }

  return {
    title: article.title,
    description: article.content[0]?.slice(0, 160),
  };
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedPublishedArticles(article.id, 2);

  return (
    <div className="grid min-h-screen bg-[radial-gradient(circle_at_top_left,_#d9e8f5,_#eaf4ee_40%,_#f7f8f4_75%)] text-slate-800">
      <main className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <SectionBlock className="gap-4">
          <p className="text-sm font-medium text-emerald-700">
            By {article.author} • {new Date(article.publishedAt).toLocaleDateString()}
          </p>
          <SectionTitle title={article.title} />
          <div className="relative h-56 overflow-hidden rounded-2xl ring-1 ring-emerald-100 sm:h-72">
            <Image
              src={article.imageSrc}
              alt={article.imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, 70vw"
              className="object-cover"
            />
          </div>
        </SectionBlock>

        <SectionBlock>
          <SectionTitle title="Article" />
          {article.richContent ? (
            <RichArticleRenderer content={article.richContent} />
          ) : (
            <div className="grid gap-4">
              {article.content.map((paragraph, index) => (
                <p key={`${article.id}-${index}`} className="text-slate-700">
                  {paragraph}
                </p>
              ))}
            </div>
          )}
          <p className="rounded-xl bg-cyan-50 px-4 py-3 text-slate-700 ring-1 ring-cyan-100">
            Reflection moment: {article.reflectionMoment}
          </p>
        </SectionBlock>

        <SectionBlock>
          <SectionTitle title="Related Articles" />
          <div className="grid gap-4 md:grid-cols-2">
            {relatedArticles.map((related) => (
              <Card key={related.id} className="gap-3">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  {related.author} • {new Date(related.publishedAt).toLocaleDateString()}
                </p>
                <h3 className="text-xl font-semibold text-[var(--text-strong)]">{related.title}</h3>
                <p className="text-[var(--text-muted)]">{related.excerpt}</p>
                <p className="rounded-xl bg-[var(--card-in-section-bg)] px-3 py-2 text-sm text-[var(--text-muted)] ring-1 ring-[var(--border-muted)]">
                  Reflection moment: {truncateAtWordBoundary(related.reflectionMoment, 130)}
                </p>
                <Link
                  href={`/blog/${related.slug}`}
                  className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
                >
                  Read related article
                </Link>
              </Card>
            ))}
          </div>
          <div>
            <Link href="/blog" className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-800">
              Back to all reflections
            </Link>
          </div>
        </SectionBlock>
      </main>
    </div>
  );
}
