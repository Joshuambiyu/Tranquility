import { SectionBlock, SectionTitle } from "@/app/components/ui";
import type { ArticleCardItem } from "@/types";

interface RecentArticlesSectionProps {
  articles: ArticleCardItem[];
}

export function RecentArticlesSection({ articles }: RecentArticlesSectionProps) {
  return (
    <SectionBlock>
      <SectionTitle title="Recent Articles" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {articles.map((article) => (
          <article key={article.id} className="grid gap-3 rounded-2xl bg-sky-50/70 p-5 ring-1 ring-sky-100">
            <h3 className="text-lg font-semibold text-slate-900">{article.title}</h3>
            <p className="text-sm text-slate-700">{article.description}</p>
            <a
              href={article.href}
              className="text-sm font-semibold text-sky-700 transition hover:text-sky-900"
            >
              Read More
            </a>
          </article>
        ))}
      </div>
    </SectionBlock>
  );
}
