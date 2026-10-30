import { useTranslations } from "next-intl";
import { Icon, type IconName } from "@/components/ui/Icon";
import { LAYER_IDS, type LayerId } from "@/lib/levers/layers";
import { LayerMap } from "./LayerMap";

/**
 * La planche qui suit la couverture : ce que Pool4ward sait du physique du transport. Chaque
 * tuile joue une couche de référentiel sur l'Europe — réseaux privés de bornes, services
 * shortsea, services et réseau ferroviaires, services et réseau fluviaux, parkings,
 * transporteurs. Illustration : positions et tracés indicatifs, aucun chiffre, aucune donnée lue.
 */

const ICON: Record<LayerId, IconName> = {
  chargers: "energy",
  shortsea: "ship",
  railServices: "intermodal",
  railNetwork: "rails",
  barges: "barge",
  waterways: "waves",
  parkings: "parking",
  carriers: "truck",
};

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

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {LAYER_IDS.map((id, i) => (
            <li key={id} data-reveal className="card card-lift overflow-hidden" style={{ ["--i" as string]: i % 4 }}>
              <LayerMap layer={id} label={t("mapLabel", { name: t(`items.${id}.name`) })} />
              <div className="p-5">
                <h3 className="flex items-center gap-3 text-[1.05rem] font-bold tracking-tight">
                  <span className="tile-icon !h-9 !w-9 !rounded-[0.65rem]">
                    <Icon name={ICON[id]} size={19} />
                  </span>
                  {t(`items.${id}.name`)}
                </h3>
                <p className="mt-3 text-[0.92rem] leading-relaxed" style={{ color: "var(--fg-2)" }}>
                  {t(`items.${id}.text`)}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-[0.85rem]" style={{ color: "var(--fg-2)" }}>
          {t("note")}
        </p>
      </div>
    </section>
  );
}
