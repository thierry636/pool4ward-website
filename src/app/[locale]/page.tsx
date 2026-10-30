import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Cover } from "@/components/home/Cover";
import { Referentials } from "@/components/referentials/Referentials";
import { Stakes } from "@/components/home/Stakes";
import { JourneySection } from "@/components/home/JourneySection";
import { Capabilities } from "@/components/home/Capabilities";
import { DatasetsTeaser } from "@/components/home/DatasetsTeaser";
import { Evidence } from "@/components/home/Evidence";
import { InsightsStrip } from "@/components/home/InsightsStrip";
import { ContactSection } from "@/components/home/ContactSection";
import { ClientMessages } from "@/lib/client-messages";
import { JsonLd } from "@/components/blog/JsonLd";
import { URL_SITE } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  // Titre absolu : celui de l'accueil est la promesse, sans le gabarit « … | Pool4ward ».
  return { ...pageMetadata({ locale, path: "/", title: t("title"), description: t("description") }), title: { absolute: t("title") } };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Pool4ward",
          url: URL_SITE,
          logo: `${URL_SITE}/images/brand/v2/logo-full-light.svg`,
          description:
            locale === "fr"
              ? "Pool4ward accompagne les entreprises de l’ingénierie à la contractualisation du transport."
              : "Pool4ward supports companies from transport engineering to contracting.",
        }}
      />
      <ClientMessages namespaces={["Home.cover", "Home.levers"]}>
        <Cover />
      </ClientMessages>
      <Referentials />
      <Stakes />
      <ClientMessages namespaces={["Journey"]}>
        <JourneySection />
      </ClientMessages>
      <ClientMessages namespaces={["Capabilities"]}>
        <Capabilities />
      </ClientMessages>
      <ClientMessages namespaces={["Home.datasets", "Globe", "Journey.status", "Journey.ladderLabel"]}>
        <DatasetsTeaser />
      </ClientMessages>
      <Evidence />
      <InsightsStrip />
      <ClientMessages namespaces={["Contact.form"]}>
        <ContactSection />
      </ClientMessages>
    </>
  );
}
