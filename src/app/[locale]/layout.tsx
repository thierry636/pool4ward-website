import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { Footer } from "@/components/layout/Footer";
import { RevealObserver } from "@/components/ui/RevealObserver";
import { pickMessages } from "@/lib/client-messages";
import { INDEXABLE, URL_SITE } from "@/lib/site";

// Inter, variable, sous-ensemble latin (≈ 48 Ko, licence SIL OFL — public/fonts/OFL-Inter.txt),
// auto-hébergée : aucune requête tierce avant le premier rendu. C'est la police de la version 1.
// « optional » : si elle n'est pas là au premier rendu, la page garde sa police de repli au lieu
// de basculer en cours de route (pas de décalage) ; préchargée, elle arrive le plus souvent à temps.
const inter = localFont({
  src: "../fonts/Inter-latin-wght.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "optional",
});

/** Les deux langues sont rendues à la construction : les pages sont servies depuis le CDN. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#020617",
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
    <html lang={locale} className={inter.variable}>
      <body className="antialiased">
        <a href="#contenu" className="skip-link">
          {t("skip")}
        </a>
        {/* Le chrome client (en-tête) n'a besoin que de la navigation ; chaque
            page fournit à ses propres composants client les messages qu'ils
            utilisent (voir `ClientMessages`). */}
        <NextIntlClientProvider messages={pickMessages(messages as Record<string, unknown>, ["Nav"])}>
          <SiteChrome footer={<Footer />}>{children}</SiteChrome>
          <RevealObserver />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
