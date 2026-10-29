/** Placement sans chevauchement des bulles et des noms de lieux (en pixels d'écran). */

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const overlaps = (a: Box, b: Box) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

/** Première position libre autour de `anchor` parmi `offsets` ; la boîte retenue est ajoutée à `taken`. */
export function placeFirstFree(
  anchor: { x: number; y: number },
  offsets: readonly (readonly [number, number])[],
  size: { w: number; h: number },
  taken: Box[],
  bounds: { w: number; h: number },
): (Box & { dx: number; dy: number }) | null {
  for (const [dx, dy] of offsets) {
    const r = { x: anchor.x + dx, y: anchor.y + dy, w: size.w, h: size.h };
    if (r.x < 6 || r.y < 6 || r.x + r.w > bounds.w - 6 || r.y + r.h > bounds.h - 6) continue;
    if (taken.some((t) => overlaps(r, t))) continue;
    taken.push(r);
    return { ...r, dx, dy };
  }
  return null;
}

/** Positions essayées pour une bulle : au-dessus à droite, en dessous, à gauche, puis plus loin quand la place manque. */
export const CALLOUT_OFFSETS = (w: number, h: number): [number, number][] => [
  [20, -h - 26],
  [20, 26],
  [-w - 20, -h - 26],
  [-w - 20, 26],
  [20, -h - 90],
  [-w - 20, 90],
  [-w - 20, -h - 80],
  [20, 84],
  [-w / 2, 40],
  [-w / 2, -h - 40],
  [-w - 20, 150],
];

/** Positions essayées pour un nom de lieu. */
export const PLACE_OFFSETS = (w: number): [number, number][] => [
  [9, -22],
  [-w - 9, -22],
  [9, 6],
  [-w - 9, 6],
];

/**
 * Taille d'une bulle avant mesure : titre en gras sur une ligne, sous-titre qui passe à la ligne
 * au-delà de 15 rem, marges et bordure comprises (voir `.lever-callout` dans levers.css).
 */
export function estimateCallout(title: string, sub: string) {
  const inner = Math.min(240 - 42, Math.max(title.length * 7.7, sub.length * 6.3));
  const w = inner + 42;
  const subLines = Math.max(1, Math.ceil((sub.length * 6.3) / inner));
  return { w, h: 22 + 16.5 + 15.5 * subLines };
}

/** Largeur de carte en dessous de laquelle les bulles se relaient au lieu de cohabiter. */
export const NARROW_MAP = 560;

/**
 * Sur une petite carte, chaque bulle s'efface quand la suivante apparaît : elles ne se
 * recouvrent plus la carte à trois. La dernière reste jusqu'au bout.
 */
export function handoff<T extends { t0: number; t1: number }>(list: readonly T[]): T[] {
  const sorted = [...list].sort((a, b) => a.t0 - b.t0);
  return sorted.map((c, i) => (i < sorted.length - 1 ? { ...c, t1: Math.min(c.t1, sorted[i + 1].t0 + 0.02) } : c));
}
