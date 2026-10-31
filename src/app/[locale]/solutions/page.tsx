import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { PageHero } from "@/components/sections/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { Icon } from "@/components/ui/Icon";
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
          <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {CAPACITES.map((c, i) => (
              <li key={c.id} data-reveal style={{ ["--i" as string]: i % 3 }}>
                <Link href={`/solutions/${c.slug}`} className="card card-lift group flex h-full flex-col p-6 sm:p-7">
                  <span className="flex items-center justify-between">
                    <span className="tile-icon">
                      <Icon name={c.id} />
                    </span>
                    <span className="pill" aria-hidden="true">{i + 1} / {CAPACITES.length}</span>
                  </span>
                  <h2 className="mt-5 text-[1.3rem] font-bold tracking-tight">{tc(`${c.id}.name`)}</h2>
                  <p className="mt-2 text-[0.95rem] font-medium leading-snug" style={{ color: "var(--accent)" }}>{tc(`${c.id}.question`)}</p>
                  <p className="mt-3 text-[0.94rem] leading-relaxed" style={{ color: "var(--fg-2)" }}>{tc(`${c.id}.summary`)}</p>
                  <span aria-hidden="true" className="mt-auto flex justify-end pt-5 transition-transform group-hover:translate-x-1" style={{ color: "var(--accent)" }}>
                    <Icon name="arrow" size={22} />
                  </span>
                </Link>
              </li>
            ))}
            <li data-reveal className="flex items-center rounded-2xl p-6 sm:p-7" style={{ background: "linear-gradient(135deg, #0b1224, #0f1f4d)", ["--i" as string]: 2 }}>
              <p className="display text-gradient text-[clamp(1.35rem,2vw,1.7rem)]">{th("closing")}</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="tone-light tone-light-2 section-y" aria-labelledby="apps">
        <div className="wrap">
          <div className="max-w-3xl">
            <p className="eyebrow">{t("apps.eyebrow")}</p>
            <h2 id="apps" className="h2 mt-4">{t("apps.title")}</h2>
            <p className="lede mt-6">{t("apps.lede")}</p>
          </div>
          <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {APPS.map((id, i) => {
              const serves = CAPACITES.filter((c) => c.apps.includes(id));
              return (
                <FeatureCard key={id} index={i} title={t(`apps.items.${id}.name`)} body={t(`apps.items.${id}.body`)}>
                  {serves.length > 0 && (
                    <p className="mt-4 flex flex-wrap items-center gap-2 text-[0.82rem]" style={{ color: "var(--fg-2)" }}>
                      <span>{t("apps.serves")}</span>
                      {serves.map((c) => (
                        <Link key={c.id} href={`/solutions/${c.slug}`} className="pill hover:opacity-80">
                          {tc(`${c.id}.name`)}
                        </Link>
                      ))}
                    </p>
                  )}
                </FeatureCard>
              );
            })}
          </ul>
        </div>
      </section>

      <CtaBand title={ta("title")} body={ta("body")} button={ta("button")} />
    </>
  );
}
