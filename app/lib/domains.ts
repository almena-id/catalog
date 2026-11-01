/** A domain name as the API stores a proved one: lowercase ASCII labels, dots between. */
const DOMAIN = /^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9-]{2,63}$/;

/**
 * The domains an issuer's tenant has proved by DNS, as the catalog shows them:
 * only what reads as a domain name, each once, in the API's order (oldest
 * first). Anything else the API sends — nothing at all, from an API that does
 * not name them yet — is no domains.
 */
export function verifiedDomains(domains: unknown): string[] {
  if (!Array.isArray(domains)) return [];
  const seen = new Set<string>();
  for (const item of domains) {
    if (typeof item !== "string") continue;
    const name = item.trim().toLowerCase();
    if (DOMAIN.test(name)) seen.add(name);
  }
  return [...seen];
}
