import "server-only";

import { headers } from "next/headers";

const apiUrl = () => process.env.CATALOG_API_URL ?? "https://api.almena.id";

/**
 * With the secret the API shares with its portals, every call names the
 * visitor's address (as the edge proxy saw it), so the API's limits per
 * network address count visitors rather than this server.
 */
async function visitor(): Promise<Record<string, string>> {
  const secret = process.env.CATALOG_PORTAL_SECRET;
  if (!secret) return {};
  try {
    const seen = await headers();
    const address =
      seen.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      seen.get("x-real-ip")?.trim();
    return address
      ? { "X-Almena-Portal": secret, "X-Almena-Client-IP": address }
      : {};
  } catch {
    // Outside a request (nothing to name).
    return {};
  }
}

/**
 * A call to the API from the server: the public catalogue, and a holder's own
 * application (its secret as a header). `data` is `null` when the API cannot
 * be reached (`status` `null`) or answers with an error; `detail` is the
 * error's code, `failure` its whole body (what more says why, beside it).
 */
export async function api<T>(
  path: string,
  init: {
    method?: string;
    body?: unknown;
    /** A multipart body (file uploads); its boundary sets the media type. */
    form?: FormData;
    /** More headers (an application's secret). */
    headers?: Record<string, string>;
  } = {},
): Promise<{
  status: number | null;
  data: T | null;
  detail: string | null;
  failure?: unknown;
}> {
  try {
    const response = await fetch(`${apiUrl()}/api/v1${path}`, {
      method: init.method ?? "GET",
      headers: {
        accept: "application/json",
        ...(init.form || init.body === undefined
          ? {}
          : { "Content-Type": "application/json" }),
        ...(await visitor()),
        ...init.headers,
      },
      body:
        init.form ??
        (init.body === undefined ? undefined : JSON.stringify(init.body)),
      cache: "no-store",
    });
    const json =
      response.status === 204 ? null : await response.json().catch(() => null);
    const ok = response.ok;
    return {
      status: response.status,
      data: ok ? (json as T) : null,
      detail: !ok && typeof json?.detail === "string" ? json.detail : null,
      failure: ok ? undefined : json,
    };
  } catch {
    return { status: null, data: null, detail: null };
  }
}
