import { afterEach, describe, expect, it, vi } from "vitest";

import { Redirected, request } from "@/test/next";
import {
  applicationStatus,
  askWallet,
  keepApplication,
  pollApplicationWallet,
  saveApplicationAnswers,
  startApplication,
  uploadApplicationFile,
} from "./application-actions";

type Call = { url: string; method: string; headers: Record<string, string> };

/** The API, answering by method and path; every call is kept. */
function api(routes: Record<string, [number, unknown] | "down">) {
  const calls: Call[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init: RequestInit) => {
      const method = init.method ?? "GET";
      const path = new URL(url).pathname.replace("/api/v1", "");
      calls.push({
        url: path,
        method,
        headers: init.headers as Record<string, string>,
      });
      const route = routes[`${method} ${path}`];
      if (!route || route === "down") throw new TypeError("fetch failed");
      const [status, body] = route;
      return new Response(status === 204 ? null : JSON.stringify(body), {
        status,
      });
    }),
  );
  return calls;
}

const cookie = (id: string) => request.cookies.get(`almena.application.${id}`);

/** This browser started application `a1`. */
function started(expires = new Date(Date.now() + 60_000)) {
  request.cookies.set("almena.application.a1", {
    value: "the-secret",
    options: { expires },
  });
}

afterEach(() => vi.unstubAllGlobals());

describe("starting an application", () => {
  it("keeps the secret until the application expires, then opens it", async () => {
    const until = "2026-11-02T10:00:00+00:00";
    api({
      "POST /applications": [
        201,
        { id: "a1", slug: "app-1", secret: "the-secret", expires_at: until },
      ],
    });
    const going = startApplication("club", "membership");
    await expect(going).rejects.toEqual(new Redirected("/apply/a1"));
    expect(cookie("a1")).toEqual({
      value: "the-secret",
      options: {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
        expires: new Date(until),
      },
    });
  });

  it("keeps it for the session when the API names no end", async () => {
    api({
      "POST /applications": [201, { id: "a1", slug: "s", secret: "the-secret" }],
    });
    await expect(startApplication("club", "membership")).rejects.toBeInstanceOf(
      Redirected,
    );
    expect(cookie("a1")?.options.expires).toBeUndefined();
  });

  it("is secure in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    api({
      "POST /applications": [
        201,
        { id: "a1", slug: "s", secret: "x", expires_at: "2026-11-02T10:00:00Z" },
      ],
    });
    await expect(startApplication("club", "membership")).rejects.toBeInstanceOf(
      Redirected,
    );
    expect(cookie("a1")?.options.secure).toBe(true);
  });

  it("says when too many were started from the connection", async () => {
    api({ "POST /applications": [429, { detail: "too_many_requests" }] });
    expect(await startApplication("club", "membership")).toEqual({
      error: "too_many_requests",
    });
    expect(request.cookies.size).toBe(0);
  });

  it("says the registry is unavailable otherwise", async () => {
    api({ "POST /applications": [404, { detail: "offer_not_found" }] });
    expect(await startApplication("club", "x")).toEqual({ error: "unavailable" });
    api({ "POST /applications": "down" });
    expect(await startApplication("club", "x")).toEqual({ error: "unavailable" });
  });
});

describe("keeping an application", () => {
  it("moves the cookie's end to the application's", async () => {
    started();
    const later = "2027-01-30T10:00:00+00:00";
    const calls = api({
      "GET /applications/a1": [200, { id: "a1", status: "submitted", expires_at: later }],
    });
    await keepApplication("a1");
    expect(calls[0].headers["X-Application-Secret"]).toBe("the-secret");
    expect(cookie("a1")).toMatchObject({
      value: "the-secret",
      options: { httpOnly: true, expires: new Date(later) },
    });
  });

  it("leaves it be when the application is gone or out of reach", async () => {
    const expires = new Date(Date.now() + 60_000);
    started(expires);
    api({ "GET /applications/a1": [410, { detail: "application_expired" }] });
    await keepApplication("a1");
    expect(cookie("a1")?.options.expires).toEqual(expires);
  });

  it("asks nothing for an application this browser did not start", async () => {
    const calls = api({});
    await keepApplication("a1");
    expect(calls).toEqual([]);
    expect(request.cookies.size).toBe(0);
  });

  it("refreshes it once the wallet has answered (sent)", async () => {
    started();
    const later = "2027-01-30T10:00:00+00:00";
    api({
      "GET /applications/a1/wallet": [200, { answered: true, live: true }],
      "GET /applications/a1": [200, { id: "a1", status: "submitted", expires_at: later }],
    });
    expect(await pollApplicationWallet("a1")).toBe("answered");
    expect(cookie("a1")?.options.expires).toEqual(new Date(later));
  });

  it("does not while the wallet has not", async () => {
    started();
    const calls = api({
      "GET /applications/a1/wallet": [200, { answered: false, live: true }],
    });
    expect(await pollApplicationWallet("a1")).toBe("waiting");
    expect(calls.map((call) => call.url)).toEqual(["/applications/a1/wallet"]);
  });
});

describe("the holder's calls", () => {
  it("send the application's secret", async () => {
    started();
    const calls = api({
      "POST /applications/a1/wallet": [
        200,
        {
          purpose: "pair",
          answered: false,
          live: true,
          deep_link: "almena://auth?request_uri=x",
          expires_at: "2026-11-01T10:05:00Z",
        },
      ],
    });
    const asked = await askWallet("a1", "pair");
    expect(asked).toMatchObject({
      ok: true,
      deepLink: "almena://auth?request_uri=x",
      expiresAt: "2026-11-01T10:05:00Z",
    });
    expect(asked.ok && asked.qr.startsWith("<svg")).toBe(true);
    expect(calls[0].headers["X-Application-Secret"]).toBe("the-secret");
  });

  it("never offer a link a wallet does not open", async () => {
    started();
    api({
      "POST /applications/a1/wallet": [
        200,
        {
          purpose: "pair",
          answered: false,
          live: true,
          deep_link: "javascript:alert(1)",
          expires_at: "2026-11-01T10:05:00Z",
        },
      ],
    });
    expect(await askWallet("a1", "pair")).toEqual({
      ok: false,
      error: "unavailable",
    });
  });

  it("are gone without the cookie, and ask nothing", async () => {
    const calls = api({});
    expect(await askWallet("a1", "pair")).toEqual({ ok: false, error: "gone" });
    expect(await saveApplicationAnswers("a1", {})).toEqual({
      ok: false,
      errors: {},
      error: "gone",
    });
    expect(await pollApplicationWallet("a1")).toBe("expired");
    expect(calls).toEqual([]);
  });

  it("give the API's refusal", async () => {
    started();
    api({ "POST /applications/a1/wallet": [409, { detail: "answers_incomplete" }] });
    expect(await askWallet("a1", "submit")).toEqual({
      ok: false,
      error: "answers_incomplete",
    });
  });

  it("are unavailable when the API cannot be reached", async () => {
    started();
    api({ "POST /applications/a1/wallet": "down", "PUT /applications/a1/answers": "down" });
    expect(await askWallet("a1", "pair")).toEqual({ ok: false, error: "unavailable" });
    expect(await saveApplicationAnswers("a1", {})).toEqual({
      ok: false,
      errors: {},
      error: "unavailable",
    });
  });

  it("say which answers do not hold", async () => {
    started();
    api({
      "PUT /applications/a1/answers": [
        422,
        { detail: "answers_invalid", errors: { birthdate: "range" } },
      ],
    });
    expect(await saveApplicationAnswers("a1", { birthdate: "2020-01-01" })).toEqual({
      ok: false,
      errors: { birthdate: "range" },
      error: "answers_invalid",
    });
  });

  it("say a file is too large when a proxy refuses it", async () => {
    started();
    api({ "POST /applications/a1/files": [413, null] });
    expect(await uploadApplicationFile("a1", new FormData())).toEqual({
      ok: false,
      error: "file_too_large",
    });
  });

  it("pass on how large a file may be when the API says so", async () => {
    started();
    api({
      "POST /applications/a1/files": [
        413,
        { detail: "file_too_large", max_bytes: 10485760 },
      ],
    });
    expect(await uploadApplicationFile("a1", new FormData())).toEqual({
      ok: false,
      error: "file_too_large",
      maxBytes: 10485760,
    });
  });

  it("hear an expired application as expired", async () => {
    started();
    api({ "GET /applications/a1/wallet": [410, { detail: "application_expired" }] });
    expect(await pollApplicationWallet("a1")).toBe("expired");
  });
});

describe("following a sent application", () => {
  it("reads its status with the secret", async () => {
    started();
    const calls = api({
      "GET /applications/a1": [
        200,
        { id: "a1", status: "issued", delivered_at: null },
      ],
    });
    expect(await applicationStatus("a1")).toEqual({
      status: "issued",
      delivered: false,
    });
    expect(calls[0].headers["X-Application-Secret"]).toBe("the-secret");
  });

  it("says when the credential is in the wallet", async () => {
    started();
    api({
      "GET /applications/a1": [
        200,
        { id: "a1", status: "issued", delivered_at: "2026-11-01T10:00:00Z" },
      ],
    });
    expect(await applicationStatus("a1")).toEqual({
      status: "issued",
      delivered: true,
    });
  });

  it("is nothing when not this browser's, or out of reach", async () => {
    const calls = api({});
    expect(await applicationStatus("a1")).toBeNull();
    expect(calls).toEqual([]);
    started();
    api({ "GET /applications/a1": "down" });
    expect(await applicationStatus("a1")).toBeNull();
  });
});
