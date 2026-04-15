import { NextResponse } from "next/server";
import { toErrorResponse } from "@/lib/errors/api-error";
import { searchGlobalContent } from "@/lib/global-search";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") ?? "";
    const result = await searchGlobalContent(query);

    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error, {
      fallbackMessage: "Unable to search right now.",
      route: "GET /api/search",
    });
  }
}
