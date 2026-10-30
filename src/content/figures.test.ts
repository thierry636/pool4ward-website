import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { EUROPE_SERVICES_COUNT } from "./figures";

const legend = (loc: string) => (JSON.parse(readFileSync(`messages/${loc}/home.json`, "utf8")) as { Home: { levers: { legend: string; note: string } } }).Home.levers;

describe("le chiffre de la légende de la couverture", () => {
  it.each(["fr", "en"])("%s : vient de figures.ts, pas du texte", (loc) => {
    const { legend: text } = legend(loc);
    expect(text, `${loc} : la légende porte {count}`).toContain("{count}");
    expect(text, `${loc} : aucun chiffre écrit en dur`).not.toMatch(/\d/);
    expect(text, `${loc} : le chiffre est mis en valeur`).toMatch(/<b>.*\{count\}.*<\/b>/);
  });

  it("est un entier positif, formaté avec une espace insécable en français", () => {
    expect(Number.isInteger(EUROPE_SERVICES_COUNT)).toBe(true);
    expect(EUROPE_SERVICES_COUNT).toBeGreaterThan(0);
    const fr = new Intl.NumberFormat("fr").format(EUROPE_SERVICES_COUNT).replace(/ /g, " ");
    expect(fr, "3 500, jamais coupé en fin de ligne").toBe("3 500");
    expect(new Intl.NumberFormat("en").format(EUROPE_SERVICES_COUNT)).toBe("3,500");
  });

  it("la légende reste courte et dit ce qu'est l'illustration", () => {
    for (const loc of ["fr", "en"]) {
      expect(legend(loc).legend.length, `${loc} : une phrase`).toBeLessThan(110);
      expect(legend(loc).note, `${loc} : l'illustration est signalée`).toMatch(/Illustration/);
    }
  });
});
