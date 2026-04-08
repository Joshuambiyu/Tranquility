import { NextRequest, NextResponse } from "next/server";

/**
 * Redirect www → apex so auth cookies, OAuth callbacks, and the browsing
 * domain all share one origin.  API routes are excluded because redirecting
 * POST requests (e.g. One Tap credential callback) would lose the body.
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";

  if (host.startsWith("www.")) {
    const canonical = host.replace(/^www\./, "");
    const url = request.nextUrl.clone();
    url.host = canonical;
    url.protocol = "https";
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match every path EXCEPT:
     *  - /api (auth callbacks, One Tap POST, etc.)
     *  - /_next (static assets, image optimisation)
     *  - /favicon.ico, /icon.svg (static files)
     */
    "/((?!api|_next|favicon\\.ico|icon\\.svg).*)",
  ],
};
