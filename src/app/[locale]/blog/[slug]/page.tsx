import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";

import { JsonLd } from "@/components/blog/JsonLd";
import { articleSuivant, lireArticle, listerSlugs } from "@/lib/blog/source";
import type { BlogLocale } from "@/lib/blog/types";
import {
  BLOG_MASQUE,
  LOCALES_BLOG,
  URL_SITE,
  cheminArticle,
} from "@/lib/blog/config";

/**
 * Les quatre pages d'article — deux articles, deux langues — sont prérendues
 * au build. Next accepte que le segment le plus profond déclare aussi les
 * paramètres de ses parents.
 */
export function generateStaticParams() {
  return LOCALES_BLOG.flatMap((locale) =>
    listerSlugs(locale).map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await lireArticle(locale as BlogLocale, slug);

  if (!article) return {};

  const url = cheminArticle(locale, slug);

  return {
    metadataBase: new URL(URL_SITE),
    // Le surtitre nomme le sujet, le titre pose la question. C'est le sujet
    // qui part dans l'onglet et dans les résultats de recherche ; la question
    // reste au H1 et dans le partage social, où elle fait son travail.
    title: `${article.kicker ?? article.title} — Pool4ward`,
    description: article.description,
    keywords: article.tags,
    alternates: {
      canonical: url,
      languages: {
        fr: cheminArticle("fr", slug),
        en: cheminArticle("en", slug),
      },
    },
    robots: BLOG_MASQUE ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "article",
      siteName: "Pool4ward",
      locale,
      url,
      title: article.title,
      description: article.description,
      publishedTime: article.date,
      section: article.category,
      tags: article.tags,
    },
    twitter: {
      card: "summary",
      title: article.title,
      description: article.description,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const article = await lireArticle(locale as BlogLocale, slug);

  if (!article) notFound();

  const t = await getTranslations({ locale, namespace: "Blog" });
  const suivant = articleSuivant(locale as BlogLocale, slug);

  const donnees = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    dateModified: article.date,
    inLanguage: locale,
    articleSection: article.category,
    keywords: article.tags.join(", "),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${URL_SITE}${cheminArticle(locale, slug)}`,
    },
    author: { "@type": "Organization", name: "Pool4ward", url: URL_SITE },
    publisher: {
      "@type": "Organization",
      name: "Pool4ward",
      url: URL_SITE,
      logo: {
        "@type": "ImageObject",
        url: `${URL_SITE}/images/brand/logo-full.svg`,
      },
    },
  };

  return (
    <div className="p4w-page">
      <JsonLd data={donnees} />

      <header className="p4w-wrap p4w-article-head">
        <Link href={"/blog" as "/"} className="p4w-back">
          ← {t("backToIndex")}
        </Link>

        <p className="p4w-meta">
          {article.category}
          <span className="p4w-dot" aria-hidden="true">
            ·
          </span>
          {t("readingTime", { minutes: article.readingTime })}
        </p>

        {article.kicker && (
          <span className="p4w-kicker">{article.kicker}</span>
        )}

        <h1 className="p4w-title">{article.title}</h1>
      </header>

      <div className="p4w-wrap">
        {/* Le corps est rendu au build par le pipeline markdown : du HTML issu
            des fichiers du repo, pas d'une saisie extérieure. */}
        <div
          className="p4w-prose"
          dangerouslySetInnerHTML={{ __html: article.html }}
        />

        {suivant && (
          <section className="p4w-next">
            <p className="p4w-next-label">{t("readNext")}</p>
            <Link
              href={`/blog/${suivant.slug}` as "/"}
              className="p4w-next-link"
            >
              <p className="p4w-meta">
                {suivant.category}
                <span className="p4w-dot" aria-hidden="true">
                  ·
                </span>
                {t("readingTime", { minutes: suivant.readingTime })}
              </p>
              <h2 className="p4w-next-title">{suivant.title}</h2>
              <p className="p4w-next-desc">{suivant.description}</p>
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}
