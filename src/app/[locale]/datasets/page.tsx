import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/sections/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { GlobeEmbed } from "@/components/globe/GlobeEmbed";
import { StatusScale } from "@/components/sections/StatusScale";
import { buildManifest } from "@/server/projection/manifest";
import { getSource } from "@/server/projection/source";
import { pageMetadata } from "@/lib/seo";
import { ClientMessages } from "@/lib/client-messages";

/** Le tableau de couverture reflète la source active : on le rafraîchit toutes les cinq minutes. */
export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Datasets.meta" });
  return pageMetadata({ locale, path: "/datasets", title: t("title"), description: t("description") });
}

export default async function DatasetsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Datasets");
  const tg = await getTranslations("Globe");
  const ta = await getTranslations("Approach.ladder");
  const read = t.raw("read.items") as { name: string; body: string }[];
  const tiers = t.raw("protection.tiers") as { name: string; body: string }[];
  // Le manifeste est calculé côté serveur : il ne contient aucune donnée.
  const manifest = buildManifest(getSource());

  return (
    <>
      <PageHero eyebrow={t("hero.eyebrow")} title={t("hero.title")} lede={t("hero.lede")} />

      <section className="tone-light section-y" aria-labelledby="explore">
        <div className="wrap">
          <div className="max-w-3xl">
            <p className="eyebrow">{t("explore.eyebrow")}</p>
            <h2 id="explore" className="h2 mt-4">{t("explore.title")}</h2>
            <p className="lede mt-6">{t("explore.lede")}</p>
          </div>
          <div className="mt-12">
            <ClientMessages namespaces={["Globe"]}>
              <GlobeEmbed />
            </ClientMessages>
          </div>
        </div>
      </section>

      <section className="tone-light tone-light-2 section-y" aria-labelledby="read">
        <div className="wrap">
          <p className="eyebrow">{t("read.eyebrow")}</p>
          <h2 id="read" className="h2 mt-4 max-w-3xl">{t("read.title")}</h2>
          <ol className="mt-12 grid gap-x-12 md:grid-cols-3">
            {read.map((r, i) => (
              <li key={r.name} className="rule-top py-7">
                <span className="mono text-[0.72rem]" style={{ color: "var(--warm)" }}>0{i + 1}</span>
                <p className="h3 mt-2">{r.name}</p>
                <p className="mt-3 text-[1rem] leading-relaxed" style={{ color: "var(--fg-2)" }}>{r.body}</p>
              </li>
            ))}
          </ol>
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
          <ol className="mt-12 grid gap-x-12 md:grid-cols-3">
            {tiers.map((tier, i) => (
              <li key={tier.name} className="rule-top py-7">
                <span className="mono text-[0.72rem]" style={{ color: "var(--warm)" }}>0{i + 1}</span>
                <p className="h3 mt-2">{tier.name}</p>
                <p className="mt-3 text-[1rem] leading-relaxed" style={{ color: "var(--fg-2)" }}>{tier.body}</p>
              </li>
            ))}
          </ol>
          <p className="mono mt-10 max-w-3xl border-l-2 pl-4 text-[0.84rem] leading-relaxed" style={{ borderColor: "var(--warm)", color: "var(--fg-2)" }}>
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
                  {(["layer", "nature", "status", "grain", "zoom"] as const).map((c) => (
                    <th key={c} scope="col" className="pb-3 pr-4 font-normal">{t(`coverage.columns.${c}`)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {manifest.layers.map((l) => (
                  <tr key={l.id} className="border-t align-top" style={{ borderColor: "var(--rule)" }}>
                    <th scope="row" className="py-4 pr-4 text-[1rem] font-semibold">
                      {tg(`layers.${l.id}.name`)}
                      <span className="mt-1 block text-[0.86rem] font-normal leading-snug" style={{ color: "var(--fg-2)" }}>{tg(`layers.${l.id}.body`)}</span>
                    </th>
                    <td className="py-4 pr-4 text-[0.95rem]">{tg(`kind.${l.kind}`)}</td>
                    <td className="py-4 pr-4">
                      <span
                        className="mono inline-block border px-2 py-0.5 text-[0.7rem] uppercase tracking-[0.06em]"
                        style={{ borderColor: l.availability === "unavailable" ? "var(--rule-strong)" : "var(--accent)", color: l.availability === "unavailable" ? "var(--fg-2)" : "var(--accent)" }}
                      >
                        {tg(`availability.${l.availability}`)}
                      </span>
                    </td>
                    <td className="mono py-4 pr-4 text-[0.88rem]">{l.availability === "unavailable" ? "—" : t("coverage.grain", { deg: l.cellDeg })}</td>
                    <td className="mono py-4 text-[0.88rem]">{l.availability === "unavailable" ? "—" : l.maxZoom}</td>
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
