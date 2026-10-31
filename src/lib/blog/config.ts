/**
 * Version 2 : le blog devient la rubrique « Analyses » de la navigation
 * principale, donc il n'est plus masqué. L'indexation, elle, dépend de
 * l'environnement de déploiement (`INDEXABLE`, voir `src/lib/site.ts`) : une
 * préproduction reste hors des moteurs de recherche.
 */
export const BLOG_MASQUE = false;

/**
 * Les CTA des articles écrivent `/contact` dans le markdown ; c'est ici que
 * l'adresse réelle est décidée. La version 2 a une vraie page de contact.
 */
export const CHEMIN_CONTACT = "/contact";

/** Le blog est servi dans les deux langues du site. */
export const LOCALES_BLOG = ["fr", "en"] as const;

export { URL_SITE } from "@/lib/site";

/** Chemin d'un article, et de l'index, dans une locale donnée. */
export const cheminIndex = (locale: string) => `/${locale}/blog`;
export const cheminArticle = (locale: string, slug: string) =>
  `/${locale}/blog/${slug}`;
