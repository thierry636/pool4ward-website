import type { MetadataRoute } from "next";
import { INDEXABLE, URL_SITE } from "@/lib/site";

/**
 * Une préproduction n'est pas indexable : `robots.txt` le dit, et les pages
 * portent aussi `noindex` (voir le layout). `robots.txt` n'est pas un contrôle
 * d'accès — il ne protège aucune donnée ; les référentiels ne sont de toute
 * façon jamais servis par une page.
 */
export default function robots(): MetadataRoute.Robots {
  if (!INDEXABLE) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: `${URL_SITE}/sitemap.xml`,
  };
}
