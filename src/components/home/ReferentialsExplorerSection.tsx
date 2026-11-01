import { useTranslations } from "next-intl";
import { ClientMessages } from "@/lib/client-messages";
import { ReferentialExplorer } from "./ReferentialExplorer";

/**
 * La section sombre des référentiels : liste à gauche, référentiel ouvert à droite (carte illustrative,
 * chiffres, agent IA qui collecte et normalise). Elle reprend la mise en page de l'ancienne section des
 * cinq capacités (`Capabilities`, toujours dans le dépôt, non montée).
 */
export function ReferentialsExplorerSection() {
  const t = useTranslations("Home.referentialExplorer");

  return (
    <section id="referentiels-detail" className="tone-dark section-y scroll-mt-16" aria-labelledby="refx-title">
      <div className="wrap">
        <div className="max-w-3xl">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h2 id="refx-title" className="h2 mt-4">
            {t("title")}
          </h2>
          <p className="lede mt-6">{t("lede")}</p>
        </div>
        <div className="mt-14">
          <ClientMessages namespaces={["Home.referentialExplorer", "Home.referentials"]}>
            <ReferentialExplorer />
          </ClientMessages>
        </div>
        <p className="mt-8 text-[0.85rem]" style={{ color: "var(--fg-2)" }}>
          {t("note")}
        </p>
      </div>
    </section>
  );
}
