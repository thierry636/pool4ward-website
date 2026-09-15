import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

import { rendreMarkdown } from "./markdown";
import { appliquerTypographieFrancaise } from "./plugins/typographie-fr";
import type { Article, ArticleFrontMatter, ArticleSummary, BlogLocale } from "./types";

const RACINE = path.join(process.cwd(), "src", "content", "blog");

const dossier = (locale: BlogLocale) => path.join(RACINE, locale);

/**
 * La liste des articles est le contenu du dossier, rien d'autre. Déposer un
 * `.md` conforme suffit à le publier ; aucun index n'est tenu à la main.
 */
function fichiers(locale: BlogLocale): string[] {
  const chemin = dossier(locale);
  if (!fs.existsSync(chemin)) return [];

  return fs
    .readdirSync(chemin)
    .filter((nom) => nom.endsWith(".md") && !nom.startsWith("README"));
}

/**
 * Un front-matter incomplet arrête le build. C'est voulu : mieux vaut une
 * erreur au déploiement qu'un article publié sans description ni date.
 */
function lireFrontMatter(donnees: Record<string, unknown>, source: string): ArticleFrontMatter {
  const exiger = <T>(cle: string, valide: (v: unknown) => boolean): T => {
    const valeur = donnees[cle];
    if (!valide(valeur)) {
      throw new Error(
        `Article « ${source} » : champ de front-matter « ${cle} » manquant ou invalide. ` +
          `Voir src/content/blog/README.md.`,
      );
    }
    return valeur as T;
  };

  const texte = (v: unknown) => typeof v === "string" && v.trim().length > 0;

  return {
    title: exiger<string>("title", texte),
    kicker: typeof donnees.kicker === "string" ? donnees.kicker : undefined,
    slug: exiger<string>("slug", texte),
    description: exiger<string>("description", texte),
    date: normaliserDate(exiger<unknown>("date", (v) => v !== undefined), source),
    readingTime: exiger<number>("readingTime", (v) => typeof v === "number" && v > 0),
    category: exiger<string>("category", texte),
    tags: Array.isArray(donnees.tags) ? (donnees.tags as string[]) : [],
    order: typeof donnees.order === "number" ? donnees.order : Number.MAX_SAFE_INTEGER,
  };
}

/**
 * YAML transforme `date: 2026-09-15` en `Date`. On la ramène en `YYYY-MM-DD`
 * en UTC : passer par le fuseau du serveur ferait reculer la date d'un jour
 * pour tout build lancé à l'ouest de Greenwich.
 */
function normaliserDate(valeur: unknown, source: string): string {
  if (valeur instanceof Date) return valeur.toISOString().slice(0, 10);
  if (typeof valeur === "string" && /^\d{4}-\d{2}-\d{2}/.test(valeur)) {
    return valeur.slice(0, 10);
  }
  throw new Error(
    `Article « ${source} » : « date » doit être au format YYYY-MM-DD.`,
  );
}

/**
 * Le front-matter est affiché par React, pas par le pipeline markdown : ses
 * chaînes n'ont donc pas traversé la passe typographique. Un titre comme
 * « Qui a décidé d'externaliser votre transport ? » y passe ici — sans quoi le
 * point d'interrogation resterait collé dans le H1, dans le `<title>` et dans
 * la carte d'index, alors qu'il est correct dans le corps de l'article.
 *
 * Le slug et la date sont épargnés : ce sont des identifiants, pas du texte.
 */
function typographier(
  frontMatter: ArticleFrontMatter,
  locale: BlogLocale,
): ArticleFrontMatter {
  if (locale !== "fr") return frontMatter;

  const f = appliquerTypographieFrancaise;

  return {
    ...frontMatter,
    title: f(frontMatter.title),
    kicker: frontMatter.kicker ? f(frontMatter.kicker) : undefined,
    description: f(frontMatter.description),
    category: f(frontMatter.category),
  };
}

/** Le plus récent d'abord ; `order` croissant départage une même date. */
function trier(a: ArticleFrontMatter, b: ArticleFrontMatter): number {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  return a.order - b.order;
}

function lire(locale: BlogLocale, fichier: string) {
  const chemin = path.join(dossier(locale), fichier);
  const brut = fs.readFileSync(chemin, "utf8");
  const { data, content } = matter(brut);
  const frontMatter = lireFrontMatter(
    data as Record<string, unknown>,
    `${locale}/${fichier}`,
  );

  return { frontMatter: typographier(frontMatter, locale), corps: content };
}

/** Les articles d'une locale, triés, sans rendre le corps. */
export function listerArticles(locale: BlogLocale): ArticleSummary[] {
  return fichiers(locale)
    .map((fichier) => ({ ...lire(locale, fichier).frontMatter, locale }))
    .sort(trier);
}

/** Tous les slugs d'une locale — alimente `generateStaticParams`. */
export function listerSlugs(locale: BlogLocale): string[] {
  return listerArticles(locale).map((article) => article.slug);
}

/** Un article complet, corps rendu. `null` si le slug n'existe pas. */
export async function lireArticle(
  locale: BlogLocale,
  slug: string,
): Promise<Article | null> {
  const trouve = fichiers(locale)
    .map((fichier) => lire(locale, fichier))
    .find((entree) => entree.frontMatter.slug === slug);

  if (!trouve) return null;

  return {
    ...trouve.frontMatter,
    locale,
    html: await rendreMarkdown(trouve.corps, locale),
  };
}

/**
 * L'article à proposer en « Lire aussi ». Le suivant dans l'ordre de la liste,
 * en revenant au premier pour le dernier article : avec deux articles chacun
 * pointe vers l'autre, et avec trente personne ne se retrouve sans suite.
 */
export function articleSuivant(
  locale: BlogLocale,
  slug: string,
): ArticleSummary | null {
  const articles = listerArticles(locale);
  if (articles.length < 2) return null;

  const index = articles.findIndex((article) => article.slug === slug);
  if (index === -1) return null;

  return articles[(index + 1) % articles.length];
}
