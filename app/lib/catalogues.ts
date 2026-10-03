import "server-only";

import { cache } from "react";

import { api } from "./api";
import type { Catalogue, Labels } from "./form-fields";

/** One of Almena's credential types, as the API serves it. */
export type CredentialType = {
  id: string;
  category: string;
  labels: Labels;
  descriptions: Labels;
  source: string;
  /** `almena`: a tenant's issuer grants it; `external`: only asked for (EU PID). */
  issuance: "almena" | "external";
  /** Each a field of the field catalogue, by id. */
  claims: { field: string; required: boolean }[];
};

export type CredentialCatalogue = {
  version: string;
  categories: { id: string; labels: Labels }[];
  types: CredentialType[];
};

/** Almena's field catalogue (public); `null` when the API cannot be reached. */
export const fetchCatalogue = cache(async (): Promise<Catalogue | null> => {
  const { data } = await api<Catalogue>("/catalog/fields");
  return data;
});

/** Almena's credential type catalogue (public); `null` when unreachable. */
export const fetchCredentialCatalogue = cache(
  async (): Promise<CredentialCatalogue | null> => {
    const { data } = await api<CredentialCatalogue>("/catalog/credentials");
    return data;
  },
);
