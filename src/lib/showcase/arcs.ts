/**
 * Géométrie des liaisons : arcs de grand cercle échantillonnés, puis lus à une
 * fraction de leur longueur. Pur, sans dépendance : testé à part et réutilisé
 * par le globe (MapLibre) comme par la carte à plat.
 */

export type LonLat = [number, number];

const RAD = Math.PI / 180;
const EARTH_KM = 6371;

type Vec = [number, number, number];

const toVec = ([lon, lat]: LonLat): Vec => [Math.cos(lat * RAD) * Math.cos(lon * RAD), Math.cos(lat * RAD) * Math.sin(lon * RAD), Math.sin(lat * RAD)];
const toLonLat = ([x, y, z]: Vec): LonLat => [Math.atan2(y, x) / RAD, Math.asin(Math.max(-1, Math.min(1, z))) / RAD];

/** Distance en kilomètres (haversine). */
export function distanceKm(a: LonLat, b: LonLat): number {
  const dLat = (b[1] - a[1]) * RAD;
  const dLon = (b[0] - a[0]) * RAD;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * RAD) * Math.cos(b[1] * RAD) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Arc de grand cercle de a à b, un point tous les `stepDeg` degrés environ. Les
 * longitudes restent continues d'un point au suivant (pas de saut à ±180°), ce
 * qui permet de tracer une liaison qui franchit l'antiméridien.
 */
export function greatCircle(a: LonLat, b: LonLat, stepDeg = 0.6): LonLat[] {
  const va = toVec(a);
  const vb = toVec(b);
  const dot = Math.max(-1, Math.min(1, va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2]));
  const omega = Math.acos(dot);
  const steps = Math.max(2, Math.min(96, Math.ceil(omega / RAD / stepDeg)));
  const out: LonLat[] = [[a[0], a[1]]];
  for (let i = 1; i <= steps; i++) {
    const f = i / steps;
    let p: LonLat;
    if (omega < 1e-9) p = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
    else {
      const k0 = Math.sin((1 - f) * omega) / Math.sin(omega);
      const k1 = Math.sin(f * omega) / Math.sin(omega);
      p = toLonLat([k0 * va[0] + k1 * vb[0], k0 * va[1] + k1 * vb[1], k0 * va[2] + k1 * vb[2]]);
    }
    const prev = out[out.length - 1][0];
    while (p[0] - prev > 180) p[0] -= 360;
    while (p[0] - prev < -180) p[0] += 360;
    out.push(p);
  }
  return out;
}

/** Tracé d'une liaison qui passe par plusieurs sites : arcs bout à bout, sans point en double. */
export function routePath(stops: LonLat[], stepDeg?: number): LonLat[] {
  const out: LonLat[] = [];
  for (let i = 0; i < stops.length - 1; i++) {
    const arc = greatCircle(stops[i], stops[i + 1], stepDeg);
    if (out.length) {
      // le segment suivant reprend à la longitude où le précédent s'est arrêté
      const shift = Math.round((out[out.length - 1][0] - arc[0][0]) / 360) * 360;
      for (const p of arc) p[0] += shift;
      arc.shift();
    }
    out.push(...arc);
  }
  return out;
}

export interface Path {
  points: LonLat[];
  /** Distance cumulée depuis le départ, en km, pour chaque point. */
  cum: number[];
  length: number;
}

export function makePath(points: LonLat[]): Path {
  const cum = [0];
  for (let i = 1; i < points.length; i++) cum.push(cum[i - 1] + distanceKm(points[i - 1], points[i]));
  return { points, cum, length: cum[cum.length - 1] };
}

/** Index du segment qui contient la distance `d`, par recherche dichotomique. */
function segmentAt(cum: number[], d: number): number {
  let lo = 0;
  let hi = cum.length - 2;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (cum[mid] <= d) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

/** Point situé à la fraction `f` (0 à 1) de la longueur du tracé. */
export function pointAt(path: Path, f: number): LonLat {
  const d = Math.max(0, Math.min(1, f)) * path.length;
  const i = segmentAt(path.cum, d);
  const span = path.cum[i + 1] - path.cum[i] || 1;
  const t = (d - path.cum[i]) / span;
  const a = path.points[i];
  const b = path.points[i + 1];
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

/** Début du tracé jusqu'à la fraction `f` ; vide si f ≤ 0. */
export function slice(path: Path, f: number): LonLat[] {
  if (f <= 0) return [];
  if (f >= 1) return path.points;
  const d = f * path.length;
  const i = segmentAt(path.cum, d);
  return [...path.points.slice(0, i + 1), pointAt(path, f)];
}
