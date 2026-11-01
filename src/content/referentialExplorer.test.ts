import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CARRIERS, POINTS, SERVICES, SHORTSEA } from "./referentials";
import { REF_ACTS, REF_ART, REF_IDS, REF_LEGEND_COLORS } from "./referentialExplorer";

type Item = { name: string; question: string; summary: string; tags: string[]; covers: string[]; legend: string[]; mapTitle: string; mapAlt?: string; agent: Record<string, string> };
type Msg = { Home: { referentialExplorer: { eyebrow: string; title: string; lede: string; note: string; agent: Record<string, string>; figures: Record<string, string>; items: Record<string, Item> } } };
const load = (loc: string) => JSON.parse(readFileSync(`messages/${loc}/home.json`, "utf8")) as Msg;
const OPERATORS = /milence|engie|hexafret|hupac|cfl|basf|arctic|thermo|tsm|rosette|elltrans|carlider/i;

describe("la section des référentiels", () => {
  it("cinq référentiels : services, réseaux, bornes et parkings, transporteurs, prix de marché", () => {
    expect(REF_IDS).toEqual(["services", "networks", "points", "carriers", "prices"]);
  });

  it("chaque carte illustrative existe dans le dépôt ; les prix n'ont pas de carte mais un graphique", () => {
    for (const id of REF_IDS) {
      const art = REF_ART[id];
      if (id === "prices") expect(art, "les prix : un graphique, pas une carte").toBeNull();
      else expect(existsSync(`public/images/referentials-art/${art?.file}.webp`), `${id} : carte`).toBe(true);
    }
  });

  it("une couleur de légende par entrée de légende, dans chaque langue", () => {
    for (const loc of ["fr", "en"]) {
      const items = load(loc).Home.referentialExplorer.items;
      for (const id of REF_IDS) expect(items[id].legend.length, `${loc}/${id}`).toBe(REF_LEGEND_COLORS[id].length);
    }
  });

  it("les chiffres affichés viennent de referentials.ts : 2 500 et 1 690 lus sur le portail, « plus de » 36 000 et 80 000 de la direction", () => {
    expect([SERVICES.total, SHORTSEA.total, POINTS, CARRIERS]).toEqual([2500, 1690, 36000, 80000]);
  });

  it.each(["fr", "en"])("%s : un titre, une question, une phrase, des repères et l'agent IA de chaque référentiel, sans nom d'opérateur ni de transporteur", (loc) => {
    const r = load(loc).Home.referentialExplorer;
    expect(Object.keys(r.items), `${loc} : mêmes référentiels que le code`).toEqual([...REF_IDS]);
    for (const act of REF_ACTS) expect(r.agent[act].length, `${loc}/agent/${act}`).toBeGreaterThan(3);
    for (const id of REF_IDS) {
      const it = r.items[id];
      expect(it.question.length, `${loc}/${id}/question`).toBeGreaterThan(10);
      expect(it.summary.length, `${loc}/${id}/summary`).toBeGreaterThan(30);
      expect(it.tags.length, `${loc}/${id}/tags`).toBeGreaterThanOrEqual(2);
      expect(it.covers.length, `${loc}/${id}/covers`).toBeGreaterThanOrEqual(2);
      if (id !== "prices") expect(it.mapAlt?.length ?? 0, `${loc}/${id}/mapAlt`).toBeGreaterThan(30);
      for (const act of REF_ACTS) expect(it.agent[act].length, `${loc}/${id}/agent/${act}`).toBeGreaterThan(10);
      expect(JSON.stringify(it), `${loc}/${id} : aucun nom d'opérateur`).not.toMatch(OPERATORS);
    }
  });

  it.each(["fr", "en"])("%s : aucun nombre n'est écrit dans un message, et seuls les services sont dits mis à jour chaque jour", (loc) => {
    const r = load(loc).Home.referentialExplorer;
    const all = [r.eyebrow, r.title, r.lede, r.note, ...Object.values(r.figures), ...Object.values(r.items).flatMap((i) => [i.name, i.question, i.summary, ...i.tags, ...i.covers, ...Object.values(i.agent)])];
    for (const x of all) expect(x, `${loc} : « ${x} »`).not.toMatch(/\d/);
    const daily = loc === "fr" ? /chaque jour/i : /every day/i;
    for (const id of REF_IDS) {
      const text = JSON.stringify(r.items[id]);
      if (id === "services") expect(text, `${loc}/services`).toMatch(daily);
      else expect(text, `${loc}/${id} : pas de fréquence qu'on ne connaît pas`).not.toMatch(daily);
    }
  });
});
