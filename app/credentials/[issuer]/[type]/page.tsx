import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CopyButton } from "@/app/components/CopyButton";
import { CredentialCard } from "@/app/components/CredentialCard";
import { issuerHref } from "@/app/components/OfferTile";
import { VerifiedDomains } from "@/app/components/VerifiedDomains";
import { Badge } from "@/app/components/ui/badge";
import { Card } from "@/app/components/ui/card";
import { CategoryIcon } from "@/app/lib/category-icons";
import { getI18n } from "@/app/i18n/server";
import { fetchOffer } from "@/app/lib/applications";
import { fetchCredentialCatalogue } from "@/app/lib/catalogues";
import { label } from "@/app/lib/form-fields";
import { StartForm } from "./StartForm";

export async function generateMetadata({
  params,
}: PageProps<"/credentials/[issuer]/[type]">): Promise<Metadata> {
  const { issuer, type } = await params;
  const [offer, { locale }] = await Promise.all([
    fetchOffer(issuer, type),
    getI18n(),
  ]);
  return offer ? { title: label(offer.credential_type.labels, locale) } : {};
}

/**
 * Public: one offer — who grants the credential, what it says, what the
 * issuer will ask for (the fields, the credentials to present) and how
 * applying goes, then "Start".
 */
export default async function OfferPage({
  params,
}: PageProps<"/credentials/[issuer]/[type]">) {
  const { issuer, type } = await params;
  const [offer, credentials, { t, locale }] = await Promise.all([
    fetchOffer(issuer, type),
    fetchCredentialCatalogue(),
    getI18n(),
  ]);
  if (!offer) notFound();
  const copy = t.apply;
  const types = new Map(credentials?.types.map((item) => [item.id, item]));
  const typeName = label(offer.credential_type.labels, locale);
  const categoryName = offer.category ? label(offer.category.labels, locale) : "";

  return (
    <div className="mx-auto grid w-full max-w-[960px] gap-6">
      <header className="grid items-center gap-6 md:grid-cols-[minmax(0,380px)_minmax(0,1fr)] md:gap-10">
        <CredentialCard
          className="mx-auto max-w-[380px]"
          typeName={typeName}
          issuerName={offer.issuer.name}
          category={{ label: categoryName, icon: offer.category?.icon }}
        />
        <div className="grid gap-2">
          <Badge variant="brand" className="justify-self-start">
            <CategoryIcon icon={offer.category?.icon} aria-hidden />
            {categoryName}
          </Badge>
          <h1 className="text-[28px] leading-tight font-bold tracking-tight sm:text-[32px]">
            {typeName}
          </h1>
          <p className="text-[15px] text-muted-foreground">
            {t.home.by.split("{issuer}")[0]}
            <Link
              href={issuerHref(offer.issuer.slug)}
              className="font-semibold text-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              {offer.issuer.name}
            </Link>
            {t.home.by.split("{issuer}")[1] ?? ""}
          </p>
          <p className="text-muted-foreground">
            {label(offer.credential_type.descriptions, locale)}
          </p>
          <VerifiedDomains
            domains={offer.issuer.domains}
            label={t.issuer.domains}
          />
          <p className="flex items-center gap-1 font-mono text-[11px] text-faint">
            <span className="break-all">{offer.issuer.did}</span>
            <CopyButton
              value={offer.issuer.did}
              label={t.issuer.copyDid}
              copiedLabel={t.issuer.copied}
            />
          </p>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-2">
      <Card className="gap-4 p-6">
        <h2 className="text-lg font-semibold">{copy.asksTitle}</h2>
        {offer.form.description && (
          <p className="text-sm text-muted-foreground">
            {label(offer.form.description, locale)}
          </p>
        )}
        <ul className="grid gap-1.5 text-sm">
          {offer.form.fields.map((field) => (
            <li key={field.key}>
              {label(field.field.labels, locale)}
              {!field.required && (
                <span className="text-muted-foreground">
                  {" "}
                  · {copy.optional}
                </span>
              )}
            </li>
          ))}
        </ul>
        {offer.form.credentials.length > 0 && (
          <>
            <h3 className="font-semibold">{copy.credentialsTitle}</h3>
            <ul className="grid gap-1.5 text-sm">
              {offer.form.credentials.map((request) => (
                <li key={request.key}>
                  {request.labels && Object.keys(request.labels).length
                    ? label(request.labels, locale)
                    : types.get(request.type)
                      ? label(types.get(request.type)!.labels, locale)
                      : request.type}
                  {!request.required && (
                    <span className="text-muted-foreground">
                      {" "}
                      · {copy.optional}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <Card className="gap-3 p-6">
        <h2 className="text-lg font-semibold">{copy.howTitle}</h2>
        <ol className="grid list-decimal gap-1.5 pl-5 text-sm text-muted-foreground">
          <li>{copy.howPair}</li>
          <li>{copy.howFill}</li>
          <li>{copy.howSubmit.replace("{issuer}", offer.issuer.name)}</li>
        </ol>
        <StartForm issuer={offer.issuer.slug} type={offer.credential_type.id} />
      </Card>
      </div>
    </div>
  );
}
