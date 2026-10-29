import { setRequestLocale } from "next-intl/server";
import { Cover } from "@/components/home/Cover";
import { Stakes } from "@/components/home/Stakes";
import { JourneySection } from "@/components/home/JourneySection";
import { Capabilities } from "@/components/home/Capabilities";
import { DatasetsTeaser } from "@/components/home/DatasetsTeaser";
import { Evidence } from "@/components/home/Evidence";
import { InsightsStrip } from "@/components/home/InsightsStrip";
import { ContactSection } from "@/components/home/ContactSection";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Cover />
      <Stakes />
      <JourneySection />
      <Capabilities />
      <DatasetsTeaser />
      <Evidence />
      <InsightsStrip />
      <ContactSection />
    </>
  );
}
