import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { listerArticles } from "@/lib/blog/source";
import type { BlogLocale } from "@/lib/blog/types";

/** Les analyses : la matière de fond du site, lue depuis les fichiers du blog. */
export async function InsightsStrip() {
  const locale = (await getLocale()) as BlogLocale;
  const t = await getTranslations("Home.insights");
  const tb = await getTranslations("Blog");
  const articles = listerArticles(locale).slice(0, 2);
  if (articles.length === 0) return null;

  return (
    <section className="tone-light section-y" aria-labelledby="insights-title">
      <div className="wrap">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">{t("eyebrow")}</p>
            <h2 id="insights-title" className="h2 mt-4">{t("title")}</h2>
          </div>
          <Link href="/blog" className="mono inline-flex min-h-[2.75rem] items-center text-[0.8rem] uppercase tracking-[0.1em] underline underline-offset-[6px]">
            {t("all")} →
          </Link>
        </div>

        <ul className="mt-12 grid gap-x-12 md:grid-cols-2">
          {articles.map((a) => (
            <li key={a.slug} className="rule-top">
              <Link href={`/blog/${a.slug}` as "/"} className="group block py-7">
                <p className="eyebrow">{a.category}</p>
                <h3 className="h3 mt-3 !text-[clamp(1.4rem,2.4vw,1.9rem)] group-hover:underline decoration-1 underline-offset-[6px]">{a.title}</h3>
                <p className="mt-3 max-w-xl text-[0.98rem] leading-relaxed" style={{ color: "var(--fg-2)" }}>{a.description}</p>
                <p className="mono mt-4 text-[0.76rem]" style={{ color: "var(--fg-2)" }}>
                  {tb("readingTime", { minutes: a.readingTime })}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
