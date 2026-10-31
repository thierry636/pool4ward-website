import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CARRIERS, POINTS, SERVICES, SHORTSEA } from "@/content/referentials";
import { anchorOf } from "./scene";
import { FRAME_CORE, LAYERS, LAYER_IDS, buildLayer } from "./layers";

describe("la couche « réseaux ferroviaire et fluvial » de la planche des référentiels", () => {
  const { layer, paths } = buildLayer("networks");

  it("une seule couche, celle des réseaux : la planche montre une capture du portail pour les autres référentiels", () => {
    expect(LAYER_IDS).toEqual(["networks"]);
    expect(LAYERS.networks.id).toBe("networks");
  });

  it("tous les lieux existent, tout tient dans le cadre de l'Europe et les temps vont de 0 à 1", () => {
    const pts = [...paths.flatMap((p) => p.points), ...layer.dots.map((d) => anchorOf(d.at)), ...layer.rings.map((r) => anchorOf(r.at))];
    expect(pts.length).toBeGreaterThan(0);
    for (const [lon, lat] of pts) {
      expect(lon, `longitude ${lon}`).toBeGreaterThanOrEqual(FRAME_CORE.west);
      expect(lon, `longitude ${lon}`).toBeLessThanOrEqual(FRAME_CORE.east);
      expect(lat, `latitude ${lat}`).toBeGreaterThanOrEqual(FRAME_CORE.south);
      expect(lat, `latitude ${lat}`).toBeLessThanOrEqual(FRAME_CORE.north);
    }
    for (const { el } of paths) {
      expect(el.t0, el.id).toBeGreaterThanOrEqual(0);
      expect(el.t1, el.id).toBeLessThanOrEqual(1);
      expect(el.t1, el.id).toBeGreaterThanOrEqual(el.t0);
    }
    for (const t of [...layer.dots.map((d) => d.t), ...layer.rings.map((r) => r.t)]) {
      expect(t).toBeGreaterThanOrEqual(0);
      expect(t).toBeLessThanOrEqual(1);
    }
    expect(layer.seconds).toBeGreaterThan(3);
  });

  it("assez de lignes et de voies navigables pour se lire comme un référentiel ; les voies navigables sont en pointillé, plus épaisses que les lignes", () => {
    const rails = layer.lines.filter((l) => l.id.startsWith("rail-"));
    const waterways = layer.lines.filter((l) => l.id.startsWith("waterway-"));
    expect(rails.length, "lignes ferroviaires").toBeGreaterThanOrEqual(15);
    expect(waterways.length, "voies navigables").toBeGreaterThanOrEqual(6);
    expect(waterways.every((l) => l.style === "dashed"), "voies navigables en pointillé").toBe(true);
    expect(Math.min(...waterways.map((l) => l.width)), "les voies navigables se distinguent des lignes").toBeGreaterThanOrEqual(Math.max(...rails.map((l) => l.width)));
  });
});

describe("les chiffres de la planche", () => {
  it("les services intermodaux se lisent comme le portail : 2 500 services, 36 pays", () => {
    expect(SERVICES.total).toBe(2500);
    expect(SERVICES.countries).toBe(36);
  });

  it("les « plus de » de la direction sont de vrais ordres de grandeur, bornes et parkings plus petits que les transporteurs", () => {
    expect(POINTS, "plus de 36 000 points").toBe(36000);
    expect(CARRIERS, "plus de 80 000 transporteurs").toBe(80000);
    expect(CARRIERS).toBeGreaterThan(POINTS);
    expect(SHORTSEA.total, "le shortsea est lu sur le portail").toBe(1690);
  });
});

describe("textes de la planche (FR et EN)", () => {
  type Tile = { name: string; line: string; unit?: string; figure?: string };
  type Msg = {
    Home: {
      referentials: {
        title: string;
        sub: string;
        caption: string;
        live: string;
        controls: Record<string, string>;
        tiles: Record<string, Tile>;
      };
    };
  };
  const load = (loc: string) => JSON.parse(readFileSync(`messages/${loc}/home.json`, "utf8")) as Msg;
  const TILES = ["services", "shortsea", "networks", "points", "carriers", "prices"];
  const OPERATORS = /milence|engie|hexafret|euris|novatrans|ctl logistics|hupac|contargo|tsm|fresh/i;

  it.each(["fr", "en"])("%s : six tuiles, chacune avec un nom et une phrase, sans nom d'opérateur ni de transporteur", (loc) => {
    const r = load(loc).Home.referentials;
    expect(Object.keys(r.tiles), `${loc} : les six tuiles, dans l'ordre`).toEqual(TILES);
    for (const id of TILES) {
      expect(r.tiles[id].name.length, `${loc}/${id}/name`).toBeGreaterThan(3);
      expect(r.tiles[id].line.length, `${loc}/${id}/line`).toBeGreaterThan(10);
      expect(JSON.stringify(r.tiles[id]), `${loc}/${id} : aucun nom d'opérateur`).not.toMatch(OPERATORS);
    }
  });

  it.each(["fr", "en"])("%s : aucun nombre n'est écrit dans un message, ils viennent tous du code", (loc) => {
    const r = load(loc).Home.referentials;
    const texts = [r.title, r.sub, r.caption, r.live, ...Object.values(r.controls), ...Object.values(r.tiles).flatMap((t) => [t.name, t.line, t.unit ?? "", t.figure ?? ""])];
    for (const x of texts) expect(x.replace(/pool4ward/gi, ""), `${loc} : « ${x} »`).not.toMatch(/\d/);
  });

  it.each(["fr", "en"])("%s : un seul grand nombre dans le titre, la mise à jour est dite journalière (jamais en temps réel), la légende dit que les noms sont masqués", (loc) => {
    const r = load(loc).Home.referentials;
    expect(r.title, `${loc} : le nombre est en gras`).toMatch(/<b>\{n\}<\/b>/);
    expect(r.live, `${loc} : journalière`).toMatch(loc === "fr" ? /journali/i : /daily/i);
    expect(r.live, `${loc} : jamais « temps réel »`).not.toMatch(/temps r[ée]el|real[- ]time/i);
    expect(r.caption, `${loc} : noms masqués`).toMatch(loc === "fr" ? /masqu/i : /masked/i);
    expect(r.sub.length, `${loc} : une phrase`).toBeLessThan(120);
  });
});
