/**
 * La scène des leviers de la page d'accueil : une région du monde (la Méditerranée
 * occidentale) et six leviers joués tour à tour sur la même carte.
 *
 * C'est une ILLUSTRATION éditoriale, pas une donnée de référentiel : les lieux sont
 * réels (villes et ports, positions arrondies), les liaisons sont dessinées pour
 * expliquer chaque levier. Elles n'affirment l'existence d'aucun service, et la scène
 * ne porte ni chiffre ni nom d'opérateur. L'écran le dit (« Illustration »).
 *
 * Chaque levier est une liste d'ÉLÉMENTS (tracés, lieux, bulles) dont l'apparition est
 * minutée sur l'avancement `u` du levier, de 0 à 1.
 */

export type LeverId = "rail" | "shortsea" | "loops" | "crossdock" | "electric" | "pooling";

export const LEVER_ORDER: readonly LeverId[] = ["rail", "shortsea", "loops", "crossdock", "electric", "pooling"];

/** Durée de lecture d'un levier, en secondes. */
export const LEVER_SECONDS = 9;

export interface Place {
  fr: string;
  en: string;
  lon: number;
  lat: number;
}

export const PLACES: Record<string, Place> = {
  algeciras: { fr: "Algeciras", en: "Algeciras", lon: -5.45, lat: 36.13 },
  alicante: { fr: "Alicante", en: "Alicante", lon: -0.49, lat: 38.34 },
  valencia: { fr: "Valence", en: "Valencia", lon: -0.32, lat: 39.45 },
  castellon: { fr: "Castellón", en: "Castellón", lon: -0.02, lat: 39.97 },
  madrid: { fr: "Madrid", en: "Madrid", lon: -3.7, lat: 40.42 },
  zaragoza: { fr: "Saragosse", en: "Zaragoza", lon: -0.88, lat: 41.65 },
  barcelona: { fr: "Barcelone", en: "Barcelona", lon: 2.17, lat: 41.35 },
  perpignan: { fr: "Perpignan", en: "Perpignan", lon: 2.89, lat: 42.7 },
  marseille: { fr: "Marseille-Fos", en: "Marseille-Fos", lon: 4.87, lat: 43.4 },
  lyon: { fr: "Lyon", en: "Lyon", lon: 4.84, lat: 45.76 },
  torino: { fr: "Turin", en: "Turin", lon: 7.69, lat: 45.07 },
  milano: { fr: "Milan", en: "Milan", lon: 9.19, lat: 45.46 },
  genova: { fr: "Gênes", en: "Genoa", lon: 8.92, lat: 44.4 },
  livorno: { fr: "Livourne", en: "Livorno", lon: 10.3, lat: 43.55 },
  civitavecchia: { fr: "Civitavecchia", en: "Civitavecchia", lon: 11.8, lat: 42.09 },
  napoli: { fr: "Naples", en: "Naples", lon: 14.27, lat: 40.84 },
};

/** Un point d'ancrage : un lieu nommé, ou une position [lon, lat]. */
export type Anchor = string | readonly [number, number];

export type LineStyle = "solid" | "dashed" | "dotted";

export interface LineEl {
  kind: "line";
  id: string;
  /** Lieux traversés, dans l'ordre. */
  stops: readonly string[];
  color: string;
  width: number;
  style?: LineStyle;
  /** Fenêtre d'apparition, en avancement du levier. */
  t0: number;
  t1: number;
  /** Nombre d'impulsions lumineuses qui parcourent le tracé une fois dessiné. */
  pulses?: number;
  /** Tracé fermé : on revient au premier lieu. */
  closed?: boolean;
  /** Décalage perpendiculaire en degrés (faisceaux parallèles). */
  offset?: number;
  /** À cet avancement, le tracé s'efface à demi (ex. la liaison directe écartée). */
  dimAt?: number;
  /** Halo plus large sous le tracé (faisceau mutualisé). */
  halo?: string;
}

export type NodeKind = "port" | "rail" | "hub" | "origin" | "charger-now" | "charger-opt";

export interface NodeEl {
  kind: "node";
  at: Anchor;
  style: NodeKind;
  t: number;
  /** Pose le nom du lieu à côté. */
  label?: boolean;
  color?: string;
}

export interface RingEl {
  kind: "ring";
  at: string;
  color: string;
  t0: number;
}

export interface CalloutEl {
  kind: "callout";
  /** Clé de texte : `Levers.items.<levier>.callouts.<clé>.title|sub`. */
  key: string;
  at: Anchor;
  t0: number;
  t1: number;
  color: string;
}

/** Points posés à des fractions de la longueur d'un tracé (bornes de recharge). */
export interface ChargersEl {
  kind: "chargers";
  along: readonly string[];
  fractions: readonly number[];
  style: "charger-now" | "charger-opt";
  t0: number;
  t1: number;
}

export type SceneEl = LineEl | NodeEl | RingEl | CalloutEl | ChargersEl;

const INDIGO = "#818cf8";
const TEAL = "#2dd4bf";
const SKY = "#38bdf8";
const AMBER = "#fbbf24";
const SLATE = "#94a3b8";
const WHITE = "#f1f5f9";
const GHOST = "#64748b";

export const LEVER_COLOR: Record<LeverId, string> = {
  rail: INDIGO,
  shortsea: TEAL,
  loops: SKY,
  crossdock: WHITE,
  electric: AMBER,
  pooling: "#c4b5fd",
};

const rail = (id: string, stops: string[], t0: number, t1: number): LineEl => ({ kind: "line", id, stops, color: INDIGO, width: 3, t0, t1, pulses: 2 });
const leg = (id: string, stops: string[], t0: number, t1: number): LineEl => ({ kind: "line", id, stops, color: TEAL, width: 3.2, t0, t1, pulses: 1 });

export const SCENES: Record<LeverId, readonly SceneEl[]> = {
  /* Les longues distances passent au rail ; la route garde les premiers et derniers kilomètres. */
  rail: [
    rail("r1", ["algeciras", "madrid"], 0.1, 0.3),
    rail("r2", ["madrid", "zaragoza"], 0.18, 0.38),
    rail("r3", ["zaragoza", "barcelona"], 0.28, 0.48),
    rail("r4", ["valencia", "zaragoza"], 0.3, 0.5),
    rail("r5", ["barcelona", "perpignan", "lyon"], 0.4, 0.66),
    rail("r6", ["marseille", "lyon"], 0.56, 0.74),
    rail("r7", ["genova", "milano"], 0.6, 0.8),
    ...(["algeciras", "madrid", "zaragoza", "valencia", "barcelona", "lyon", "marseille", "genova", "milano"] as const).map(
      (p, i): NodeEl => ({ kind: "node", at: p, style: "rail", t: 0.1 + i * 0.07, label: true }),
    ),
    { kind: "callout", key: "terminal", at: "zaragoza", t0: 0.46, t1: 0.98, color: INDIGO },
    { kind: "callout", key: "corridor", at: "lyon", t0: 0.7, t1: 0.98, color: INDIGO },
  ],

  /* Le long de la côte, par escales, plutôt qu'une liaison directe. */
  shortsea: [
    { kind: "line", id: "direct", stops: ["algeciras", "napoli"], color: GHOST, width: 2, style: "dashed", t0: 0.08, t1: 0.22, dimAt: 0.3 },
    leg("c1", ["algeciras", "valencia"], 0.22, 0.32),
    leg("c2", ["valencia", "barcelona"], 0.32, 0.42),
    leg("c3", ["barcelona", "marseille"], 0.42, 0.52),
    leg("c4", ["marseille", "genova"], 0.52, 0.6),
    leg("c5", ["genova", "livorno"], 0.6, 0.67),
    leg("c6", ["livorno", "civitavecchia"], 0.67, 0.75),
    leg("c7", ["civitavecchia", "napoli"], 0.75, 0.83),
    ...(["algeciras", "valencia", "barcelona", "marseille", "genova", "livorno", "civitavecchia", "napoli"] as const).map(
      (p, i): NodeEl => ({ kind: "node", at: p, style: "port", t: 0.12 + i * 0.1, label: true }),
    ),
    { kind: "callout", key: "direct", at: [-0.2, 38.2], t0: 0.12, t1: 0.36, color: SLATE },
    { kind: "callout", key: "calls", at: "marseille", t0: 0.54, t1: 0.98, color: TEAL },
  ],

  /* Des rotations fermées : le retour trouve une charge. */
  loops: [
    { kind: "line", id: "a", stops: ["valencia", "zaragoza", "barcelona"], color: SKY, width: 3.2, t0: 0.1, t1: 0.4, pulses: 3, closed: true },
    { kind: "line", id: "b", stops: ["marseille", "lyon", "milano", "genova"], color: SKY, width: 3.2, t0: 0.36, t1: 0.72, pulses: 3, closed: true },
    ...(["valencia", "zaragoza", "barcelona", "marseille", "lyon", "milano", "genova"] as const).map(
      (p, i): NodeEl => ({ kind: "node", at: p, style: "hub", t: 0.1 + i * 0.08, label: true }),
    ),
    { kind: "callout", key: "round", at: "zaragoza", t0: 0.3, t1: 0.98, color: SKY },
    { kind: "callout", key: "return", at: "lyon", t0: 0.62, t1: 0.98, color: SKY },
  ],

  /* Les flux se rejoignent sur une plateforme, se regroupent, repartent pleins. */
  crossdock: [
    ...(["valencia", "zaragoza", "barcelona", "marseille", "genova"] as const).map(
      (p, i): LineEl => ({ kind: "line", id: `in-${p}`, stops: [p, "lyon"], color: SLATE, width: 1.6, t0: 0.08 + i * 0.07, t1: 0.2 + i * 0.07, pulses: 1 }),
    ),
    { kind: "ring", at: "lyon", color: WHITE, t0: 0.42 },
    { kind: "line", id: "out-milano", stops: ["lyon", "milano"], color: WHITE, width: 5, t0: 0.5, t1: 0.7, pulses: 2, halo: "#4263eb" },
    { kind: "line", id: "out-torino", stops: ["lyon", "torino"], color: WHITE, width: 5, t0: 0.55, t1: 0.74, pulses: 2, halo: "#4263eb" },
    ...(["valencia", "zaragoza", "barcelona", "marseille", "genova"] as const).map((p, i): NodeEl => ({ kind: "node", at: p, style: "origin", t: 0.08 + i * 0.07, label: i > 1 })),
    { kind: "node", at: "lyon", style: "hub", t: 0.38, label: true },
    { kind: "node", at: "milano", style: "port", t: 0.7, label: true },
    { kind: "node", at: "torino", style: "port", t: 0.74, label: true },
    { kind: "callout", key: "partial", at: "zaragoza", t0: 0.18, t1: 0.46, color: SLATE },
    { kind: "callout", key: "hub", at: "lyon", t0: 0.44, t1: 0.98, color: WHITE },
    { kind: "callout", key: "full", at: "milano", t0: 0.74, t1: 0.98, color: WHITE },
  ],

  /* Électrifier là où un réseau de bornes optimal le permet. */
  electric: [
    { kind: "line", id: "road", stops: ["valencia", "barcelona", "perpignan", "lyon"], color: "#cbd5e1", width: 2, t0: 0.06, t1: 0.28 },
    { kind: "chargers", along: ["valencia", "barcelona", "perpignan", "lyon"], fractions: [0.12, 0.33, 0.4, 0.84], style: "charger-now", t0: 0.26, t1: 0.4 },
    { kind: "line", id: "covered", stops: ["valencia", "barcelona", "perpignan", "lyon"], color: AMBER, width: 4.5, t0: 0.46, t1: 0.88, pulses: 2, halo: "#b45309" },
    { kind: "chargers", along: ["valencia", "barcelona", "perpignan", "lyon"], fractions: [0.06, 0.22, 0.38, 0.54, 0.7, 0.88], style: "charger-opt", t0: 0.44, t1: 0.82 },
    { kind: "node", at: "valencia", style: "hub", t: 0.06, label: true },
    { kind: "node", at: "barcelona", style: "hub", t: 0.14, label: true },
    { kind: "node", at: "lyon", style: "hub", t: 0.22, label: true },
    { kind: "callout", key: "now", at: [-0.7, 40.4], t0: 0.32, t1: 0.52, color: SLATE },
    { kind: "callout", key: "optimal", at: "perpignan", t0: 0.6, t1: 0.98, color: AMBER },
  ],

  /* Trois chargeurs, un même service. */
  pooling: [
    { kind: "line", id: "s1", stops: ["alicante", "valencia", "barcelona"], color: INDIGO, width: 2.4, t0: 0.08, t1: 0.34, pulses: 1 },
    { kind: "line", id: "s2", stops: ["castellon", "barcelona"], color: TEAL, width: 2.4, t0: 0.12, t1: 0.34, pulses: 1 },
    { kind: "line", id: "s3", stops: ["zaragoza", "barcelona"], color: AMBER, width: 2.4, t0: 0.16, t1: 0.34, pulses: 1 },
    { kind: "line", id: "halo", stops: ["barcelona", "marseille", "genova"], color: "#e2e8f0", width: 11, t0: 0.4, t1: 0.7 },
    { kind: "line", id: "b1", stops: ["barcelona", "marseille", "genova"], color: INDIGO, width: 2.6, t0: 0.42, t1: 0.72, pulses: 2, offset: -0.1 },
    { kind: "line", id: "b2", stops: ["barcelona", "marseille", "genova"], color: TEAL, width: 2.6, t0: 0.42, t1: 0.72, pulses: 2 },
    { kind: "line", id: "b3", stops: ["barcelona", "marseille", "genova"], color: AMBER, width: 2.6, t0: 0.42, t1: 0.72, pulses: 2, offset: 0.1 },
    { kind: "node", at: "alicante", style: "origin", t: 0.08, color: INDIGO, label: true },
    { kind: "node", at: "castellon", style: "origin", t: 0.12, color: TEAL, label: true },
    { kind: "node", at: "zaragoza", style: "origin", t: 0.16, color: AMBER, label: true },
    { kind: "node", at: "barcelona", style: "hub", t: 0.3, label: true },
    { kind: "node", at: "marseille", style: "port", t: 0.56, label: true },
    { kind: "node", at: "genova", style: "port", t: 0.72, label: true },
    { kind: "callout", key: "shippers", at: "zaragoza", t0: 0.18, t1: 0.4, color: SLATE },
    { kind: "callout", key: "shared", at: "marseille", t0: 0.6, t1: 0.98, color: "#c4b5fd" },
  ],
};
