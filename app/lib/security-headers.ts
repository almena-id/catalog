/**
 * The Content Security Policy of every page, with the request's nonce: only
 * this origin's scripts and those Next marks with the nonce run (`strict-
 * dynamic` lets them load their chunks); styles are this origin's files plus
 * inline ones (server-rendered `style` attributes); images may be `data:` or
 * `blob:`; fonts are self-hosted; nothing may frame the portal, and forms
 * and server actions post only here. In development React needs `eval`.
 */
export function contentSecurityPolicy(nonce: string, dev = false): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

/** A fresh nonce for one request. */
export function newNonce(): string {
  return btoa(crypto.randomUUID());
}

/** The headers every response carries beside the policy (`next.config.ts`). */
export const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
];
