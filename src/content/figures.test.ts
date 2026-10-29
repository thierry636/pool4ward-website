import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { EUROPE_SERVICES_COUNT } from "./figures";

const cover = (loc: string) => (JSON.parse(readFileSync(`messages/${loc}/home.json`, "utf8")) as { Home: { cover: { title: string; lede: string } } }).Home.cover;

describe("le chiffre du titre de la couverture", () => {
  it.each(["fr", "en"])("%s : vient de figures.ts, pas du texte", (loc) => {
    const { title } = cover(loc);
    expect(title, `${loc} : le titre porte {count}`).toContain("{count}");
    expect(title, `${loc} : aucun chiffre écrit en dur`).not.toMatch(/\d/);
    expect(title, `${loc} : la fin de la phrase met le chiffre en valeur`).toMatch(/<em>.*\{count\}.*<\/em>|<em>\{count\}/);
  });

  it("est un entier positif, formaté avec une espace insécable en français", () => {
    expect(Number.isInteger(EUROPE_SERVICES_COUNT)).toBe(true);
    expect(EUROPE_SERVICES_COUNT).toBeGreaterThan(0);
    const fr = new Intl.NumberFormat("fr").format(EUROPE_SERVICES_COUNT).replace(/ /g, " ");
    expect(fr, "3 500, jamais coupé en fin de ligne").toBe("3 500");
    expect(new Intl.NumberFormat("en").format(EUROPE_SERVICES_COUNT)).toBe("3,500");
  });

  it("le titre reste court : un chiffre, ce que c'est, où, pour quoi", () => {
    for (const loc of ["fr", "en"]) expect(cover(loc).title.length, loc).toBeLessThan(95);
  });
});
