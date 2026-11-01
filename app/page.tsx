import Link from "next/link";

import { EmptyState } from "@/app/components/EmptyState";
import { EmptyCatalog } from "@/app/components/illustrations/EmptyCatalog";
import { HeroWallet } from "@/app/components/illustrations/HeroWallet";
import { NoResults } from "@/app/components/illustrations/NoResults";
import { Unreachable } from "@/app/components/illustrations/Unreachable";
import { Button } from "@/app/components/ui/button";
import { getI18n } from "@/app/i18n/server";
import { fetchOfferCategories, fetchOffers } from "@/app/lib/offers";
import { CatalogSearch, CategoryChips } from "./CatalogSearch";
import { OfferGrid } from "./OfferGrid";

/** A search parameter as one string (the first, if repeated). */
const one = (value: string | string[] | undefined, max: number) =>
  (Array.isArray(value) ? value[0] : value)?.slice(0, max) ?? "";

/**
 * The catalog: every published issuer's offers, each leading to its
 * application, under a hero with the search; the URL's `q` and `category`
 * narrow them, so a search can be linked and is rendered here.
 */
export default async function CatalogPage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const q = one(params.q, 100).trim();
  const category = one(params.category, 32) || undefined;
  const filters = { q, category };
  const [{ t }, offers, categories] = await Promise.all([
    getI18n(),
    fetchOffers(filters),
    fetchOfferCategories(),
  ]);
  const copy = t.home;
  const filtered = Boolean(q || category);

  return (
    <div className="grid gap-8">
      <section className="hero-backdrop relative isolate overflow-hidden rounded-3xl border bg-card/60 shadow-card">
        <div className="grid items-center gap-6 px-6 py-10 sm:px-10 md:grid-cols-[minmax(0,1fr)_minmax(0,300px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:py-14">
          <div className="grid gap-4">
            <p className="font-brand text-[13px] font-semibold tracking-[0.08em] text-primary uppercase">
              {t.app.network}
            </p>
            <h1 className="max-w-2xl text-[32px] leading-tight font-bold tracking-tight sm:text-[40px]">
              {copy.title}
            </h1>
            <p className="max-w-2xl text-muted-foreground sm:text-lg">{copy.lead}</p>
            <CatalogSearch q={q} category={category} />
          </div>
          <HeroWallet className="mx-auto hidden w-full max-w-[400px] md:block" />
        </div>
      </section>

      {categories && categories.length > 0 && (
        <CategoryChips q={q} category={category} categories={categories} />
      )}

      {offers === null ? (
        <EmptyState
          role="alert"
          art={<Unreachable />}
          title={copy.unavailableTitle}
        >
          {copy.unavailable}
        </EmptyState>
      ) : offers.items.length === 0 ? (
        filtered ? (
          <EmptyState
            role="status"
            art={<NoResults />}
            title={copy.noResultsTitle}
            action={
              <Button asChild variant="outline">
                <Link href="/" scroll={false}>
                  {copy.clearFilters}
                </Link>
              </Button>
            }
          >
            {q ? copy.noResults.replace("{q}", q) : copy.noResultsCategory}
          </EmptyState>
        ) : (
          <EmptyState art={<EmptyCatalog />} title={copy.emptyTitle}>
            {copy.empty}
          </EmptyState>
        )
      ) : (
        <section className="grid gap-4" aria-labelledby="offers-count">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="offers-count" className="text-sm font-medium text-muted-foreground" aria-live="polite">
              {(offers.total === 1 ? copy.countOne : copy.count).replace(
                "{count}",
                String(offers.total),
              )}
            </h2>
            {filtered && (
              <Link
                href="/"
                scroll={false}
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                {copy.clearFilters}
              </Link>
            )}
          </div>
          <OfferGrid
            key={`${q}\u0000${category ?? ""}`}
            initial={offers}
            filters={filters}
          />
        </section>
      )}
    </div>
  );
}
