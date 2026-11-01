import "server-only";

import { cookies } from "next/headers";

import { api } from "./api";
import type { CredentialType } from "./catalogues";
import type {
  CatalogueField,
  CredentialRequest,
  FormField,
} from "./form-fields";
import type { Category } from "./offers";
import type { Texts } from "./texts";

/** What an issued credential's status is, as its issuer's list says. */
export type CredentialStatus = "valid" | "suspended" | "revoked";

/** Where whoever started an application keeps its secret (one per application). */
export const applicationCookie = (id: string) => `almena.application.${id}`;

/** A form field as an offer shows it: the form's settings and its definition. */
export type OfferField = FormField & {
  key: string;
  field: CatalogueField;
  /** A file field: the most a holder may upload for it, in bytes. */
  max_bytes?: number;
};

export type Offer = {
  issuer: {
    slug: string;
    name: string;
    /** By language. */
    description: Texts | null;
    did: string;
    /** The domains its tenant has proved by DNS, oldest first (`verifiedDomains`). */
    domains?: string[];
  };
  credential_type: CredentialType;
  /** The credential type's category, named and with its icon. */
  category: Category;
  form: {
    slug: string;
    name: Texts;
    description: Texts | null;
    fields: OfferField[];
    credentials: CredentialRequest[];
  };
};

export type FileMeta = {
  filename: string;
  media_type: string;
  size: number;
  digest: string;
};

export type Presented = {
  key: string;
  type: string;
  presented: boolean;
  verified: boolean;
  format: string | null;
  issuer: string | null;
  claims: Record<string, unknown>;
  fills: Record<string, unknown>;
  problems: string[];
};

export type ApplicationStatus =
  "open" | "paired" | "submitted" | "accepted" | "rejected" | "issued";

export type WalletState = {
  purpose: "pair" | "present" | "submit" | "receive" | null;
  answered: boolean;
  live: boolean;
  deep_link: string | null;
  expires_at: string | null;
};

/** An application, as whoever holds its secret sees it. */
export type HolderApplication = {
  id: string;
  slug: string;
  /** Until when its secret opens it: a day unsent, then after each step. */
  expires_at: string;
  status: ApplicationStatus;
  holder_did: string | null;
  offer: Offer;
  answers: Record<string, unknown>;
  filled: Record<string, unknown>;
  files: Record<string, FileMeta>;
  presented: Presented[];
  wallet: WalletState;
  submitted_at: string | null;
  decided_at: string | null;
  decision_note: string | null;
  issued_at: string | null;
  valid_until: string | null;
  delivered_at: string | null;
  /** Issued: its status, as the issuer's status list says. */
  credential_status: CredentialStatus | null;
};

/** An issuer's offer, public; `null` when there is none (or no API). */
export async function fetchOffer(
  issuer: string,
  type: string,
): Promise<Offer | null> {
  const { data } = await api<Offer>(
    // A route parameter may come encoded or not (`custom:{key}`); no type id
    // holds a `%`, so decoding first is safe either way.
    `/catalog/issuers/${encodeURIComponent(issuer)}/offers/${encodeURIComponent(decodeURIComponent(type))}`,
  );
  return data;
}

/** The secret of an application this browser started, if it did. */
export async function applicationSecret(id: string): Promise<string | null> {
  return (await cookies()).get(applicationCookie(id))?.value ?? null;
}

/** An application this browser started; `null` otherwise, or when gone. */
export async function fetchApplication(
  id: string,
): Promise<HolderApplication | null> {
  const secret = await applicationSecret(id);
  if (!secret) return null;
  const { data } = await api<HolderApplication>(
    `/applications/${encodeURIComponent(id)}`,
    { headers: { "X-Application-Secret": secret } },
  );
  return data;
}

/** The most applications listed from one browser's cookies. */
const listed = 50;

/**
 * Every application this browser holds the secret of (one cookie each), as
 * the API sees it now, the latest step first; `failed` when some could not be
 * read (the API out of reach). One the API no longer opens is left out.
 */
export async function fetchMyApplications(): Promise<{
  items: HolderApplication[];
  failed: boolean;
}> {
  const prefix = applicationCookie("");
  const held = (await cookies())
    .getAll()
    .filter(({ name, value }) => name.startsWith(prefix) && value)
    .slice(0, listed);
  const found = await Promise.all(
    held.map(({ name, value }) =>
      api<HolderApplication>(
        `/applications/${encodeURIComponent(name.slice(prefix.length))}`,
        { headers: { "X-Application-Secret": value } },
      ),
    ),
  );
  const items = found
    .flatMap(({ data }) => (data ? [data] : []))
    .sort((a, b) => latestStep(b).localeCompare(latestStep(a)));
  return {
    items,
    failed: found.some(({ status }) => status === null || status >= 500),
  };
}

/** When an application last moved, as an ISO date ("" when never sent). */
function latestStep(application: HolderApplication): string {
  return (
    application.delivered_at ??
    application.issued_at ??
    application.decided_at ??
    application.submitted_at ??
    ""
  );
}
