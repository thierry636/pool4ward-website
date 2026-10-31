import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/sections/PageHero";
import { StatusScale } from "@/components/sections/StatusScale";
import { CtaBand } from "@/components/sections/CtaBand";
import { FeatureCard } from "@/components/ui/FeatureCard";
import type { IconName } from "@/components/ui/Icon";
import { pageMetadata } from "@/lib/seo";

const GROUND = ["flows", "slots", "drivers", "equipment", "energy", "commitments"] as const;
const LEVERS = ["collaboration", "intermodal", "ai", "datasets"] as const;
const LEVER_ICON: Record<(typeof LEVERS)[number], IconName> = { collaboration: "collaboration", intermodal: "intermodal", ai: "ai", datasets: "database" };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Approach.meta" });
  return pageMetadata({ locale, path: "/approach", title: t("title"), description: t("description") });
}

export default async function ApproachPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Approach");
  const body = t.raw("conviction.body") as string[];

  return (
    <>
      <PageHero eyebrow={t("hero.eyebrow")} title={t("hero.title")} lede={t("hero.lede")} />

      <section className="tone-light section-y" aria-labelledby="conviction">
        <div className="wrap grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
          <div>
            <p className="eyebrow">{t("conviction.eyebrow")}</p>
            <h2 id="conviction" className="h2 mt-4">{t("conviction.title")}</h2>
          </div>
          <div className="prose-p4w space-y-6 text-[1.1rem]">
            {body.map((p) => (
              <p key={p} className="!max-w-none !text-[1.1rem]">{p}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="tone-light tone-light-2 section-y" aria-labelledby="ground">
        <div className="wrap">
          <p className="eyebrow">{t("ground.eyebrow")}</p>
          <h2 id="ground" className="h2 mt-4 max-w-3xl">{t("ground.title")}</h2>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GROUND.map((id, i) => (
              <FeatureCard key={id} icon={id} index={i} title={t(`ground.items.${id}.name`)} body={t(`ground.items.${id}.body`)} />
            ))}
          </ul>
        </div>
      </section>

      <section className="tone-dark section-y" aria-labelledby="levers">
        <div className="wrap">
          <div className="max-w-3xl">
            <p className="eyebrow">{t("levers.eyebrow")}</p>
            <h2 id="levers" className="h2 mt-4">{t("levers.title")}</h2>
            <p className="lede mt-6">{t("levers.lede")}</p>
          </div>
          <ul className="mt-12 grid gap-4 md:grid-cols-2">
            {LEVERS.map((id, i) => (
              <FeatureCard key={id} icon={LEVER_ICON[id]} index={i} pill={t(`levers.items.${id}.kind`)} title={t(`levers.items.${id}.name`)} body={t(`levers.items.${id}.body`)} />
            ))}
          </ul>
        </div>
      </section>

      <section className="tone-light section-y" aria-labelledby="ladder">
        <div className="wrap">
          <p className="eyebrow">{t("ladder.eyebrow")}</p>
          <h2 id="ladder" className="h2 mt-4 max-w-3xl">{t("ladder.title")}</h2>
          <p className="lede mt-6">{t("ladder.lede")}</p>
          <div className="mt-12">
            <StatusScale />
          </div>
        </div>
      </section>

      <CtaBand title={t("cta.title")} body={t("cta.body")} button={t("cta.button")} />
    </>
  );
}
