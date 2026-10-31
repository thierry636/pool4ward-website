import { useTranslations } from "next-intl";
import { ClientMessages } from "@/lib/client-messages";
import { ReferentialBoard } from "./ReferentialBoard";

/**
 * La planche qui suit la couverture : ce que Pool4ward sait du physique du transport. Un menu à gauche
 * (services ferroviaires et fluviaux, shortsea, réseaux, bornes, parkings, transporteurs) et, à droite,
 * la fiche du référentiel choisi : ses chiffres, sa carte animée et un enregistrement en détail.
 * Les nombres viennent de `content/referentials.ts` (provenance dans l'en-tête de ce fichier) ; les
 * noms d'opérateurs et de transporteurs sont masqués.
 */
export function Referentials() {
  const t = useTranslations("Home.referentials");

  return (
    <section id="referentiels" className="tone-light tone-light-2 section-y scroll-mt-16" aria-labelledby="referentials-title">
      <div className="wrap">
        <div className="max-w-2xl">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h2 id="referentials-title" className="h2 mt-4">
            {t.rich("title", { em: (chunks) => <em>{chunks}</em> })}
          </h2>
          <p className="lede mt-5">{t("lede")}</p>
        </div>

        <div className="mt-10">
          <ClientMessages namespaces={["Home.referentials"]}>
            <ReferentialBoard />
          </ClientMessages>
        </div>
        <p className="mt-6 text-[0.85rem]" style={{ color: "var(--fg-2)" }}>
          {t("note")}
        </p>
      </div>
    </section>
  );
}
