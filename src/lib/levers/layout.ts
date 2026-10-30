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

/** Positions essayées pour un nom de lieu. */
export const PLACE_OFFSETS = (w: number): [number, number][] => [
  [9, -22],
  [-w - 9, -22],
  [9, 6],
  [-w - 9, 6],
];
