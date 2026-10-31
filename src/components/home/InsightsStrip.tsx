import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Icon } from "@/components/ui/Icon";
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
          <Link href="/blog" className="btn btn-line self-start sm:self-auto">
            {t("all")} <Icon name="arrow" size={17} />
          </Link>
        </div>

        <ul className="mt-10 grid gap-6 md:grid-cols-2">
          {articles.map((a, i) => (
            <li key={a.slug} data-reveal style={{ ["--i" as string]: i }}>
              <Link href={`/blog/${a.slug}` as "/"} className="card card-lift group flex h-full flex-col p-6 sm:p-8">
                <span className="tile-icon">
                  <Icon name="book" />
                </span>
                <p className="pill mt-6">{a.category}</p>
                <h3 className="mt-4 text-[clamp(1.25rem,2.2vw,1.65rem)] font-bold leading-tight tracking-tight">{a.title}</h3>
                <p className="mt-3 max-w-xl text-[0.96rem] leading-relaxed" style={{ color: "var(--fg-2)" }}>{a.description}</p>
                <p className="mt-auto flex items-center justify-between pt-6 text-[0.85rem] font-medium" style={{ color: "var(--fg-2)" }}>
                  <span>{tb("readingTime", { minutes: a.readingTime })}</span>
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-1" style={{ color: "var(--accent)" }}>
                    <Icon name="arrow" size={20} />
                  </span>
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
