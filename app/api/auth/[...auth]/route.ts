import { NextRequest, NextResponse } from "next/server";
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

const handler = toNextJsHandler(auth);

async function withErrorLogging(
  req: NextRequest,
  method: (req: NextRequest) => Promise<Response>,
) {
  try {
    return await method(req);
  } catch (error) {
    console.error("[auth] unhandled error:", {
      url: req.url,
      method: req.method,
      userAgent: req.headers.get("user-agent"),
      error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
    });
    return NextResponse.json(
      { error: "Internal auth error" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  return withErrorLogging(req, handler.GET);
}

export async function POST(req: NextRequest) {
  return withErrorLogging(req, handler.POST);
}
