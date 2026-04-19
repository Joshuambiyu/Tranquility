import type { FeaturedArticleData } from "@/app/components/FeaturedArticleSection";
import { HomePageClient } from "@/app/components/HomePageClient";
import { getFeaturedArticle } from "@/lib/articles";

export const revalidate = 300;

function toFeaturedArticleData(article: Awaited<ReturnType<typeof getFeaturedArticle>>): FeaturedArticleData | null {
  if (!article) {
    return null;
  }

  return {
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    author: article.author,
    reflectionMoment: article.reflectionMoment,
    publishedAt: article.publishedAt.toISOString(),
  };
}

export default async function Home() {
  const featuredArticle = await getFeaturedArticle();
  const featuredPost = toFeaturedArticleData(featuredArticle);

  return <HomePageClient featuredPost={featuredPost} />;
}
