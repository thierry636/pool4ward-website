import type { Metadata } from "next";
import { URL_SITE } from "./site";

/** Image de partage par défaut. Next remplace `openGraph` en bloc d'un segment à l'autre :
 * sans elle ici, les pages intérieures perdraient l'image du layout. */
export const IMAGE_PARTAGE = { url: "/og/pool4ward.png", width: 1200, height: 630 };

/**
 * Métadonnées d'une page éditoriale : canonique, alternates de langue, Open
 * Graph. `path` est le chemin sans préfixe de langue ("/approach").
 */
export function pageMetadata({
  locale,
  path,
  title,
  description,
}: {
  locale: string;
  path: string;
  title: string;
  description: string;
}): Metadata {
  const suffix = path === "/" ? "" : path;
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}${suffix}`,
      languages: { fr: `/fr${suffix}`, en: `/en${suffix}`, "x-default": `/en${suffix}` },
    },
    openGraph: {
      type: "website",
      siteName: "Pool4ward",
      title,
      description,
      url: `${URL_SITE}/${locale}${suffix}`,
      locale: locale === "fr" ? "fr_FR" : "en_GB",
      images: [IMAGE_PARTAGE],
    },
  };
}
