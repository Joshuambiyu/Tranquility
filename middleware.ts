import { NextResponse } from "next/server";

/**
 * Vercel is already configured to redirect the apex domain
 * (tranquilityhub.co.ke) to www.tranquilityhub.co.ke.
 * This middleware is a no-op safety net.  If we ever need to
 * enforce the canonical host in code, do it here.
 */
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next|favicon\\.ico|icon\\.svg).*)",
  ],
};
