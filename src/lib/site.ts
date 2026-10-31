/**
 * Constantes du site public. Tout ce qui dépend de l'environnement de
 * déploiement passe par ici, pour qu'une préproduction ne puisse pas se
 * prendre pour la production.
 */

/** Racine des URL absolues — canoniques, Open Graph, JSON-LD, sitemap. */
export const URL_SITE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://pool4ward.com";

/**
 * Contexte de déploiement. Netlify pose `CONTEXT` (production, deploy-preview,
 * branch-deploy, dev) au build ; `NEXT_PUBLIC_SITE_ENV` permet de forcer la
 * valeur ailleurs. Seul `production` est indexable : la version 2 reste hors
 * des moteurs de recherche tant que la mise en ligne n'est pas décidée.
 */
const CONTEXTE = process.env.NEXT_PUBLIC_SITE_ENV ?? process.env.CONTEXT ?? "preview";
export const EST_PRODUCTION = CONTEXTE === "production";
export const INDEXABLE = EST_PRODUCTION;

/**
 * Portail applicatif (accès clients). L'URL exacte n'est pas dans ce dépôt :
 * elle se règle par variable d'environnement. Tant qu'elle n'est pas fournie,
 * le lien pointe vers la valeur par défaut ci-dessous — à confirmer avant la
 * mise en ligne (voir docs/version2/INTEGRATIONS.md).
 */
export const PORTAL_URL =
  process.env.NEXT_PUBLIC_PORTAL_URL ?? "https://app.pool4ward.com";

export const LOCALES = ["fr", "en"] as const;
export type SiteLocale = (typeof LOCALES)[number];

export const estLocale = (valeur: string): valeur is SiteLocale =>
  (LOCALES as readonly string[]).includes(valeur);
