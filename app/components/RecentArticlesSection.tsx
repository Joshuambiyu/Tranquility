import { Card, SectionBlock, SectionTitle } from "@/app/components/ui";
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
          <Card key={article.id} className="gap-3">
            <h3 className="text-lg font-semibold text-[var(--text-strong)] lg:text-xl">{article.title}</h3>
            <p className="text-sm leading-relaxed text-[var(--text-muted)] lg:text-base">{article.description}</p>
            <a
              href={article.href}
              className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
            >
              Read More
            </a>
          </Card>
        ))}
      </div>
    </SectionBlock>
  );
}
