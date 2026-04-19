import Link from "next/link";
import { BlendedImageLayer } from "@/app/components/BlendedImageLayer";
import { Card, SectionBlock, SectionTitle } from "@/app/components/ui";

export interface FeaturedArticleData {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  reflectionMoment: string;
  publishedAt: string;
}

interface FeaturedArticleSectionProps {
  featuredPost: FeaturedArticleData | null;
  title?: string;
  emptyMessage?: string;
}

export function FeaturedArticleSection({
  featuredPost,
  title = "Featured Article",
  emptyMessage = "No featured article yet.",
}: FeaturedArticleSectionProps) {
  return (
    <SectionBlock className="relative overflow-hidden" bgVariant="default">
      {featuredPost ? (
        <BlendedImageLayer imageSrc="/images/featured-article-image.jpeg" />
      ) : null}

      <div className="relative">
        <SectionTitle title={title} />
      </div>

      {featuredPost ? (
        <article className="relative grid gap-5 md:grid-cols-[1.1fr_1fr] md:items-center">
          <div className="grid gap-3">
            <p className="text-sm font-medium text-emerald-700">
              By {featuredPost.author} • {new Date(featuredPost.publishedAt).toLocaleDateString()}
            </p>
            <h3 className="text-2xl font-semibold text-[var(--text-strong)]">{featuredPost.title}</h3>
            <p className="text-[var(--text-muted)]">{featuredPost.excerpt}</p>
            <p className="rounded-xl bg-[var(--card-in-section-bg)] px-4 py-3 text-sm text-[var(--text-muted)] ring-1 ring-[var(--border-muted)]">
              Reflection moment: {featuredPost.reflectionMoment}
            </p>
            <Link href={`/blog/${featuredPost.slug}`} className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
              Read full reflection
            </Link>
          </div>
          <div className="hidden h-52 md:block" aria-hidden="true" />
        </article>
      ) : (
        <Card>
          <p className="text-[var(--text-muted)]">{emptyMessage}</p>
        </Card>
      )}
    </SectionBlock>
  );
}