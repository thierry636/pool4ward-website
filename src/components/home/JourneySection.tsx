import { useTranslations } from "next-intl";
import { JourneyLazy } from "@/components/journey/JourneyLazy";

export function JourneySection() {
  const t = useTranslations("Home.journey");

  return (
    <section id="parcours" className="tone-light tone-light-2 section-y scroll-mt-16" aria-labelledby="journey-title">
      <div className="wrap">
        <div className="max-w-3xl">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h2 id="journey-title" className="h2 mt-4">{t("title")}</h2>
          <p className="lede mt-6">{t("lede")}</p>
          <p className="mono mt-4 text-[0.78rem]" style={{ color: "var(--fg-2)" }}>{t("note")}</p>
        </div>
        <div className="mt-12">
          <JourneyLazy />
        </div>
      </div>
    </section>
  );
}
