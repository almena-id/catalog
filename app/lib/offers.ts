import "server-only";

import { api } from "./api";
import type { Labels, Texts } from "./texts";

/** A credential category as the API's public catalogue names and draws it. */
export type Category = {
  id: string;
  labels: Labels;
  /** A lucide name (`app/lib/category-icons.ts`). */
  icon: string;
};

/** The publishing issuer, as every offer names it. */
export type OfferIssuer = {
  slug: string;
  name: string;
  /** By language. */
  description: Texts | null;
  did: string;
  /** The domains its tenant has proved by DNS, oldest first (`verifiedDomains`). */
  domains?: string[];
};

/** A service in the catalog: a credential type an issuer grants on request. */
export type Offer = {
  issuer: OfferIssuer;
  credential_type: {
    id: string;
    labels: Labels;
    descriptions: Labels;
    category: Category;
  };
};

/** A page of offers, as the API's public catalogue serves them. */
export type OfferPage = {
  items: Offer[];
  next_cursor: string | null;
  total: number;
};

/** What the catalog is narrowed by: words to find, a credential category. */
export type OfferFilters = { q?: string; category?: string };

/** A category offers are filed under, with how many there are. */
export type OfferCategory = Category & { offers: number };

/** A published issuer and everything it offers. */
export type IssuerOffers = {
  issuer: OfferIssuer;
  published_at: string;
  offers: Offer["credential_type"][];
};

/** The query string the filters and the cursor make (empty ones left out). */
export function offersQuery(filters: OfferFilters, cursor?: string): string {
  const query = new URLSearchParams();
  const q = filters.q?.trim();
  if (q) query.set("q", q);
  if (filters.category) query.set("category", filters.category);
  if (cursor) query.set("cursor", cursor);
  const text = query.toString();
  return text ? `?${text}` : "";
}

/** One page of the published offers that match, newest issuer first; `null` when unreachable. */
export async function fetchOffers(
  filters: OfferFilters = {},
  cursor?: string,
): Promise<OfferPage | null> {
  const { data } = await api<OfferPage>(
    `/catalog/offers${offersQuery(filters, cursor)}`,
  );
  return data;
}

/** The categories offers are filed under, the most offered first; `null` when unreachable. */
export async function fetchOfferCategories(): Promise<OfferCategory[] | null> {
  const { data } = await api<OfferCategory[]>("/catalog/offers/categories");
  return data;
}

/**
 * A published issuer and its offers: `missing` when there is no such issuer
 * (or it is not published), `null` when the API cannot be reached.
 */
export async function fetchIssuerOffers(
  slug: string,
): Promise<IssuerOffers | "missing" | null> {
  const { status, data } = await api<IssuerOffers>(
    `/catalog/issuers/${encodeURIComponent(decodeURIComponent(slug))}/offers`,
  );
  if (status === 404) return "missing";
  return data;
}
