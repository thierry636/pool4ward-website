import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { PlatformContent } from "./PlatformContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Platform" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default function PlatformPage() {
  return <PlatformContent />;
}
