/**
 * La scène des leviers de la page d'accueil : six leviers joués tour à tour sur la même
 * carte de l'Europe. Chacun raconte une idée en trois temps — la situation de départ, ce
 * qu'on identifie dessus, ce qu'elle devient — et la carte du levier (LeverCard) en dit l'idée.
 *
 * C'est une ILLUSTRATION éditoriale, pas une donnée de référentiel : les lieux sont réels
 * (villes et ports, positions arrondies), les liaisons sont dessinées pour expliquer chaque
 * levier. Elles n'affirment l'existence d'aucun service et la scène ne porte aucun nom
 * d'opérateur. Chaque levier est une liste d'ÉLÉMENTS (tracés, lieux, bornes) dont
 * l'apparition est minutée sur l'avancement `u` du levier, de 0 à 1.
 */

export type LeverId = "rail" | "shortsea" | "loops" | "crossdock" | "electric" | "pooling";

export const LEVER_ORDER: readonly LeverId[] = ["rail", "shortsea", "loops", "crossdock", "electric", "pooling"];

/** Durée de lecture d'un levier, en secondes (celle des leviers qui n'ont pas la leur). */
export const LEVER_SECONDS = 12;

/** Chaque levier raconte plus ou moins d'étapes : le report modal et le bouclage prennent leur temps. */
const LEVER_DURATION: Partial<Record<LeverId, number>> = { rail: 15, shortsea: 15, loops: 15, crossdock: 12, electric: 16, pooling: 15 };
export const leverSeconds = (id: LeverId): number => LEVER_DURATION[id] ?? LEVER_SECONDS;

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
  /* report modal rail/fluvial : du sud de l'Espagne à la Pologne */
  sevilla: { fr: "Séville", en: "Seville", lon: -5.99, lat: 37.39 },
  almeria: { fr: "Almería", en: "Almería", lon: -2.46, lat: 36.84 },
  paris: { fr: "Paris", en: "Paris", lon: 2.35, lat: 48.86 },
  strasbourg: { fr: "Strasbourg", en: "Strasbourg", lon: 7.75, lat: 48.58 },
  basel: { fr: "Bâle", en: "Basel", lon: 7.59, lat: 47.56 },
  mannheim: { fr: "Mannheim", en: "Mannheim", lon: 8.47, lat: 49.49 },
  frankfurt: { fr: "Francfort", en: "Frankfurt", lon: 8.68, lat: 50.11 },
  koln: { fr: "Cologne", en: "Cologne", lon: 6.96, lat: 50.94 },
  duisburg: { fr: "Duisbourg", en: "Duisburg", lon: 6.76, lat: 51.43 },
  rotterdam: { fr: "Rotterdam", en: "Rotterdam", lon: 4.48, lat: 51.92 },
  hannover: { fr: "Hanovre", en: "Hanover", lon: 9.73, lat: 52.37 },
  leipzig: { fr: "Leipzig", en: "Leipzig", lon: 12.37, lat: 51.34 },
  dresden: { fr: "Dresde", en: "Dresden", lon: 13.74, lat: 51.05 },
  berlin: { fr: "Berlin", en: "Berlin", lon: 13.4, lat: 52.52 },
  poznan: { fr: "Poznań", en: "Poznań", lon: 16.93, lat: 52.41 },
  wroclaw: { fr: "Wrocław", en: "Wrocław", lon: 17.04, lat: 51.11 },
  lodz: { fr: "Łódź", en: "Łódź", lon: 19.46, lat: 51.76 },
  warszawa: { fr: "Varsovie", en: "Warsaw", lon: 21.01, lat: 52.23 },
  /* shortsea : les ports côtiers d'Europe */
  lisboa: { fr: "Lisbonne", en: "Lisbon", lon: -9.14, lat: 38.72 },
  leixoes: { fr: "Leixões", en: "Leixões", lon: -8.7, lat: 41.18 },
  sines: { fr: "Sines", en: "Sines", lon: -8.87, lat: 37.95 },
  bilbao: { fr: "Bilbao", en: "Bilbao", lon: -2.93, lat: 43.34 },
  lehavre: { fr: "Le Havre", en: "Le Havre", lon: 0.11, lat: 49.49 },
  dunkerque: { fr: "Dunkerque", en: "Dunkirk", lon: 2.37, lat: 51.03 },
  zeebrugge: { fr: "Zeebruges", en: "Zeebrugge", lon: 3.2, lat: 51.33 },
  antwerpen: { fr: "Anvers", en: "Antwerp", lon: 4.4, lat: 51.23 },
  hamburg: { fr: "Hambourg", en: "Hamburg", lon: 9.97, lat: 53.54 },
  bremerhaven: { fr: "Bremerhaven", en: "Bremerhaven", lon: 8.58, lat: 53.55 },
  felixstowe: { fr: "Felixstowe", en: "Felixstowe", lon: 1.35, lat: 51.96 },
  southampton: { fr: "Southampton", en: "Southampton", lon: -1.4, lat: 50.9 },
  liverpool: { fr: "Liverpool", en: "Liverpool", lon: -2.99, lat: 53.41 },
  dublin: { fr: "Dublin", en: "Dublin", lon: -6.26, lat: 53.35 },
  gothenburg: { fr: "Göteborg", en: "Gothenburg", lon: 11.97, lat: 57.7 },
  oslo: { fr: "Oslo", en: "Oslo", lon: 10.74, lat: 59.91 },
  copenhagen: { fr: "Copenhague", en: "Copenhagen", lon: 12.57, lat: 55.68 },
  stockholm: { fr: "Stockholm", en: "Stockholm", lon: 18.07, lat: 59.33 },
  helsinki: { fr: "Helsinki", en: "Helsinki", lon: 24.94, lat: 60.17 },
  tallinn: { fr: "Tallinn", en: "Tallinn", lon: 24.75, lat: 59.44 },
  riga: { fr: "Riga", en: "Riga", lon: 24.11, lat: 56.95 },
  klaipeda: { fr: "Klaipėda", en: "Klaipėda", lon: 21.13, lat: 55.7 },
  gdansk: { fr: "Gdańsk", en: "Gdańsk", lon: 18.65, lat: 54.35 },
  palermo: { fr: "Palerme", en: "Palermo", lon: 13.36, lat: 38.12 },
  cagliari: { fr: "Cagliari", en: "Cagliari", lon: 9.11, lat: 39.22 },
  koper: { fr: "Koper", en: "Koper", lon: 13.73, lat: 45.55 },
  bari: { fr: "Bari", en: "Bari", lon: 16.87, lat: 41.12 },
  piraeus: { fr: "Le Pirée", en: "Piraeus", lon: 23.64, lat: 37.94 },
  thessaloniki: { fr: "Thessalonique", en: "Thessaloniki", lon: 22.94, lat: 40.64 },
  /* boucles, électrification, mutualisation : des villes d'Europe */
  bruxelles: { fr: "Bruxelles", en: "Brussels", lon: 4.35, lat: 50.85 },
  wien: { fr: "Vienne", en: "Vienna", lon: 16.37, lat: 48.21 },
  praha: { fr: "Prague", en: "Prague", lon: 14.42, lat: 50.08 },
  munchen: { fr: "Munich", en: "Munich", lon: 11.58, lat: 48.14 },
  roma: { fr: "Rome", en: "Rome", lon: 12.5, lat: 41.9 },
  budapest: { fr: "Budapest", en: "Budapest", lon: 19.04, lat: 47.5 },
  dourges: { fr: "Dourges", en: "Dourges", lon: 3.0, lat: 50.43 },
  kiel: { fr: "Kiel", en: "Kiel", lon: 10.15, lat: 54.33 },
  bordeaux: { fr: "Bordeaux", en: "Bordeaux", lon: -0.58, lat: 44.84 },
  toulouse: { fr: "Toulouse", en: "Toulouse", lon: 1.44, lat: 43.6 },
  stuttgart: { fr: "Stuttgart", en: "Stuttgart", lon: 9.18, lat: 48.78 },
  bologna: { fr: "Bologne", en: "Bologna", lon: 11.34, lat: 44.49 },
};

/** Un point d'ancrage : un lieu nommé, ou une position [lon, lat]. */
export type Anchor = string | readonly [number, number];

export type LineStyle = "solid" | "dashed" | "dotted";

export interface LineEl {
  kind: "line";
  id: string;
  /** Lieux traversés, dans l'ordre ; une position [lon, lat] sert de point de passage (un tracé qui suit la mer). */
  stops: readonly Anchor[];
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
  /** À cet avancement, le tracé s'efface (ex. la liaison directe écartée). */
  dimAt?: number;
  /** Opacité atteinte à `dimAt` (0,28 par défaut). */
  dimTo?: number;
  /** Opacité du tracé tant qu'il n'est pas effacé (1 par défaut) : un réseau en filigrane. */
  opacity?: number;
  /** Exclu du réseau discret affiché derrière tous les leviers (et de l'image d'attente). */
  skipBase?: boolean;
  /** Halo plus large sous le tracé (faisceau mutualisé). */
  halo?: string;
}

export type NodeKind = "port" | "rail" | "hub" | "origin" | "dot" | "charger-now" | "charger-opt" | "charger-net";

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

/** Points posés à des fractions de la longueur d'un tracé (bornes de recharge). */
export interface ChargersEl {
  kind: "chargers";
  along: readonly string[];
  fractions: readonly number[];
  style: "charger-now" | "charger-opt" | "charger-net";
  t0: number;
  t1: number;
}

export type SceneEl = LineEl | NodeEl | RingEl | ChargersEl;

const INDIGO = "#818cf8";
const TEAL = "#2dd4bf";
const SKY = "#38bdf8";
const AMBER = "#fbbf24";
const SLATE = "#94a3b8";
const WHITE = "#f1f5f9";
const ROAD = "#94a3b8";
const HAUL = "#cbd5e1";
const PINK = "#f472b6";

/** Report modal : flux directs par la route (départ → arrivée), puis le service ferroviaire retenu. */
const DIRECT: readonly (readonly [string, string])[] = [
  ["algeciras", "wroclaw"],
  ["sevilla", "lodz"],
  ["almeria", "warszawa"],
];
const SERVICE: readonly string[] = ["zaragoza", "barcelona", "perpignan", "lyon", "strasbourg", "frankfurt", "berlin", "poznan"];
/** Réseaux en filigrane : tracés indicatifs entre villes, pas des lignes ni des voies d'eau relevées. */
const RAIL_NET: readonly (readonly string[])[] = [
  ["algeciras", "sevilla", "madrid"],
  ["almeria", "madrid"],
  ["madrid", "zaragoza"],
  ["valencia", "zaragoza"],
  ["zaragoza", "barcelona", "perpignan", "lyon"],
  ["lyon", "paris"],
  ["lyon", "strasbourg"],
  ["paris", "strasbourg"],
  ["strasbourg", "frankfurt"],
  ["frankfurt", "leipzig", "berlin"],
  ["frankfurt", "hannover", "berlin"],
  ["berlin", "poznan"],
  ["leipzig", "dresden", "wroclaw"],
  ["wroclaw", "poznan"],
  ["poznan", "warszawa"],
  ["wroclaw", "lodz"],
];
const FLUVIAL_NET: readonly (readonly string[])[] = [
  ["basel", "strasbourg", "mannheim", "koln", "duisburg", "rotterdam"],
  ["marseille", "lyon"],
  ["duisburg", "hannover", "berlin"],
  ["berlin", "wroclaw"],
];

export const LEVER_COLOR: Record<LeverId, string> = {
  rail: INDIGO,
  shortsea: TEAL,
  loops: SKY,
  crossdock: WHITE,
  electric: AMBER,
  pooling: "#c4b5fd",
};

/** Shortsea : les ports côtiers d'Europe, dans l'ordre où ils apparaissent (de l'Atlantique à la Baltique, puis la Méditerranée). */
const PORTS: readonly string[] = [
  "sines", "lisboa", "leixoes", "bilbao", "lehavre", "southampton", "dublin", "liverpool", "felixstowe", "dunkerque", "zeebrugge", "antwerpen", "rotterdam",
  "bremerhaven", "hamburg", "kiel", "copenhagen", "gothenburg", "oslo", "stockholm", "helsinki", "tallinn", "riga", "klaipeda", "gdansk",
  "algeciras", "valencia", "barcelona", "cagliari", "marseille", "genova", "livorno", "civitavecchia", "napoli", "palermo", "koper", "bari", "thessaloniki", "piraeus",
];
/** Deux flux par la route : Paris → Rome, et de la Norvège vers l'Allemagne (Oslo → Cologne). */
const SEA_FLOWS: readonly { from: string; to: string }[] = [
  { from: "paris", to: "roma" },
  { from: "oslo", to: "koln" },
];
/**
 * Le service Le Havre → Civitavecchia, de port à port, tout en mer : Manche, golfe de Gascogne,
 * côte portugaise, détroit de Gibraltar, Méditerranée, mer Tyrrhénienne. Les points de passage
 * ne sont pas des escales ; ils tiennent le tracé dans l'eau (levers.test.ts le vérifie).
 */
const SEA_ATLANTIC_MED: readonly Anchor[] = [
  "lehavre", [-0.5, 49.8], [-1.0, 49.98], [-2.3, 49.98], [-3.6, 49.7], [-5.3, 49.0], [-6.2, 48.2], [-6.2, 46.5], [-8.0, 45.0], [-10.0, 43.5],
  [-10.2, 41.0], [-10.1, 38.7], [-9.7, 36.8], [-7.2, 36.2], [-5.7, 35.95], [-4.0, 36.1], [-2.0, 36.4], [0.0, 37.9], [1.8, 38.3], [4.5, 38.4],
  [8.6, 38.2], [9.6, 38.6], [10.3, 39.4], [11.5, 40.9], "civitavecchia",
];
/** Le service Oslo → Kiel : le fjord d'Oslo, le Skagerrak, le Kattegat, le Grand Belt, la baie de Kiel. */
const SEA_OSLO_KIEL: readonly Anchor[] = [
  "oslo", [10.58, 59.72], [10.6, 59.62], [10.55, 59.5], [10.53, 59.4], [10.58, 59.3], [10.62, 59.1], [10.62, 58.85], [10.6, 58.7], [10.9, 58.2], [11.05, 57.7],
  [11.4, 57.3], [11.1, 56.65], [10.95, 55.85], [10.82, 55.8], [11.04, 55.35], [10.95, 54.85], [10.6, 54.5], [10.3, 54.43], "kiel",
];

/**
 * Boucles : de nombreux flux paneuropéens à sens unique (de fond), et dedans quelques longues boucles
 * triangulaires : des jambes chargées qui se referment, au besoin avec une jambe à vide (dernier tracé).
 */
const LOOPS: readonly { id: string; legs: readonly (readonly [string, string])[]; empty?: readonly [string, string] }[] = [
  { id: "west", legs: [["barcelona", "antwerpen"], ["antwerpen", "milano"], ["milano", "barcelona"]] },
  { id: "east", legs: [["warszawa", "hamburg"], ["hamburg", "wien"]], empty: ["wien", "warszawa"] },
  { id: "south", legs: [["roma", "budapest"], ["budapest", "munchen"]], empty: ["munchen", "roma"] },
];
/** Les flux de fond : ceux des jambes chargées des boucles en font partie (c'est « à l'intérieur » qu'on les repère). */
const PAN_FLOWS: readonly (readonly [string, string])[] = [
  ["lisboa", "madrid"], ["madrid", "bordeaux"], ["bordeaux", "paris"], ["sevilla", "valencia"], ["valencia", "lyon"], ["toulouse", "milano"],
  ["barcelona", "antwerpen"], ["marseille", "torino"], ["lyon", "stuttgart"], ["paris", "rotterdam"], ["paris", "frankfurt"], ["lehavre", "koln"],
  ["antwerpen", "milano"], ["rotterdam", "berlin"], ["duisburg", "praha"], ["milano", "barcelona"], ["hamburg", "munchen"], ["frankfurt", "wien"],
  ["warszawa", "hamburg"], ["stuttgart", "budapest"], ["berlin", "wroclaw"], ["poznan", "praha"], ["hamburg", "wien"], ["lodz", "dresden"],
  ["gdansk", "berlin"], ["copenhagen", "hamburg"], ["roma", "budapest"], ["budapest", "wien"], ["wien", "milano"], ["milano", "roma"],
  ["budapest", "munchen"], ["bologna", "napoli"], ["roma", "bari"], ["torino", "barcelona"], ["zaragoza", "bordeaux"], ["hannover", "leipzig"],
  ["leipzig", "warszawa"], ["dresden", "praha"], ["bruxelles", "strasbourg"], ["basel", "munchen"], ["dourges", "lyon"],
];

/** Cross-dock : des flux partiels d'origines variées convergent vers une plateforme. */
const CROSS_ORIGINS: readonly string[] = ["barcelona", "zaragoza", "valencia", "marseille", "genova", "paris", "frankfurt", "basel", "bruxelles"];

/** Électrification : les flux, le réseau de bornes (des corridors), puis une boucle électrifiée qui en emprunte quelques-uns. */
const ELEC_FLOWS: readonly (readonly [string, string])[] = [
  ["madrid", "lyon"], ["barcelona", "milano"], ["paris", "berlin"], ["rotterdam", "wien"], ["hamburg", "munchen"], ["milano", "praha"], ["lyon", "frankfurt"], ["bruxelles", "warszawa"],
];
/** Les corridors de la boucle électrifiée : leurs bornes font partie du réseau, et celles qu'on utilise sont mises en avant. */
const ELEC_LOOP: readonly (readonly string[])[] = [["lyon", "strasbourg"], ["strasbourg", "frankfurt"], ["frankfurt", "paris"], ["paris", "lyon"]];
const ELEC_NET: readonly (readonly string[])[] = [
  ["lisboa", "madrid"], ["madrid", "zaragoza", "barcelona"], ["barcelona", "perpignan", "lyon"], ["lyon", "torino", "milano"], ["milano", "munchen", "wien"],
  ["wien", "praha", "berlin"], ["berlin", "poznan", "warszawa"], ["frankfurt", "leipzig", "berlin"], ["hamburg", "hannover", "frankfurt"], ["rotterdam", "koln", "frankfurt"],
  ["bruxelles", "paris"], ...ELEC_LOOP,
];
const CHARGER_FRACTIONS: readonly number[] = [0.12, 0.3, 0.5, 0.7, 0.88];
/** Les bornes de la boucle qu'on utilise : un sous-ensemble des bornes du réseau (mêmes fractions), donc au même endroit. */
const LOOP_STOPS_FRACTIONS: readonly number[] = [0.3, 0.7];

/** Mutualisation : des flux d'entreprises différentes, regroupés sur un même train Dourges → Poznań. */
const SHIPPERS: readonly { from: string; to: string; color: string }[] = [
  { from: "paris", to: "wroclaw", color: INDIGO },
  { from: "bruxelles", to: "lodz", color: TEAL },
  { from: "rotterdam", to: "warszawa", color: AMBER },
  { from: "lehavre", to: "gdansk", color: PINK },
];

export const SCENES: Record<LeverId, readonly SceneEl[]> = {
  /*
   * Report modal rail/fluvial : trois flux partent du sud de l'Espagne vers la Pologne, chacun
   * directement par la route. On branche en filigrane les réseaux ferré et fluvial ; on
   * identifie un service ferroviaire (Saragosse → Poznań) ; les flux se transforment en
   * pré-acheminement routier, traction ferroviaire et post-acheminement routier.
   */
  rail: [
    /* 1. La situation de départ : en direct, par la route. */
    ...DIRECT.map(
      ([from, to], i): LineEl => ({ kind: "line", id: `direct-${from}`, stops: [from, to], color: ROAD, width: 2.2, t0: 0.03 + i * 0.03, t1: 0.2 + i * 0.03, pulses: 1, dimAt: 0.62, dimTo: 0.14 }),
    ),
    /* 2. Les réseaux ferré et fluvial, en filigrane. */
    ...RAIL_NET.map(
      (stops, i): LineEl => ({ kind: "line", id: `net-rail-${i}`, stops, color: INDIGO, width: 1.8, opacity: 0.4, t0: 0.26 + (i % 6) * 0.015, t1: 0.42 + (i % 6) * 0.015, skipBase: true }),
    ),
    ...FLUVIAL_NET.map(
      (stops, i): LineEl => ({ kind: "line", id: `net-river-${i}`, stops, color: SKY, width: 2, style: "dashed", opacity: 0.5, t0: 0.3 + i * 0.02, t1: 0.46 + i * 0.02, skipBase: true }),
    ),
    /* 3. Un service ferroviaire est identifié. */
    { kind: "ring", at: "zaragoza", color: INDIGO, t0: 0.5 },
    { kind: "ring", at: "poznan", color: INDIGO, t0: 0.5 },
    { kind: "line", id: "service", stops: SERVICE, color: INDIGO, width: 4.6, t0: 0.52, t1: 0.68, pulses: 3, halo: INDIGO },
    /* 4. Les flux se transforment : route, rail, route. */
    ...DIRECT.map(
      ([from], i): LineEl => ({ kind: "line", id: `pre-${from}`, stops: [from, "zaragoza"], color: HAUL, width: 2.6, t0: 0.68 + i * 0.02, t1: 0.8 + i * 0.02, pulses: 1 }),
    ),
    ...DIRECT.map(
      ([, to], i): LineEl => ({ kind: "line", id: `post-${to}`, stops: ["poznan", to], color: HAUL, width: 2.6, t0: 0.82 + i * 0.02, t1: 0.92 + i * 0.02, pulses: 1 }),
    ),
    ...DIRECT.map(([from], i): NodeEl => ({ kind: "node", at: from, style: "origin", t: 0.03 + i * 0.03, label: true })),
    ...DIRECT.map(([, to], i): NodeEl => ({ kind: "node", at: to, style: "origin", t: 0.12 + i * 0.03, label: true })),
    { kind: "node", at: "zaragoza", style: "hub", t: 0.5, label: true },
    { kind: "node", at: "poznan", style: "hub", t: 0.5, label: true },
  ],


  /*
   * Shortsea : deux flux par la route (Paris → Rome, Oslo → Cologne). On branche en filigrane les
   * ports côtiers d'Europe. On identifie deux services de port à port — Le Havre → Civitavecchia,
   * Oslo → Kiel — et les flux se transforment : route, mer, route. Les tracés en mer restent dans l'eau.
   */
  shortsea: [
    /* 1. La situation de départ : en direct, par la route. */
    ...SEA_FLOWS.map(
      ({ from, to }, i): LineEl => ({ kind: "line", id: `direct-${from}`, stops: [from, to], color: ROAD, width: 2.2, t0: 0.03 + i * 0.04, t1: 0.2 + i * 0.04, pulses: 1, dimAt: 0.62, dimTo: 0.14 }),
    ),
    ...SEA_FLOWS.map(({ from }, i): NodeEl => ({ kind: "node", at: from, style: "origin", t: 0.03 + i * 0.04, label: true })),
    ...SEA_FLOWS.map(({ to }, i): NodeEl => ({ kind: "node", at: to, style: "origin", t: 0.12 + i * 0.04, label: true })),
    /* 2. Les ports côtiers d'Europe, en filigrane. */
    ...PORTS.map((p, i): NodeEl => ({ kind: "node", at: p, style: "dot", t: 0.26 + (i / PORTS.length) * 0.2 })),
    /* 3. Deux services de port à port sont identifiés. */
    ...["lehavre", "civitavecchia", "oslo", "kiel"].map((p): RingEl => ({ kind: "ring", at: p, color: TEAL, t0: 0.5 })),
    ...["lehavre", "civitavecchia", "oslo", "kiel"].map((p): NodeEl => ({ kind: "node", at: p, style: "port", t: 0.5, label: p === "lehavre" })),
    { kind: "line", id: "sea-med", stops: SEA_ATLANTIC_MED, color: TEAL, width: 4.2, t0: 0.52, t1: 0.74, pulses: 3, halo: TEAL },
    { kind: "line", id: "sea-nord", stops: SEA_OSLO_KIEL, color: TEAL, width: 4.2, t0: 0.54, t1: 0.66, pulses: 2, halo: TEAL },
    /* 4. Les flux se transforment : route, mer, route. */
    { kind: "line", id: "pre-paris", stops: ["paris", "lehavre"], color: HAUL, width: 2.6, t0: 0.74, t1: 0.82, pulses: 1 },
    { kind: "line", id: "post-roma", stops: ["civitavecchia", "roma"], color: HAUL, width: 2.6, t0: 0.84, t1: 0.9, pulses: 1 },
    { kind: "line", id: "post-koln", stops: ["kiel", "koln"], color: HAUL, width: 2.6, t0: 0.84, t1: 0.94, pulses: 1 },
  ],

  /*
   * Boucles : une quarantaine de flux paneuropéens à sens unique ; dedans, on identifie quelques
   * longues boucles triangulaires — des jambes chargées qui se referment, au besoin avec une jambe
   * à vide. Aucun nom de ville : seuls les tracés parlent.
   */
  loops: [
    ...PAN_FLOWS.map(
      ([from, to], i): LineEl => ({
        kind: "line",
        id: `flow-${i}`,
        stops: [from, to],
        color: ROAD,
        width: 1.7,
        t0: 0.02 + (i / (PAN_FLOWS.length - 1)) * 0.36,
        t1: 0.12 + (i / (PAN_FLOWS.length - 1)) * 0.36,
        pulses: i % 4 === 0 ? 1 : 0,
        dimAt: 0.48,
        dimTo: 0.25,
      }),
    ),
    ...LOOPS.flatMap((lp, k) => {
      const t = 0.5 + k * 0.15;
      const step = 0.055;
      const vertices = Array.from(new Set(lp.legs.flatMap(([a, b]) => [a, b])));
      return [
        ...lp.legs.map(
          ([from, to], i): LineEl => ({ kind: "line", id: `loop-${lp.id}-${i}`, stops: [from, to], color: SKY, width: 3.6, t0: t + i * step, t1: t + i * step + 0.07, pulses: 2, halo: SKY }),
        ),
        ...(lp.empty
          ? [{ kind: "line", id: `empty-${lp.id}`, stops: [...lp.empty], color: SLATE, width: 2.4, style: "dashed", t0: t + lp.legs.length * step, t1: t + lp.legs.length * step + 0.07 } as LineEl]
          : []),
        ...vertices.map((p): NodeEl => ({ kind: "node", at: p, style: "hub", t: t })),
      ];
    }),
  ],

  /*
   * Cross-dock : de petits flux d'origines variées convergent vers une plateforme, se consolident,
   * et repartent en un seul gros flux vers l'usine.
   */
  crossdock: [
    ...CROSS_ORIGINS.map(
      (p, i): LineEl => ({ kind: "line", id: `in-${p}`, stops: [p, "lyon"], color: SLATE, width: 1.6, t0: 0.05 + i * 0.04, t1: 0.17 + i * 0.04, pulses: 1 }),
    ),
    ...CROSS_ORIGINS.map((p, i): NodeEl => ({ kind: "node", at: p, style: "origin", t: 0.05 + i * 0.04, label: i % 2 === 0 })),
    { kind: "ring", at: "lyon", color: WHITE, t0: 0.5 },
    { kind: "node", at: "lyon", style: "hub", t: 0.5, label: true },
    { kind: "line", id: "out", stops: ["lyon", "milano"], color: WHITE, width: 9, t0: 0.58, t1: 0.82, pulses: 3, halo: "#4263eb" },
    { kind: "node", at: "milano", style: "hub", t: 0.82, label: true },
  ],

  /*
   * Électrification : les flux, puis le réseau de bornes tout autour, puis un flux bouclé et
   * électrifié qui se recharge sur les bonnes bornes.
   */
  electric: [
    ...ELEC_FLOWS.map(
      ([from, to], i): LineEl => ({ kind: "line", id: `flow-${i}`, stops: [from, to], color: ROAD, width: 1.8, t0: 0.03 + i * 0.025, t1: 0.15 + i * 0.025, pulses: 1, dimAt: 0.55, dimTo: 0.22 }),
    ),
    ...ELEC_NET.map(
      (stops, i): ChargersEl => ({ kind: "chargers", along: stops, fractions: CHARGER_FRACTIONS, style: "charger-net", t0: 0.28 + (i / ELEC_NET.length) * 0.2, t1: 0.34 + (i / ELEC_NET.length) * 0.2 }),
    ),
    ...ELEC_LOOP.map(
      (stops, i): LineEl => ({ kind: "line", id: `loop-${i}`, stops, color: AMBER, width: 4.4, t0: 0.58 + i * 0.07, t1: 0.66 + i * 0.07, pulses: 2, halo: "#b45309" }),
    ),
    ...ELEC_LOOP.map(
      (stops, i): ChargersEl => ({ kind: "chargers", along: stops, fractions: LOOP_STOPS_FRACTIONS, style: "charger-opt", t0: 0.62 + i * 0.07, t1: 0.7 + i * 0.07 }),
    ),
    ...["lyon", "strasbourg", "frankfurt", "paris"].map((p, i): NodeEl => ({ kind: "node", at: p, style: "hub", t: 0.58 + i * 0.07, label: true })),
  ],

  /*
   * Mutualisation : les flux de plusieurs entreprises, regroupés sur un même train — par exemple
   * Dourges → Poznań —, avec leur pré- et post-acheminement.
   */
  pooling: [
    ...SHIPPERS.map(
      (sh, i): LineEl => ({ kind: "line", id: `direct-${sh.from}`, stops: [sh.from, sh.to], color: sh.color, width: 2.4, t0: 0.03 + i * 0.03, t1: 0.2 + i * 0.03, pulses: 1, dimAt: 0.56, dimTo: 0.14 }),
    ),
    ...SHIPPERS.map((sh, i): NodeEl => ({ kind: "node", at: sh.from, style: "origin", t: 0.03 + i * 0.03, color: sh.color, label: true })),
    ...SHIPPERS.map((sh, i): NodeEl => ({ kind: "node", at: sh.to, style: "origin", t: 0.12 + i * 0.03, color: sh.color, label: true })),
    { kind: "ring", at: "dourges", color: WHITE, t0: 0.42 },
    { kind: "ring", at: "poznan", color: WHITE, t0: 0.42 },
    { kind: "node", at: "dourges", style: "hub", t: 0.42, label: true },
    { kind: "node", at: "poznan", style: "hub", t: 0.42, label: true },
    { kind: "line", id: "train-halo", stops: ["dourges", "poznan"], color: "#e2e8f0", width: 13, opacity: 0.35, t0: 0.46, t1: 0.66 },
    ...SHIPPERS.map(
      (sh, i): LineEl => ({ kind: "line", id: `train-${i}`, stops: ["dourges", "poznan"], color: sh.color, width: 2.6, offset: (i - 1.5) * 0.09, t0: 0.46, t1: 0.66, pulses: 1 }),
    ),
    ...SHIPPERS.map(
      (sh, i): LineEl => ({ kind: "line", id: `pre-${sh.from}`, stops: [sh.from, "dourges"], color: sh.color, width: 2.6, t0: 0.66 + i * 0.02, t1: 0.76 + i * 0.02, pulses: 1 }),
    ),
    ...SHIPPERS.map(
      (sh, i): LineEl => ({ kind: "line", id: `post-${sh.to}`, stops: ["poznan", sh.to], color: sh.color, width: 2.6, t0: 0.78 + i * 0.02, t1: 0.88 + i * 0.02, pulses: 1 }),
    ),
  ],
};
