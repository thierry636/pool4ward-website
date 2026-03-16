import { getTranslations } from "next-intl/server";
import { SolutionPageTemplate } from "@/components/sections/SolutionPageTemplate";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "SolutionData" });
  return { title: `${t("collaborative-transport.title")} — Pool4ward`, description: t("collaborative-transport.description") };
}

export default function CollaborativeTransportPage() {
  return (
    <SolutionPageTemplate
      slug="collaborative-transport"
      relatedProducts={["Design4ward", "Cobuild4ward", "Modal4ward"]}
    />
  );
}
