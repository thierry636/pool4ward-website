"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { CTABand } from "@/components/ui/CTABand";
import { PlatformArchitecture } from "@/components/diagrams/PlatformArchitecture";
import { EcosystemDiagram } from "@/components/diagrams/EcosystemDiagram";
import { FlowDiagram } from "@/components/diagrams/FlowDiagram";
import { HeroVisual } from "@/components/diagrams/HeroVisual";

export function HomeContent() {
  const t = useTranslations("Home");
  const tc = useTranslations("Common");
  const tp = useTranslations("ProductData");

  const operationalSlugs = ["design4ward", "modal4ward", "cobuild4ward"];
  const expertSlugs = ["compute4ward", "connect4ward"];
  const iconMap: Record<string, string> = {
    design4ward: "Search",
    modal4ward: "GitBranch",
    cobuild4ward: "Users",
    compute4ward: "Cpu",
    connect4ward: "Link",
  };

  const painPointKeys = [
    "fragmentedFlows",
    "unusedCapacity",
    "duplicatedTransport",
    "noSharedVisibility",
    "hardToStructure",
    "avoidableCost",
  ] as const;

  const painIcons = [
    <svg key="0" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>,
    <svg key="1" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
    <svg key="2" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
    <svg key="3" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>,
    <svg key="4" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    <svg key="5" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  ];

  const visionItemKeys = [
    "identifySynergies",
    "alignActors",
    "testScenarios",
    "structureInitiatives",
    "implementChanges",
  ] as const;

  const collabItemKeys = [
    "discoverOpportunities",
    "designInitiatives",
    "coordinateActors",
    "implementConfidence",
  ] as const;

  const solutionCardKeys = [
    { key: "collaborativeTransport" as const, href: "/solutions/collaborative-transport" },
    { key: "multimodalOptimization" as const, href: "/solutions/multimodal-strategy" },
    { key: "networkRedesign" as const, href: "/solutions/logistics-optimization" },
    { key: "decarbonization" as const, href: "/solutions/supply-chain-decarbonization" },
  ];

  const benefitKeys = [
    "costReduction",
    "capacityUtilization",
    "co2Emissions",
    "fasterCoordination",
  ] as const;

  const integrationKeys = [
    "erp", "tms", "wms", "partnerApis", "ediB2b", "customConnectors", "dataLakes", "biTools", "iotPlatforms",
  ] as const;

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-navy-950">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950" />
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-600/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-500/6 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
        </div>
        <div className="relative container-xl pt-32 pb-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <span className="badge mb-6">{t("heroBadge")}</span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-display-xl font-bold text-white tracking-tight mb-6 text-balance">
                {t("heroTitle")}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-teal-400">
                  {t("heroTitleHighlight")}
                </span>
              </h1>
              <p className="text-lg lg:text-xl text-navy-300 leading-relaxed mb-8 max-w-xl">
                {t("heroDescription")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="primary" size="lg" href="/company#contact">{tc("requestDemo")}</Button>
                <Button variant="ghost" size="lg" href="/platform" className="text-white hover:text-white hover:bg-white/10">{tc("explorePlatform")}</Button>
              </div>
              <div className="mt-12 pt-8 border-t border-white/10">
                <p className="text-xs text-navy-500 uppercase tracking-wider mb-4">{tc("incubatedAt")}</p>
                <p className="text-sm text-navy-400">{tc("incubatedAtDescription")}</p>
              </div>
            </div>
            <div className="hidden lg:block"><HeroVisual /></div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="section-padding bg-white">
        <div className="container-xl">
          <SectionHeader badge={t("problemBadge")} title={t("problemTitle")} description={t("problemDescription")} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {painPointKeys.map((key, i) => (
              <Card key={key} hover={false} padding="md">
                <div className="w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center text-navy-500 mb-4">{painIcons[i]}</div>
                <h3 className="text-base font-semibold text-navy-900 mb-2">{t(`painPoints.${key}.title`)}</h3>
                <p className="text-sm text-navy-500 leading-relaxed">{t(`painPoints.${key}.description`)}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* VISION */}
      <section className="section-padding bg-navy-50">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <span className="badge mb-4">{t("visionBadge")}</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-navy-900 tracking-tight mb-6 text-balance">
                {t("visionTitle")}<span className="gradient-text">{t("visionTitleHighlight")}</span>
              </h2>
              <p className="text-lg text-navy-500 leading-relaxed mb-6">{t("visionP1")}</p>
              <p className="text-lg text-navy-500 leading-relaxed mb-8">{t("visionP2")}</p>
              <Button variant="primary" href="/platform">{tc("learnAboutPlatform")}</Button>
            </div>
            <div className="bg-white rounded-2xl border border-navy-200/60 p-8 shadow-premium">
              <div className="space-y-6">
                {visionItemKeys.map((key, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-teal-500 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-navy-900">{t(`visionItems.${key}.label`)}</h4>
                      <p className="text-sm text-navy-500 mt-1">{t(`visionItems.${key}.desc`)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM */}
      <section className="section-padding bg-white">
        <div className="container-xl">
          <SectionHeader badge={t("platformBadge")} title={t("platformTitle")} description={t("platformDescription")} />
          <PlatformArchitecture />
          <div className="text-center mt-10">
            <Button variant="secondary" href="/platform">{tc("deepDive")}</Button>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="section-padding bg-navy-50">
        <div className="container-xl">
          <SectionHeader badge={t("productsBadge")} title={t("productsTitle")} description={t("productsDescription")} />
          <div className="mb-12">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-6">{tc("operationalApplications")}</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {operationalSlugs.map((slug) => (
                <Card key={slug} href={`/products/${slug}`} padding="lg">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 mb-5">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {iconMap[slug] === "Search" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />}
                      {iconMap[slug] === "GitBranch" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 3v12m0 0a3 3 0 103 3M6 15a3 3 0 01-3 3m9-15a3 3 0 013 3v6a3 3 0 01-3 3M18 6a3 3 0 00-3-3" />}
                      {iconMap[slug] === "Users" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />}
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-navy-900 mb-1">{tp(`${slug}.name`)}</h3>
                  <p className="text-sm text-brand-600 font-medium mb-3">{tp(`${slug}.tagline`)}</p>
                  <p className="text-sm text-navy-500 leading-relaxed">{tp(`${slug}.description`)}</p>
                </Card>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-navy-500 mb-6">{tc("expertApplications")}</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {expertSlugs.map((slug) => (
                <Card key={slug} href={`/products/${slug}`} padding="md">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-navy-100 flex items-center justify-center text-navy-500 shrink-0">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {iconMap[slug] === "Cpu" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />}
                        {iconMap[slug] === "Link" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />}
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-navy-900 mb-1">{tp(`${slug}.name`)}</h3>
                      <p className="text-sm text-navy-500 leading-relaxed">{tp(`${slug}.description`)}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section-padding bg-white">
        <div className="container-xl">
          <SectionHeader badge={t("howItWorksBadge")} title={t("howItWorksTitle")} description={t("howItWorksDescription")} />
          <FlowDiagram />
        </div>
      </section>

      {/* COLLABORATION */}
      <section className="section-padding bg-navy-900 text-white">
        <div className="container-xl">
          <SectionHeader badge={t("collabBadge")} title={t("collabTitle")} description={t("collabDescription")} dark />
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div><EcosystemDiagram /></div>
            <div className="space-y-8">
              {collabItemKeys.map((key, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-teal-500 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">{i + 1}</span>
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-white mb-1">{t(`collabItems.${key}.title`)}</h4>
                    <p className="text-sm text-navy-300 leading-relaxed">{t(`collabItems.${key}.description`)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SOLUTIONS */}
      <section className="section-padding bg-white">
        <div className="container-xl">
          <SectionHeader badge={t("solutionsBadge")} title={t("solutionsTitle")} description={t("solutionsDescription")} />
          <div className="grid md:grid-cols-2 gap-6">
            {solutionCardKeys.map(({ key, href }) => (
              <Card key={key} href={href} padding="lg">
                <h3 className="text-lg font-bold text-navy-900 mb-2">{t(`solutionCards.${key}.title`)}</h3>
                <p className="text-sm text-navy-500 leading-relaxed mb-4">{t(`solutionCards.${key}.description`)}</p>
                <span className="text-sm font-semibold text-brand-600">{tc("learnMore")}</span>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="section-padding bg-navy-50">
        <div className="container-xl">
          <SectionHeader badge={t("impactBadge")} title={t("impactTitle")} />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefitKeys.map((key) => (
              <Card key={key} hover={false} padding="lg">
                <div className="text-3xl font-bold gradient-text mb-2">{t(`benefits.${key}.metric`)}</div>
                <h3 className="text-base font-semibold text-navy-900 mb-2">{t(`benefits.${key}.label`)}</h3>
                <p className="text-sm text-navy-500 leading-relaxed">{t(`benefits.${key}.description`)}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* INTEGRATIONS */}
      <section className="section-padding bg-white">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <span className="badge mb-4">{t("integrationsBadge")}</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 tracking-tight mb-6">{t("integrationsTitle")}</h2>
              <p className="text-lg text-navy-500 leading-relaxed mb-8">{t("integrationsDescription")}</p>
              <Button variant="secondary" href="/ecosystem">{tc("exploreIntegrations")}</Button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {integrationKeys.map((key) => (
                <div key={key} className="bg-navy-50 border border-navy-100 rounded-xl p-4 flex items-center justify-center text-center">
                  <span className="text-xs font-semibold text-navy-600">{t(`integrationSystems.${key}`)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTABand title={t("ctaTitle")} description={t("ctaDescription")} />
    </>
  );
}
