import type { Metadata } from "next";
import { Chakra_Petch, Inter, JetBrains_Mono } from "next/font/google";

import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { I18nProvider } from "./i18n/client";
import { getI18n } from "./i18n/server";
import { getTheme } from "./lib/theme-server";
import "./globals.css";

// The typefaces, self-hosted by next/font (downloaded when building, never
// from Google by the visitor): Chakra Petch for the brand and the headings,
// Inter for the interface, JetBrains Mono for figures and codes. globals.css
// turns their variables into font-brand, font-sans and font-mono.
const brand = Chakra_Petch({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-chakra-petch" });
const ui = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jetbrains-mono" });

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
    <html lang={locale} data-theme={theme} className={`${brand.variable} ${ui.variable} ${mono.variable}`}>
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
