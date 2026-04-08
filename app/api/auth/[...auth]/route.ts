import { NextRequest, NextResponse } from "next/server";
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

const handler = toNextJsHandler(auth);

async function withErrorLogging(
  req: NextRequest,
  method: (req: NextRequest) => Promise<Response>,
) {
  const meta = {
    url: req.url,
    method: req.method,
    userAgent: req.headers.get("user-agent"),
  };

  try {
    const res = await method(req);

    // Log non-2xx responses (BetterAuth may return errors without throwing)
    if (res.status >= 400) {
      const body = await res.clone().text();
      console.error("[auth] error response:", { ...meta, status: res.status, body });
    }

    return res;
  } catch (error) {
    console.error("[auth] unhandled error:", {
      ...meta,
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
