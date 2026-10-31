/**
 * Géométrie du cas démonstrateur « terrain → engagements ».
 *
 * C'est un schéma, pas une carte : les sites, le fleuve, la voie ferrée et les
 * flux sont dessinés dans un repère abstrait de 900 × 760 et ne correspondent
 * à aucun territoire réel. Aucune distance, aucun temps de parcours, aucun
 * coût n'en est déduit. Le plateau affiche en permanence « cas démonstrateur ».
 */

export const BOARD_W = 900;
export const BOARD_H = 760;

export type Pt = readonly [number, number];
export type Cubic = readonly [Pt, Pt, Pt, Pt];

export const SITES = {
  N: { x: 150, y: 160 },
  C: { x: 440, y: 320 },
  E: { x: 760, y: 230 },
  S: { x: 270, y: 590 },
} as const;
export type SiteId = keyof typeof SITES;

/** Terminaux rail-route : infrastructure publique, pas site du groupe. */
export const TERMINALS = {
  T1: { x: 545, y: 392 },
  T2: { x: 738, y: 358 },
} as const;

export type FlowId = "F1" | "F2" | "F3" | "F4" | "F5" | "F6";

export interface FlowDef {
  id: FlowId;
  from: SiteId;
  to: SiteId;
  curve: Cubic;
  /** Volume relatif — trois paliers, jamais un chiffre. */
  volume: 1 | 2 | 3;
  /** Récurrence : nombre de départs par semaine dans le cas fictif. */
  perWeek: number;
}

const P = (x: number, y: number): Pt => [x, y];

export const FLOWS: Record<FlowId, FlowDef> = {
  F1: { id: "F1", from: "N", to: "C", curve: [P(150, 160), P(250, 170), P(340, 260), P(440, 320)], volume: 2, perWeek: 5 },
  F2: { id: "F2", from: "C", to: "E", curve: [P(440, 320), P(560, 270), P(660, 250), P(760, 230)], volume: 3, perWeek: 5 },
  F3: { id: "F3", from: "E", to: "S", curve: [P(760, 230), P(700, 420), P(450, 560), P(270, 590)], volume: 2, perWeek: 1 },
  F4: { id: "F4", from: "S", to: "N", curve: [P(270, 590), P(180, 500), P(110, 330), P(150, 160)], volume: 2, perWeek: 1 },
  F5: { id: "F5", from: "S", to: "C", curve: [P(270, 590), P(330, 520), P(380, 420), P(440, 320)], volume: 1, perWeek: 5 },
  F6: { id: "F6", from: "S", to: "C", curve: [P(270, 590), P(330, 520), P(380, 420), P(440, 320)], volume: 1, perWeek: 5 },
};

export const FLOW_IDS = Object.keys(FLOWS) as FlowId[];

/* ------------------------------------------------------------ utilitaires */

const norm = (dx: number, dy: number): Pt => {
  const l = Math.hypot(dx, dy) || 1;
  return [dx / l, dy / l];
};

/**
 * Décale une cubique de `d` unités le long de sa normale. Approximation
 * (décalage des quatre points par les normales des extrémités) : exacte aux
 * extrémités, suffisante pour des courbes douces comme celles du plateau.
 */
export function offsetCubic([p0, p1, p2, p3]: Cubic, d: number): Cubic {
  const [t0x, t0y] = norm(p1[0] - p0[0], p1[1] - p0[1]);
  const [t3x, t3y] = norm(p3[0] - p2[0], p3[1] - p2[1]);
  const n0: Pt = [-t0y, t0x];
  const n3: Pt = [-t3y, t3x];
  return [
    [p0[0] + n0[0] * d, p0[1] + n0[1] * d],
    [p1[0] + n0[0] * d, p1[1] + n0[1] * d],
    [p2[0] + n3[0] * d, p2[1] + n3[1] * d],
    [p3[0] + n3[0] * d, p3[1] + n3[1] * d],
  ];
}

export const reverseCubic = ([p0, p1, p2, p3]: Cubic): Cubic => [p3, p2, p1, p0];

const f = (n: number) => Math.round(n * 10) / 10;

export function cubicPath(c: Cubic, moveTo = true): string {
  const [p0, p1, p2, p3] = c;
  const c3 = `C${f(p1[0])},${f(p1[1])} ${f(p2[0])},${f(p2[1])} ${f(p3[0])},${f(p3[1])}`;
  return moveTo ? `M${f(p0[0])},${f(p0[1])} ${c3}` : c3;
}

/** Point à la fraction t d'une cubique. */
export function cubicAt([p0, p1, p2, p3]: Cubic, t: number): Pt {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return [
    a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
    a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1],
  ];
}

/* ---------------------------------------------------------------- chemins */

/** Trait principal d'un flux, décalé pour que F5 et F6 restent distincts. */
export function flowCurve(id: FlowId): Cubic {
  const base = FLOWS[id].curve;
  if (id === "F5") return offsetCubic(base, -7);
  if (id === "F6") return offsetCubic(base, 7);
  return base;
}

export const flowPath = (id: FlowId) => cubicPath(flowCurve(id));

/** Retour à vide : la même liaison, parcourue dans l'autre sens, un peu à côté. */
export function emptyReturnPath(id: FlowId): string {
  return cubicPath(offsetCubic(reverseCubic(FLOWS[id].curve), 15));
}

/** Boucle N → C → E → S → N : les quatre liaisons mises bout à bout. */
export const LOOP_PATH =
  cubicPath(FLOWS.F1.curve) +
  " " +
  cubicPath(FLOWS.F2.curve, false) +
  " " +
  cubicPath(FLOWS.F3.curve, false) +
  " " +
  cubicPath(FLOWS.F4.curve, false) +
  " Z";

export const RIVER_PATH =
  "M870,750 C760,700 640,660 560,610 S430,480 400,420 S330,300 300,250 S250,100 262,10";

export const RAIL_PATH = {
  west: "M40,486 C200,476 380,446 545,392",
  main: "M545,392 C640,372 700,364 738,358",
  east: "M738,358 C790,356 840,360 880,368",
};

/** Variante modale de F2 : route jusqu'au terminal, rail, route jusqu'au site. */
export const MODAL_F2 = {
  pre: cubicPath([P(440, 320), P(470, 336), P(510, 372), P(545, 392)]),
  rail: RAIL_PATH.main,
  post: cubicPath([P(738, 358), P(745, 320), P(752, 270), P(760, 230)]),
};

/** Point de l'étiquette d'un flux : milieu de la courbe, légèrement décalé. */
export function flowMid(id: FlowId, t = 0.5): Pt {
  return cubicAt(flowCurve(id), t);
}

/** Angle (degrés) de la tangente d'une cubique à la fraction t. */
export function tangentAngle([p0, p1, p2, p3]: Cubic, t: number): number {
  const u = 1 - t;
  const dx = 3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]);
  const dy = 3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

/** Étiquette posée à côté d'un flux : fraction de la courbe, décalage latéral. */
export function flowTag(id: FlowId, t: number, d: number): Pt {
  const c = flowCurve(id);
  const [x, y] = cubicAt(c, t);
  const a = (tangentAngle(c, t) * Math.PI) / 180;
  return [x - Math.sin(a) * d, y + Math.cos(a) * d];
}
