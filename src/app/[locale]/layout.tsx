import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { Footer } from "@/components/layout/Footer";
import { pickMessages } from "@/lib/client-messages";
import { INDEXABLE, URL_SITE } from "@/lib/site";

// Polices variables allégées : seuls les axes réellement utilisés sont
// conservés (voir docs/version2/PERFORMANCE.md). Geist ≈ 40 Ko, Geist Mono
// n'est pas préchargée (elle ne sert qu'aux étiquettes).
const geist = localFont({
  src: "../fonts/Geist-400-700.woff2",
  variable: "--font-geist-sans",
  weight: "400 700",
  // « optional » : si Geist n'est pas là au premier rendu, la page garde sa
  // police de repli au lieu de basculer en cours de route — pas de décalage,
  // et le texte principal n'est peint qu'une fois (préchargée, Geist arrive
  // le plus souvent à temps).
  display: "optional",
});

const geistMono = localFont({
  src: "../fonts/GeistMono-400-600.woff2",
  variable: "--font-geist-mono",
  weight: "400 600",
  display: "swap",
  preload: false,
});

/** Les deux langues sont rendues à la construction : les pages sont servies depuis le CDN. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

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
  setRequestLocale(locale);

  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: "Nav" });

  return (
    <html lang={locale} className={`${geist.variable} ${geistMono.variable}`}>
      <head>
        <link
          rel="preload"
          href="/fonts/SourceSerif4-display-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased">
        <a href="#contenu" className="skip-link">
          {t("skip")}
        </a>
        {/* Le chrome client (en-tête) n'a besoin que de la navigation ; chaque
            page fournit à ses propres composants client les messages qu'ils
            utilisent (voir `ClientMessages`). */}
        <NextIntlClientProvider messages={pickMessages(messages as Record<string, unknown>, ["Nav"])}>
          <SiteChrome footer={<Footer />}>{children}</SiteChrome>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
