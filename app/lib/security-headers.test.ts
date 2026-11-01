import { describe, expect, it } from "vitest";

import {
  contentSecurityPolicy,
  newNonce,
  securityHeaders,
} from "./security-headers";

const directives = (policy: string) =>
  Object.fromEntries(
    policy.split("; ").map((part) => {
      const [name, ...values] = part.split(" ");
      return [name, values];
    }),
  );

describe("the content security policy", () => {
  it("runs only this origin's scripts and those with the nonce", () => {
    const policy = directives(contentSecurityPolicy("abc"));
    expect(policy["script-src"]).toEqual([
      "'self'",
      "'nonce-abc'",
      "'strict-dynamic'",
    ]);
    expect(policy["object-src"]).toEqual(["'none'"]);
    expect(policy["base-uri"]).toEqual(["'self'"]);
    expect(policy["form-action"]).toEqual(["'self'"]);
  });

  it("lets nothing frame the portal", () => {
    expect(directives(contentSecurityPolicy("abc"))["frame-ancestors"]).toEqual([
      "'none'",
    ]);
  });

  it("allows eval in development only", () => {
    expect(contentSecurityPolicy("abc")).not.toContain("unsafe-eval");
    expect(contentSecurityPolicy("abc", true)).toContain("'unsafe-eval'");
  });

  it("takes data: images and self-hosted fonts", () => {
    const policy = directives(contentSecurityPolicy("abc"));
    expect(policy["img-src"]).toContain("data:");
    expect(policy["font-src"]).toEqual(["'self'"]);
  });
});

describe("a nonce", () => {
  it("is new each time, and safe inside the policy", () => {
    const one = newNonce();
    expect(one).not.toBe(newNonce());
    expect(one).toMatch(/^[A-Za-z0-9+/=]+$/);
  });
});

describe("the other headers", () => {
  it("forbid sniffing and framing, and trim the referrer", () => {
    const named = Object.fromEntries(
      securityHeaders.map(({ key, value }) => [key, value]),
    );
    expect(named["X-Content-Type-Options"]).toBe("nosniff");
    expect(named["X-Frame-Options"]).toBe("DENY");
    expect(named["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(named["Permissions-Policy"]).toContain("camera=()");
  });
});
