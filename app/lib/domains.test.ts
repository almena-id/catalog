import { describe, expect, it } from "vitest";

import { verifiedDomains } from "./domains";

describe("an issuer's verified domains", () => {
  it("keeps domain names, each once, in the API's order", () => {
    expect(
      verifiedDomains(["acme.com", "shop.acme.org", "Acme.com", "xn--acm-bma.es"]),
    ).toEqual(["acme.com", "shop.acme.org", "xn--acm-bma.es"]);
  });

  it("leaves out what is not a domain name", () => {
    expect(
      verifiedDomains([
        "https://acme.com",
        "acme.com/about",
        "localhost",
        "-acme.com",
        "acme..com",
        "javascript:alert(1)",
        "",
        42,
        null,
      ]),
    ).toEqual([]);
  });

  it("is none when the API names none", () => {
    expect(verifiedDomains(undefined)).toEqual([]);
    expect(verifiedDomains(null)).toEqual([]);
    expect(verifiedDomains("acme.com")).toEqual([]);
    expect(verifiedDomains([])).toEqual([]);
  });
});
