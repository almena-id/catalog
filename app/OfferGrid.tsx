"use client";

import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { useI18n } from "@/app/i18n/client";
import { loadOffers } from "@/app/lib/offer-actions";
import type { Offer, OfferPage } from "@/app/lib/offers";
import { label } from "@/app/lib/texts";

const keyOf = (offer: Offer) => `${offer.issuer.slug}/${offer.credential_type.id}`;

/**
 * The offers, each opening its own page, where the application starts. The grid keeps going as it is
 * scrolled: when the marker under it comes near the viewport, the next page
 * is asked for with the cursor the previous one ended on.
 */
export function OfferGrid({ initial }: { initial: OfferPage }) {
  const { t, locale } = useI18n();
  const copy = t.home;
  const [offers, setOffers] = useState(initial.items);
  const [cursor, setCursor] = useState(initial.next_cursor);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const marker = useRef<HTMLDivElement>(null);
  const busy = useRef(false);

  const next = useCallback(async () => {
    if (!cursor || busy.current) return;
    busy.current = true;
    setLoading(true);
    const page = await loadOffers(cursor).catch(() => null);
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
  }, [cursor]);

  useEffect(() => {
    const node = marker.current;
    if (!node || !cursor || failed) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void next();
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [cursor, failed, next]);

  return (
    <div className="grid gap-3">
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {offers.map((offer) => {
          const kind = offer.credential_type;
          return (
            <li key={keyOf(offer)}>
              <Link
                href={`/credentials/${encodeURIComponent(offer.issuer.slug)}/${encodeURIComponent(kind.id)}`}
                className="group block h-full rounded-2xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <Card className="h-full gap-2 p-5 transition-colors hover:bg-accent">
                  <Badge variant="brand" className="justify-self-start">
                    {label(kind.category.labels, locale)}
                  </Badge>
                  <span className="text-lg font-semibold">{label(kind.labels, locale)}</span>
                  <span className="text-sm text-muted-foreground">
                    {copy.by.replace("{issuer}", offer.issuer.name)}
                  </span>
                  <span className="text-[13px] text-faint">
                    {label(kind.descriptions, locale)}
                  </span>
                  <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium text-primary">
                    {copy.apply}
                    <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Card>
              </Link>
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
    </div>
  );
}
