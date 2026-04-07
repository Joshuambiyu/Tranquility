import { NextResponse } from "next/server";

import { toErrorResponse } from "@/lib/errors/api-error";
import { getCurrentResourceOfMonth } from "@/lib/resources";

export async function GET() {
  try {
    const resource = await getCurrentResourceOfMonth();

    return NextResponse.json({
      resource,
    });
  } catch (error) {
    return toErrorResponse(error, {
      fallbackMessage: "Something went wrong while loading the current resource.",
      route: "GET /api/resources/current",
    });
  }
}
