"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { CTABand } from "@/components/ui/CTABand";
import { ProductIcon } from "@/components/ui/ProductIcon";

interface ProductPageTemplateProps {
  slug: string;
  category: "operational" | "expert";
  color?: string;
  icon?: string;
}

export function ProductPageTemplate({ slug, category }: ProductPageTemplateProps) {
  const t = useTranslations("ProductData");
  const tt = useTranslations("ProductTemplate");
  const tc = useTranslations("Common");
  const isExpert = category === "expert";

  const name = t(`${slug}.name`);
  const tagline = t(`${slug}.tagline`);
  const heroDescription = t(`${slug}.heroDescription`);
  const problemTitle = t(`${slug}.problemTitle`);
  const problemDescription = t(`${slug}.problemDescription`);
  const solutionTitle = t(`${slug}.solutionTitle`);
  const solutionDescription = t(`${slug}.solutionDescription`);

  const capabilities = [0, 1, 2, 3, 4].map((i) => ({
    title: t(`${slug}.capabilities.${i}.title`),
    description: t(`${slug}.capabilities.${i}.description`),
  }));

  const benefits = [0, 1, 2].map((i) => ({
    title: t(`${slug}.benefits.${i}.title`),
    description: t(`${slug}.benefits.${i}.description`),
  }));

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pb-28 overflow-hidden bg-navy-950">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950" />
          <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-brand-600/8 rounded-full blur-3xl" />
        </div>
        <div className="relative container-xl">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  isExpert
                    ? "bg-navy-700 text-navy-300"
                    : "bg-brand-500/20 text-brand-300"
                }`}
              >
                {isExpert ? tc("expertApplication") : tc("operationalApplication")}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-4">
              {name}
            </h1>
            <p className="text-xl lg:text-2xl text-navy-300 font-medium mb-4">
              {tagline}
            </p>
            <p className="text-lg text-navy-400 leading-relaxed mb-8 max-w-2xl">
              {heroDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="primary" size="lg" href="/company#contact">
                {tc("requestDemo")}
              </Button>
              <Button
                variant="ghost"
                size="lg"
                href="/platform"
                className="text-white hover:text-white hover:bg-white/10"
              >
                {tc("viewFullPlatform")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="section-padding bg-white">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <span className="badge mb-4">{tt("theChallenge")}</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 tracking-tight mb-6">
                {problemTitle}
              </h2>
              <p className="text-lg text-navy-500 leading-relaxed">
                {problemDescription}
              </p>
            </div>
            <div
              className={`rounded-2xl p-8 lg:p-10 ${
                isExpert ? "bg-navy-50 border border-navy-100" : "bg-brand-50 border border-brand-100"
              }`}
            >
              <h3 className="text-lg font-bold text-navy-900 mb-4">
                {solutionTitle}
              </h3>
              <p className="text-sm text-navy-600 leading-relaxed">
                {solutionDescription}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="section-padding bg-navy-50">
        <div className="container-xl">
          <SectionHeader
            badge={tt("capabilities")}
            title={tt("whatDoes", { name })}
            description={tt("capabilitiesDesc", { name })}
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((cap, i) => (
              <Card key={i} hover={false} padding="md">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                    isExpert
                      ? "bg-navy-100 text-navy-600"
                      : "bg-brand-50 text-brand-600"
                  }`}
                >
                  <span className="text-sm font-bold">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="text-base font-semibold text-navy-900 mb-2">
                  {cap.title}
                </h3>
                <p className="text-sm text-navy-500 leading-relaxed">
                  {cap.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-padding bg-white">
        <div className="container-xl">
          <SectionHeader
            badge={tt("benefits")}
            title={tt("whyItMatters")}
          />
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {benefits.map((benefit, i) => (
              <Card key={i} hover={false} padding="lg">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-teal-500 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-navy-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-navy-500 leading-relaxed">
                  {benefit.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Product Visualization Placeholder */}
      <section className="section-padding bg-navy-50">
        <div className="container-xl">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl border border-navy-200/60 shadow-premium-lg overflow-hidden">
              <div className="bg-navy-900 px-6 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                  <div className="w-3 h-3 rounded-full bg-green-400/60" />
                </div>
                <span className="text-xs text-navy-400 ml-4">
                  {name} — Pool4ward Platform
                </span>
              </div>
              <div className="p-8 lg:p-12">
                <div className="aspect-video bg-gradient-to-br from-navy-50 to-navy-100 rounded-xl flex items-center justify-center border border-navy-200/40">
                  <div className="text-center">
                    <div
                      className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                        isExpert
                          ? "bg-navy-200 text-navy-500"
                          : "bg-brand-100 text-brand-600"
                      }`}
                    >
                      <ProductIcon slug={slug} size={40} />
                    </div>
                    <p className="text-sm font-semibold text-navy-600">
                      {tt("interfaceLabel", { name })}
                    </p>
                    <p className="text-xs text-navy-400 mt-1">
                      {tagline}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Context */}
      <section className="section-padding bg-white">
        <div className="container-xl text-center">
          <SectionHeader
            badge={tt("platformContext")}
            title={tt("howFits", { name })}
            description={
              isExpert
                ? tt("expertContextDesc", { name })
                : tt("operationalContextDesc", { name })
            }
          />
          <Button variant="secondary" href="/platform">
            {tc("exploreFullPlatform")}
          </Button>
        </div>
      </section>

      {/* CTA */}
      <CTABand
        title={tt("ctaTitle", { name })}
        description={tt("ctaDescription", { name })}
      />
    </>
  );
}
