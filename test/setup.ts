/**
 * What server actions take from Next, for every unit test: the request's
 * headers and cookies (`test/next.ts`, empty before each test), `redirect`
 * throwing as Next's does, and no API secret for portals unless a test sets
 * one.
 */
import { beforeEach, vi } from "vitest";

import { Redirected, request, resetRequest, type CookieOptions } from "./next";

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => {
      const cookie = request.cookies.get(name);
      return cookie ? { name, value: cookie.value } : undefined;
    },
    getAll: () =>
      [...request.cookies].map(([name, { value }]) => ({ name, value })),
    set: (name: string, value: string, options: CookieOptions = {}) => {
      request.cookies.set(name, { value, options });
    },
    delete: (name: string) => {
      request.cookies.delete(name);
    },
  }),
  headers: async () => request.headers,
}));
vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw new Redirected(to);
  },
}));

beforeEach(() => {
  resetRequest();
  vi.unstubAllEnvs();
  vi.stubEnv("CATALOG_API_URL", "https://api.test");
  vi.stubEnv("CATALOG_PORTAL_SECRET", "");
});
