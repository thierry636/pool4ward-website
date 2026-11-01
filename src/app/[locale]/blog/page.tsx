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
    // `absolute` : « — Pool4ward » est déjà dans le message, et le layout racine
    // ajouterait « · Pool4ward » une seconde fois.
    title: { absolute: t("metaTitle") },
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
      ...(article.image ? { image: `${URL_SITE}${article.image}` } : {}),
    })),
  };

  return (
    <div className="p4w-page">
      <JsonLd data={donnees} />

      <header className="p4w-hero">
        <h1 className="p4w-hero-title">{t("heroTitle")}</h1>
        <p className="p4w-hero-sub">{t("heroSubtitle")}</p>
        <div className="p4w-hero-art">
          {/* Plein cadre dès le premier rendu : c'est l'image qui porte la page,
              donc chargée en priorité, et ses dimensions réservent la place.
              Déjà optimisée en WebP : pas besoin du composant d'image de Next. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/blog/hero-boite-de-chocolats.webp"
            alt={t("heroAlt")}
            width={1942}
            height={809}
            decoding="async"
            fetchPriority="high"
          />
        </div>
      </header>

      <section className="p4w-journal" aria-labelledby="blog-eclairages">
        <div className="p4w-section-head">
          <h2 id="blog-eclairages" className="p4w-section-title">
            <span>{t("sectionTitle")}</span>
          </h2>
          <span className="p4w-section-bar" aria-hidden="true" />
        </div>

        {articles.length === 0 ? (
          <p className="p4w-empty">{t("empty")}</p>
        ) : (
          <ul className="p4w-rows">
            {articles.map((article, index) => (
              <li
                key={article.slug}
                className={article.image ? "p4w-row" : "p4w-row p4w-row--text"}
              >
                {article.image && (
                  <div className="p4w-row-art">
                    {/* Décorative : le titre du lien dit déjà de quoi parle la
                        carte. Le texte alternatif est sur la page de l'article. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={article.image}
                      alt=""
                      width={1280}
                      height={720}
                      loading={index < 2 ? "eager" : "lazy"}
                      decoding="async"
                    />
                  </div>
                )}

                <div className="p4w-row-body">
                  <p className="p4w-label">{article.category}</p>
                  <h3 className="p4w-row-title">
                    {/* Le lien porte le titre ; sa pastille ::after recouvre la
                        carte entière, qui devient cliquable sans que le lecteur
                        d'écran n'annonce tout le texte comme un seul lien. */}
                    <Link
                      href={`/blog/${article.slug}` as "/"}
                      className="p4w-row-link"
                    >
                      {article.title}
                    </Link>
                  </h3>
                  <p className="p4w-row-desc">{article.description}</p>
                  <p className="p4w-more" aria-hidden="true">
                    {t("readArticle")}
                    <span className="p4w-more-arrow">→</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
