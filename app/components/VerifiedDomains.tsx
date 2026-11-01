import { BadgeCheckIcon } from "lucide-react";

import { cn } from "cn";
import { verifiedDomains } from "@/app/lib/domains";

/**
 * The domains an issuer's tenant has proved by DNS, as a trust signal: a
 * check and the label, then each domain as plain text (not a link, so a
 * look-alike is read, never followed). Nothing when there are none.
 */
export function VerifiedDomains({
  domains,
  label,
  className,
}: {
  domains: unknown;
  label: string;
  className?: string;
}) {
  const names = verifiedDomains(domains);
  if (names.length === 0) return null;
  return (
    <p
      className={cn(
        "flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-muted-foreground",
        className,
      )}
    >
      <BadgeCheckIcon className="size-4 shrink-0 text-primary" aria-hidden />
      <span>{label}</span>
      {names.map((name) => (
        <span
          key={name}
          className="rounded-md border bg-background/60 px-1.5 py-0.5 font-mono text-[12px] text-foreground"
        >
          {name}
        </span>
      ))}
    </p>
  );
}
