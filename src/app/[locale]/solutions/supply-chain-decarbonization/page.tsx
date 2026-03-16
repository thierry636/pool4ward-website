import { getTranslations } from "next-intl/server";
import { SolutionPageTemplate } from "@/components/sections/SolutionPageTemplate";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "SolutionData" });
  return { title: `${t("supply-chain-decarbonization.title")} — Pool4ward`, description: t("supply-chain-decarbonization.description") };
}

export default function SupplyChainDecarbonizationPage() {
  return (
    <SolutionPageTemplate
      slug="supply-chain-decarbonization"
      relatedProducts={["Modal4ward", "Design4ward", "Cobuild4ward", "Compute4ward"]}
    />
  );
}
