import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionBlock, SectionTitle } from "@/app/components/ui";
import { blogArticleBySlug } from "@/app/data/homepageData";

interface BlogArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { slug } = await params;
  const article = blogArticleBySlug[slug];

  if (!article) {
    notFound();
  }

  const relatedArticles = article.relatedSlugs
    .map((relatedSlug) => blogArticleBySlug[relatedSlug])
    .filter((candidate) => Boolean(candidate));

  return (
    <div className="grid min-h-screen bg-[radial-gradient(circle_at_top_left,_#d9e8f5,_#eaf4ee_40%,_#f7f8f4_75%)] text-slate-800">
      <main className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <SectionBlock className="gap-4">
          <p className="text-sm font-medium text-emerald-700">
            By {article.author} • {article.publishedOn}
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
          <div className="grid gap-4">
            {article.content.map((paragraph, index) => (
              <p key={`${article.slug}-${index}`} className="text-slate-700">
                {paragraph}
              </p>
            ))}
          </div>
          <p className="rounded-xl bg-cyan-50 px-4 py-3 text-slate-700 ring-1 ring-cyan-100">
            Reflection moment: {article.reflectionMoment}
          </p>
        </SectionBlock>

        <SectionBlock>
          <SectionTitle title="Related Articles" />
          <div className="grid gap-4 md:grid-cols-2">
            {relatedArticles.map((related) => (
              <article key={related.slug} className="grid gap-2 rounded-2xl bg-white p-5 ring-1 ring-emerald-100">
                <h3 className="text-lg font-semibold text-slate-900">{related.title}</h3>
                <p className="text-sm text-slate-600">
                  By {related.author} • {related.publishedOn}
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
