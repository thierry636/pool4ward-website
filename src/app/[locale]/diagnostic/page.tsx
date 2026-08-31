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
    // v1 : le diagnostic n'existe qu'en français. La version EN s'ouvrira sur
    // /en/diagnostic une fois le taux de conversion FR mesuré.
    alternates: { canonical: "/fr/diagnostic" },
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
