"use client";

import { useTranslations } from "next-intl";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { CTABand } from "@/components/ui/CTABand";

export function ResourcesContent() {
  const t = useTranslations("Resources");
  const tc = useTranslations("Common");

  const insightIndices = [0, 1, 2, 3, 4, 5];
  const caseStudyIndices = [0, 1, 2];
  const docIndices = [0, 1, 2];
  const docHrefs = ["/platform", "/platform", "/products/connect4ward"];

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-navy-950">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950" />
          <div className="absolute top-20 right-1/3 w-[400px] h-[400px] bg-brand-600/6 rounded-full blur-3xl" />
        </div>
        <div className="relative container-xl text-center">
          <span className="badge mb-6">{t("heroBadge")}</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6 max-w-3xl mx-auto">
            {t("heroTitle")}
          </h1>
          <p className="text-lg text-navy-300 max-w-2xl mx-auto">
            {t("heroDescription")}
          </p>
        </div>
      </section>

      {/* Featured Insights */}
      <section className="section-padding bg-white">
        <div className="container-xl">
          <SectionHeader
            badge={t("insightsBadge")}
            title={t("insightsTitle")}
            align="left"
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {insightIndices.map((i) => (
              <Card key={i} hover padding="md" className="cursor-pointer">
                <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
                  {t(`insights.${i}.category`)}
                </span>
                <h3 className="text-base font-bold text-navy-900 mt-3 mb-2 leading-snug">
                  {t(`insights.${i}.title`)}
                </h3>
                <p className="text-sm text-navy-500 leading-relaxed mb-4">
                  {t(`insights.${i}.description`)}
                </p>
                <span className="text-xs text-navy-400">
                  {t(`insights.${i}.readTime`)}
                </span>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="section-padding bg-navy-50">
        <div className="container-xl">
          <SectionHeader
            badge={t("caseStudiesBadge")}
            title={t("caseStudiesTitle")}
            align="left"
          />
          <div className="space-y-6">
            {caseStudyIndices.map((i) => {
              const tags: string[] = [
                t(`caseStudies.${i}.tags.0`),
                t(`caseStudies.${i}.tags.1`),
              ];
              return (
                <Card key={i} hover padding="lg" className="cursor-pointer">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-navy-900 mb-2">
                        {t(`caseStudies.${i}.title`)}
                      </h3>
                      <p className="text-sm text-navy-500 leading-relaxed">
                        {t(`caseStudies.${i}.description`)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 md:shrink-0">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs font-medium text-navy-500 bg-navy-100 px-2.5 py-1 rounded-lg whitespace-nowrap"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Platform Documentation */}
      <section className="section-padding bg-white">
        <div className="container-xl">
          <SectionHeader
            badge={t("docsBadge")}
            title={t("docsTitle")}
          />
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {docIndices.map((i) => (
              <Card key={i} href={docHrefs[i]} padding="md">
                <h3 className="text-base font-semibold text-navy-900 mb-2">
                  {t(`docs.${i}.title`)}
                </h3>
                <p className="text-sm text-navy-500 leading-relaxed mb-3">
                  {t(`docs.${i}.description`)}
                </p>
                <span className="text-sm font-semibold text-brand-600">
                  {tc("readMore")}
                </span>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTABand
        title={t("ctaTitle")}
        description={t("ctaDescription")}
      />
    </>
  );
}
