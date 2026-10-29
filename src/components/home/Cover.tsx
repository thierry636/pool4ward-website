import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { CoverScene } from "./CoverScene";

/**
 * Première page : une promesse lisible, une scène, un appel à l'action. Le
 * texte est rendu côté serveur et s'affiche avant tout script.
 */
export function Cover() {
  const t = useTranslations("Home.cover");
  const benefits = t.raw("benefits") as string[];

  return (
    <section className="tone-dark relative isolate overflow-hidden pt-[4.25rem]" aria-labelledby="cover-title">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60rem 42rem at 78% 46%, rgb(143 196 171 / 0.13), transparent 62%), radial-gradient(40rem 30rem at 8% 100%, rgb(232 185 100 / 0.07), transparent 60%)",
        }}
      />
      <div className="wrap grid items-center gap-10 pb-16 pt-10 lg:min-h-[calc(100svh-4.25rem)] lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-6 lg:pb-14 lg:pt-6">
        <div className="lg:pr-6">
          <p className="eyebrow" style={{ color: "var(--warm)" }}>
            {t("eyebrow")}
          </p>
          <h1 id="cover-title" className="display mt-5 text-[clamp(2.7rem,6.1vw,5.6rem)]">
            {t("title")}
          </h1>
          <p className="lede mt-7">{t("lede")}</p>

          <ul className="mono mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[0.78rem] uppercase tracking-[0.1em]">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-2">
                <span aria-hidden="true" style={{ color: "var(--warm)" }}>◆</span>
                {b}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href="#parcours" className="btn btn-solid">
              {t("ctaJourney")} <span aria-hidden="true">↓</span>
            </a>
            <Link href="/contact" className="btn btn-line">
              {t("ctaTalk")}
            </Link>
          </div>
          <p className="mt-5">
            <Link href="/datasets" className="mono inline-flex min-h-[2.75rem] items-center text-[0.8rem] uppercase tracking-[0.1em] underline decoration-1 underline-offset-[6px] hover:opacity-80">
              {t("ctaDatasets")} →
            </Link>
          </p>
        </div>

        <CoverScene />
      </div>
    </section>
  );
}
