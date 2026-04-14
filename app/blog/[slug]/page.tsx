import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RichArticleRenderer from "@/app/components/RichArticleRenderer";
import { SectionBlock, SectionTitle } from "@/app/components/ui";
import { getPublishedArticleBySlug, getRelatedPublishedArticles } from "@/lib/articles";

interface BlogArticlePageProps {
  params: Promise<{ slug: string }>;
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
              <article key={related.id} className="grid gap-2 rounded-2xl bg-white p-5 ring-1 ring-emerald-100">
                <h3 className="text-lg font-semibold text-slate-900">{related.title}</h3>
                <p className="text-sm text-slate-600">
                  By {related.author} • {new Date(related.publishedAt).toLocaleDateString()}
                </p>
                <Link
                  href={`/blog/${related.slug}`}
                  className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
                >
                  Read related article
                </Link>
              </article>
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
