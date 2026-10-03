import "server-only";

import { api } from "./api";
import type { Labels } from "./texts";

/** A service in the catalog: a credential type an issuer grants on request. */
export type Offer = {
  issuer: { slug: string; name: string; description: string | null; did: string };
  credential_type: {
    id: string;
    labels: Labels;
    descriptions: Labels;
    category: { id: string; labels: Labels };
  };
};

/** A page of offers, as the API's public catalogue serves them. */
export type OfferPage = { items: Offer[]; next_cursor: string | null; total: number };

/** One page of every published offer, newest issuer first; `null` when unreachable. */
export async function fetchOffers(cursor?: string): Promise<OfferPage | null> {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  const { data } = await api<OfferPage>(`/catalog/offers${query}`);
  return data;
}
