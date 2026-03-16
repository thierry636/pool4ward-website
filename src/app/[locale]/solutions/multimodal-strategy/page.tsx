import { getTranslations } from "next-intl/server";
import { SolutionPageTemplate } from "@/components/sections/SolutionPageTemplate";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "SolutionData" });
  return { title: `${t("multimodal-strategy.title")} — Pool4ward`, description: t("multimodal-strategy.description") };
}

export default function MultimodalStrategyPage() {
  return (
    <SolutionPageTemplate
      slug="multimodal-strategy"
      relatedProducts={["Modal4ward", "Design4ward", "Compute4ward"]}
    />
  );
}
