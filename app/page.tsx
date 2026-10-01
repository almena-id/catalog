import { ArrowUpRightIcon } from "lucide-react";

import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { Badge } from "@/app/components/ui/badge";
import { Card } from "@/app/components/ui/card";
import { getI18n } from "@/app/i18n/server";
import { applyUrl, fetchOffers } from "@/app/lib/offers";
import { label } from "@/app/lib/texts";

/** The catalog: every published issuer's offers, each leading to its application. */
export default async function CatalogPage() {
  const [{ t, locale }, offers] = await Promise.all([getI18n(), fetchOffers()]);
  const copy = t.home;

  return (
    <div className="grid gap-6">
      <header className="grid gap-1">
        <h1 className="text-[28px] font-bold tracking-tight">{copy.title}</h1>
        <p className="max-w-2xl text-muted-foreground">{copy.lead}</p>
        {offers && offers.length > 0 && (
          <p className="text-sm text-faint">
            {copy.count.replace("{count}", String(offers.length))}
          </p>
        )}
      </header>
      {offers === null ? (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{copy.unavailable}</AlertDescription>
        </Alert>
      ) : offers.length === 0 ? (
        <p className="rounded-xl border border-dashed px-5 py-10 text-center text-faint">
          {copy.empty}
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {offers.map((offer) => (
            <li key={`${offer.issuer.slug}-${offer.type}`}>
              <a
                href={applyUrl(offer)}
                className="group block h-full rounded-2xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <Card className="h-full gap-2 p-5 transition-colors hover:bg-accent">
                  <Badge variant="brand" className="justify-self-start">
                    {offer.category ? label(offer.category.labels, locale) : offer.type}
                  </Badge>
                  <span className="text-lg font-semibold">
                    {offer.kind ? label(offer.kind.labels, locale) : offer.type}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {copy.by.replace("{issuer}", offer.issuer.name)}
                  </span>
                  {offer.kind && (
                    <span className="text-[13px] text-faint">
                      {label(offer.kind.descriptions, locale)}
                    </span>
                  )}
                  <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium text-primary">
                    {copy.apply}
                    <ArrowUpRightIcon className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </Card>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
