import "server-only";

import { cache } from "react";

import { api } from "./api";
import type { Labels } from "./texts";

/** One of Almena's credential types, as much of it as the catalog shows. */
export type CredentialType = {
  id: string;
  category: string;
  labels: Labels;
  descriptions: Labels;
};

export type CredentialCatalogue = {
  version: string;
  categories: { id: string; labels: Labels }[];
  types: CredentialType[];
};

/** A published issuer of any tenant, as the public catalogue lists it. */
export type PublishedIssuer = {
  did: string;
  name: string;
  description: string | null;
  /** Where its offers are. */
  slug: string | null;
  /** The types it offers: with a form to apply. */
  offers: string[] | null;
};

type IssuerPage = { items: PublishedIssuer[]; next_cursor: string | null };

/** A service in the catalog: a credential type an issuer grants on request. */
export type Offer = {
  issuer: PublishedIssuer & { slug: string };
  type: string;
  kind: CredentialType | undefined;
  category: CredentialCatalogue["categories"][number] | undefined;
};

/** Almena's credential type catalogue; `null` when unreachable. */
export const fetchCredentialCatalogue = cache(async () => {
  const { data } = await api<CredentialCatalogue>("/catalog/credentials");
  return data;
});

/** Every page of published issuers (up to a few hundred); `null` when unreachable. */
export const fetchPublishedIssuers = cache(async (): Promise<PublishedIssuer[] | null> => {
  const found: PublishedIssuer[] = [];
  let cursor: string | null = null;
  for (let page = 0; page < 5; page++) {
    const query: string = cursor ? `&cursor=${encodeURIComponent(cursor)}` : "";
    const response: { data: IssuerPage | null } = await api<IssuerPage>(
      `/catalog/issuers?limit=100${query}`,
    );
    const data: IssuerPage | null = response.data;
    if (!data) return page ? found : null;
    found.push(...data.items);
    cursor = data.next_cursor;
    if (!cursor) break;
  }
  return found;
});

/** Every published offer, each with its type and category; `null` when unreachable. */
export async function fetchOffers(): Promise<Offer[] | null> {
  const [issuers, catalogue] = await Promise.all([
    fetchPublishedIssuers(),
    fetchCredentialCatalogue(),
  ]);
  if (issuers === null || catalogue === null) return null;
  const types = new Map(catalogue.types.map((type) => [type.id, type]));
  const categories = new Map(catalogue.categories.map((c) => [c.id, c]));
  return issuers.flatMap((issuer) => {
    const { slug } = issuer;
    if (!slug) return [];
    return (issuer.offers ?? []).map((type) => {
      const kind = types.get(type);
      return {
        issuer: { ...issuer, slug },
        type,
        kind,
        category: kind && categories.get(kind.category),
      };
    });
  });
}

/** Where an offer is applied for: the registry portal, for now. */
export function applyUrl(offer: Offer): string {
  const registry = process.env.NEXT_PUBLIC_REGISTRY_WEB_URL ?? "https://registry.almena.id";
  return `${registry}/credentials/${encodeURIComponent(offer.issuer.slug)}/${encodeURIComponent(offer.type)}`;
}
