/**
 * Calculs de la scène des leviers, sans dépendance au rendu : ce que le globe (MapLibre)
 * comme la carte à plat (SVG) dessinent à un avancement donné. Pur, donc testé.
 */
import { makePath, pointAt, routePath, slice, type LonLat, type Path } from "@/lib/showcase/arcs";
import { boxOf, type Box } from "@/lib/showcase/camera";
import { PLACES, type Anchor, type ChargersEl, type LeverId, type LineEl, type NodeEl, type SceneEl, SCENES } from "./data";

export const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/** Avancement d'un élément dont l'apparition court de `t0` à `t1` quand le levier est à `u`. */
export const revealOf = (t0: number, t1: number, u: number) => clamp01((u - t0) / Math.max(1e-6, t1 - t0));

export function anchorOf(a: Anchor): LonLat {
  if (typeof a === "string") {
    const p = PLACES[a];
    if (!p) throw new Error(`lieu inconnu : ${a}`);
    return [p.lon, p.lat];
  }
  return [a[0], a[1]];
}

/**
 * Décale un tracé de `d` degrés sur sa perpendiculaire (corrigée de la latitude : le décalage
 * a la même taille à l'écran vers l'est qu'vers le nord). Sert aux faisceaux parallèles.
 */
export function offsetPoints(points: LonLat[], d: number): LonLat[] {
  if (!d) return points;
  return points.map((p, i) => {
    const a = points[Math.max(0, i - 1)];
    const b = points[Math.min(points.length - 1, i + 1)];
    const k = Math.cos((p[1] * Math.PI) / 180);
    const dx = (b[0] - a[0]) * k;
    const dy = b[1] - a[1];
    const n = Math.hypot(dx, dy) || 1;
    return [p[0] + ((-dy / n) * d) / Math.max(k, 0.2), p[1] + ((dx / n) * d)] as LonLat;
  });
}

export interface BuiltLine {
  el: LineEl;
  path: Path;
}

export function buildLine(el: LineEl): BuiltLine {
  const stops = el.closed ? [...el.stops, el.stops[0]] : [...el.stops];
  const raw = routePath(stops.map((s) => anchorOf(s)), 0.5);
  return { el, path: makePath(offsetPoints(raw, el.offset ?? 0)) };
}

/** Lignes, nœuds, bulles et bornes d'un levier, séparés par genre. */
export interface BuiltScene {
  lines: BuiltLine[];
  nodes: NodeEl[];
  rings: Extract<SceneEl, { kind: "ring" }>[];
  chargers: { el: ChargersEl; points: LonLat[] }[];
}

/** Points posés à des fractions de la longueur d'un tracé. */
export function pointsAlong(stops: readonly string[], fractions: readonly number[]): LonLat[] {
  const path = makePath(routePath(stops.map((s) => anchorOf(s)), 0.5));
  return fractions.map((f) => pointAt(path, f));
}

export function buildScene(id: LeverId): BuiltScene {
  const els = SCENES[id];
  return {
    lines: els.filter((e): e is LineEl => e.kind === "line").map(buildLine),
    nodes: els.filter((e): e is NodeEl => e.kind === "node"),
    rings: els.filter((e): e is Extract<SceneEl, { kind: "ring" }> => e.kind === "ring"),
    chargers: els.filter((e): e is ChargersEl => e.kind === "chargers").map((el) => ({ el, points: pointsAlong(el.along, el.fractions) })),
  };
}

/** Un tracé qui s'efface le fait en un sixième de la durée du levier. */
const DIM_SPAN = 0.06;

/** Opacité d'un tracé à l'avancement `u` : la sienne, puis `dimTo` une fois effacé (la liaison directe écartée). */
export function lineOpacity(el: LineEl, u: number): number {
  const base = el.opacity ?? 1;
  if (el.dimAt === undefined) return base;
  const k = clamp01((u - el.dimAt) / DIM_SPAN);
  return base + ((el.dimTo ?? 0.28) - base) * k;
}

/** Vrai quand le tracé est effacé : ses impulsions ne le parcourent plus. */
export const isDimmed = (el: LineEl, u: number): boolean => el.dimAt !== undefined && u >= el.dimAt;

/** Partie dessinée d'un tracé à l'avancement `u`. */
export function drawnPart(b: BuiltLine, u: number): LonLat[] {
  return slice(b.path, revealOf(b.el.t0, b.el.t1, u));
}

/** Emprise de ce que montre un levier (lieux et tracés) : c'est elle qui cadre la caméra. */
export function sceneBox(id: LeverId): Box {
  const s = buildScene(id);
  const pts: LonLat[] = [];
  for (const l of s.lines) pts.push(...l.path.points);
  for (const n of s.nodes) pts.push(anchorOf(n.at));
  return boxOf(pts);
}

/** Emprise de toute la région : la vue d'ensemble de la scène. */
export function regionBox(ids: readonly LeverId[]): Box {
  const boxes = ids.map(sceneBox);
  return {
    west: Math.min(...boxes.map((b) => b.west)),
    east: Math.max(...boxes.map((b) => b.east)),
    south: Math.min(...boxes.map((b) => b.south)),
    north: Math.max(...boxes.map((b) => b.north)),
  };
}
