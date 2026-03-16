import { getTranslations } from "next-intl/server";
import { ProductPageTemplate } from "@/components/sections/ProductPageTemplate";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ProductData" });
  return { title: `${t("compute4ward.name")} — Pool4ward`, description: t("compute4ward.description") };
}

export default function Compute4wardPage() {
  return <ProductPageTemplate slug="compute4ward" category="expert" color="navy" icon="Cpu" />;
}
