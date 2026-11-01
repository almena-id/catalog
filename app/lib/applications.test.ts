import { afterEach, describe, expect, it, vi } from "vitest";

import { request } from "@/test/next";
import { fetchMyApplications } from "./applications";

/** The API, answering each application by its secret; every call is kept. */
function api(answers: Record<string, [number, unknown] | "down">) {
  const calls: { path: string; secret: string }[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init: RequestInit) => {
      const path = new URL(url).pathname.replace("/api/v1", "");
      const secret = (init.headers as Record<string, string>)[
        "X-Application-Secret"
      ];
      calls.push({ path, secret });
      const answer = answers[path];
      if (!answer || answer === "down") throw new TypeError("fetch failed");
      return new Response(JSON.stringify(answer[1]), { status: answer[0] });
    }),
  );
  return calls;
}

const hold = (id: string, secret: string) =>
  request.cookies.set(`almena.application.${id}`, {
    value: secret,
    options: {},
  });

afterEach(() => vi.unstubAllGlobals());

describe("this browser's applications", () => {
  it("reads each one it holds with its own secret, the latest first", async () => {
    hold("a1", "s1");
    hold("a2", "s2");
    request.cookies.set("almena.locale", { value: "es", options: {} });
    const calls = api({
      "/applications/a1": [200, { id: "a1", submitted_at: "2026-10-01T10:00:00Z" }],
      "/applications/a2": [200, { id: "a2", issued_at: "2026-10-20T10:00:00Z" }],
    });
    const { items, failed } = await fetchMyApplications();
    expect(items.map((item) => item.id)).toEqual(["a2", "a1"]);
    expect(failed).toBe(false);
    expect(calls).toEqual([
      { path: "/applications/a1", secret: "s1" },
      { path: "/applications/a2", secret: "s2" },
    ]);
  });

  it("leaves out one the API no longer opens", async () => {
    hold("a1", "s1");
    hold("gone", "s2");
    api({
      "/applications/a1": [200, { id: "a1", submitted_at: null }],
      "/applications/gone": [404, { detail: "application_not_found" }],
    });
    expect(await fetchMyApplications()).toEqual({
      items: [{ id: "a1", submitted_at: null }],
      failed: false,
    });
  });

  it("says when some could not be read", async () => {
    hold("a1", "s1");
    api({ "/applications/a1": "down" });
    expect(await fetchMyApplications()).toEqual({ items: [], failed: true });
  });

  it("asks nothing when it holds none", async () => {
    const calls = api({});
    expect(await fetchMyApplications()).toEqual({ items: [], failed: false });
    expect(calls).toEqual([]);
  });
});
