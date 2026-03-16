import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { EcosystemContent } from "./EcosystemContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Ecosystem" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default function EcosystemPage() {
  return <EcosystemContent />;
}
