"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";

export function CompanyContent() {
  const t = useTranslations("Company");
  const tc = useTranslations("Common");

  const beliefKeys = [
    "collaborationProblem",
    "moreThanCommunication",
    "outsizedValue",
    "implementationMatters",
  ] as const;

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pb-28 overflow-hidden bg-navy-950">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950" />
          <div className="absolute top-20 left-1/2 w-[500px] h-[500px] bg-brand-600/6 rounded-full blur-3xl -translate-x-1/2" />
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

      {/* Vision */}
      <section className="section-padding bg-white">
        <div className="container-xl">
          <div className="max-w-3xl mx-auto">
            <span className="badge mb-4">{t("visionBadge")}</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 tracking-tight mb-8">
              {t("visionTitle")}
            </h2>
            <div className="space-y-6 text-lg text-navy-500 leading-relaxed">
              <p>{t("visionP1")}</p>
              <p>{t("visionP2")}</p>
              <p>{t("visionP3")}</p>
              <p className="font-semibold text-navy-900">{t("visionP4")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Pool4ward exists */}
      <section className="section-padding bg-navy-50">
        <div className="container-xl">
          <SectionHeader
            badge={t("whyBadge")}
            title={t("whyTitle")}
            description={t("whySubtitle")}
          />
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {beliefKeys.map((key) => (
              <Card key={key} hover={false} padding="lg">
                <h3 className="text-lg font-semibold text-navy-900 mb-2">
                  {t(`beliefs.${key}.title`)}
                </h3>
                <p className="text-sm text-navy-500 leading-loose">
                  {t(`beliefs.${key}.description`)}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="section-padding bg-white">
        <div className="container-xl">
          <div className="max-w-2xl mx-auto text-center">
            <SectionHeader
              badge={t("contactBadge")}
              title={t("contactTitle")}
              description={t("contactDescription")}
            />
            <div className="bg-navy-50 rounded-2xl border border-navy-100 p-8 lg:p-10">
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-navy-700 mb-2 text-left"
                  >
                    {t("nameLabel")}
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-3 rounded-lg border border-navy-200 bg-white text-navy-900 text-sm
                               focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                               placeholder:text-navy-400"
                    placeholder={t("namePlaceholder")}
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-navy-700 mb-2 text-left"
                  >
                    {t("emailLabel")}
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 rounded-lg border border-navy-200 bg-white text-navy-900 text-sm
                               focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                               placeholder:text-navy-400"
                    placeholder={t("emailPlaceholder")}
                  />
                </div>
                <div>
                  <label
                    htmlFor="company"
                    className="block text-sm font-medium text-navy-700 mb-2 text-left"
                  >
                    {t("companyLabel")}
                  </label>
                  <input
                    type="text"
                    id="company"
                    className="w-full px-4 py-3 rounded-lg border border-navy-200 bg-white text-navy-900 text-sm
                               focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                               placeholder:text-navy-400"
                    placeholder={t("companyPlaceholder")}
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-navy-700 mb-2 text-left"
                  >
                    {t("messageLabel")}
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-navy-200 bg-white text-navy-900 text-sm
                               focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                               placeholder:text-navy-400 resize-none"
                    placeholder={t("messagePlaceholder")}
                  />
                </div>
                <Button variant="primary" size="lg" className="w-full">
                  {tc("requestDemo")}
                </Button>
                <p className="text-xs text-navy-400">
                  {t("responseTime")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
