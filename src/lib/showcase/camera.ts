/**
 * Mouvements de caméra de l'animation : un vol d'un chapitre à l'autre (avec un
 * recul qui laisse voir le monde tourner), puis une dérive très lente pendant
 * que le chapitre se lit. Fonctions pures — le composant ne fait que les appeler
 * à chaque image.
 */

export interface Cam {
  lon: number;
  lat: number;
  zoom: number;
}

/** Durée d'un vol, puis d'un chapitre à l'arrêt, en secondes. */
export const LEG_SECONDS = 2.8;
export const HOLD_SECONDS = 7.5;

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/** `to` ramené à moins de 180° de `from` : on tourne par le plus court chemin. */
export function shortLon(from: number, to: number): number {
  let d = to - from;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return from + d;
}

/** Recul au milieu du vol : assez pour voir le globe, jamais plus loin que le monde entier. */
export function legDip(from: Cam, to: Cam, floor = 2.7): number {
  return clamp((from.zoom + to.zoom) / 2 - floor, 0.2, 2.4);
}

/**
 * Position de la caméra à l'avancement `e` (0 à 1) d'un vol. Le recul suit une
 * courbe en cloche ; un léger balayage vers l'ouest — la Terre tourne vers
 * l'est — s'y ajoute à mi-vol et s'annule à l'arrivée.
 */
export function legCam(from: Cam, to: Cam, e: number, spin = 16): Cam {
  const k = clamp(e, 0, 1);
  const bell = Math.sin(Math.PI * k);
  return {
    lon: from.lon + (shortLon(from.lon, to.lon) - from.lon) * k - spin * bell,
    lat: from.lat + (to.lat - from.lat) * k,
    zoom: from.zoom + (to.zoom - from.zoom) * k - legDip(from, to) * bell,
  };
}

/** Dérive pendant un chapitre (`u` de 0 à 1) : part exactement de la vue d'arrivée du vol. */
export function holdCam(base: Cam, u: number): Cam {
  const k = clamp(u, 0, 1);
  return { lon: base.lon - 1.6 * k, lat: base.lat, zoom: base.zoom + 0.06 * k };
}

export interface Box {
  west: number;
  east: number;
  south: number;
  north: number;
}

/** Emprise d'un ensemble de points [lon, lat] (hors antiméridien : nos chapitres sont européens). */
export function boxOf(points: [number, number][]): Box {
  const lons = points.map((p) => p[0]);
  const lats = points.map((p) => p[1]);
  return { west: Math.min(...lons), east: Math.max(...lons), south: Math.min(...lats), north: Math.max(...lats) };
}

/**
 * Vue qui cadre une emprise dans une scène de `width` × `height` px. En projection
 * globe, MapLibre normalise le zoom comme Mercator à la latitude du centre : un
 * degré de longitude fait 512·2^z/360 px, un degré de latitude 1/cos(lat) fois plus.
 * On prend le plus petit des deux zooms (largeur, hauteur), avec de l'air autour des
 * sites — davantage à droite et en bas, où se posent les étiquettes — et des bornes
 * pour qu'un chapitre d'un seul site ne plonge pas dans la carte.
 */
export function fitCam(box: Box, width: number, height: number, limits = { min: 2.8, max: 6.4 }): Cam {
  const lat = (box.south + box.north) / 2;
  const dLon = Math.max(box.east - box.west, 1.5) * 1.45;
  const dLat = Math.max(box.north - box.south, 1) * 1.55;
  const zW = Math.log2((Math.max(width, 120) * 360) / (512 * dLon));
  const zH = Math.log2((Math.max(height, 120) * 360 * Math.cos((lat * Math.PI) / 180)) / (512 * dLat));
  return { lon: (box.west + box.east) / 2, lat, zoom: clamp(Math.min(zW, zH), limits.min, limits.max) };
}

/** Une vue donnée pour une scène de 640 px de côté, adaptée à la scène réelle (utilisé pour la vue d'ensemble). */
export function stageZoom(zoom: number, width: number, height: number): number {
  const side = Math.max(240, Math.min(width, height));
  return zoom + Math.log2(side / 640);
}

/**
 * Progression d'une liaison quand le chapitre se dévoile : chaque liaison part un
 * peu après la précédente et se trace sur 60 % du temps total.
 */
export function staggered(progress: number, rank: number, count: number): number {
  const span = 0.6;
  const delay = count > 1 ? (rank / (count - 1)) * (1 - span) : 0;
  return clamp((progress - delay) / span, 0, 1);
}
