import Image from "next/image";
import Link from "next/link";
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
}

export function FeaturedArticleSection({ featuredPost }: FeaturedArticleSectionProps) {
  return (
    <SectionBlock className="relative overflow-hidden" bgVariant="default">
      {featuredPost ? (
        <>
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "linear-gradient(180deg, var(--hero-from), var(--hero-via), var(--hero-to))" }}
          />
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
            <Image
              src="/images/featured-article-image.jpeg"
              alt=""
              fill
              sizes="100vw"
              className="object-cover object-right"
              style={{
                opacity: 1.85,
                transform: "scale(1.2)",
                maskImage: "linear-gradient(to right, transparent 0%, transparent 25%, rgba(0,0,0,0.4) 50%, black 80%)",
                WebkitMaskImage: "linear-gradient(to right, transparent 0%, transparent 25%, rgba(0,0,0,0.4) 50%, black 80%)",
              }}
              priority
            />
          </div>
        </>
      ) : null}

      <div className="relative">
        <SectionTitle title="Featured Article" />
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
          <p className="text-[var(--text-muted)]">No featured article yet.</p>
        </Card>
      )}
    </SectionBlock>
  );
}