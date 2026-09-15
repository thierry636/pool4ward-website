/** Locales servies par le blog. Alignées sur `routing.locales`. */
export type BlogLocale = "fr" | "en";

/**
 * Front-matter d'un article. Tout est obligatoire sauf `kicker` : la
 * convention est décrite dans `src/content/blog/README.md`, et un fichier
 * incomplet fait échouer le build plutôt que d'afficher un article amputé.
 */
export interface ArticleFrontMatter {
  title: string;
  /** Surtitre facultatif, affiché au-dessus du H1 et repris dans le <title>. */
  kicker?: string;
  slug: string;
  description: string;
  /** ISO `YYYY-MM-DD`. Sert au tri et à `datePublished`. */
  date: string;
  /** En minutes. Jamais calculé — il est écrit dans le fichier. */
  readingTime: number;
  category: string;
  tags: string[];
  /** Départage deux articles publiés le même jour. Croissant. */
  order: number;
}

/** Un article prêt à afficher : front-matter + corps rendu en HTML. */
export interface Article extends ArticleFrontMatter {
  locale: BlogLocale;
  html: string;
}

/** Ce qu'il faut pour dessiner une carte d'index, sans rendre le corps. */
export type ArticleSummary = ArticleFrontMatter & { locale: BlogLocale };
