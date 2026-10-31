/**
 * La couche « réseaux ferroviaire et fluvial » de la planche des référentiels : les lignes et les
 * voies navigables, puis les nœuds et les ports intérieurs. Elle remplace une capture du portail
 * tant qu'on n'en a pas fourni une pour ce référentiel.
 *
 * C'est une ILLUSTRATION éditoriale, comme la scène des leviers : les lieux sont réels, les tracés
 * sont indicatifs (des liaisons entre villes), aucun chiffre n'est annoncé et aucune donnée de
 * référentiel n'est lue ici. Les temps (`t`, `t0`, `t1`) vont de 0 à 1 sur la durée de la couche.
 */
import type { LonLat } from "@/lib/showcase/arcs";
import { FLUVIAL_NET, INDIGO, RAIL_NET, SKY, type Anchor, type LineEl } from "./data";
import { buildLine } from "./scene";

export const LAYER_IDS = ["networks"] as const;
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
  /** La zone de la carte que la couche cadre : tout ce qu'elle dessine doit y tenir. */
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

/** Le cadre : l'Europe du Portugal à la Pologne, de la Sicile à la Baltique. */
export const FRAME_CORE: Frame = { west: -10.2, east: 24.5, south: 36, north: 55.2 };

const line = (id: string, stops: readonly Anchor[], color: string, width: number, t0: number, t1: number, extra: Partial<LineEl> = {}): LineEl => ({ kind: "line", id, stops, color, width, t0, t1, ...extra });
const spread = (i: number, n: number, from: number, to: number) => from + (n > 1 ? (i / (n - 1)) * (to - from) : 0);
const uniq = <T,>(xs: readonly T[]) => Array.from(new Set(xs));

const WATERWAYS: readonly (readonly string[])[] = [...FLUVIAL_NET, ["paris", "lehavre"], ["wien", "budapest"], ["hamburg", "dresden"], ["rotterdam", "antwerpen"]];

/* Réseaux ferroviaire et fluvial : les lignes et les voies navigables, puis les nœuds et les ports. */
const RAIL_EXTRA: readonly (readonly string[])[] = [["lisboa", "madrid"], ["paris", "bruxelles", "koln"], ["torino", "milano", "bologna", "roma", "napoli"], ["milano", "munchen", "wien", "budapest"], ["hamburg", "hannover", "frankfurt"], ["praha", "wien"], ["munchen", "praha", "wroclaw"]];
const RAIL_ALL = [...RAIL_NET, ...RAIL_EXTRA];
const networks: Layer = {
  id: "networks",
  frame: FRAME_CORE,
  seconds: 8,
  lines: [
    ...RAIL_ALL.map((c, i) => line(`rail-${i}`, c, INDIGO, 1.8, spread(i, RAIL_ALL.length, 0.04, 0.5), spread(i, RAIL_ALL.length, 0.16, 0.62), { opacity: 0.9 })),
    ...WATERWAYS.map((c, i) => line(`waterway-${i}`, c, SKY, 2, spread(i, WATERWAYS.length, 0.3, 0.64), spread(i, WATERWAYS.length, 0.42, 0.76), { style: "dashed", opacity: 0.95 })),
  ],
  dots: [
    ...uniq(RAIL_ALL.flat()).map((at, i, all): LayerDot => ({ at, shape: "dot", color: "#c7d2fe", t: spread(i, all.length, 0.5, 0.86) })),
    ...uniq(WATERWAYS.flat()).map((at, i, all): LayerDot => ({ at, shape: "dot", color: "#bae6fd", t: spread(i, all.length, 0.62, 0.9) })),
  ],
  rings: [],
};

export const LAYERS: Record<LayerId, Layer> = { networks };

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
