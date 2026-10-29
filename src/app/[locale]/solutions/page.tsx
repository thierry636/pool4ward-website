import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { PageHero } from "@/components/sections/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { CAPACITES, type AppId } from "@/content/capabilities";
import { pageMetadata } from "@/lib/seo";

const APPS: AppId[] = ["design4ward", "compute4ward", "modal4ward", "connect4ward", "carrierbridge"];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Solutions.meta" });
  return pageMetadata({ locale, path: "/solutions", title: t("title"), description: t("description") });
}

export default async function SolutionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Solutions");
  const tc = await getTranslations("Capabilities");
  const th = await getTranslations("Home.stakes");
  const ta = await getTranslations("Approach.cta");

  return (
    <>
      <PageHero eyebrow={t("hero.eyebrow")} title={t("hero.title")} lede={t("hero.lede")} />

      <section className="tone-light section-y" aria-label={tc("eyebrow")}>
        <div className="wrap">
          <ol>
            {CAPACITES.map((c, i) => (
              <li key={c.id} className="rule-top">
                <Link href={`/solutions/${c.slug}`} className="group grid gap-4 py-9 lg:grid-cols-[5rem_minmax(0,0.8fr)_minmax(0,1.2fr)_3rem] lg:items-start lg:gap-10">
                  <span className="display text-[3rem] leading-none lg:text-[3.6rem]" style={{ color: "var(--warm)" }} aria-hidden="true">0{i + 1}</span>
                  <div>
                    <h2 className="h3 !text-[clamp(1.6rem,2.6vw,2.2rem)] group-hover:underline decoration-1 underline-offset-[6px]">{tc(`${c.id}.name`)}</h2>
                    <p className="mt-3 text-[1.02rem] italic leading-snug" style={{ color: "var(--accent)" }}>{tc(`${c.id}.question`)}</p>
                  </div>
                  <p className="text-[1.02rem] leading-relaxed" style={{ color: "var(--fg-2)" }}>{tc(`${c.id}.summary`)}</p>
                  <span aria-hidden="true" className="hidden text-[1.6rem] transition-transform group-hover:translate-x-1 lg:block">→</span>
                </Link>
              </li>
            ))}
          </ol>
          <p className="display mt-12 max-w-3xl text-[clamp(1.4rem,2.4vw,2rem)]" style={{ color: "var(--accent)" }}>
            <em style={{ color: "inherit" }}>{th("closing")}</em>
          </p>
        </div>
      </section>

      <section className="tone-light tone-light-2 section-y" aria-labelledby="apps">
        <div className="wrap">
          <div className="max-w-3xl">
            <p className="eyebrow">{t("apps.eyebrow")}</p>
            <h2 id="apps" className="h2 mt-4">{t("apps.title")}</h2>
            <p className="lede mt-6">{t("apps.lede")}</p>
          </div>
          <dl className="mt-12 grid gap-x-12 md:grid-cols-2">
            {APPS.map((id) => {
              const serves = CAPACITES.filter((c) => c.apps.includes(id));
              return (
                <div key={id} className="rule-top py-7">
                  <dt className="h3">{t(`apps.items.${id}.name`)}</dt>
                  <dd className="mt-3 text-[1rem] leading-relaxed" style={{ color: "var(--fg-2)" }}>
                    {t(`apps.items.${id}.body`)}
                    {serves.length > 0 && (
                      <span className="mono mt-4 block text-[0.76rem]" style={{ color: "var(--fg)" }}>
                        {t("apps.serves")}{" "}
                        {serves.map((c, k) => (
                          <span key={c.id}>
                            {k > 0 && " · "}
                            <Link href={`/solutions/${c.slug}`} className="underline underline-offset-4">{tc(`${c.id}.name`)}</Link>
                          </span>
                        ))}
                      </span>
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </section>

      <CtaBand title={ta("title")} body={ta("body")} button={ta("button")} />
    </>
  );
}
