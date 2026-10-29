import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { distanceKm } from "@/lib/showcase/arcs";
import { LEVER_ORDER, LEVER_SECONDS, PLACES, SCENES, leverSeconds, type LineEl } from "./data";
import { anchorOf, buildScene, drawnPart, isDimmed, lineOpacity, offsetPoints, pointsAlong, regionBox, revealOf, sceneBox } from "./scene";

describe("données de la scène", () => {
  it("six leviers, dans l'ordre voulu", () => {
    expect(LEVER_ORDER).toEqual(["rail", "shortsea", "loops", "crossdock", "electric", "pooling"]);
    for (const id of LEVER_ORDER) expect(SCENES[id].length, id).toBeGreaterThan(0);
  });

  it("tous les lieux cités existent, en deux langues, avec des positions plausibles pour l'Europe", () => {
    for (const p of Object.values(PLACES)) {
      expect(p.fr.length).toBeGreaterThan(0);
      expect(p.en.length).toBeGreaterThan(0);
      expect(p.lon).toBeGreaterThan(-8);
      expect(p.lon).toBeLessThan(22);
      expect(p.lat).toBeGreaterThan(35);
      expect(p.lat).toBeLessThan(54);
    }
    for (const id of LEVER_ORDER) for (const el of SCENES[id]) {
      if (el.kind === "line") el.stops.forEach((s) => expect(() => anchorOf(s), `${id}/${el.id}`).not.toThrow());
      if (el.kind === "node" || el.kind === "callout") expect(() => anchorOf(el.at)).not.toThrow();
    }
  });

  it("chaque minutage est ordonné et tient dans [0, 1]", () => {
    const window = (el: (typeof SCENES)[keyof typeof SCENES][number]): [number, number] => {
      if (el.kind === "node") return [el.t, el.t];
      if (el.kind === "ring") return [el.t0, el.t0];
      return [el.t0, el.t1];
    };
    for (const id of LEVER_ORDER) {
      for (const el of SCENES[id]) {
        const [a, b] = window(el);
        expect(a, id).toBeGreaterThanOrEqual(0);
        expect(b, id).toBeLessThanOrEqual(1);
        expect(b, id).toBeGreaterThanOrEqual(a);
      }
    }
  });

  it("chaque levier a au moins une bulle d'explication, et la dernière reste visible jusqu'au bout", () => {
    for (const id of LEVER_ORDER) {
      const s = buildScene(id);
      expect(s.callouts.length, id).toBeGreaterThan(0);
      expect(Math.max(...s.callouts.map((c) => c.t1)), id).toBeGreaterThanOrEqual(0.97);
    }
  });
});

describe("report modal rail/fluvial", () => {
  const scene = buildScene("rail");
  const lines = (prefix: string) => scene.lines.filter((l) => l.el.id.startsWith(prefix));
  const first = (l: { path: { points: [number, number][] } }) => l.path.points[0];
  const last = (l: { path: { points: [number, number][] } }) => l.path.points[l.path.points.length - 1];
  const at = (id: string): [number, number] => anchorOf(id);

  it("trois flux directs partent du sud de l'Espagne vers la Pologne, chacun par la route", () => {
    const direct = lines("direct-");
    expect(direct).toHaveLength(3);
    for (const l of direct) {
      expect(first(l)[1], `départ de ${l.el.id}`).toBeLessThan(38);
      expect(first(l)[0], `départ de ${l.el.id}`).toBeLessThan(0);
      expect(last(l)[0], `arrivée de ${l.el.id}`).toBeGreaterThan(16);
      expect(l.el.stops, "un seul arc, sans escale").toHaveLength(2);
    }
  });

  it("le service ferroviaire va de Saragosse à Poznań, par les terminaux et le réseau, pas par la route directe", () => {
    const [service] = lines("service");
    expect(service.el.stops[0]).toBe("zaragoza");
    expect(service.el.stops[service.el.stops.length - 1]).toBe("poznan");
    expect(distanceKm(first(service), at("zaragoza")), "part de Saragosse").toBeLessThan(1);
    expect(distanceKm(last(service), at("poznan")), "arrive à Poznań").toBeLessThan(1);
  });

  it("pré-acheminement vers Saragosse, post-acheminement depuis Poznań, après l'identification du service", () => {
    const [service] = lines("service");
    for (const l of lines("pre-")) {
      expect(distanceKm(last(l), at("zaragoza")), l.el.id).toBeLessThan(1);
      expect(l.el.t0, `${l.el.id} suit le service`).toBeGreaterThanOrEqual(service.el.t1);
    }
    for (const l of lines("post-")) {
      expect(distanceKm(first(l), at("poznan")), l.el.id).toBeLessThan(1);
      expect(l.el.t0, `${l.el.id} suit le pré-acheminement`).toBeGreaterThan(Math.max(...lines("pre-").map((x) => x.el.t0)));
    }
    expect(lines("pre-")).toHaveLength(3);
    expect(lines("post-")).toHaveLength(3);
  });

  it("les réseaux ferré et fluvial sont en filigrane, entre les flux directs et le service, et hors du fond commun", () => {
    const net = [...lines("net-rail-"), ...lines("net-river-")];
    expect(lines("net-rail-").length).toBeGreaterThan(8);
    expect(lines("net-river-").length).toBeGreaterThanOrEqual(3);
    const [service] = lines("service");
    const directEnd = Math.max(...lines("direct-").map((l) => l.el.t1));
    for (const l of net) {
      expect(l.el.opacity ?? 1, l.el.id).toBeLessThan(0.6);
      expect(l.el.skipBase, l.el.id).toBe(true);
      expect(l.el.t0, `${l.el.id} apparaît après les flux directs`).toBeGreaterThanOrEqual(lines("direct-")[0].el.t0 + 0.2);
      expect(l.el.t1, `${l.el.id} apparaît avant le service`).toBeLessThanOrEqual(service.el.t0);
      expect(l.el.t1, l.el.id).toBeGreaterThan(directEnd);
    }
    // le fluvial se lit autrement que par la couleur : tirets
    for (const l of lines("net-river-")) expect(l.el.style, l.el.id).toBe("dashed");
  });

  it("les flux directs sont écartés une fois le service identifié", () => {
    const [service] = lines("service");
    for (const l of lines("direct-")) {
      const el = l.el as LineEl;
      expect(el.dimAt, l.el.id).toBeDefined();
      expect(el.dimAt!, "écarté après le début du service").toBeGreaterThanOrEqual(service.el.t0);
      expect(lineOpacity(el, 0.3), "visible avant").toBe(1);
      expect(lineOpacity(el, 1), "presque effacé à la fin").toBeLessThan(0.2);
      expect(isDimmed(el, el.dimAt! - 0.01)).toBe(false);
      expect(isDimmed(el, el.dimAt!)).toBe(true);
    }
  });

  it("l'effacement est progressif : ni saut ni retour en arrière", () => {
    const el = lines("direct-")[0].el;
    const samples = [0.6, 0.62, 0.64, 0.66, 0.68, 0.7].map((u) => lineOpacity(el, u));
    for (let i = 1; i < samples.length; i++) expect(samples[i], `u=${0.6 + i * 0.02}`).toBeLessThanOrEqual(samples[i - 1]);
    expect(samples[0]).toBe(1);
    expect(samples[samples.length - 1]).toBeCloseTo(el.dimTo ?? 0.28, 6);
  });

  it("l'emprise du levier va du sud de l'Espagne à la Pologne", () => {
    const b = sceneBox("rail");
    expect(b.south).toBeLessThan(38);
    expect(b.east).toBeGreaterThan(19);
    expect(b.north).toBeGreaterThan(52);
  });

  it("le report modal dure plus que les autres leviers", () => {
    expect(leverSeconds("rail")).toBeGreaterThan(LEVER_SECONDS);
    for (const id of LEVER_ORDER.filter((x) => x !== "rail")) expect(leverSeconds(id), id).toBe(LEVER_SECONDS);
  });
});

describe("calculs de la scène", () => {
  it("revealOf : borné, linéaire entre t0 et t1", () => {
    expect(revealOf(0.2, 0.6, 0)).toBe(0);
    expect(revealOf(0.2, 0.6, 0.4)).toBeCloseTo(0.5, 9);
    expect(revealOf(0.2, 0.6, 1)).toBe(1);
  });

  it("un tracé se dessine progressivement jusqu'à son extrémité", () => {
    const l = buildScene("rail").lines[0];
    expect(drawnPart(l, 0)).toEqual([]);
    const half = drawnPart(l, (l.el.t0 + l.el.t1) / 2);
    expect(half.length).toBeGreaterThan(1);
    expect(drawnPart(l, 1)).toBe(l.path.points);
  });

  it("un tracé fermé revient à son point de départ", () => {
    const loops = buildScene("loops").lines;
    expect(loops.length).toBeGreaterThanOrEqual(2);
    for (const l of loops) {
      const first = l.path.points[0];
      const last = l.path.points[l.path.points.length - 1];
      expect(distanceKm(first, last)).toBeLessThan(1);
    }
  });

  it("offsetPoints : les faisceaux s'écartent d'environ le décalage, sans se croiser", () => {
    const base = buildScene("pooling").lines.find((l) => l.el.id === "b2")!.path.points;
    const left = offsetPoints(base, -0.1);
    const right = offsetPoints(base, 0.1);
    const mid = Math.floor(base.length / 2);
    const gap = distanceKm(left[mid], right[mid]);
    expect(gap).toBeGreaterThan(15);
    expect(gap).toBeLessThan(30);
    expect(offsetPoints(base, 0)).toBe(base);
  });

  it("pointsAlong : les bornes suivent le corridor, dans l'ordre", () => {
    const pts = pointsAlong(["valencia", "barcelona", "perpignan", "lyon"], [0.1, 0.5, 0.9]);
    expect(pts[0][1]).toBeLessThan(pts[1][1]);
    expect(pts[1][1]).toBeLessThan(pts[2][1]);
  });

  it("les bornes optimales sont plus régulières que les bornes existantes", () => {
    const s = buildScene("electric");
    const gaps = (f: readonly number[]) => f.slice(1).map((x, i) => x - f[i]);
    const now = s.chargers.find((c) => c.el.style === "charger-now")!.el.fractions;
    const opt = s.chargers.find((c) => c.el.style === "charger-opt")!.el.fractions;
    const spread = (g: number[]) => Math.max(...g) - Math.min(...g);
    expect(spread(gaps(opt))).toBeLessThan(spread(gaps(now)));
  });

  it("l'emprise de la région contient celle de chaque levier", () => {
    const region = regionBox(LEVER_ORDER);
    for (const id of LEVER_ORDER) {
      const b = sceneBox(id);
      expect(b.west).toBeGreaterThanOrEqual(region.west);
      expect(b.east).toBeLessThanOrEqual(region.east);
      expect(b.south).toBeGreaterThanOrEqual(region.south);
      expect(b.north).toBeLessThanOrEqual(region.north);
    }
  });
});

describe("textes de la scène (FR et EN)", () => {
  type Msg = { Home: { levers: { items: Record<string, { name: string; text: string; schema: string; callouts: Record<string, { title: string; sub: string }> }> } } };
  const load = (loc: string) => JSON.parse(readFileSync(`messages/${loc}/home.json`, "utf8")) as Msg;

  it.each(["fr", "en"])("%s : chaque levier a un nom, un texte, une description de schéma et ses bulles", (loc) => {
    const items = load(loc).Home.levers.items;
    for (const id of LEVER_ORDER) {
      const it = items[id];
      expect(it, `${loc} : levier ${id}`).toBeDefined();
      for (const k of ["name", "text", "schema"] as const) expect(it[k].length, `${loc}/${id}/${k}`).toBeGreaterThan(3);
      for (const el of SCENES[id]) {
        if (el.kind !== "callout") continue;
        const c = it.callouts[el.key];
        expect(c, `${loc}/${id} : bulle « ${el.key} »`).toBeDefined();
        expect(c.title.length + c.sub.length, `${loc}/${id}/${el.key}`).toBeGreaterThan(5);
      }
    }
  });

  it("aucune bulle de texte n'est orpheline : chaque clé de message est utilisée par la scène", () => {
    const items = load("fr").Home.levers.items;
    for (const id of LEVER_ORDER) {
      const used = new Set(SCENES[id].filter((e) => e.kind === "callout").map((e) => (e as { key: string }).key));
      expect([...Object.keys(items[id].callouts)].sort(), `bulles de ${id}`).toEqual([...used].sort());
    }
  });
});
