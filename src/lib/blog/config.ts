/**
 * Le blog est en ligne mais pas encore annoncé : les pages répondent à qui
 * connaît l'URL — pour relire et faire circuler en interne — mais elles ne
 * sont ni indexées, ni liées depuis l'en-tête ou le pied de page.
 *
 * Publier le blog, c'est passer ce booléen à `false`. Rien d'autre.
 */
export const BLOG_MASQUE = true;

/**
 * Le site n'a pas de page `/contact` : le formulaire vit dans la section
 * `#contact` de la page Company, où pointent déjà l'en-tête, le pied de page,
 * `CTABand` et les deux sorties du diagnostic. Les CTA des articles écrivent
 * `/contact` dans le markdown ; c'est ici que l'adresse réelle est décidée.
 */
export const CHEMIN_CONTACT = "/company#contact";

/** Le blog est servi dans les deux langues du site. */
export const LOCALES_BLOG = ["fr", "en"] as const;

/**
 * Racine des URL absolues — canoniques, Open Graph, JSON-LD. Le site n'avait
 * pas besoin de la connaître jusqu'ici : aucune page ne déclarait d'URL
 * absolue. Surchargeable par `NEXT_PUBLIC_SITE_URL` pour les préproductions.
 */
export const URL_SITE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://pool4ward.com";

/** Chemin d'un article, et de l'index, dans une locale donnée. */
export const cheminIndex = (locale: string) => `/${locale}/blog`;
export const cheminArticle = (locale: string, slug: string) =>
  `/${locale}/blog/${slug}`;
