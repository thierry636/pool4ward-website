import { getTranslations } from "next-intl/server";
import { ProductPageTemplate } from "@/components/sections/ProductPageTemplate";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ProductData" });
  return { title: `${t("modal4ward.name")} — Pool4ward`, description: t("modal4ward.description") };
}

export default function Modal4wardPage() {
  return <ProductPageTemplate slug="modal4ward" category="operational" color="teal" icon="GitBranch" />;
}
