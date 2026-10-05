/**
 * Forms and Almena's field catalogue, as the API serves them and a holder
 * fills them in: the fields an offer's form asks for, with their definitions,
 * and the credentials it asks to be presented. Shared by client and server.
 */

import type { Texts } from "./texts";

export type Labels = Record<string, string>;
export type FieldType =
  "text" | "email" | "phone" | "date" | "code" | "codes" | "file" | "group";
export type Narrowing = "values" | "min_date" | "max_date" | "max_length";
export type CodeValue = string | number;

export type CatalogueField = {
  id: string;
  type: FieldType;
  labels: Labels;
  source: string;
  /** Top-level fields only; a group's parts have none. */
  category?: string;
  schema?: string;
  narrowing?: Narrowing[];
  repeatable?: boolean;
  domain?: string;
  /** The domain's values this field takes, when not all of them. */
  values?: CodeValue[];
  max_length?: number;
  /** The tenant's own fields: a text's pattern, a list's options inline. */
  pattern?: string;
  codes?: Code[];
  parts?: { key: string; required: boolean; field: CatalogueField }[];
};

/** How forms name one of the tenant's own fields: `custom:{key}`. */
export const CUSTOM = "custom:";

export type Code = { value: CodeValue; labels: Labels; media_type?: string };

export type Catalogue = {
  version: string;
  languages: string[];
  categories: { id: string; labels: Labels }[];
  fields: CatalogueField[];
  domains: Record<string, { labels: Labels; source: string; codes: Code[] }>;
};

export type Narrow = {
  values?: CodeValue[];
  min_date?: string;
  max_date?: string;
  max_length?: number;
};

/** A form's field, as the API keeps it. */
export type FormField = {
  ref: string;
  as?: string;
  required: boolean;
  help?: Texts;
  narrow?: Narrow;
};

/** A label in the visitor's language, else English. */
export function label(
  labels: Record<string, string | undefined>,
  locale: string,
): string {
  return (
    labels[locale] || labels.en || Object.values(labels).find(Boolean) || ""
  );
}

export function byId(catalogue: Catalogue): Map<string, CatalogueField> {
  return new Map(catalogue.fields.map((field) => [field.id, field]));
}

/** The codes a coded or file field takes, before a form narrows them. */
export function codesOf(catalogue: Catalogue, field: CatalogueField): Code[] {
  if (field.codes) return field.codes;
  const codes = field.domain
    ? (catalogue.domains[field.domain]?.codes ?? [])
    : [];
  return field.values
    ? codes.filter((code) => field.values?.includes(code.value))
    : codes;
}

/** A credential a form asks to be presented, as the API keeps it. */
export type TrustMode = "registry" | "issuers" | "framework";
export type CredentialRequest = {
  key: string;
  type: string;
  required: boolean;
  purpose?: Texts;
  claims: string[];
  trust: TrustMode;
  issuers?: string[];
  /** The keys of the form's fields it fills. */
  fills: string[];
  /** Its type's name, by language: an issuer's own types are not Almena's. */
  labels?: Texts;
};
