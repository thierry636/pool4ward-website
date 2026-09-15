import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";

import { JsonLd } from "@/components/blog/JsonLd";
import { listerArticles } from "@/lib/blog/source";
import type { BlogLocale } from "@/lib/blog/types";
import {
  BLOG_MASQUE,
  URL_SITE,
  cheminArticle,
  cheminIndex,
} from "@/lib/blog/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Blog" });

  return {
    metadataBase: new URL(URL_SITE),
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: cheminIndex(locale),
      languages: { fr: cheminIndex("fr"), en: cheminIndex("en") },
    },
    // Le blog n'est pas encore annoncé : il répond, il ne se référence pas.
    robots: BLOG_MASQUE ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "website",
      siteName: "Pool4ward",
      locale,
      url: cheminIndex(locale),
      title: t("metaTitle"),
      description: t("metaDescription"),
    },
    twitter: {
      card: "summary",
      title: t("metaTitle"),
      description: t("metaDescription"),
    },
  };
}

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Blog" });
  const articles = listerArticles(locale as BlogLocale);

  const donnees = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: t("indexTitle"),
    description: t("metaDescription"),
    url: `${URL_SITE}${cheminIndex(locale)}`,
    inLanguage: locale,
    publisher: { "@type": "Organization", name: "Pool4ward", url: URL_SITE },
    blogPost: articles.map((article) => ({
      "@type": "BlogPosting",
      headline: article.title,
      description: article.description,
      datePublished: article.date,
      url: `${URL_SITE}${cheminArticle(locale, article.slug)}`,
    })),
  };

  return (
    <div className="p4w-page">
      <JsonLd data={donnees} />

      <header className="p4w-wrap p4w-index-head">
        <h1 className="p4w-index-title">{t("indexTitle")}</h1>
        <p className="p4w-index-lede">{t("indexLede")}</p>
      </header>

      <div className="p4w-wrap p4w-list">
        {articles.length === 0 ? (
          <p className="p4w-empty">{t("empty")}</p>
        ) : (
          articles.map((article) => (
            <article key={article.slug}>
              <Link
                href={`/blog/${article.slug}` as "/"}
                className="p4w-card"
              >
                <p className="p4w-meta">{article.category}</p>
                <h2 className="p4w-card-title">{article.title}</h2>
                <p className="p4w-card-desc">{article.description}</p>
                <p className="p4w-meta">
                  {t("readingTime", { minutes: article.readingTime })}
                </p>
              </Link>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
