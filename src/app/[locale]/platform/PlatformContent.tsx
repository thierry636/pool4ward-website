"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { CTABand } from "@/components/ui/CTABand";
import { PlatformArchitecture } from "@/components/diagrams/PlatformArchitecture";
import { FlowDiagram } from "@/components/diagrams/FlowDiagram";
import { ProductIcon } from "@/components/ui/ProductIcon";

export function PlatformContent() {
  const t = useTranslations("Platform");
  const tc = useTranslations("Common");

  const optimizationLevels = [
    { ...JSON.parse(JSON.stringify({ label: t("internalOpt.label"), value: t("internalOpt.value"), desc: t("internalOpt.desc") })), barWidth: "w-1/3" },
    { ...JSON.parse(JSON.stringify({ label: t("crossCompanyOpt.label"), value: t("crossCompanyOpt.value"), desc: t("crossCompanyOpt.desc") })), barWidth: "w-2/3" },
    { ...JSON.parse(JSON.stringify({ label: t("ecosystemOpt.label"), value: t("ecosystemOpt.value"), desc: t("ecosystemOpt.desc") })), barWidth: "w-full" },
  ];

  const ecoCollabKeys = ["opportunityDiscovery", "initiativeDesign", "multiActorCoord", "operationalAlignment"] as const;
  const opAppSlugs = ["design4ward", "modal4ward", "cobuild4ward"] as const;
  const expertAppSlugs = ["compute4ward", "connect4ward"] as const;

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pb-28 overflow-hidden bg-navy-950">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950" />
          <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-brand-600/8 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-1/4 w-[400px] h-[400px] bg-teal-500/6 rounded-full blur-3xl" />
        </div>
        <div className="relative container-xl text-center">
          <span className="badge mb-6">{t("heroBadge")}</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6 text-balance max-w-4xl mx-auto">
            {t("heroTitle")}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-teal-400">{t("heroTitleHighlight")}</span>
          </h1>
          <p className="text-lg lg:text-xl text-navy-300 max-w-2xl mx-auto mb-8">{t("heroDescription")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" size="lg" href="/company#contact">{tc("requestDemo")}</Button>
            <Button variant="ghost" size="lg" href="#architecture" className="text-white hover:text-white hover:bg-white/10">{tc("seeArchitecture")}</Button>
          </div>
        </div>
      </section>

      {/* Why optimization stops */}
      <section className="section-padding bg-white">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <span className="badge mb-4">{t("problemBadge")}</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 tracking-tight mb-6">{t("problemTitle")}</h2>
              <p className="text-lg text-navy-500 leading-relaxed mb-6">{t("problemP1")}</p>
              <p className="text-lg text-navy-500 leading-relaxed">{t("problemP2")}</p>
            </div>
            <div className="space-y-4">
              {optimizationLevels.map((item) => (
                <Card key={item.label} hover={false} padding="md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-navy-900">{item.label}</span>
                    <span className="text-lg font-bold gradient-text">{item.value}</span>
                  </div>
                  <div className="w-full bg-navy-100 rounded-full h-2 mb-2">
                    <div className={`bg-gradient-to-r from-brand-500 to-teal-500 h-2 rounded-full ${item.barWidth}`} />
                  </div>
                  <p className="text-xs text-navy-500">{item.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section id="architecture" className="section-padding bg-navy-50">
        <div className="container-xl">
          <SectionHeader badge={t("archBadge")} title={t("archTitle")} description={t("archDescription")} />
          <PlatformArchitecture />
        </div>
      </section>

      {/* Ecosystem Collaboration */}
      <section id="collaboration" className="section-padding bg-white">
        <div className="container-xl">
          <SectionHeader badge={t("ecoCollabBadge")} title={t("ecoCollabTitle")} description={t("ecoCollabDescription")} />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ecoCollabKeys.map((key) => (
              <Card key={key} hover={false}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-teal-500 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-base font-semibold text-navy-900 mb-2">{t(`ecoCollabItems.${key}.title`)}</h3>
                <p className="text-sm text-navy-500 leading-relaxed">{t(`ecoCollabItems.${key}.description`)}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Operational Applications */}
      <section className="section-padding bg-navy-50">
        <div className="container-xl">
          <SectionHeader badge={t("opAppsBadge")} title={t("opAppsTitle")} description={t("opAppsDescription")} />
          <div className="grid md:grid-cols-3 gap-6">
            {opAppSlugs.map((slug) => (
              <Card key={slug} href={`/products/${slug}`} padding="lg">
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 mb-4">
                  <ProductIcon slug={slug} size={24} />
                </div>
                <h3 className="text-lg font-bold text-navy-900 mb-1">{slug.charAt(0).toUpperCase() + slug.slice(1)}</h3>
                <p className="text-sm text-brand-600 font-medium mb-3">{t(`opApps.${slug}.tagline`)}</p>
                <p className="text-sm text-navy-500 leading-relaxed">{t(`opApps.${slug}.description`)}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Expert Applications */}
      <section className="section-padding bg-white">
        <div className="container-xl">
          <SectionHeader badge={t("expertBadge")} title={t("expertTitle")} description={t("expertDescription")} />
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {expertAppSlugs.map((slug) => {
              const capabilities = t.raw(`expertApps.${slug}.capabilities`) as string[];
              return (
                <Card key={slug} href={`/products/${slug}`} padding="lg">
                  <div className="w-12 h-12 rounded-xl bg-navy-100 flex items-center justify-center text-navy-600 mb-4">
                    <span className="text-sm font-bold">{slug.charAt(0).toUpperCase()}4</span>
                  </div>
                  <h3 className="text-lg font-bold text-navy-900 mb-3">{slug.charAt(0).toUpperCase() + slug.slice(1)}</h3>
                  <p className="text-sm text-navy-500 leading-relaxed mb-4">{t(`expertApps.${slug}.description`)}</p>
                  <div className="flex flex-wrap gap-2">
                    {capabilities.map((cap: string) => (
                      <span key={cap} className="text-xs font-medium text-navy-500 bg-navy-50 px-2.5 py-1 rounded-lg">{cap}</span>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section-padding bg-navy-50">
        <div className="container-xl">
          <SectionHeader badge={t("processBadge")} title={t("processTitle")} description={t("processDescription")} />
          <FlowDiagram />
        </div>
      </section>

      <CTABand />
    </>
  );
}
