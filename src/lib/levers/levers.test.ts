import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { distanceKm } from "@/lib/showcase/arcs";
import { LEVER_ORDER, LEVER_SECONDS, PLACES, SCENES, leverSeconds, type LeverId, type LineEl, type NodeEl } from "./data";
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
      expect(p.lon, p.fr).toBeGreaterThan(-10);
      expect(p.lon, p.fr).toBeLessThan(26);
      expect(p.lat, p.fr).toBeGreaterThan(35);
      expect(p.lat, p.fr).toBeLessThan(61);
    }
    for (const id of LEVER_ORDER) for (const el of SCENES[id]) {
      if (el.kind === "line") el.stops.forEach((s) => expect(() => anchorOf(s), `${id}/${el.id}`).not.toThrow());
      if (el.kind === "node") expect(() => anchorOf(el.at)).not.toThrow();
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

  it("aucune bulle de texte sur l'image : une scène ne contient que des tracés, des repères, des anneaux et des bornes", () => {
    for (const id of LEVER_ORDER) {
      const kinds = new Set<string>(SCENES[id].map((e) => e.kind));
      for (const k of kinds) expect(["line", "node", "ring", "chargers"], `${id} : ${k}`).toContain(k);
    }
  });

  it("chaque levier montre d'abord ses flux ou ses ports, puis la transformation qu'il illustre", () => {
    const startOf = (el: (typeof SCENES)[LeverId][number]) => (el.kind === "node" ? el.t : el.kind === "ring" ? el.t0 : el.t0);
    for (const id of LEVER_ORDER) {
      const starts = SCENES[id].map(startOf).sort((a, b) => a - b);
      expect(starts[0], `${id} : le dessin commence tout de suite`).toBeLessThan(0.1);
      const lineStarts = buildScene(id).lines.map((l) => l.el.t0);
      expect(Math.max(...lineStarts), `${id} : la transformation arrive dans la seconde moitié`).toBeGreaterThan(0.45);
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

  it("le report modal dure plus que la durée par défaut, chaque levier a sa durée", () => {
    expect(leverSeconds("rail")).toBeGreaterThan(LEVER_SECONDS);
    expect(Object.fromEntries(LEVER_ORDER.map((id) => [id, leverSeconds(id)]))).toEqual({ rail: 15, shortsea: 15, loops: 15, crossdock: 12, electric: 16, pooling: 15 });
  });
});

const endsOf = (l: { path: { points: [number, number][] } }) => [l.path.points[0], l.path.points[l.path.points.length - 1]] as const;
const near = (a: [number, number], b: [number, number]) => distanceKm(a, b) < 1;

describe("shortsea : les ports d'Europe, puis un service de port en port", () => {
  const scene = buildScene("shortsea");
  const ports = SCENES.shortsea.filter((e): e is NodeEl => e.kind === "node" && e.style === "dot");
  const chain = scene.lines.filter((l) => /^c\d+$/.test(l.el.id));

  it("on voit d'abord au moins trente ports côtiers, de l'Atlantique à la Méditerranée et à la Baltique", () => {
    expect(ports.length).toBeGreaterThanOrEqual(30);
    const lats = ports.map((p) => anchorOf(p.at)[1]);
    expect(Math.max(...lats), "la Baltique").toBeGreaterThan(58);
    expect(Math.min(...lats), "la Méditerranée").toBeLessThan(40);
    const lastPort = Math.max(...ports.map((p) => p.t));
    expect(Math.min(...chain.map((l) => l.el.t0)), "le service arrive après les ports").toBeGreaterThan(lastPort);
  });

  it("le service méditerranéen enchaîne les escales d'Algésiras à Naples, chaque tronçon partant d'où le précédent s'arrête", () => {
    expect(chain.length).toBeGreaterThanOrEqual(5);
    expect(near(endsOf(chain[0])[0], anchorOf("algeciras")), "part d'Algésiras").toBe(true);
    expect(near(endsOf(chain[chain.length - 1])[1], anchorOf("napoli")), "arrive à Naples").toBe(true);
    for (let i = 1; i < chain.length; i++) {
      expect(near(endsOf(chain[i - 1])[1], endsOf(chain[i])[0]), `tronçon ${i}`).toBe(true);
      expect(chain[i].el.t0, `tronçon ${i} suit le précédent`).toBeGreaterThan(chain[i - 1].el.t0);
    }
  });

  it("seules quelques escales du service sont nommées, pour que les noms ne se chevauchent pas", () => {
    const ports = SCENES.shortsea.filter((e): e is NodeEl => e.kind === "node" && e.style === "port");
    expect(ports.length, "toutes les escales sont marquées").toBeGreaterThanOrEqual(6);
    const named = ports.filter((p) => p.label);
    expect(named.length, "quelques noms").toBeGreaterThanOrEqual(3);
    expect(named.length, "pas plus de cinq noms").toBeLessThanOrEqual(5);
    expect(named.map((p) => p.at), "les deux extrémités sont nommées").toEqual(expect.arrayContaining(["algeciras", "napoli"]));
  });

  it("la liaison directe est écartée une fois le service tracé", () => {
    const direct = scene.lines.find((l) => l.el.id === "direct")!.el;
    expect(direct.style).toBe("dashed");
    expect(direct.dimAt!, "écartée quand le service commence").toBeGreaterThanOrEqual(chain[0].el.t0);
    expect(lineOpacity(direct, 1)).toBeLessThan(0.3);
  });
});

describe("boucles : des flux paneuropéens, puis quelques boucles", () => {
  const scene = buildScene("loops");
  const flows = scene.lines.filter((l) => l.el.id.startsWith("flow-"));
  const ids = ["iberia", "benelux", "central"];

  it("au moins dix flux de fond, écartés quand les boucles sont identifiées", () => {
    expect(flows.length).toBeGreaterThanOrEqual(10);
    const firstLoop = Math.min(...scene.lines.filter((l) => l.el.id.startsWith("loop-")).map((l) => l.el.t0));
    for (const l of flows) {
      expect(l.el.dimAt, l.el.id).toBeDefined();
      expect(l.el.dimAt!, `${l.el.id} s'efface quand les boucles commencent`).toBeGreaterThanOrEqual(firstLoop - 0.05);
    }
  });

  it.each(ids)("la boucle %s : des jambes chargées qui s'enchaînent, refermées par une jambe à vide en pointillé", (id) => {
    const loaded = scene.lines.filter((l) => l.el.id.startsWith(`loop-${id}-`));
    const empty = scene.lines.find((l) => l.el.id === `empty-${id}`)!;
    expect(loaded.length, "au moins deux jambes chargées").toBeGreaterThanOrEqual(2);
    expect(empty.el.style, "la jambe à vide se lit en pointillé").toBe("dashed");
    for (let i = 1; i < loaded.length; i++) expect(near(endsOf(loaded[i - 1])[1], endsOf(loaded[i])[0]), `jambe ${i}`).toBe(true);
    expect(near(endsOf(loaded[loaded.length - 1])[1], endsOf(empty)[0]), "la jambe à vide part d'où l'on a fini").toBe(true);
    expect(near(endsOf(empty)[1], endsOf(loaded[0])[0]), "elle ramène au point de départ").toBe(true);
    expect(empty.el.t0, "elle se trace après la première jambe chargée").toBeGreaterThan(loaded[0].el.t0);
    expect(empty.el.width, "plus discrète que les jambes chargées").toBeLessThan(loaded[0].el.width ?? 0);
  });

  it("les boucles se traitent l'une après l'autre", () => {
    const starts = ids.map((id) => scene.lines.find((l) => l.el.id === `loop-${id}-0`)!.el.t0);
    expect([...starts].sort((a, b) => a - b), "ordre d'apparition").toEqual(starts);
    expect(new Set(starts).size, "des départs distincts").toBe(ids.length);
  });
});

describe("cross-dock : la consolidation", () => {
  const scene = buildScene("crossdock");
  const inflows = scene.lines.filter((l) => l.el.id.startsWith("in-"));
  const out = scene.lines.find((l) => l.el.id === "out")!;

  it("au moins six petits flux convergent vers la même plateforme", () => {
    expect(inflows.length).toBeGreaterThanOrEqual(6);
    const [, hub] = endsOf(inflows[0]);
    for (const l of inflows) expect(near(endsOf(l)[1], hub), l.el.id).toBe(true);
    expect(new Set(inflows.map((l) => endsOf(l)[0].join())).size, "des origines toutes différentes").toBe(inflows.length);
  });

  it("un seul gros flux repart de la plateforme vers l'usine, bien plus épais que chaque flux entrant", () => {
    const [from, to] = endsOf(out);
    expect(near(from, endsOf(inflows[0])[1]), "il part de la plateforme").toBe(true);
    expect(distanceKm(from, to), "il va jusqu'à l'usine").toBeGreaterThan(200);
    expect(out.el.width ?? 0, "plus épais que chaque flux entrant").toBeGreaterThanOrEqual(4 * Math.max(...inflows.map((l) => l.el.width ?? 0)));
    expect(out.el.halo, "mis en valeur").toBeDefined();
    expect(scene.lines.filter((l) => !l.el.id.startsWith("in-")), "aucun autre flux").toHaveLength(1);
    expect(out.el.t0, "il part quand tout est arrivé").toBeGreaterThanOrEqual(Math.max(...inflows.map((l) => l.el.t1)));
  });
});

describe("électrification : les flux, le réseau de bornes, puis une boucle électrifiée", () => {
  const scene = buildScene("electric");
  const net = scene.chargers.filter((c) => c.el.style === "charger-net");
  const used = scene.chargers.filter((c) => c.el.style === "charger-opt");
  const loop = scene.lines.filter((l) => l.el.id.startsWith("loop-"));

  it("le réseau compte plus de soixante bornes, réparties dans toute l'Europe", () => {
    const pts = net.flatMap((c) => c.points);
    expect(pts.length).toBeGreaterThan(60);
    const lons = pts.map((p) => p[0]);
    const lats = pts.map((p) => p[1]);
    expect(Math.max(...lons) - Math.min(...lons), "étendue est-ouest").toBeGreaterThan(20);
    expect(Math.max(...lats) - Math.min(...lats), "étendue nord-sud").toBeGreaterThan(10);
  });

  it("la boucle électrifiée est fermée et ne se recharge que sur des bornes du réseau", () => {
    expect(loop.length).toBeGreaterThanOrEqual(3);
    expect(near(endsOf(loop[0])[0], endsOf(loop[loop.length - 1])[1]), "la boucle se referme").toBe(true);
    const netPts = net.flatMap((c) => c.points);
    expect(used.flatMap((c) => c.points).length, "des bornes choisies").toBeGreaterThan(0);
    for (const p of used.flatMap((c) => c.points)) expect(netPts.some((q) => near(p, q)), "une borne choisie existe dans le réseau").toBe(true);
  });

  it("les bornes choisies sont moins nombreuses que celles du réseau, et apparaissent après lui", () => {
    expect(used.flatMap((c) => c.points).length).toBeLessThan(net.flatMap((c) => c.points).length / 3);
    expect(Math.min(...used.map((c) => c.el.t0)), "après le réseau").toBeGreaterThanOrEqual(Math.max(...net.map((c) => c.el.t1)));
    expect(Math.min(...loop.map((l) => l.el.t0)), "la boucle suit le réseau").toBeGreaterThanOrEqual(Math.max(...net.map((c) => c.el.t1)));
  });
});

describe("mutualisation : des entreprises différentes sur un même train Dourges – Poznań", () => {
  const scene = buildScene("pooling");
  const directs = scene.lines.filter((l) => l.el.id.startsWith("direct-"));
  const trains = scene.lines.filter((l) => /^train-\d+$/.test(l.el.id));

  it("au moins trois entreprises, chacune avec sa couleur", () => {
    expect(directs.length).toBeGreaterThanOrEqual(3);
    expect(new Set(directs.map((l) => l.el.color)).size, "couleurs distinctes").toBe(directs.length);
  });

  it("les faisceaux du train relient Dourges à Poznań, dans les couleurs des entreprises", () => {
    expect(trains).toHaveLength(directs.length);
    for (const l of trains) {
      expect(distanceKm(endsOf(l)[0], anchorOf("dourges")), `${l.el.id} part de Dourges`).toBeLessThan(40);
      expect(distanceKm(endsOf(l)[1], anchorOf("poznan")), `${l.el.id} arrive à Poznań`).toBeLessThan(40);
    }
    expect(new Set(trains.map((l) => l.el.color))).toEqual(new Set(directs.map((l) => l.el.color)));
    expect(scene.lines.some((l) => l.el.id === "train-halo"), "un halo regroupe les faisceaux").toBe(true);
  });

  it("le pré-acheminement va à Dourges et le post-acheminement part de Poznań, après le train", () => {
    const pre = scene.lines.filter((l) => l.el.id.startsWith("pre-"));
    const post = scene.lines.filter((l) => l.el.id.startsWith("post-"));
    expect(pre).toHaveLength(directs.length);
    expect(post).toHaveLength(directs.length);
    for (const l of pre) {
      expect(near(endsOf(l)[1], anchorOf("dourges")), l.el.id).toBe(true);
      expect(l.el.t0, `${l.el.id} suit le train`).toBeGreaterThanOrEqual(Math.min(...trains.map((t) => t.el.t1)));
    }
    for (const l of post) expect(near(endsOf(l)[0], anchorOf("poznan")), l.el.id).toBe(true);
    expect(Math.min(...post.map((l) => l.el.t0)), "après le pré-acheminement").toBeGreaterThan(Math.min(...pre.map((l) => l.el.t0)));
  });

  it("les flux directs sont écartés une fois le train identifié", () => {
    const train0 = Math.min(...trains.map((t) => t.el.t0));
    for (const l of directs) expect(l.el.dimAt!, l.el.id).toBeGreaterThanOrEqual(train0);
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

  it("offsetPoints : les faisceaux s'écartent d'environ le décalage, sans se croiser", () => {
    const base = buildScene("pooling").lines.find((l) => l.el.id === "train-1")!.path.points;
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
  type Item = { name: string; text: string; schema: string; watermark: string };
  type Msg = { Home: { levers: { items: Record<string, Item> } & Record<string, unknown> } };
  const load = (loc: string) => JSON.parse(readFileSync(`messages/${loc}/home.json`, "utf8")) as Msg;

  it.each(["fr", "en"])("%s : chaque levier a un nom, un texte, une description de schéma et son filigrane", (loc) => {
    const items = load(loc).Home.levers.items;
    for (const id of LEVER_ORDER) {
      const it = items[id];
      expect(it, `${loc} : levier ${id}`).toBeDefined();
      for (const k of ["name", "text", "schema", "watermark"] as const) expect(it[k].length, `${loc}/${id}/${k}`).toBeGreaterThan(3);
    }
  });

  it.each(["fr", "en"])("%s : les bulles d'explication ont disparu des messages", (loc) => {
    const levers = load(loc).Home.levers;
    expect(levers, `${loc} : plus de légende fixe`).not.toHaveProperty("legend");
    for (const id of LEVER_ORDER) expect(levers.items[id], `${loc}/${id}`).not.toHaveProperty("callouts");
  });

  it("le filigrane est une phrase courte, avec un mot-clé en gras", () => {
    for (const loc of ["fr", "en"]) {
      for (const id of LEVER_ORDER) {
        const w = load(loc).Home.levers.items[id].watermark;
        expect(w.replace(/<\/?b>/g, "").length, `${loc}/${id} : une phrase punchy`).toBeLessThan(90);
        expect(w, `${loc}/${id} : un passage en gras`).toMatch(/<b>.+<\/b>/);
      }
    }
  });
});
