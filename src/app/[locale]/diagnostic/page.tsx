import type { Metadata } from "next";

import { DiagnosticContent } from "@/components/diagnostic/DiagnosticContent";
import { getDiagnosticCopy } from "@/content/diagnostic/copy";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const copy = getDiagnosticCopy(locale);

  return {
    title: copy.meta.title,
    description: copy.meta.description,
    alternates: {
      // La page canonique est celle de la langue effectivement servie : la copy
      // retombe sur le français pour toute locale non traduite.
      canonical: `/${copy.locale}/diagnostic`,
      languages: {
        fr: "/fr/diagnostic",
        en: "/en/diagnostic",
      },
    },
  };
}

export default async function DiagnosticPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <DiagnosticContent locale={locale} />;
}
