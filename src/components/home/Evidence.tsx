import { useTranslations } from "next-intl";

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

        <div className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-20">
          <div>
            <h3 className="eyebrow">{t("verify.title")}</h3>
            <ul className="mt-4">
              {verify.map((v, i) => (
                <li key={v.name} className="rule-top grid gap-1 py-5 sm:grid-cols-[3rem_1fr]">
                  <span className="mono text-[0.74rem]" style={{ color: "var(--warm)" }}>0{i + 1}</span>
                  <div>
                    <p className="h3 !text-[1.3rem]">{v.name}</p>
                    <p className="mt-2 text-[0.98rem] leading-relaxed" style={{ color: "var(--fg-2)" }}>{v.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="border p-6 sm:p-8 lg:self-start" style={{ borderColor: "var(--rule-strong)", background: "var(--card)" }}>
            <h3 className="eyebrow" style={{ color: "var(--warm)" }}>{t("notClaimed.title")}</h3>
            <ul className="mt-5 space-y-4">
              {not.map((n) => (
                <li key={n} className="flex gap-3 text-[0.98rem] leading-relaxed">
                  <span aria-hidden="true" className="mono" style={{ color: "var(--warm)" }}>✕</span>
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
