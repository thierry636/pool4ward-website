import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { EUROPE_SERVICES_COUNT, SHORTSEA_SERVICES_COUNT } from "./figures";

type Levers = { note: string; items: Record<string, { watermark: string }> };
const levers = (loc: string) => (JSON.parse(readFileSync(`messages/${loc}/home.json`, "utf8")) as { Home: { levers: Levers } }).Home.levers;
const FIGURE_LEVERS = ["rail", "shortsea"] as const;
const nbsp = (n: number, loc: string) => new Intl.NumberFormat(loc).format(n).replace(/[\u202f ]/g, "\u00a0");

describe("les chiffres des filigranes de la couverture", () => {
  it.each(["fr", "en"])("%s : les filigranes chiffrés viennent de figures.ts, pas du texte", (loc) => {
    for (const id of FIGURE_LEVERS) {
      const text = levers(loc).items[id].watermark;
      expect(text, `${loc}/${id} : le filigrane porte {count}`).toContain("{count}");
      expect(text, `${loc}/${id} : aucun chiffre écrit en dur`).not.toMatch(/\d/);
      expect(text, `${loc}/${id} : le chiffre est mis en valeur`).toMatch(/<b>.*\{count\}.*<\/b>/);
    }
  });

  it.each(["fr", "en"])("%s : les filigranes sans chiffre n'en portent aucun, ni accolade", (loc) => {
    for (const [id, item] of Object.entries(levers(loc).items)) {
      if ((FIGURE_LEVERS as readonly string[]).includes(id)) continue;
      expect(item.watermark, `${loc}/${id}`).not.toMatch(/\d|\{count\}/);
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

  it("chaque filigrane reste une phrase courte, et l'illustration est signalée à part", () => {
    for (const loc of ["fr", "en"]) {
      const l = levers(loc);
      for (const [id, item] of Object.entries(l.items)) expect(item.watermark.length, `${loc}/${id} : une phrase`).toBeLessThan(110);
      expect(l.note, `${loc} : l'illustration est signalée`).toMatch(/Illustration/);
    }
  });
});
