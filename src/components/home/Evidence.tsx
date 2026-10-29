import { useTranslations } from "next-intl";
import { Icon } from "@/components/ui/Icon";

export function Evidence() {
  const t = useTranslations("Home.evidence");
  const verify = t.raw("verify.items") as { name: string; body: string }[];
  const not = t.raw("notClaimed.items") as string[];

  return (
    <section className="tone-light tone-light-2 section-y" aria-labelledby="evidence-title">
      <div className="wrap">
        <div className="max-w-3xl">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h2 id="evidence-title" className="h2 mt-4">{t("title")}</h2>
          <p className="lede mt-6">{t("lede")}</p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
          <div>
            <h3 className="text-[0.95rem] font-bold" style={{ color: "var(--fg-2)" }}>{t("verify.title")}</h3>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {verify.map((v, i) => (
                <li key={v.name} data-reveal className="card card-lift p-5 sm:p-6" style={{ ["--i" as string]: i % 2 }}>
                  <span className="tile-icon !h-9 !w-9 !rounded-[0.65rem]">
                    <Icon name="check" size={18} />
                  </span>
                  <p className="mt-4 text-[1.05rem] font-bold tracking-tight">{v.name}</p>
                  <p className="mt-2 text-[0.93rem] leading-relaxed" style={{ color: "var(--fg-2)" }}>{v.body}</p>
                </li>
              ))}
            </ul>
          </div>

          <div data-reveal className="tone-dark rounded-3xl border p-6 sm:p-8 lg:self-start" style={{ borderColor: "var(--rule)", background: "var(--bg)", boxShadow: "var(--shadow)" }}>
            <h3 className="text-[0.95rem] font-bold" style={{ color: "var(--warm)" }}>{t("notClaimed.title")}</h3>
            <ul className="mt-5 space-y-4">
              {not.map((n) => (
                <li key={n} className="flex gap-3 text-[0.96rem] leading-relaxed" style={{ color: "var(--fg)" }}>
                  <span aria-hidden="true" className="mt-1 shrink-0" style={{ color: "#fb923c" }}>
                    <Icon name="cross" size={16} />
                  </span>
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
