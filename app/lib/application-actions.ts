"use server";

import QRCode from "qrcode";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { api } from "./api";
import {
  applicationCookie,
  applicationSecret,
  type ApplicationStatus,
  type FileMeta,
  type HolderApplication,
  type WalletState,
} from "./applications";
import { safeDeepLink } from "./deep-link";

/** Why an application could not start. */
export type StartError = "too_many_requests" | "unavailable";

/**
 * Keep an application's secret in this browser for as long as the API says
 * it can be opened (`expires_at`): a day unsent, and once sent until a while
 * after its latest step, so a decision taken by hand can still be read and
 * the credential taken. An answer without a date keeps it for the session.
 */
async function keepSecret(id: string, secret: string, expiresAt?: string) {
  const expires = expiresAt ? new Date(expiresAt) : null;
  (await cookies()).set(applicationCookie(id), secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(expires && !Number.isNaN(expires.getTime()) ? { expires } : {}),
  });
}

/** Start applying for an offer; this browser keeps the secret while it holds. */
export async function startApplication(
  issuer: string,
  type: string,
): Promise<{ error: StartError }> {
  const { data, detail } = await api<{
    id: string;
    secret: string;
    expires_at?: string;
  }>("/applications", { method: "POST", body: { issuer, type } });
  if (!data)
    return {
      error: detail === "too_many_requests" ? detail : "unavailable",
    };
  await keepSecret(data.id, data.secret, data.expires_at);
  redirect(`/apply/${data.id}`);
}

/**
 * Bring the cookie's end up to date with the application's: each step (sent,
 * decided, issued) moves it later. Run when the holder opens it and when the
 * wallet answers; nothing changes when it is not this browser's, or gone.
 */
export async function keepApplication(id: string): Promise<void> {
  const secret = await applicationSecret(id);
  if (!secret) return;
  const { data } = await api<HolderApplication>(
    `/applications/${encodeURIComponent(id)}`,
    { headers: { "X-Application-Secret": secret } },
  );
  if (data?.expires_at) await keepSecret(id, secret, data.expires_at);
}

async function holderCall<T>(
  id: string,
  path: string,
  init: { method: string; body?: unknown; form?: FormData },
) {
  const secret = await applicationSecret(id);
  if (!secret)
    return { status: null, data: null, detail: "gone", failure: undefined };
  return api<T>(`/applications/${encodeURIComponent(id)}${path}`, {
    ...init,
    headers: { "X-Application-Secret": secret },
  });
}

export type WalletAsk =
  | { ok: true; deepLink: string; qr: string; expiresAt: string }
  | { ok: false; error: string };

/** A new wallet request for the application: its QR code and deep link. */
export async function askWallet(
  id: string,
  purpose: "pair" | "present" | "submit" | "receive",
): Promise<WalletAsk> {
  const { data, detail } = await holderCall<WalletState>(id, "/wallet", {
    method: "POST",
    body: { purpose },
  });
  if (!data?.deep_link || !data.expires_at)
    return { ok: false, error: detail ?? "unavailable" };
  // Only a link a wallet opens is drawn or offered: never `javascript:`.
  const deepLink = safeDeepLink(data.deep_link);
  if (!deepLink) return { ok: false, error: "unavailable" };
  const qr = await QRCode.toString(deepLink, {
    type: "svg",
    margin: 1,
    errorCorrectionLevel: "M",
  });
  return { ok: true, deepLink, qr, expiresAt: data.expires_at };
}

/** Whether the wallet has answered the request in course. */
export async function pollApplicationWallet(
  id: string,
): Promise<"answered" | "waiting" | "expired"> {
  const { data } = await holderCall<WalletState>(id, "/wallet", {
    method: "GET",
  });
  if (!data) return "expired";
  if (data.answered) {
    // Sent (or paired, or taken): the application may hold longer now.
    await keepApplication(id);
    return "answered";
  }
  return data.live ? "waiting" : "expired";
}

export type AnswersResult =
  { ok: true } | { ok: false; errors: Record<string, string>; error?: string };

/** Save the typed answers; each field that does not hold says why. */
export async function saveApplicationAnswers(
  id: string,
  answers: Record<string, unknown>,
): Promise<AnswersResult> {
  const { status, detail, failure } = await holderCall(id, "/answers", {
    method: "PUT",
    body: { answers },
  });
  if (status !== null && status < 300) return { ok: true };
  const errors =
    failure && typeof failure === "object" && "errors" in failure
      ? ((failure as { errors: Record<string, string> }).errors ?? {})
      : {};
  return {
    ok: false,
    errors,
    error: detail ?? (status ? undefined : "unavailable"),
  };
}

export type UploadResult =
  | { ok: true; file: FileMeta }
  | { ok: false; error: string; maxBytes?: number };

/** Upload a file for one of the form's file fields. */
export async function uploadApplicationFile(
  id: string,
  form: FormData,
): Promise<UploadResult> {
  const { data, detail, status, failure } = await holderCall<FileMeta>(
    id,
    "/files",
    { method: "POST", form },
  );
  if (data) return { ok: true, file: data };
  // The API says how large a file may be (`max_bytes`); a proxy refusing it
  // first says nothing.
  const most =
    failure && typeof failure === "object" && "max_bytes" in failure
      ? Number((failure as { max_bytes: unknown }).max_bytes)
      : NaN;
  return {
    ok: false,
    error: detail ?? (status === 413 ? "file_too_large" : "unavailable"),
    ...(Number.isFinite(most) && most > 0 ? { maxBytes: most } : {}),
  };
}

export async function removeApplicationFile(id: string, key: string) {
  await holderCall(id, `/files/${encodeURIComponent(key)}`, {
    method: "DELETE",
  });
}

/**
 * Where a sent application stands now, for the page to follow it without a
 * reload: its status and whether the credential is in the wallet; `null`
 * when it is not this browser's, gone or out of reach.
 */
export async function applicationStatus(
  id: string,
): Promise<{ status: ApplicationStatus; delivered: boolean } | null> {
  const { data } = await holderCall<HolderApplication>(id, "", {
    method: "GET",
  });
  if (!data) return null;
  return { status: data.status, delivered: Boolean(data.delivered_at) };
}
