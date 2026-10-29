import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { INDEXABLE, URL_SITE } from "@/lib/site";

const geist = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});

const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0b241a",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    metadataBase: new URL(URL_SITE),
    title: { default: t("title"), template: t("titleTemplate") },
    description: t("description"),
    icons: { icon: "/icon.svg" },
    openGraph: {
      type: "website",
      siteName: "Pool4ward",
      title: t("title"),
      description: t("description"),
      locale: locale === "fr" ? "fr_FR" : "en_GB",
      images: [{ url: "/og/pool4ward.png", width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image" },
    // La version 2 n'est indexable que si l'environnement le dit
    // (voir `src/lib/site.ts`) : une préproduction ne doit pas concurrencer
    // le site public.
    robots: INDEXABLE ? undefined : { index: false, follow: false },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "fr")) {
    notFound();
  }

  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: "Nav" });

  return (
    <html lang={locale} className={`${geist.variable} ${geistMono.variable}`}>
      <head>
        <link
          rel="preload"
          href="/fonts/SourceSerif4-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased">
        <a href="#contenu" className="skip-link">
          {t("skip")}
        </a>
        <NextIntlClientProvider messages={messages}>
          <SiteChrome>{children}</SiteChrome>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
