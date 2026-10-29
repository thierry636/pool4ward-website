import { setRequestLocale } from "next-intl/server";
import { Cover } from "@/components/home/Cover";
import { Stakes } from "@/components/home/Stakes";
import { JourneySection } from "@/components/home/JourneySection";
import { Capabilities } from "@/components/home/Capabilities";
import { DatasetsTeaser } from "@/components/home/DatasetsTeaser";
import { Evidence } from "@/components/home/Evidence";
import { InsightsStrip } from "@/components/home/InsightsStrip";
import { ContactSection } from "@/components/home/ContactSection";
import { ClientMessages } from "@/lib/client-messages";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <ClientMessages namespaces={["Home.cover", "Journey.board", "Journey.sites"]}>
        <Cover />
      </ClientMessages>
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
