import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, routing } from "@/i18n/routing";
import { PageHero } from "@/components/sections/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { Icon } from "@/components/ui/Icon";
import { CAPACITES, capaciteParSlug } from "@/content/capabilities";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => CAPACITES.map((c) => ({ locale, slug: c.slug })));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const c = capaciteParSlug(slug);
  if (!c) return {};
  const t = await getTranslations({ locale, namespace: "Capabilities" });
  return pageMetadata({ locale, path: `/solutions/${slug}`, title: t(`${c.id}.name`), description: t(`${c.id}.summary`) });
}

export default async function SolutionPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const c = capaciteParSlug(slug);
  if (!c) notFound();

  const t = await getTranslations("Capabilities");
  const ts = await getTranslations("Solutions");
  const i = CAPACITES.findIndex((x) => x.id === c.id);
  const prev = CAPACITES[i - 1];
  const next = CAPACITES[i + 1];
  const verbs = t.raw(`${c.id}.verbs`) as string[];
  const covers = t.raw(`${c.id}.covers`) as string[];

  return (
    <>
      <PageHero eyebrow={`${i + 1} / ${CAPACITES.length} · ${t("eyebrow")}`} title={t(`${c.id}.name`)} lede={t(`${c.id}.summary`)}>
        <ul className="mt-8 flex flex-wrap gap-2">
          {verbs.map((v) => (
            <li key={v} className="pill">
              {v}
            </li>
          ))}
        </ul>
      </PageHero>

      <section className="tone-light section-y" aria-labelledby="decision">
        <div className="wrap grid gap-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
          <div>
            <p className="eyebrow">{ts("detail.decision")}</p>
            <h2 id="decision" className="display mt-4 text-[clamp(1.8rem,3.4vw,2.9rem)]">{t(`${c.id}.question`)}</h2>
          </div>
          <div>
            <p className="eyebrow">{t("covers")}</p>
            <ul className="mt-5 space-y-3">
              {covers.map((line, k) => (
                <li key={line} data-reveal className="card flex gap-4 p-5" style={{ ["--i" as string]: k % 3 }}>
                  <span className="tile-icon !h-9 !w-9 !rounded-[0.65rem]">
                    <Icon name="check" size={18} />
                  </span>
                  <span className="text-[1rem] leading-relaxed">{line}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 rounded-2xl border px-5 py-4 text-[0.9rem] leading-relaxed" style={{ borderColor: "var(--rule)", background: "var(--bg-2)", color: "var(--fg-2)" }}>
              {t(`${c.id}.scope`)}
            </p>

            {c.apps.length > 0 && (
              <div className="mt-10">
                <p className="eyebrow">{t("apps")}</p>
                <ul className="mt-4 flex flex-wrap gap-3">
                  {c.apps.map((a) => (
                    <li key={a} className="card px-4 py-2 text-[0.95rem] font-semibold">
                      {ts(`apps.items.${a}.name`)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="tone-light tone-light-2 py-14" aria-label={ts("detail.continuity")}>
        <div className="wrap">
          <p className="eyebrow">{ts("detail.continuity")}</p>
          <ol className="mt-5 grid grid-cols-5 gap-1.5">
            {CAPACITES.map((x, k) => (
              <li key={x.id}>
                <span aria-hidden="true" className="block h-1.5 rounded-full" style={{ background: k === i ? "linear-gradient(90deg, #4263eb, #2dd4bf)" : "var(--rule-strong)" }} />
                <Link
                  href={`/solutions/${x.slug}`}
                  aria-current={k === i ? "page" : undefined}
                  className="mt-2 block text-[0.7rem] font-medium leading-tight sm:text-[0.82rem]"
                  style={{ color: k === i ? "var(--fg)" : "var(--fg-2)", fontWeight: k === i ? 700 : 400 }}
                >
                  <span aria-hidden="true" className="sm:hidden">{k + 1}</span>
                  <span className="sr-only sm:not-sr-only">
                    <span className="hidden sm:inline">{k + 1} · </span>
                    {t(`${x.id}.name`)}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="eyebrow">{ts("detail.previous")}</p>
              {prev ? (
                <Link href={`/solutions/${prev.slug}`} className="card card-lift mt-2 block px-5 py-4 text-[1.1rem] font-bold tracking-tight">← {t(`${prev.id}.name`)}</Link>
              ) : (
                <p className="mt-2 text-[0.95rem]" style={{ color: "var(--fg-2)" }}>{ts("detail.first")}</p>
              )}
            </div>
            <div className="sm:text-right">
              <p className="eyebrow">{ts("detail.next")}</p>
              {next ? (
                <Link href={`/solutions/${next.slug}`} className="card card-lift mt-2 block px-5 py-4 text-[1.1rem] font-bold tracking-tight">{t(`${next.id}.name`)} →</Link>
              ) : (
                <p className="mt-2 text-[0.95rem]" style={{ color: "var(--fg-2)" }}>{ts("detail.last")}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <CtaBand title={ts("detail.cta")} body={t(`${c.id}.question`)} button={ts("detail.cta")} />
    </>
  );
}
