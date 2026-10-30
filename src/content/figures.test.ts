import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { EUROPE_SERVICES_COUNT, SHORTSEA_SERVICES_COUNT } from "./figures";

type Card = { head?: string; label: string };
type Levers = { note: string; items: Record<string, { card: Card }> };
const levers = (loc: string) => (JSON.parse(readFileSync(`messages/${loc}/home.json`, "utf8")) as { Home: { levers: Levers } }).Home.levers;
const FIGURE_LEVERS = ["rail", "shortsea"] as const;
const nbsp = (n: number, loc: string) => new Intl.NumberFormat(loc).format(n).replace(/[\u202f ]/g, "\u00a0");

describe("les chiffres des cartes de la couverture", () => {
  it.each(["fr", "en"])("%s : les cartes chiffrées n'ont que la précision, le chiffre vient de figures.ts", (loc) => {
    for (const id of FIGURE_LEVERS) {
      const { card } = levers(loc).items[id];
      expect(card.head, `${loc}/${id} : pas de titre, c'est le chiffre qui accroche`).toBeUndefined();
      expect(card.label, `${loc}/${id} : aucun chiffre écrit en dur`).not.toMatch(/\d/);
      expect(card.label, `${loc}/${id} : l'Europe est nommée`).toMatch(/Europe/);
    }
  });

  it.each(["fr", "en"])("%s : les cartes sans chiffre ont un titre et une précision, sans aucun chiffre", (loc) => {
    for (const [id, { card }] of Object.entries(levers(loc).items)) {
      if ((FIGURE_LEVERS as readonly string[]).includes(id)) continue;
      expect(card.head?.length ?? 0, `${loc}/${id} : un titre`).toBeGreaterThan(3);
      expect(`${card.head} ${card.label}`, `${loc}/${id}`).not.toMatch(/\d/);
    }
  });

  it("sont des entiers positifs, formatés avec une espace insécable en français", () => {
    for (const n of [EUROPE_SERVICES_COUNT, SHORTSEA_SERVICES_COUNT]) {
      expect(Number.isInteger(n)).toBe(true);
      expect(n).toBeGreaterThan(0);
    }
    expect(nbsp(EUROPE_SERVICES_COUNT, "fr"), "3 500, jamais coupé en fin de ligne").toBe("3\u00a0500");
    expect(nbsp(SHORTSEA_SERVICES_COUNT, "fr"), "1 500, jamais coupé en fin de ligne").toBe("1\u00a0500");
    expect(new Intl.NumberFormat("en").format(EUROPE_SERVICES_COUNT)).toBe("3,500");
    expect(new Intl.NumberFormat("en").format(SHORTSEA_SERVICES_COUNT)).toBe("1,500");
  });

  it("la précision ne se coupe pas devant « · Europe », et l'illustration est signalée à part", () => {
    for (const loc of ["fr", "en"]) {
      for (const id of FIGURE_LEVERS) expect(levers(loc).items[id].card.label, `${loc}/${id}`).toMatch(/\u00a0· Europe$/);
      expect(levers(loc).note, `${loc} : l'illustration est signalée`).toMatch(/Illustration/);
    }
  });
});
