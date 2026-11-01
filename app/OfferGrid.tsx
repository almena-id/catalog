"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { OfferTile } from "@/app/components/OfferTile";
import { Button } from "@/app/components/ui/button";
import { useI18n } from "@/app/i18n/client";
import { loadOffers } from "@/app/lib/offer-actions";
import type { Offer, OfferFilters, OfferPage } from "@/app/lib/offers";
import { label } from "@/app/lib/texts";

const keyOf = (offer: Offer) => `${offer.issuer.slug}/${offer.credential_type.id}`;

/**
 * The offers, each opening its own page, where the application starts. The
 * next page is asked for with the cursor the previous one ended on and the
 * same filters (the page renders a new grid, by its key, when the filters
 * change): by the "Load more" button under it, and as it is scrolled, when
 * the marker under it comes near the viewport — but not while the focus is
 * on one of its offers, so a keyboard going through them reaches the button
 * and the footer instead of pushing them away.
 */
export function OfferGrid({
  initial,
  filters,
}: {
  initial: OfferPage;
  filters: OfferFilters;
}) {
  const { t, locale } = useI18n();
  const copy = t.home;
  const [offers, setOffers] = useState(initial.items);
  const [cursor, setCursor] = useState(initial.next_cursor);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const marker = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const busy = useRef(false);
  const { q, category } = filters;

  const next = useCallback(async () => {
    if (!cursor || busy.current) return;
    busy.current = true;
    setLoading(true);
    const page = await loadOffers(cursor, { q, category }).catch(() => null);
    if (page) {
      // An issuer published meanwhile can shift the pages: never show one twice.
      setOffers((shown) => {
        const seen = new Set(shown.map(keyOf));
        return [...shown, ...page.items.filter((offer) => !seen.has(keyOf(offer)))];
      });
      setCursor(page.next_cursor);
      setFailed(false);
    } else {
      setFailed(true);
    }
    setLoading(false);
    busy.current = false;
  }, [cursor, q, category]);

  useEffect(() => {
    const node = marker.current;
    if (!node || !cursor || failed) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (list.current?.contains(document.activeElement)) return;
        if (entries.some((entry) => entry.isIntersecting)) void next();
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [cursor, failed, next]);

  return (
    <div className="grid gap-3">
      <ul
        ref={list}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
      >
        {offers.map((offer) => {
          const kind = offer.credential_type;
          return (
            <li key={keyOf(offer)}>
              <OfferTile
                issuer={offer.issuer}
                type={kind.id}
                typeName={label(kind.labels, locale)}
                description={label(kind.descriptions, locale)}
                category={{
                  label: label(kind.category.labels, locale),
                  icon: kind.category.icon,
                }}
                byLabel={copy.by}
                applyLabel={copy.apply}
              />
            </li>
          );
        })}
      </ul>
      <div ref={marker} className="min-h-px" aria-live="polite">
        {loading && (
          <span className="block py-3 text-center text-sm text-muted-foreground">
            {copy.loading}
          </span>
        )}
        {failed && cursor && (
          <span className="block py-3 text-center text-sm text-muted-foreground">
            {copy.loadError}{" "}
            <Button
              type="button"
              variant="link"
              className="h-auto p-0"
              onClick={() => void next()}
            >
              {copy.retry}
            </Button>
          </span>
        )}
      </div>
      {cursor && !failed && (
        <Button
          type="button"
          variant="outline"
          className="justify-self-center"
          disabled={loading}
          onClick={() => void next()}
        >
          {copy.loadMore}
        </Button>
      )}
    </div>
  );
}
