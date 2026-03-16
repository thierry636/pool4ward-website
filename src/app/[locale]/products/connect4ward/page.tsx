import { getTranslations } from "next-intl/server";
import { ProductPageTemplate } from "@/components/sections/ProductPageTemplate";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ProductData" });
  return { title: `${t("connect4ward.name")} — Pool4ward`, description: t("connect4ward.description") };
}

export default function Connect4wardPage() {
  return <ProductPageTemplate slug="connect4ward" category="expert" color="navy" icon="Link" />;
}
