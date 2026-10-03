"use server";

import { fetchOffers, type OfferPage } from "./offers";

/** The page of offers after `cursor`, for the grid as it is scrolled. */
export async function loadOffers(cursor: string): Promise<OfferPage | null> {
  return fetchOffers(cursor);
}
