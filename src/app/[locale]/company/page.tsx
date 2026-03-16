import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { CompanyContent } from "./CompanyContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Company" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default function CompanyPage() {
  return <CompanyContent />;
}
