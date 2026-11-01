import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

import { CredentialCard } from "./CredentialCard";

/** Where an issuer's own page is. */
export const issuerHref = (slug: string) => `/issuers/${encodeURIComponent(slug)}`;

/** Where an offer's page is. */
export const offerHref = (issuer: string, type: string) =>
  `/credentials/${encodeURIComponent(issuer)}/${encodeURIComponent(type)}`;

/**
 * An offer in a grid: its credential as a compact card, then who issues it
 * (linking to the issuer's page; left out when `issuerLink` is off: already
 * on it, and the card names it), what it is and "Apply". The whole tile opens the offer; the issuer's link
 * sits above that.
 */
export function OfferTile({
  issuer,
  type,
  typeName,
  description,
  category,
  byLabel,
  applyLabel,
  issuerLink = true,
}: {
  issuer: { slug: string; name: string };
  type: string;
  typeName: string;
  description: string;
  category: { label: string; icon: string | null | undefined };
  /** "Issued by {issuer}". */
  byLabel: string;
  applyLabel: string;
  issuerLink?: boolean;
}) {
  const [before, after = ""] = byLabel.split("{issuer}");
  return (
    <article className="group relative flex h-full flex-col gap-3 rounded-2xl border bg-card p-3 pb-4 text-card-foreground shadow-card transition-[translate,box-shadow] hover:-translate-y-0.5 has-[[data-cover]:focus-visible]:ring-[3px] has-[[data-cover]:focus-visible]:ring-ring/50">
      <CredentialCard
        size="compact"
        typeName={typeName}
        issuerName={issuer.name}
        category={category}
      />
      <div className="grid flex-1 content-start gap-1 px-2">
        {issuerLink && (
          <span className="text-sm text-muted-foreground">
            {before}
            <Link
              href={issuerHref(issuer.slug)}
              className="relative z-10 font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              {issuer.name}
            </Link>
            {after}
          </span>
        )}
        <span className="line-clamp-2 text-[13px] text-faint">{description}</span>
      </div>
      <span className="inline-flex items-center gap-1 px-2 text-sm font-medium text-primary">
        {applyLabel}
        <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
      </span>
      <Link
        data-cover
        href={offerHref(issuer.slug, type)}
        aria-label={`${typeName} · ${issuer.name}`}
        className="absolute inset-0 rounded-2xl outline-none"
      />
    </article>
  );
}
