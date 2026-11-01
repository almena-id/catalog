/**
 * The schemes a wallet link the API sends may have: the Almena wallet's own
 * (`almena:`) and https (a universal link). Anything else — `javascript:`,
 * `data:`, plain http — is never drawn as a QR code nor put in an `href`.
 */
const allowed = new Set(["almena:", "https:"]);

/** The API's deep link when its scheme is one a wallet opens; else `null`. */
export function safeDeepLink(link: unknown): string | null {
  if (typeof link !== "string") return null;
  try {
    return allowed.has(new URL(link).protocol) ? link : null;
  } catch {
    return null;
  }
}
