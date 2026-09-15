import { describe, expect, it } from "vitest";
import { articleSuivant, listerArticles, listerSlugs, lireArticle } from "./source";
import { LOCALES_BLOG } from "./config";

describe("liste d'articles", () => {
  it("découvre les articles depuis le dossier, sans index codé en dur", () => {
    const slugs = listerSlugs("fr");
    expect(slugs).toContain("make-or-buy-transport");
    expect(slugs).toContain("jetable-ou-durable");
  });

  it("trie du plus récent au plus ancien, `order` départageant une même date", () => {
    const articles = listerArticles("fr");

    for (let i = 1; i < articles.length; i += 1) {
      const precedent = articles[i - 1];
      const courant = articles[i];
      if (precedent.date === courant.date) {
        expect(precedent.order).toBeLessThanOrEqual(courant.order);
      } else {
        expect(precedent.date > courant.date).toBe(true);
      }
    }
  });

  it("expose les mêmes slugs dans les deux langues", () => {
    // Le sélecteur de langue du Header rejoue le chemin courant : un slug
    // présent dans une seule langue produirait un 404 au changement de langue.
    const [a, b] = LOCALES_BLOG.map((locale) => listerSlugs(locale).sort());
    expect(a).toEqual(b);
  });

  it("propose l'autre article en lecture suivante", () => {
    expect(articleSuivant("fr", "make-or-buy-transport")?.slug).toBe(
      "jetable-ou-durable",
    );
    // Le dernier de la liste revient au premier : personne ne reste sans suite.
    expect(articleSuivant("fr", "jetable-ou-durable")?.slug).toBe(
      "make-or-buy-transport",
    );
  });

  it("renvoie null sur un slug inconnu", async () => {
    expect(await lireArticle("fr", "article-qui-nexiste-pas")).toBeNull();
    expect(articleSuivant("fr", "article-qui-nexiste-pas")).toBeNull();
  });

  it("expose un front-matter complet pour chaque article des deux langues", () => {
    for (const locale of LOCALES_BLOG) {
      const articles = listerArticles(locale);
      expect(articles.length).toBeGreaterThan(0);

      for (const article of articles) {
        expect(article.title.length).toBeGreaterThan(0);
        expect(article.description.length).toBeGreaterThan(0);
        expect(article.category.length).toBeGreaterThan(0);
        expect(article.readingTime).toBeGreaterThan(0);
        expect(article.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });
});
