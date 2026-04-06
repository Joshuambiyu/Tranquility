import { NextResponse } from "next/server";
import { getFeaturedArticle, getPublishedArticlesPage } from "@/lib/articles";
import { toErrorResponse } from "@/lib/errors/api-error";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? "1");
    const pageSize = Number(url.searchParams.get("pageSize") ?? "4");
    const search = url.searchParams.get("search") ?? "";

    const featured = await getFeaturedArticle();

    const result = await getPublishedArticlesPage({
      page,
      pageSize,
      search,
      excludeArticleId: featured?.id,
    });

    return NextResponse.json({
      ...result,
      featured,
    });
  } catch (error) {
    return toErrorResponse(error, {
      fallbackMessage: "Something went wrong while loading articles.",
      route: "GET /api/articles",
    });
  }
}