import { ChevronRightIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/app/components/EmptyState";
import { EmptyCatalog } from "@/app/components/illustrations/EmptyCatalog";
import { issuerHref } from "@/app/components/OfferTile";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { getI18n } from "@/app/i18n/server";
import {
  fetchMyApplications,
  type ApplicationStatus,
} from "@/app/lib/applications";
import { label } from "@/app/lib/form-fields";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.applications.title };
}

const tone: Record<
  ApplicationStatus,
  "brand" | "danger" | "muted" | "pending"
> = {
  open: "pending",
  paired: "pending",
  submitted: "muted",
  accepted: "brand",
  rejected: "danger",
  issued: "brand",
};

/**
 * The applications started in this browser (it holds each one's secret in
 * its cookie), as the API sees them now: the offer, where each stands and
 * the way back to it. Nobody signs in here, so another browser's are not.
 */
export default async function MyApplicationsPage() {
  const [{ t, locale }, { items, failed }] = await Promise.all([
    getI18n(),
    fetchMyApplications(),
  ]);
  const copy = t.applications;
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "long" });

  return (
    <div className="mx-auto grid w-full max-w-[720px] gap-6">
      <header className="grid gap-1">
        <h1 className="text-[28px] font-bold tracking-tight">{copy.title}</h1>
        <p className="text-muted-foreground">{copy.lead}</p>
      </header>
      {failed && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{copy.unavailable}</AlertDescription>
        </Alert>
      )}
      {items.length === 0 ? (
        !failed && (
          <EmptyState
            art={<EmptyCatalog />}
            title={copy.emptyTitle}
            action={
              <Button asChild variant="outline">
                <Link href="/">{t.apply.toCatalogue}</Link>
              </Button>
            }
          >
            {copy.empty}
          </EmptyState>
        )
      ) : (
        <ul className="grid gap-3">
          {items.map((application) => {
            const { offer } = application;
            const typeName = label(offer.credential_type.labels, locale);
            return (
              <li
                key={application.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3.5"
              >
                <div className="grid min-w-0 gap-0.5">
                  <Link
                    href={issuerHref(offer.issuer.slug)}
                    className="text-[13px] font-semibold text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                  >
                    {offer.issuer.name}
                  </Link>
                  <span className="font-semibold">{typeName}</span>
                  <span className="text-[13px] text-muted-foreground">
                    {application.submitted_at
                      ? copy.sent.replace(
                          "{date}",
                          date.format(new Date(application.submitted_at)),
                        )
                      : copy.notSent}
                    {" · "}
                    <span className="font-mono text-[12px] text-faint">
                      {application.slug}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={tone[application.status]}>
                    {t.apply.status[application.status]}
                  </Badge>
                  <Button asChild variant="outline" size="sm">
                    <Link
                      href={`/apply/${encodeURIComponent(application.id)}`}
                      aria-label={`${copy.open}: ${typeName}, ${offer.issuer.name}`}
                    >
                      {copy.open}
                      <ChevronRightIcon />
                    </Link>
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
