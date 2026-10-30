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

/** Le jeu de polygones « terre » du fond de carte : sert à vérifier qu'un tracé en mer reste dans l'eau. */
const land = (JSON.parse(readFileSync("public/geo/land-50m-europe.json", "utf8")) as { geometry: { type: string; coordinates: number[][][][] | number[][][] } }).geometry;
const polygons: number[][][][] = land.type === "MultiPolygon" ? (land.coordinates as number[][][][]) : [land.coordinates as number[][][]];
const inRing = (p: [number, number], ring: number[][]) => {
  let c = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
/** Profondeur à l'intérieur des terres, en km (0 en mer) : distance au bord le plus proche. */
function landDepthKm(p: [number, number]): number {
  const k = Math.cos((p[1] * Math.PI) / 180);
  for (const poly of polygons) {
    if (!inRing(p, poly[0]) || poly.slice(1).some((h) => inRing(p, h))) continue;
    let best = Infinity;
    for (const ring of poly) {
      for (let i = 1; i < ring.length; i++) {
        const ax = (ring[i - 1][0] - p[0]) * k, ay = ring[i - 1][1] - p[1], bx = (ring[i][0] - p[0]) * k, by = ring[i][1] - p[1];
        const dx = bx - ax, dy = by - ay;
        const t = Math.max(0, Math.min(1, -(ax * dx + ay * dy) / (dx * dx + dy * dy || 1e-12)));
        best = Math.min(best, Math.hypot(ax + t * dx, ay + t * dy) * 111.2);
      }
    }
    return best;
  }
  return 0;
}

describe("shortsea : des flux par la route, puis des services de port à port", () => {
  const scene = buildScene("shortsea");
  const line = (id: string) => scene.lines.find((l) => l.el.id === id)!;
  const ports = SCENES.shortsea.filter((e): e is NodeEl => e.kind === "node" && e.style === "dot");
  const med = line("sea-med");
  const nord = line("sea-nord");

  it("deux flux par la route : Paris → Rome, et de la Norvège vers l'Allemagne", () => {
    const [p0, p1] = endsOf(line("direct-paris"));
    expect(near(p0, anchorOf("paris")) && near(p1, anchorOf("roma")), "Paris → Rome").toBe(true);
    const [n0, n1] = endsOf(line("direct-oslo"));
    expect(near(n0, anchorOf("oslo")), "il part de Norvège").toBe(true);
    expect(near(n1, anchorOf("koln")), "il arrive en Allemagne").toBe(true);
    expect(line("direct-paris").el.stops, "un seul arc, sans escale").toHaveLength(2);
  });

  it("entre les flux et les services, on voit au moins trente ports côtiers, de l'Atlantique à la Baltique et à la Méditerranée", () => {
    expect(ports.length).toBeGreaterThanOrEqual(30);
    const lats = ports.map((p) => anchorOf(p.at)[1]);
    expect(Math.max(...lats), "la Baltique").toBeGreaterThan(58);
    expect(Math.min(...lats), "la Méditerranée").toBeLessThan(40);
    const directEnd = Math.max(...scene.lines.filter((l) => l.el.id.startsWith("direct-")).map((l) => l.el.t1));
    expect(Math.min(...ports.map((p) => p.t)), "après le début des flux directs").toBeGreaterThan(0.2);
    expect(Math.max(...ports.map((p) => p.t)), "avant les services").toBeLessThan(med.el.t0);
    expect(directEnd, "les flux directs sont déjà tracés").toBeLessThan(med.el.t0);
  });

  it("Paris → Rome passe par la mer : route jusqu'au Havre, mer du Havre à Civitavecchia, route jusqu'à Rome", () => {
    const pre = line("pre-paris");
    const post = line("post-roma");
    expect(near(endsOf(pre)[0], anchorOf("paris")) && near(endsOf(pre)[1], anchorOf("lehavre")), "Paris → Le Havre").toBe(true);
    expect(near(endsOf(med)[0], anchorOf("lehavre")) && near(endsOf(med)[1], anchorOf("civitavecchia")), "Le Havre → Civitavecchia").toBe(true);
    expect(near(endsOf(post)[0], anchorOf("civitavecchia")) && near(endsOf(post)[1], anchorOf("roma")), "Civitavecchia → Rome").toBe(true);
    expect(med.el.t0, "le service est identifié avant le pré-acheminement").toBeLessThan(pre.el.t0);
    expect(post.el.t0, "le post-acheminement suit le pré-acheminement").toBeGreaterThan(pre.el.t0);
  });

  it("la Norvège passe par la mer, d'Oslo à Kiel, puis par la route vers Cologne", () => {
    const post = line("post-koln");
    expect(near(endsOf(nord)[0], anchorOf("oslo")) && near(endsOf(nord)[1], anchorOf("kiel")), "Oslo → Kiel").toBe(true);
    expect(near(endsOf(post)[0], anchorOf("kiel")) && near(endsOf(post)[1], anchorOf("koln")), "Kiel → Cologne").toBe(true);
    expect(post.el.t0, "après le service maritime").toBeGreaterThanOrEqual(nord.el.t1);
  });

  it("chaque service est de port à port, sans escale : aucun autre port du fond n'est touché", () => {
    for (const sea of [med, nord]) {
      const [a, b] = endsOf(sea);
      for (const p of ports) {
        const at = anchorOf(p.at);
        if (near(at, a) || near(at, b)) continue;
        // Algeciras borde le détroit de Gibraltar : on passe devant, sans y faire escale
        const reach = p.at === "algeciras" ? 12 : 25;
        const closest = Math.min(...sea.path.points.map((q) => distanceKm(q, at)));
        expect(closest, `${sea.el.id} passe à ${Math.round(closest)} km de ${String(p.at)}`).toBeGreaterThan(reach);
      }
    }
  });

  it("les tracés en mer restent dans l'eau (à quelques kilomètres près, aux abords des ports)", () => {
    for (const sea of [med, nord]) {
      expect(sea.path.length, `${sea.el.id} : un vrai trajet maritime`).toBeGreaterThan(500);
      const bad = sea.path.points.filter((p, i) => sea.path.cum[i] > 30 && sea.path.length - sea.path.cum[i] > 30 && landDepthKm(p) > 12);
      expect(bad, `${sea.el.id} : ${bad.length} point(s) à plus de 12 km à l'intérieur des terres, dont ${bad[0]?.map((x) => x.toFixed(2))}`).toHaveLength(0);
    }
  });

  it("les flux directs sont écartés une fois le service tracé, et seul Le Havre est nommé parmi les ports", () => {
    for (const id of ["direct-paris", "direct-oslo"]) {
      const el = line(id).el;
      expect(el.dimAt!, id).toBeGreaterThanOrEqual(Math.min(med.el.t0, nord.el.t0));
      expect(lineOpacity(el, 1), id).toBeLessThan(0.3);
    }
    const named = SCENES.shortsea.filter((e): e is NodeEl => e.kind === "node" && e.style === "port" && !!e.label);
    expect(named.map((n) => n.at)).toEqual(["lehavre"]);
  });
});

describe("boucles : de nombreux flux paneuropéens, puis de longues boucles triangulaires", () => {
  const scene = buildScene("loops");
  const flows = scene.lines.filter((l) => l.el.id.startsWith("flow-"));
  const ids = ["west", "east", "south"];
  const legs = (id: string) => scene.lines.filter((l) => l.el.id.startsWith(`loop-${id}-`));
  const empty = (id: string) => scene.lines.find((l) => l.el.id === `empty-${id}`);

  it("une quarantaine de flux à sens unique d'abord, écartés quand les boucles sont identifiées", () => {
    expect(flows.length).toBeGreaterThanOrEqual(35);
    const firstLoop = Math.min(...ids.flatMap(legs).map((l) => l.el.t0));
    expect(Math.max(...flows.map((l) => l.el.t1)), "tous les flux sont tracés avant la première boucle").toBeLessThanOrEqual(firstLoop);
    for (const l of flows) {
      expect(l.el.dimAt, l.el.id).toBeDefined();
      expect(l.el.dimAt!, `${l.el.id} s'efface quand les boucles commencent`).toBeGreaterThanOrEqual(firstLoop - 0.05);
    }
  });

  it.each(ids)("la boucle %s est un triangle qui se referme, et ses jambes chargées sont des flux du fond", (id) => {
    const loaded = legs(id);
    const closing = empty(id);
    for (let i = 1; i < loaded.length; i++) expect(near(endsOf(loaded[i - 1])[1], endsOf(loaded[i])[0]), `jambe ${i}`).toBe(true);
    const last = closing ?? loaded[loaded.length - 1];
    if (closing) expect(near(endsOf(loaded[loaded.length - 1])[1], endsOf(closing)[0]), "la jambe à vide part d'où l'on a fini").toBe(true);
    expect(near(endsOf(last)[1], endsOf(loaded[0])[0]), "la boucle revient à son point de départ").toBe(true);
    expect(loaded.length + (closing ? 1 : 0), "trois côtés : un triangle").toBe(3);
    for (const l of loaded) {
      const [a, b] = endsOf(l);
      expect(flows.some((f) => near(endsOf(f)[0], a) && near(endsOf(f)[1], b)), `${l.el.id} est déjà un flux du fond`).toBe(true);
    }
  });

  it("les boucles sont longues : chaque côté fait plus de 500 km, et l'une relie Barcelone à Anvers", () => {
    for (const id of ids) {
      for (const l of [...legs(id), ...(empty(id) ? [empty(id)!] : [])]) expect(distanceKm(...endsOf(l)), l.el.id).toBeGreaterThan(500);
    }
    const west = legs("west");
    expect(near(endsOf(west[0])[0], anchorOf("barcelona")) && near(endsOf(west[0])[1], anchorOf("antwerpen")), "Barcelone → Anvers").toBe(true);
  });

  it("une boucle se referme par une jambe à vide en pointillé, une autre par une jambe chargée", () => {
    const closings = ids.map((id) => empty(id));
    expect(closings.some((c) => c?.el.style === "dashed"), "une jambe à vide").toBe(true);
    expect(closings.some((c) => !c), "une boucle entièrement chargée").toBe(true);
    for (const c of closings) if (c) expect(c.el.width, "plus discrète qu'une jambe chargée").toBeLessThan(legs("west")[0].el.width ?? 0);
  });

  it("aucun nom de ville sur la scène des boucles", () => {
    expect(scene.nodes.length, "des repères aux sommets").toBeGreaterThan(0);
    for (const n of scene.nodes) expect(n.label, `repère ${String(n.at)}`).toBeFalsy();
  });

  it("les boucles se traitent l'une après l'autre", () => {
    const starts = ids.map((id) => legs(id)[0].el.t0);
    expect([...starts].sort((a, b) => a - b), "ordre d'apparition").toEqual(starts);
    expect(new Set(starts).size, "des départs distincts").toBe(ids.length);
    expect(Math.max(...ids.flatMap((id) => [...legs(id), ...(empty(id) ? [empty(id)!] : [])]).map((l) => l.el.t1)), "tout tient dans le levier").toBeLessThanOrEqual(1);
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
  type Item = { name: string; text: string; schema: string; card: { head?: string; label: string } };
  type Msg = { Home: { levers: { items: Record<string, Item> } & Record<string, unknown> } };
  const load = (loc: string) => JSON.parse(readFileSync(`messages/${loc}/home.json`, "utf8")) as Msg;

  it.each(["fr", "en"])("%s : chaque levier a un nom, un texte, une description de schéma et sa carte", (loc) => {
    const items = load(loc).Home.levers.items;
    for (const id of LEVER_ORDER) {
      const it = items[id];
      expect(it, `${loc} : levier ${id}`).toBeDefined();
      for (const k of ["name", "text", "schema"] as const) expect(it[k].length, `${loc}/${id}/${k}`).toBeGreaterThan(3);
      expect(it.card.label.length, `${loc}/${id}/card`).toBeGreaterThan(3);
    }
  });

  it.each(["fr", "en"])("%s : plus de bulles d'explication ni de filigrane dans les messages", (loc) => {
    const levers = load(loc).Home.levers;
    expect(levers, `${loc} : plus de légende fixe`).not.toHaveProperty("legend");
    for (const id of LEVER_ORDER) {
      expect(levers.items[id], `${loc}/${id}`).not.toHaveProperty("callouts");
      expect(levers.items[id], `${loc}/${id}`).not.toHaveProperty("watermark");
    }
  });

  it("la carte est courte : deux lignes, un passage qui accroche (chiffre ou phrase)", () => {
    for (const loc of ["fr", "en"]) {
      for (const id of LEVER_ORDER) {
        const { head, label } = load(loc).Home.levers.items[id].card;
        expect(label.length, `${loc}/${id} : une ligne de précision`).toBeLessThan(60);
        if (head !== undefined) expect(head.length, `${loc}/${id} : un titre court`).toBeLessThan(40);
      }
    }
  });
});
