"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { CTABand } from "@/components/ui/CTABand";

export function SolutionsContent() {
  const t = useTranslations("Solutions");
  const ts = useTranslations("SolutionData");
  const tc = useTranslations("Common");

  const solutionSlugs = [
    "logistics-optimization",
    "collaborative-transport",
    "multimodal-strategy",
    "supply-chain-decarbonization",
  ];

  const outcomeCountMap: Record<string, number> = {
    "logistics-optimization": 3,
    "collaborative-transport": 3,
    "multimodal-strategy": 3,
    "supply-chain-decarbonization": 3,
  };

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pb-28 overflow-hidden bg-navy-950">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950" />
          <div className="absolute top-20 left-1/3 w-[500px] h-[500px] bg-teal-500/8 rounded-full blur-3xl" />
        </div>
        <div className="relative container-xl text-center">
          <span className="badge-teal mb-6">{t("heroBadge")}</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6 text-balance max-w-4xl mx-auto">
            {t("heroTitle")}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-brand-400">
              {t("heroTitleHighlight")}
            </span>
          </h1>
          <p className="text-lg lg:text-xl text-navy-300 max-w-2xl mx-auto">
            {t("heroDescription")}
          </p>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="section-padding bg-white">
        <div className="container-xl">
          <div className="space-y-8">
            {solutionSlugs.map((slug) => (
              <Card
                key={slug}
                href={`/solutions/${slug}`}
                padding="lg"
              >
                <div className="grid md:grid-cols-3 gap-6 items-start">
                  <div className="md:col-span-2">
                    <h3 className="text-xl font-bold text-navy-900 mb-2">
                      {ts(`${slug}.title`)}
                    </h3>
                    <p className="text-sm text-teal-600 font-medium mb-3">
                      {ts(`${slug}.tagline`)}
                    </p>
                    <p className="text-sm text-navy-500 leading-relaxed">
                      {ts(`${slug}.description`)}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-navy-400 mb-3">
                      {tc("expectedOutcomes")}
                    </h4>
                    <div className="space-y-2">
                      {Array.from({ length: outcomeCountMap[slug] }, (_, i) => (
                        <div key={i} className="flex gap-2">
                          <svg className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-xs text-navy-600 font-medium">
                            {ts(`${slug}.outcomes.${i}.title`)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
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
