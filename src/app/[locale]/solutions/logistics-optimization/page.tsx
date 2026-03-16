import { getTranslations } from "next-intl/server";
import { SolutionPageTemplate } from "@/components/sections/SolutionPageTemplate";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "SolutionData" });
  return { title: `${t("logistics-optimization.title")} — Pool4ward`, description: t("logistics-optimization.description") };
}

export default function LogisticsOptimizationPage() {
  return (
    <SolutionPageTemplate
      slug="logistics-optimization"
      relatedProducts={["Design4ward", "Modal4ward", "Cobuild4ward", "Compute4ward"]}
    />
  );
}
