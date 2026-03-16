"use client";

import { useTranslations } from "next-intl";
import { Button } from "./Button";

interface CTABandProps {
  title?: string;
  description?: string;
  primaryCTA?: string;
  primaryHref?: string;
  secondaryCTA?: string;
  secondaryHref?: string;
  dark?: boolean;
}

export function CTABand({
  title,
  description,
  primaryCTA,
  primaryHref = "/company#contact",
  secondaryCTA,
  secondaryHref = "/platform",
  dark = true,
}: CTABandProps) {
  const t = useTranslations("CTABand");

  const displayTitle = title ?? t("defaultTitle");
  const displayDescription = description ?? t("defaultDescription");
  const displayPrimaryCTA = primaryCTA ?? t("defaultPrimaryCTA");
  const displaySecondaryCTA = secondaryCTA ?? t("defaultSecondaryCTA");

  return (
    <section
      className={`relative overflow-hidden ${
        dark ? "bg-navy-900" : "bg-brand-600"
      }`}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl" />
      </div>

      <div className="relative container-xl py-20 md:py-24 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-6 text-balance">
          {displayTitle}
        </h2>
        <p className="text-lg text-navy-300 max-w-2xl mx-auto mb-10">
          {displayDescription}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="white" size="lg" href={primaryHref}>
            {displayPrimaryCTA}
          </Button>
          <Button
            variant="ghost"
            size="lg"
            href={secondaryHref}
            className="text-white hover:text-white hover:bg-white/10"
          >
            {displaySecondaryCTA} →
          </Button>
        </div>
      </div>
    </section>
  );
}
