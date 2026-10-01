import type { Metadata } from "next";

import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { I18nProvider } from "./i18n/client";
import { getI18n } from "./i18n/server";
import { getTheme } from "./lib/theme-server";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_CATALOG_WEB_URL ?? "https://catalog.almena.id",
    ),
    title: { default: t.app.name, template: `%s · ${t.app.name}` },
    description: t.home.lead,
  };
}

/** The document: header, the page and the footer. */
export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { locale, t } = await getI18n();
  const theme = await getTheme();

  return (
    <html lang={locale} data-theme={theme}>
      <body>
        <I18nProvider locale={locale}>
          <div className="shell relative isolate flex min-h-dvh flex-col">
            <SiteHeader t={t} />
            <main className="page-frame flex flex-1 flex-col pt-8 pb-12">{children}</main>
            <SiteFooter t={t} theme={theme} />
          </div>
        </I18nProvider>
      </body>
    </html>
  );
}
