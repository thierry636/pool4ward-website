/**
 * Les référentiels qui cartographient le physique du transport, montrés couche par couche : chaque
 * tuile de la planche qui suit la couverture joue une couche — des bornes de recharge, des services
 * maritimes, des services et un réseau ferroviaires, des services et un réseau fluviaux, des
 * parkings, des transporteurs.
 *
 * C'est une ILLUSTRATION éditoriale, comme la scène des leviers : les lieux sont réels, les
 * tracés et les positions des sites sont indicatifs (des liaisons entre villes, des points posés le
 * long d'un axe), aucun chiffre n'est annoncé et aucune donnée de référentiel n'est lue ici.
 * Les temps (`t`, `t0`, `t1`) vont de 0 à 1 sur la durée de la couche.
 */
import type { LonLat } from "@/lib/showcase/arcs";
import { AMBER, CHARGER_FRACTIONS, ELEC_NET, FLUVIAL_NET, HAUL, INDIGO, PINK, PORTS, RAIL_NET, ROAD, SEA_ATLANTIC_MED, SEA_OSLO_KIEL, SKY, TEAL, WHITE, type Anchor, type LineEl } from "./data";
import { buildLine, pointsAlong } from "./scene";

export const LAYER_IDS = ["chargers", "shortsea", "railServices", "railNetwork", "barges", "waterways", "parkings", "carriers"] as const;
export type LayerId = (typeof LAYER_IDS)[number];

/** Forme d'un repère : un point, un carré (site), un hub (cercle plein), un port (carré creux). */
export type DotShape = "dot" | "square" | "hub" | "port";

export interface LayerDot {
  at: Anchor;
  shape: DotShape;
  color: string;
  t: number;
}

export interface LayerRing {
  at: string;
  color: string;
  t: number;
}

export interface Layer {
  id: LayerId;
  /** La zone de la carte que la tuile cadre : tout ce que dessine la couche doit y tenir. */
  frame: Frame;
  /** Durée de la couche, en secondes, avant qu'elle ne soit rejouée. */
  seconds: number;
  lines: LineEl[];
  dots: LayerDot[];
  rings: LayerRing[];
}

export interface Frame {
  west: number;
  east: number;
  south: number;
  north: number;
}

/** Le cadre des tuiles : l'Europe du Portugal à la Pologne, de la Sicile à la Baltique. */
export const FRAME_CORE: Frame = { west: -10.2, east: 24.5, south: 36, north: 55.2 };
/** Le cadre élargi du shortsea, qui va de Gibraltar à Oslo et de l'Atlantique à la Baltique. */
export const FRAME_WIDE: Frame = { west: -11, east: 27.5, south: 34.5, north: 61.5 };

const line = (id: string, stops: readonly Anchor[], color: string, width: number, t0: number, t1: number, extra: Partial<LineEl> = {}): LineEl => ({ kind: "line", id, stops, color, width, t0, t1, ...extra });
const spread = (i: number, n: number, from: number, to: number) => from + (n > 1 ? (i / (n - 1)) * (to - from) : 0);

/** Des repères posés à des fractions d'un axe : bornes, parkings. */
function along(corridors: readonly (readonly string[])[], fractions: readonly number[], shape: DotShape, color: string, from: number, to: number): LayerDot[] {
  return corridors.flatMap((c, i) =>
    pointsAlong(c, fractions).map((p: LonLat, j): LayerDot => ({ at: [p[0], p[1]], shape, color, t: spread(i, corridors.length, from, to) + j * 0.015 })),
  );
}

const uniq = <T,>(xs: readonly T[]) => Array.from(new Set(xs));

/* Bornes de recharge : le réseau de corridors équipés, des hubs privés qui ressortent. */
const chargers: Layer = {
  id: "chargers",
  frame: FRAME_CORE,
  seconds: 7,
  lines: ELEC_NET.map((c, i) => line(`corridor-${i}`, c, AMBER, 1.2, spread(i, ELEC_NET.length, 0.04, 0.5), spread(i, ELEC_NET.length, 0.14, 0.6), { opacity: 0.3 })),
  dots: along(ELEC_NET, CHARGER_FRACTIONS, "dot", AMBER, 0.08, 0.66),
  rings: ["lyon", "frankfurt", "milano", "madrid", "paris", "berlin"].map((at, i) => ({ at, color: AMBER, t: 0.72 + i * 0.03 })),
};

/* Services shortsea : les ports côtiers, puis deux services de port à port. */
const shortsea: Layer = {
  id: "shortsea",
  frame: FRAME_WIDE,
  seconds: 7,
  lines: [line("sea-med", SEA_ATLANTIC_MED, TEAL, 3, 0.46, 0.82, { pulses: 2, halo: TEAL }), line("sea-nord", SEA_OSLO_KIEL, TEAL, 3, 0.52, 0.72, { pulses: 1, halo: TEAL })],
  dots: [
    ...PORTS.map((at, i): LayerDot => ({ at, shape: "dot", color: WHITE, t: spread(i, PORTS.length, 0.03, 0.42) })),
    ...["lehavre", "civitavecchia", "oslo", "kiel"].map((at): LayerDot => ({ at, shape: "port", color: TEAL, t: 0.46 })),
  ],
  rings: [],
};

/* Services ferroviaires : des terminaux, et les services qui les relient. */
const RAIL_SERVICES: readonly (readonly [string, string])[] = [
  ["madrid", "zaragoza"], ["zaragoza", "barcelona"], ["barcelona", "lyon"], ["lyon", "strasbourg"], ["paris", "strasbourg"], ["rotterdam", "koln"],
  ["koln", "berlin"], ["hamburg", "munchen"], ["munchen", "wien"], ["wien", "budapest"], ["milano", "munchen"], ["torino", "milano"], ["milano", "roma"],
  ["berlin", "poznan"], ["poznan", "warszawa"],
];
const railServices: Layer = {
  id: "railServices",
  frame: FRAME_CORE,
  seconds: 7,
  lines: RAIL_SERVICES.map(([a, b], i) => line(`service-${i}`, [a, b], INDIGO, 2.6, spread(i, RAIL_SERVICES.length, 0.08, 0.7), spread(i, RAIL_SERVICES.length, 0.2, 0.84), { pulses: i % 2 === 0 ? 1 : 0 })),
  dots: uniq(RAIL_SERVICES.flat()).map((at, i, all): LayerDot => ({ at, shape: "square", color: INDIGO, t: spread(i, all.length, 0.04, 0.6) })),
  rings: [],
};

/* Réseau ferroviaire : les lignes, puis les nœuds. */
const RAIL_EXTRA: readonly (readonly string[])[] = [["lisboa", "madrid"], ["paris", "bruxelles", "koln"], ["torino", "milano", "bologna", "roma", "napoli"], ["milano", "munchen", "wien", "budapest"], ["hamburg", "hannover", "frankfurt"], ["praha", "wien"], ["munchen", "praha", "wroclaw"]];
const RAIL_ALL = [...RAIL_NET, ...RAIL_EXTRA];
const railNetwork: Layer = {
  id: "railNetwork",
  frame: FRAME_CORE,
  seconds: 7,
  lines: RAIL_ALL.map((c, i) => line(`rail-${i}`, c, INDIGO, 1.8, spread(i, RAIL_ALL.length, 0.04, 0.58), spread(i, RAIL_ALL.length, 0.16, 0.7), { opacity: 0.9 })),
  dots: uniq(RAIL_ALL.flat()).map((at, i, all): LayerDot => ({ at, shape: "dot", color: "#c7d2fe", t: spread(i, all.length, 0.5, 0.9) })),
  rings: [],
};

/* Voies navigables, puis services de barges qui y circulent. */
const WATERWAYS: readonly (readonly string[])[] = [...FLUVIAL_NET, ["paris", "lehavre"], ["wien", "budapest"], ["hamburg", "dresden"], ["rotterdam", "antwerpen"]];
const waterways: Layer = {
  id: "waterways",
  frame: FRAME_CORE,
  seconds: 7,
  lines: WATERWAYS.map((c, i) => line(`waterway-${i}`, c, SKY, 2, spread(i, WATERWAYS.length, 0.04, 0.6), spread(i, WATERWAYS.length, 0.16, 0.72), { style: "dashed", opacity: 0.9 })),
  dots: uniq(WATERWAYS.flat()).map((at, i, all): LayerDot => ({ at, shape: "dot", color: "#bae6fd", t: spread(i, all.length, 0.5, 0.9) })),
  rings: [],
};
const BARGE_SERVICES: readonly (readonly string[])[] = [["rotterdam", "duisburg", "koln", "mannheim", "strasbourg", "basel"], ["marseille", "lyon"], ["paris", "lehavre"], ["wien", "budapest"]];
const barges: Layer = {
  id: "barges",
  frame: FRAME_CORE,
  seconds: 7,
  lines: [
    ...WATERWAYS.map((c, i) => line(`waterway-${i}`, c, SKY, 1.4, 0.02, 0.2, { style: "dashed", opacity: 0.35 })),
    ...BARGE_SERVICES.map((c, i) => line(`barge-${i}`, c, SKY, 3.4, spread(i, BARGE_SERVICES.length, 0.26, 0.58), spread(i, BARGE_SERVICES.length, 0.42, 0.78), { pulses: 2, halo: SKY })),
  ],
  dots: uniq(BARGE_SERVICES.flatMap((c) => [c[0], c[c.length - 1]])).map((at, i, all): LayerDot => ({ at, shape: "square", color: SKY, t: spread(i, all.length, 0.26, 0.58) })),
  rings: [],
};

/* Parkings : des aires de stationnement poids lourds le long des grands axes routiers. */
const ROAD_AXES: readonly (readonly string[])[] = [
  ["lisboa", "madrid", "zaragoza", "barcelona"], ["barcelona", "perpignan", "lyon"], ["lyon", "paris"], ["paris", "bruxelles", "rotterdam"], ["lyon", "basel", "frankfurt"],
  ["frankfurt", "hannover", "hamburg"], ["koln", "berlin", "poznan", "warszawa"], ["milano", "munchen", "wien", "budapest"], ["torino", "milano", "bologna", "roma", "napoli"], ["munchen", "praha", "wroclaw"],
];
const parkings: Layer = {
  id: "parkings",
  frame: FRAME_CORE,
  seconds: 7,
  lines: ROAD_AXES.map((c, i) => line(`axis-${i}`, c, ROAD, 1.4, spread(i, ROAD_AXES.length, 0.02, 0.4), spread(i, ROAD_AXES.length, 0.12, 0.5), { opacity: 0.4 })),
  dots: along(ROAD_AXES, [0.12, 0.3, 0.5, 0.7, 0.88], "square", "#93c5fd", 0.1, 0.78),
  rings: [],
};

/* Transporteurs : des implantations, la zone qu'elles couvrent, et leurs rayons d'action. */
const CARRIER_SITES = ["lisboa", "madrid", "barcelona", "lyon", "paris", "rotterdam", "bruxelles", "hamburg", "frankfurt", "munchen", "milano", "roma", "wien", "praha", "poznan", "warszawa", "budapest", "bilbao", "napoli", "gdansk"] as const;
const SPOKES: readonly (readonly [string, readonly string[]])[] = [
  ["lyon", ["marseille", "torino", "strasbourg", "paris", "barcelona"]],
  ["frankfurt", ["koln", "munchen", "leipzig", "strasbourg"]],
  ["milano", ["torino", "genova", "munchen", "bologna"]],
  ["poznan", ["berlin", "warszawa", "wroclaw", "gdansk"]],
];
const carriers: Layer = {
  id: "carriers",
  frame: FRAME_CORE,
  seconds: 7,
  lines: SPOKES.flatMap(([hub, to], i) => to.map((t, j) => line(`spoke-${hub}-${t}`, [hub, t], HAUL, 1.6, spread(i, SPOKES.length, 0.4, 0.62) + j * 0.02, spread(i, SPOKES.length, 0.5, 0.72) + j * 0.02, { opacity: 0.7 }))),
  dots: CARRIER_SITES.map((at, i): LayerDot => ({ at, shape: "hub", color: WHITE, t: spread(i, CARRIER_SITES.length, 0.04, 0.4) })),
  rings: SPOKES.map(([at], i) => ({ at, color: PINK, t: 0.36 + i * 0.05 })),
};

export const LAYERS: Record<LayerId, Layer> = { chargers, shortsea, railServices, railNetwork, barges, waterways, parkings, carriers };

/** Une couche prête à dessiner : les chemins des tracés sont calculés une fois. */
export interface BuiltLayer {
  layer: Layer;
  paths: { el: LineEl; points: LonLat[]; km: number }[];
}
const cache = new Map<LayerId, BuiltLayer>();
export function buildLayer(id: LayerId): BuiltLayer {
  let b = cache.get(id);
  if (!b) {
    const layer = LAYERS[id];
    b = {
      layer,
      paths: layer.lines.map((el) => {
        const { path } = buildLine(el);
        return { el, points: path.points, km: path.length };
      }),
    };
    cache.set(id, b);
  }
  return b;
}
