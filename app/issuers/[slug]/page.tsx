import { CalendarDaysIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CopyButton } from "@/app/components/CopyButton";
import { EmptyState } from "@/app/components/EmptyState";
import { EmptyCatalog } from "@/app/components/illustrations/EmptyCatalog";
import { Unreachable } from "@/app/components/illustrations/Unreachable";
import { OfferTile } from "@/app/components/OfferTile";
import { Button } from "@/app/components/ui/button";
import { getI18n } from "@/app/i18n/server";
import { initials } from "@/app/lib/initials";
import { fetchIssuerOffers } from "@/app/lib/offers";
import { hasText, label } from "@/app/lib/texts";

export async function generateMetadata({
  params,
}: PageProps<"/issuers/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const found = await fetchIssuerOffers(slug);
  return found && found !== "missing" ? { title: found.issuer.name } : {};
}

/**
 * Public: a published issuer — who it is (its initials, name, description and
 * DID, since when it is published) and everything it offers, as the catalog
 * shows them.
 */
export default async function IssuerPage({
  params,
}: PageProps<"/issuers/[slug]">) {
  const { slug } = await params;
  const [found, { t, locale }] = await Promise.all([
    fetchIssuerOffers(slug),
    getI18n(),
  ]);
  if (found === "missing") notFound();
  const copy = t.issuer;

  if (found === null)
    return (
      <div className="mx-auto grid w-full max-w-[720px] gap-4">
        <EmptyState
          role="alert"
          art={<Unreachable />}
          title={t.home.unavailableTitle}
          action={
            <Button asChild variant="outline">
              <Link href="/">{copy.back}</Link>
            </Button>
          }
        >
          {t.home.unavailable}
        </EmptyState>
      </div>
    );

  const { issuer, offers } = found;
  const since = new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(
    new Date(found.published_at),
  );

  return (
    <div className="grid gap-8">
      <header className="hero-backdrop relative isolate grid gap-5 overflow-hidden rounded-3xl border bg-card/60 px-6 py-8 shadow-card sm:grid-cols-[auto_minmax(0,1fr)] sm:px-10 sm:py-10">
        <span
          className="grid size-20 place-items-center rounded-[22px] border border-primary/20 bg-brand-soft font-brand text-[30px] font-semibold text-primary"
          aria-hidden
        >
          {initials(issuer.name)}
        </span>
        <div className="grid content-start gap-2">
          <p className="font-brand text-[13px] font-semibold tracking-[0.08em] text-primary uppercase">
            {copy.kicker}
          </p>
          <h1 className="text-[28px] leading-tight font-bold tracking-tight sm:text-[34px]">
            {issuer.name}
          </h1>
          {hasText(issuer.description) && (
            <p className="max-w-3xl text-muted-foreground">
              {label(issuer.description ?? {}, locale)}
            </p>
          )}
          <p className="flex items-center gap-1 font-mono text-[12px] text-faint">
            <span className="break-all">{issuer.did}</span>
            <CopyButton
              value={issuer.did}
              label={copy.copyDid}
              copiedLabel={copy.copied}
            />
          </p>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDaysIcon className="size-4" aria-hidden />
            {copy.since.replace("{date}", since)}
          </p>
        </div>
      </header>

      <section className="grid gap-4" aria-labelledby="issuer-offers">
        <h2 id="issuer-offers" className="text-lg font-semibold">
          {copy.offersTitle}{" "}
          <span className="font-mono text-sm font-normal text-muted-foreground">
            {offers.length}
          </span>
        </h2>
        {offers.length === 0 ? (
          <EmptyState art={<EmptyCatalog />} title={copy.emptyTitle}>
            {copy.empty}
          </EmptyState>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {offers.map((kind) => (
              <li key={kind.id}>
                <OfferTile
                  issuer={issuer}
                  issuerLink={false}
                  type={kind.id}
                  typeName={label(kind.labels, locale)}
                  description={label(kind.descriptions, locale)}
                  category={{
                    label: label(kind.category.labels, locale),
                    icon: kind.category.icon,
                  }}
                  byLabel={t.home.by}
                  applyLabel={t.home.apply}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
