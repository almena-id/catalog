import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { getI18n } from "@/app/i18n/server";
import { fetchOffers } from "@/app/lib/offers";
import { OfferGrid } from "./OfferGrid";

/** The catalog: every published issuer's offers, each leading to its application. */
export default async function CatalogPage() {
  const [{ t }, offers] = await Promise.all([getI18n(), fetchOffers()]);
  const copy = t.home;

  return (
    <div className="grid gap-6">
      <header className="grid gap-1">
        <h1 className="text-[28px] font-bold tracking-tight">{copy.title}</h1>
        <p className="max-w-2xl text-muted-foreground">{copy.lead}</p>
        {offers && offers.total > 0 && (
          <p className="text-sm text-faint">
            {copy.count.replace("{count}", String(offers.total))}
          </p>
        )}
      </header>
      {offers === null ? (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{copy.unavailable}</AlertDescription>
        </Alert>
      ) : offers.items.length === 0 ? (
        <p className="rounded-xl border border-dashed px-5 py-10 text-center text-faint">
          {copy.empty}
        </p>
      ) : (
        <OfferGrid initial={offers} />
      )}
    </div>
  );
}
