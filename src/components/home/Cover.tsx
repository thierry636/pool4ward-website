import { useTranslations } from "next-intl";
import { LeverStage } from "@/components/levers/LeverStage";

/**
 * Première page : une promesse lisible, et une carte qui joue les six leviers sur toute
 * l'Europe — seule, sans menu ni lien. Le texte est rendu côté serveur et s'affiche avant
 * tout script ; la carte (`LeverStage`) se pose derrière lui sur grand écran, sous lui sur
 * téléphone.
 */
export function Cover() {
  const t = useTranslations("Home.cover");
  const benefits = t.raw("benefits") as string[];

  return (
    <section className="tone-dark relative isolate flex flex-col overflow-hidden pt-[4.25rem] lg:min-h-[100svh]" aria-labelledby="cover-title">
      <div aria-hidden="true" className="glow-blue pointer-events-none absolute -left-40 top-10 -z-20 h-[44rem] w-[44rem] opacity-70" />
      <div className="wrap relative z-10 flex flex-1 items-center py-9 lg:py-6">
        <div data-cover-text className="max-w-[35rem]">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h1 id="cover-title" className="display mt-5 text-[clamp(2.4rem,4.3vw,3.9rem)]">
            {t.rich("title", { em: (chunks) => <em>{chunks}</em> })}
          </h1>
          <p className="lede mt-5 text-[1.02rem]">{t("lede")}</p>

          <ul className="mt-6 flex flex-wrap gap-2">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-2 rounded-full border px-3 py-1 text-[0.82rem] font-semibold" style={{ borderColor: "var(--rule)", background: "var(--card)" }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ color: "var(--warm)" }}>
                  <path d="M3 8.5l3.2 3L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <LeverStage />
    </section>
  );
}
