"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { CTABand } from "@/components/ui/CTABand";
import { EcosystemDiagram } from "@/components/diagrams/EcosystemDiagram";

export function EcosystemContent() {
  const t = useTranslations("Ecosystem");
  const tc = useTranslations("Common");

  const challengeKeys = [
    "noSharedVisibility",
    "noStructuredProcess",
    "competingInterests",
    "dataSensitivity",
    "complexityAtScale",
    "implementationGap",
  ] as const;

  const infoSharingKeys = [
    "purposeSpecific",
    "roleBased",
    "auditGovernance",
  ] as const;

  const actorKeys = [
    "shippers",
    "carriers",
    "logisticsOperators",
    "multimodalActors",
    "ecosystemCoordinators",
    "techPartners",
  ] as const;

  const integrationSystems = [
    "SAP",
    "Oracle",
    "Microsoft Dynamics",
    "TMS Systems",
    "WMS Systems",
    "Carrier Platforms",
    "EDI Networks",
    "Custom APIs",
    "Data Warehouses",
    "BI Platforms",
    "IoT Systems",
    "Partner Portals",
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pb-28 overflow-hidden bg-navy-950">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950" />
          <div className="absolute top-20 left-1/3 w-[500px] h-[500px] bg-teal-500/8 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/3 w-[400px] h-[400px] bg-brand-600/6 rounded-full blur-3xl" />
        </div>
        <div className="relative container-xl text-center">
          <span className="badge mb-6">{t("heroBadge")}</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6 text-balance max-w-4xl mx-auto">
            {t("heroTitle")}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-teal-400">
              {t("heroTitleHighlight")}
            </span>
          </h1>
          <p className="text-lg lg:text-xl text-navy-300 max-w-2xl mx-auto mb-8">
            {t("heroDescription")}
          </p>
          <Button variant="primary" size="lg" href="/company#contact">
            {tc("requestDemo")}
          </Button>
        </div>
      </section>

      {/* Why collaboration is hard */}
      <section className="section-padding bg-white">
        <div className="container-xl">
          <SectionHeader
            badge={t("challengeBadge")}
            title={t("challengeTitle")}
            description={t("challengeDescription")}
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challengeKeys.map((key) => (
              <Card key={key} hover={false} padding="md">
                <h3 className="text-base font-semibold text-navy-900 mb-2">
                  {t(`challenges.${key}.title`)}
                </h3>
                <p className="text-sm text-navy-500 leading-relaxed">
                  {t(`challenges.${key}.description`)}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How Pool4ward structures collaboration */}
      <section className="section-padding bg-navy-50">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <span className="badge mb-4">{t("solutionBadge")}</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 tracking-tight mb-6">
                {t("solutionTitle")}
              </h2>
              <p className="text-lg text-navy-500 leading-relaxed mb-6">
                {t("solutionDescription")}
              </p>
              <div className="space-y-4">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-brand-500 to-teal-500 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm text-navy-600">{t(`solutionItems.${i}`)}</p>
                  </div>
                ))}
              </div>
            </div>
            <EcosystemDiagram />
          </div>
        </div>
      </section>

      {/* Information sharing */}
      <section className="section-padding bg-white">
        <div className="container-xl">
          <SectionHeader
            badge={t("infoSharingBadge")}
            title={t("infoSharingTitle")}
            description={t("infoSharingDescription")}
          />
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {infoSharingKeys.map((key) => (
              <Card key={key} hover={false} padding="md">
                <h3 className="text-base font-semibold text-navy-900 mb-2">
                  {t(`infoSharingItems.${key}.title`)}
                </h3>
                <p className="text-sm text-navy-500 leading-relaxed">
                  {t(`infoSharingItems.${key}.description`)}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="section-padding bg-navy-50">
        <div className="container-xl">
          <SectionHeader
            badge={t("integrationsBadge")}
            title={t("integrationsTitle")}
            description={t("integrationsDescription")}
          />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {integrationSystems.map((system) => (
              <div
                key={system}
                className="bg-white border border-navy-200/60 rounded-xl p-4 flex items-center justify-center text-center shadow-premium"
              >
                <span className="text-xs font-semibold text-navy-600">{system}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Actor types */}
      <section className="section-padding bg-white">
        <div className="container-xl">
          <SectionHeader
            badge={t("actorsBadge")}
            title={t("actorsTitle")}
            description={t("actorsDescription")}
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {actorKeys.map((key) => (
              <Card key={key} hover={false} padding="md">
                <h3 className="text-base font-semibold text-navy-900 mb-2">
                  {t(`actors.${key}.title`)}
                </h3>
                <p className="text-sm text-navy-500 leading-relaxed">
                  {t(`actors.${key}.description`)}
                </p>
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
