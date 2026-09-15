import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

import { rendreMarkdown } from "./markdown";
import { lireArticle } from "./source";
import { LOCALES_BLOG } from "./config";
import { appliquerTypographieFrancaise } from "./plugins/typographie-fr";

const lireSource = (locale: string, nom: string) =>
  fs.readFileSync(
    path.join(process.cwd(), "src", "content", "blog", locale, `${nom}.md`),
    "utf8",
  );

describe("blocs éditoriaux", () => {
  it("rend les six types de blocs, distinctement", async () => {
    const un = (await lireArticle("fr", "make-or-buy-transport"))!.html;
    const deux = (await lireArticle("fr", "jetable-ou-durable"))!.html;
    const tout = un + deux;

    for (const classe of [
      "p4w-figure",
      "p4w-numbered",
      "p4w-cols",
      "p4w-note",
      "p4w-questions",
      "p4w-cta",
    ]) {
      expect(tout, `bloc « ${classe} » absent du rendu`).toContain(
        `class="${classe}"`,
      );
    }
  });

  it("ne laisse aucun marqueur de composant dans la page", async () => {
    const html = (await lireArticle("fr", "jetable-ou-durable"))!.html;
    expect(html).not.toContain("COMPONENT:");
    expect(html).not.toContain("<!-- FIGURE");
    // Une directive mal reconnue ressortirait en clair dans le texte.
    expect(html).not.toContain(":::");
  });

  it("découpe un item en numéro, titre et corps", async () => {
    const html = (await lireArticle("fr", "make-or-buy-transport"))!.html;
    expect(html).toContain('<span class="p4w-numbered-num" aria-hidden="true">01</span>');
    expect(html).toContain("Le coût de la capacité</h3>");
  });
});

describe("SVG", () => {
  it("arrive au navigateur identique au fichier source", async () => {
    // Les graphiques sont écrits à la main, coordonnée par coordonnée : le
    // pipeline n'a pas le droit de les reformater.
    for (const locale of LOCALES_BLOG) {
      for (const nom of ["make-or-buy-transport", "jetable-ou-durable"]) {
        const source = /<svg[\s\S]*?<\/svg>/.exec(lireSource(locale, nom))![0];
        const rendu = /<svg[\s\S]*?<\/svg>/.exec(
          (await lireArticle(locale, nom))!.html,
        )![0];
        expect(rendu, `${locale}/${nom}`).toBe(source);
      }
    }
  });

  it("garde son role et son aria-label", async () => {
    const html = (await lireArticle("fr", "make-or-buy-transport"))!.html;
    expect(html).toContain('role="img"');
    expect(html).toMatch(/aria-label="[^"]{40,}"/);
  });
});

describe("liens", () => {
  it("envoie le CTA vers la vraie page de contact, avec la locale", async () => {
    const fr = (await lireArticle("fr", "make-or-buy-transport"))!.html;
    const en = (await lireArticle("en", "make-or-buy-transport"))!.html;

    expect(fr).toContain('href="/fr/company#contact"');
    expect(en).toContain('href="/en/company#contact"');
    // `/contact` n'existe pas sur ce site : aucun lien ne doit y rester.
    expect(fr).not.toContain('href="/contact"');
  });
});

describe("typographie française", () => {
  it("pose une insécable devant la double ponctuation", () => {
    expect(appliquerTypographieFrancaise("la réponse arrive vite :")).toBe(
      "la réponse arrive vite :",
    );
    expect(appliquerTypographieFrancaise("votre transport ?")).toBe(
      "votre transport ?",
    );
    expect(appliquerTypographieFrancaise("« recentrage »")).toBe(
      "« recentrage »",
    );
  });

  it("traite le `:` qui ouvre un nœud texte après une balise", () => {
    expect(appliquerTypographieFrancaise(" : gouvernance simple")).toBe(
      " : gouvernance simple",
    );
  });

  it("épargne les URL et les heures", () => {
    expect(appliquerTypographieFrancaise("https://pool4ward.com")).toBe(
      "https://pool4ward.com",
    );
    expect(appliquerTypographieFrancaise("12:30")).toBe("12:30");
  });

  it("n'entre pas dans les SVG ni dans le code", async () => {
    const html = (await lireArticle("fr", "jetable-ou-durable"))!.html;
    const svg = /<svg[\s\S]*?<\/svg>/.exec(html)![0];
    expect(svg).not.toContain(" ");
    expect(svg).not.toContain(" ");
  });

  it("ne s'applique pas à l'anglais", async () => {
    const html = (await lireArticle("en", "make-or-buy-transport"))!.html;
    expect(html).not.toContain(" ");
  });
});

describe("robustesse du pipeline", () => {
  it("enveloppe les tableaux pour qu'ils défilent seuls", async () => {
    const html = (await lireArticle("fr", "make-or-buy-transport"))!.html;
    expect(html).toContain('<div class="p4w-table-scroll"><table>');
  });

  it("accepte une directive collée comme une directive espacée", async () => {
    const espacee = await rendreMarkdown("::: note\nTexte.\n:::", "fr");
    const collee = await rendreMarkdown(":::note\nTexte.\n:::", "fr");
    expect(espacee).toContain('class="p4w-note"');
    expect(espacee).toBe(collee);
  });

  it("laisse passer un markdown sans aucun bloc éditorial", async () => {
    const html = await rendreMarkdown("## Titre\n\nUn paragraphe.", "fr");
    expect(html).toContain("<h2");
    expect(html).toContain("<p>Un paragraphe.</p>");
  });
});

describe("découpage des items", () => {
  it("met « Hier » et « Aujourd'hui » sur deux paragraphes", async () => {
    // Le markdown les sépare par un retour à la ligne simple — un saut doux,
    // sans nœud `break`. Une seule ligne les collerait au fil du texte.
    const html = await rendreMarkdown(
      "<!-- COMPONENT: liste numérotée -->\n\n" +
        "**01 — Le bilan**\n*Hier :* sortir les actifs.\n*Aujourd'hui :* inchangé.\n",
      "fr",
    );
    const corps = /<div class="p4w-numbered-body">([\s\S]*?)<\/div>/.exec(html)![1];
    expect(corps.match(/<p>/g)).toHaveLength(2);
    expect(corps).toContain("sortir les actifs.</p>");
  });

  it("garde un item d'une seule ligne en un seul paragraphe", async () => {
    const html = await rendreMarkdown(
      "<!-- COMPONENT: trois colonnes -->\n\n**01 — La donnée**\nUn seul paragraphe.\n",
      "fr",
    );
    const corps = /<div class="p4w-col-body">([\s\S]*?)<\/div>/.exec(html)![1];
    expect(corps.match(/<p>/g)).toHaveLength(1);
  });
});
