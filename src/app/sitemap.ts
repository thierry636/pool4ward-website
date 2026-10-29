import type { MetadataRoute } from "next";
import { CAPACITES } from "@/content/capabilities";
import { listerArticles } from "@/lib/blog/source";
import { LOCALES, URL_SITE } from "@/lib/site";

/**
 * Pages publiques éditoriales uniquement. Aucune URL d'API, aucune page
 * générée depuis les référentiels : le plan du site ne peut donc rien
 * divulguer d'eux.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/approach", "/solutions", "/datasets", "/blog", "/company", "/contact"];
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    for (const p of pages) {
      entries.push({ url: `${URL_SITE}/${locale}${p}`, changeFrequency: "monthly" });
    }
    for (const c of CAPACITES) {
      entries.push({ url: `${URL_SITE}/${locale}/solutions/${c.slug}`, changeFrequency: "monthly" });
    }
    for (const a of listerArticles(locale)) {
      entries.push({ url: `${URL_SITE}/${locale}/blog/${a.slug}`, lastModified: a.date });
    }
  }
  return entries;
}
