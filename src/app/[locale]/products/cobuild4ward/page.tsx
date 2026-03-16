import { getTranslations } from "next-intl/server";
import { ProductPageTemplate } from "@/components/sections/ProductPageTemplate";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ProductData" });
  return { title: `${t("cobuild4ward.name")} — Pool4ward`, description: t("cobuild4ward.description") };
}

export default function Cobuild4wardPage() {
  return <ProductPageTemplate slug="cobuild4ward" category="operational" color="brand" icon="Users" />;
}
