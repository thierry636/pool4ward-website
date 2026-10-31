import { useTranslations } from "next-intl";
import { Icon } from "@/components/ui/Icon";

const ITEMS = ["flows", "slots", "drivers", "equipment", "energy", "commitments"] as const;

/** Les six réalités du terrain : l'argument de fond, sans le mot « commodité ». */
export function Stakes() {
  const t = useTranslations("Home.stakes");

  return (
    <section className="tone-light section-y" aria-labelledby="stakes-title">
      <div className="wrap grid gap-12 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h2 id="stakes-title" className="h2 mt-4">{t("title")}</h2>
          <p className="lede mt-6">{t("lede")}</p>
          <p className="display text-gradient mt-9 text-[clamp(1.4rem,2.3vw,1.95rem)]">{t("closing")}</p>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2">
          {ITEMS.map((id, i) => (
            <li key={id} data-reveal className="card card-lift p-5 sm:p-6" style={{ ["--i" as string]: i % 2 }}>
              <span className="tile-icon">
                <Icon name={id} />
              </span>
              <h3 className="mt-4 text-[1.1rem] font-bold tracking-tight">{t(`items.${id}.name`)}</h3>
              <p className="mt-2 text-[0.94rem] leading-relaxed" style={{ color: "var(--fg-2)" }}>
                {t(`items.${id}.body`)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
