import type { ApplicationStatus } from "./applications";

/** The first wait between two looks at a sent application, and the longest. */
export const firstDelay = 5_000;
export const longestDelay = 60_000;

/**
 * Whether a sent application can still change without the holder: sent or
 * accepted it waits on the issuer. Not accepted, or issued, it is settled
 * (taking an issued credential is the wallet's request, followed apart).
 */
export function awaitsIssuer(status: ApplicationStatus): boolean {
  return status === "submitted" || status === "accepted";
}

/** The next wait: twice the last, up to the longest. */
export function nextDelay(last: number): number {
  return Math.min(longestDelay, Math.max(firstDelay, last * 2));
}
