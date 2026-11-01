"use server";

import { fetchOffers, type OfferFilters, type OfferPage } from "./offers";

/**
 * The page of offers after `cursor`, for the grid as it is scrolled, narrowed
 * by the same filters as the first page (the URL's `q` and `category`).
 */
export async function loadOffers(
  cursor: string,
  filters: OfferFilters = {},
): Promise<OfferPage | null> {
  return fetchOffers(
    {
      q: typeof filters.q === "string" ? filters.q.slice(0, 100) : undefined,
      category:
        typeof filters.category === "string"
          ? filters.category.slice(0, 32)
          : undefined,
    },
    cursor,
  );
}
