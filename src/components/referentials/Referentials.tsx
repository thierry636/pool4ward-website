import { useLocale, useTranslations } from "next-intl";
import { ClientMessages } from "@/lib/client-messages";
import { SERVICES } from "@/content/referentials";
import { TileBoard } from "./TileBoard";

/**
 * La planche qui suit la couverture : les référentiels de Pool4ward, un par tuile. Un seul grand nombre
 * dans le titre (les services intermodaux) ; chaque tuile porte le sien, avec l'écran du portail
 * présenté autour. Les nombres viennent de `content/referentials.ts` (provenance dans l'en-tête de ce fichier).
 */
export function Referentials() {
  const t = useTranslations("Home.referentials");
  const locale = useLocale();
  const n = new Intl.NumberFormat(locale).format(SERVICES.total).replace(/ /g, " ");

  return (
    <section id="referentiels" className="tone-light tone-light-2 section-y scroll-mt-16" aria-labelledby="referentials-title">
      <div className="wrap">
        <h2 id="referentials-title" className="h2 rt-title max-w-[22ch] sm:max-w-3xl">
          {t.rich("title", { n, b: (chunks) => <b>{chunks}</b> })}
        </h2>
        <p className="lede mt-5">{t("sub")}</p>

        <div className="mt-10 sm:mt-12">
          <ClientMessages namespaces={["Home.referentials"]}>
            <TileBoard />
          </ClientMessages>
        </div>
        <p className="mt-6 text-[0.85rem]" style={{ color: "var(--fg-2)" }}>
          {t("caption")}
        </p>
      </div>
    </section>
  );
}
