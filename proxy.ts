import { NextResponse, type NextRequest } from "next/server";

import { contentSecurityPolicy, newNonce } from "./app/lib/security-headers";

/**
 * Every page gets its Content Security Policy with a nonce of its own: Next
 * reads it from the request's policy and marks its scripts with it (every
 * page renders per request: the layout reads cookies).
 */
export function proxy(request: NextRequest) {
  const policy = contentSecurityPolicy(
    newNonce(),
    process.env.NODE_ENV === "development",
  );
  const headers = new Headers(request.headers);
  headers.set("Content-Security-Policy", policy);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set("Content-Security-Policy", policy);
  return response;
}

export const config = {
  matcher: [
    {
      // Not the static files nor the health check.
      source: "/((?!_next/static|_next/image|health|icon.svg|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
