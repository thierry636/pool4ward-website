import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { LeverStage } from "@/components/levers/LeverStage";
import { EUROPE_SERVICES_COUNT } from "@/content/figures";

/**
 * Première page : une promesse lisible, une carte qui joue les six leviers sur une même
 * région, un appel à l'action. Le texte est rendu côté serveur et s'affiche avant tout
 * script ; la carte (`LeverStage`) se pose derrière lui sur grand écran, sous lui sur
 * téléphone.
 */
export function Cover() {
  const t = useTranslations("Home.cover");
  // Espace insécable ordinaire entre milliers : la fine de la locale française se voit à peine en gras.
  const count = new Intl.NumberFormat(useLocale()).format(EUROPE_SERVICES_COUNT).replace(/\u202f/g, "\u00a0");

  return (
    <section className="tone-dark relative isolate flex flex-col overflow-hidden pt-[4.25rem] lg:min-h-[100svh]" aria-labelledby="cover-title">
      <div aria-hidden="true" className="glow-blue pointer-events-none absolute -left-40 top-10 -z-20 h-[44rem] w-[44rem] opacity-70" />
      <div className="wrap relative z-10 flex flex-1 items-center py-9 lg:py-6">
        <div data-cover-text className="max-w-[40rem]">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h1 id="cover-title" className="display mt-5 text-[clamp(2.4rem,4.3vw,4rem)]">
            {t.rich("title", { count, em: (chunks) => <em>{chunks}</em> })}
          </h1>
          <p className="lede mt-5 text-[1.1rem]">{t("lede")}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href="#parcours" className="btn btn-solid">
              {t("ctaJourney")} <span aria-hidden="true">↓</span>
            </a>
            <Link href="/contact" className="btn btn-line">
              {t("ctaTalk")}
            </Link>
          </div>
        </div>
      </div>

      <LeverStage />
    </section>
  );
}
