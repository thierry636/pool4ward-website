"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { CTABand } from "@/components/ui/CTABand";
import { PlatformArchitecture } from "@/components/diagrams/PlatformArchitecture";

export function ProductsContent() {
  const t = useTranslations("Products");
  const tp = useTranslations("ProductData");
  const tc = useTranslations("Common");

  const operationalSlugs = ["design4ward", "modal4ward", "cobuild4ward"];
  const expertSlugs = ["compute4ward", "connect4ward"];

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pb-28 overflow-hidden bg-navy-950">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950" />
          <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-brand-600/8 rounded-full blur-3xl" />
        </div>
        <div className="relative container-xl text-center">
          <span className="badge mb-6">{t("heroBadge")}</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6 text-balance max-w-4xl mx-auto">
            {t("heroTitle")}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-teal-400">
              {t("heroTitleHighlight")}
            </span>
          </h1>
          <p className="text-lg lg:text-xl text-navy-300 max-w-2xl mx-auto">
            {t("heroDescription")}
          </p>
        </div>
      </section>

      {/* Operational Applications */}
      <section className="section-padding bg-white">
        <div className="container-xl">
          <SectionHeader
            badge={t("opAppsBadge")}
            title={t("opAppsTitle")}
            description={t("opAppsDescription")}
            align="left"
          />
          <div className="space-y-8">
            {operationalSlugs.map((slug) => (
              <Card key={slug} href={`/products/${slug}`} padding="lg">
                <div className="grid md:grid-cols-3 gap-6 items-center">
                  <div className="md:col-span-2">
                    <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
                      {tc("operationalApplication")}
                    </span>
                    <h3 className="text-xl font-bold text-navy-900 mt-2 mb-1">
                      {tp(`${slug}.name`)}
                    </h3>
                    <p className="text-sm text-brand-600 font-medium mb-3">
                      {tp(`${slug}.tagline`)}
                    </p>
                    <p className="text-sm text-navy-500 leading-relaxed">
                      {tp(`${slug}.description`)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="text-xs font-medium text-navy-500 bg-brand-50 px-2.5 py-1 rounded-lg"
                      >
                        {tp(`${slug}.capabilities.${i}.title`)}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Expert Applications */}
      <section className="section-padding bg-navy-50">
        <div className="container-xl">
          <SectionHeader
            badge={t("expertBadge")}
            title={t("expertTitle")}
            description={t("expertDescription")}
            align="left"
          />
          <div className="grid md:grid-cols-2 gap-6">
            {expertSlugs.map((slug) => (
              <Card key={slug} href={`/products/${slug}`} padding="lg">
                <span className="text-xs font-semibold text-navy-500 uppercase tracking-wider">
                  {tc("expertApplication")}
                </span>
                <h3 className="text-lg font-bold text-navy-900 mt-2 mb-1">
                  {tp(`${slug}.name`)}
                </h3>
                <p className="text-sm text-navy-600 font-medium mb-3">
                  {tp(`${slug}.tagline`)}
                </p>
                <p className="text-sm text-navy-500 leading-relaxed">
                  {tp(`${slug}.description`)}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Architecture */}
      <section className="section-padding bg-white">
        <div className="container-xl">
          <SectionHeader
            badge={t("archBadge")}
            title={t("archTitle")}
            description={t("archDescription")}
          />
          <PlatformArchitecture />
          <div className="text-center mt-10">
            <Button variant="secondary" href="/platform">
              {tc("learnMorePlatform")}
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTABand />
    </>
  );
}
