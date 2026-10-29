import { useTranslations } from "next-intl";
import { Icon } from "@/components/ui/Icon";
import { StatusLadder } from "@/components/journey/StatusLadder";
import { GlobeTeaser } from "./GlobeTeaser";

/** Passerelle vers les référentiels (le globe lui-même vit sur /datasets). */
export function DatasetsTeaser() {
  const t = useTranslations("Home.datasets");

  return (
    <section className="tone-light section-y" aria-labelledby="datasets-title">
      <div className="wrap grid items-center gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
        <div>
          <p className="eyebrow">{t("eyebrow")}</p>
          <h2 id="datasets-title" className="h2 mt-4">{t("title")}</h2>
          <p className="lede mt-6">{t("lede")}</p>
          <div className="card mt-9 flex gap-4 p-5 sm:p-6">
            <span className="tile-icon">
              <Icon name="map" />
            </span>
            <div>
              <p className="text-[1.1rem] font-bold tracking-tight">{t("ladderTitle")}</p>
              <p className="mt-2 text-[0.94rem] leading-relaxed" style={{ color: "var(--fg-2)" }}>{t("ladderBody")}</p>
            </div>
          </div>
        </div>
        <div>
          <GlobeTeaser />
          <div className="mt-6">
            <StatusLadder current="referenced" compact />
          </div>
        </div>
      </div>
    </section>
  );
}
