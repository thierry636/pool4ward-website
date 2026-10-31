import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/sections/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { Showcase } from "@/components/showcase/Showcase";
import { ShowcaseList } from "@/components/showcase/ShowcaseList";
import { StatusScale } from "@/components/sections/StatusScale";
import { showcase } from "@/lib/showcase/load";
import { pageMetadata } from "@/lib/seo";
import { ClientMessages } from "@/lib/client-messages";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Datasets.meta" });
  return pageMetadata({ locale, path: "/datasets", title: t("title"), description: t("description") });
}

export default async function DatasetsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Datasets");
  const ta = await getTranslations("Approach.ladder");
  const read = t.raw("read.items") as { name: string; body: string }[];
  const tiers = t.raw("protection.tiers") as { name: string; body: string }[];
  const rows = t.raw("coverage.rows") as { name: string; content: string; grain: string }[];

  return (
    <>
      <PageHero eyebrow={t("hero.eyebrow")} title={t("hero.title")} lede={t("hero.lede")} />

      <section id="monde" className="tone-dark section-y scroll-mt-20" aria-labelledby="world">
        <div className="wrap">
          <div className="max-w-3xl">
            <p className="eyebrow">{t("world.eyebrow")}</p>
            <h2 id="world" className="h2 mt-4">{t("world.title")}</h2>
            <p className="lede mt-6">{t("world.lede")}</p>
          </div>
          <div className="mt-12">
            <ClientMessages namespaces={["Showcase"]}>
              <Showcase data={showcase} />
            </ClientMessages>
            <ShowcaseList data={showcase} />
          </div>
        </div>
      </section>

      <section className="tone-light tone-light-2 section-y" aria-labelledby="read">
        <div className="wrap">
          <p className="eyebrow">{t("read.eyebrow")}</p>
          <h2 id="read" className="h2 mt-4 max-w-3xl">{t("read.title")}</h2>
          <ul className="mt-12 grid gap-4 md:grid-cols-3">
            {read.map((r, i) => (
              <FeatureCard key={r.name} index={i} title={r.name} body={r.body} />
            ))}
          </ul>
          <div className="mt-14">
            <p className="eyebrow mb-3">{ta("title")}</p>
            <StatusScale />
          </div>
        </div>
      </section>

      <section className="tone-dark section-y" aria-labelledby="protection">
        <div className="wrap">
          <div className="max-w-3xl">
            <p className="eyebrow">{t("protection.eyebrow")}</p>
            <h2 id="protection" className="h2 mt-4">{t("protection.title")}</h2>
            <p className="lede mt-6">{t("protection.lede")}</p>
          </div>
          <ul className="mt-12 grid gap-4 md:grid-cols-3">
            {tiers.map((tier, i) => (
              <FeatureCard key={tier.name} index={i} title={tier.name} body={tier.body} />
            ))}
          </ul>
          <p className="mt-8 max-w-3xl rounded-2xl border px-5 py-4 text-[0.92rem] leading-relaxed" style={{ borderColor: "var(--rule)", background: "var(--card)", color: "var(--fg-2)" }}>
            {t("protection.limit")}
          </p>
        </div>
      </section>

      <section className="tone-light section-y" aria-labelledby="coverage">
        <div className="wrap">
          <div className="max-w-3xl">
            <p className="eyebrow">{t("coverage.eyebrow")}</p>
            <h2 id="coverage" className="h2 mt-4">{t("coverage.title")}</h2>
            <p className="lede mt-6">{t("coverage.lede")}</p>
          </div>
          <div className="mt-12 overflow-x-auto" tabIndex={0} role="region" aria-label={t("coverage.tableLabel")}>
            <table className="w-full min-w-[40rem] border-collapse text-left">
              <thead>
                <tr className="eyebrow">
                  {(["item", "content", "grain"] as const).map((c) => (
                    <th key={c} scope="col" className="pb-3 pr-4 font-normal">{t(`coverage.columns.${c}`)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.name} className="border-t align-top" style={{ borderColor: "var(--rule)" }}>
                    <th scope="row" className="py-4 pr-4 text-[1rem] font-semibold">{r.name}</th>
                    <td className="py-4 pr-4 text-[0.95rem]">{r.content}</td>
                    <td className="py-4 text-[0.95rem]" style={{ color: "var(--fg-2)" }}>{r.grain}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-[0.88rem]" style={{ color: "var(--fg-2)" }}>{t("coverage.legendNote")}</p>
          </div>
        </div>
      </section>

      <CtaBand title={t("cta.title")} body={t("cta.body")} button={t("cta.button")} />
    </>
  );
}
