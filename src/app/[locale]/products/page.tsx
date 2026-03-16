import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { ProductsContent } from "./ProductsContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Products" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default function ProductsPage() {
  return <ProductsContent />;
}
