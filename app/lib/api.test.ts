import { afterEach, describe, expect, it, vi } from "vitest";

import { request } from "@/test/next";
import { api, clientAddress } from "./api";

afterEach(() => vi.unstubAllGlobals());

function answering(status: number, body: unknown) {
  const fetch = vi.fn(
    async () =>
      new Response(status === 204 ? null : JSON.stringify(body), { status }),
  );
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

/** The first call's URL and headers. */
function first(fetch: ReturnType<typeof answering>) {
  const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
  return { url, headers: init.headers as Record<string, string> };
}
const sent = (fetch: ReturnType<typeof answering>) => first(fetch).headers;

describe("the visitor's address", () => {
  it("is the entry the proxy in front added, the last one", () => {
    const seen = new Headers({
      "x-forwarded-for": "6.6.6.6, 203.0.113.7 , 198.51.100.2",
    });
    expect(clientAddress(seen)).toBe("198.51.100.2");
  });

  it("is never the first, which the client may have forged", () => {
    const seen = new Headers({ "x-forwarded-for": "6.6.6.6,198.51.100.2" });
    expect(clientAddress(seen)).not.toBe("6.6.6.6");
  });

  it("skips empty entries", () => {
    const seen = new Headers({ "x-forwarded-for": "198.51.100.2, ," });
    expect(clientAddress(seen)).toBe("198.51.100.2");
  });

  it("falls back to X-Real-IP", () => {
    expect(clientAddress(new Headers({ "x-real-ip": " 192.0.2.4 " }))).toBe(
      "192.0.2.4",
    );
    expect(
      clientAddress(new Headers({ "x-forwarded-for": " , ", "x-real-ip": "192.0.2.4" })),
    ).toBe("192.0.2.4");
  });

  it("is none without either", () => {
    expect(clientAddress(new Headers())).toBeUndefined();
  });
});

describe("calling the API", () => {
  it("names the visitor with the portal's secret", async () => {
    vi.stubEnv("CATALOG_PORTAL_SECRET", "shared");
    request.headers = new Headers({
      "x-forwarded-for": "6.6.6.6, 198.51.100.2",
    });
    const fetch = answering(200, { ok: true });
    await api("/catalog/offers");
    expect(first(fetch).url).toBe("https://api.test/api/v1/catalog/offers");
    expect(sent(fetch)).toMatchObject({
      "X-Almena-Portal": "shared",
      "X-Almena-Client-IP": "198.51.100.2",
    });
  });

  it("names nobody without the secret", async () => {
    request.headers = new Headers({ "x-forwarded-for": "198.51.100.2" });
    const fetch = answering(200, {});
    await api("/catalog/offers");
    expect(sent(fetch)).not.toHaveProperty("X-Almena-Client-IP");
    expect(sent(fetch)).not.toHaveProperty("X-Almena-Portal");
  });

  it("gives an error's code and body", async () => {
    answering(422, { detail: "answers_invalid", errors: { a: "required" } });
    expect(await api("/x")).toEqual({
      status: 422,
      data: null,
      detail: "answers_invalid",
      failure: { detail: "answers_invalid", errors: { a: "required" } },
    });
  });

  it("gives nothing when the API cannot be reached", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("fetch failed");
      }),
    );
    expect(await api("/x")).toEqual({ status: null, data: null, detail: null });
  });
});
