import { useTranslations } from "next-intl";
import { CapabilityExplorer } from "./CapabilityExplorer";

export function Capabilities() {
  const t = useTranslations("Home.capabilities");

  return (
    <section className="tone-dark section-y" aria-labelledby="cap-title">
      <div className="wrap">
        <div className="max-w-3xl">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h2 id="cap-title" className="h2 mt-4">{t("title")}</h2>
          <p className="lede mt-6">{t("lede")}</p>
        </div>
        <div className="mt-14">
          <CapabilityExplorer />
        </div>
      </div>
    </section>
  );
}
