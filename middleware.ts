import { NextRequest, NextResponse } from "next/server";

/**
 * Redirect the apex domain to www so cookies, OAuth state, and
 * session tokens are always on a single canonical origin.
 *
 * Both domains are Vercel aliases (no infra-level redirect), so
 * we must enforce it here — especially for /api/auth/* callbacks
 * that rely on cookies set during the sign-in initiation.
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";

  // Only redirect the apex domain → www (production only)
  if (host === "tranquilityhub.co.ke") {
    const url = request.nextUrl.clone();
    url.host = "www.tranquilityhub.co.ke";
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match ALL routes including /api, but exclude Next.js internals
    "/((?!_next|favicon\\.ico|icon\\.svg).*)",
  ],
};
