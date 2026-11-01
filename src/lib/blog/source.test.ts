import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { articleSuivant, listerArticles, listerSlugs, lireArticle } from "./source";
import { LOCALES_BLOG } from "./config";

/** Les cinq articles publiés le 28 octobre 2026, avec leur illustration. */
const ILLUSTRES = [
  "boucles-et-mutualisation",
  "reduire-la-dependance-au-diesel",
  "electrification-make-or-buy",
  "trouver-les-bons-transporteurs",
  "prioriser-les-actions-achats-transport",
];

describe("liste d'articles", () => {
  it("découvre les articles depuis le dossier, sans index codé en dur", () => {
    const slugs = listerSlugs("fr");
    expect(slugs).toContain("make-or-buy-transport");
    expect(slugs).toContain("jetable-ou-durable");
    for (const slug of ILLUSTRES) expect(slugs).toContain(slug);
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

  it("propose en lecture suivante l'article qui suit dans la liste", () => {
    const articles = listerArticles("fr");

    articles.forEach((article, index) => {
      // Le dernier de la liste revient au premier : personne ne reste sans suite.
      const attendu = articles[(index + 1) % articles.length];
      expect(articleSuivant("fr", article.slug)?.slug).toBe(attendu.slug);
    });
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

  it("range les articles illustrés du 28 octobre dans l'ordre de la maquette", () => {
    const slugs = listerSlugs("fr").slice(0, ILLUSTRES.length);
    expect(slugs).toEqual(ILLUSTRES);
  });
});

describe("illustrations", () => {
  const racine = path.join(process.cwd(), "public");

  it("chaque article illustré pointe vers un fichier qui existe, avec son texte alternatif", () => {
    for (const locale of LOCALES_BLOG) {
      for (const slug of ILLUSTRES) {
        const article = listerArticles(locale).find((a) => a.slug === slug);
        expect(article?.image, `${locale}/${slug}`).toBeDefined();
        expect(fs.existsSync(path.join(racine, article!.image!)), `${locale}/${slug} : ${article!.image}`).toBe(true);
        expect(article!.imageAlt?.length ?? 0, `${locale}/${slug} : imageAlt`).toBeGreaterThan(10);
      }
    }
  });

  it("utilise la même illustration dans les deux langues, avec un alt traduit", () => {
    for (const slug of ILLUSTRES) {
      const fr = listerArticles("fr").find((a) => a.slug === slug)!;
      const en = listerArticles("en").find((a) => a.slug === slug)!;
      expect(en.image).toBe(fr.image);
      expect(en.imageAlt).not.toBe(fr.imageAlt);
    }
  });

  it("n'a aucune image référencée qui manque, même sur les anciens articles", () => {
    for (const locale of LOCALES_BLOG) {
      for (const article of listerArticles(locale)) {
        if (!article.image) continue;
        expect(fs.existsSync(path.join(racine, article.image)), `${locale}/${article.slug}`).toBe(true);
      }
    }
  });

  it("le panorama de l'index existe", () => {
    expect(fs.existsSync(path.join(racine, "images", "blog", "hero-boite-de-chocolats.webp"))).toBe(true);
  });
});

describe("rendu d'un article illustré", () => {
  it("rend les puces en liste et garde les gras du texte d'origine", async () => {
    const article = await lireArticle("fr", "boucles-et-mutualisation");
    expect(article).not.toBeNull();
    expect(article!.html).toContain("<ul>");
    expect(article!.html.match(/<li>/g)?.length).toBe(4);
    expect(article!.html).toContain(
      "<strong>Trouver deux trajets complémentaires ne suffit pas à construire une boucle qui tient toute l'année.</strong>",
    );
  });

  it("préfixe de la locale le lien vers l'article make or buy existant", async () => {
    const fr = await lireArticle("fr", "electrification-make-or-buy");
    const en = await lireArticle("en", "electrification-make-or-buy");
    expect(fr!.html).toContain('href="/fr/blog/make-or-buy-transport"');
    expect(en!.html).toContain('href="/en/blog/make-or-buy-transport"');
  });

  it("applique la typographie française au front-matter, pas au slug", () => {
    const article = listerArticles("fr").find((a) => a.slug === "boucles-et-mutualisation")!;
    expect(article.title).toBe("Le fret aussi a son Looper\u00A0: Pool4ward.");
    expect(article.slug).toBe("boucles-et-mutualisation");
  });
});
