import { describe, expect, it } from "vitest";

import {
  awaitsIssuer,
  firstDelay,
  longestDelay,
  nextDelay,
} from "./status-poll";

describe("following a sent application", () => {
  it("waits while the issuer has it", () => {
    expect(awaitsIssuer("submitted")).toBe(true);
    expect(awaitsIssuer("accepted")).toBe(true);
  });

  it("stops once it is settled, or not sent", () => {
    for (const status of ["rejected", "issued", "open", "paired"] as const)
      expect(awaitsIssuer(status)).toBe(false);
  });

  it("waits longer each time, up to a minute", () => {
    expect(nextDelay(0)).toBe(firstDelay);
    expect(nextDelay(firstDelay)).toBe(firstDelay * 2);
    expect(nextDelay(40_000)).toBe(longestDelay);
    expect(nextDelay(longestDelay)).toBe(longestDelay);
  });
});
