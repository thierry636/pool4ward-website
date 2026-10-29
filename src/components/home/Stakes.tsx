import { useTranslations } from "next-intl";

const ITEMS = ["flows", "slots", "drivers", "equipment", "energy", "commitments"] as const;

/** Les six réalités du terrain : l'argument de fond, sans le mot « commodité ». */
export function Stakes() {
  const t = useTranslations("Home.stakes");

  return (
    <section className="tone-light section-y" aria-labelledby="stakes-title">
      <div className="wrap grid gap-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
        <div>
          <p className="eyebrow">{t("eyebrow")}</p>
          <h2 id="stakes-title" className="h2 mt-4">{t("title")}</h2>
          <p className="lede mt-6">{t("lede")}</p>
          <p className="display mt-10 text-[clamp(1.5rem,2.6vw,2.2rem)]" style={{ color: "var(--accent)" }}>
            <em style={{ color: "inherit" }}>{t("closing")}</em>
          </p>
        </div>

        <dl className="grid gap-x-10 sm:grid-cols-2">
          {ITEMS.map((id, i) => (
            <div key={id} className="rule-top py-6">
              <dt className="flex items-baseline gap-3">
                <span className="mono text-[0.72rem]" style={{ color: "var(--warm)" }}>0{i + 1}</span>
                <span className="h3 !text-[1.35rem]">{t(`items.${id}.name`)}</span>
              </dt>
              <dd className="mt-3 text-[0.98rem] leading-relaxed" style={{ color: "var(--fg-2)" }}>
                {t(`items.${id}.body`)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
