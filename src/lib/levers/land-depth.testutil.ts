import { readFileSync } from "node:fs";

/** Le jeu de polygones « terre » du fond de carte : sert à vérifier qu'un tracé en mer reste dans l'eau. */
const land = (JSON.parse(readFileSync("public/geo/land-50m-europe.json", "utf8")) as { geometry: { type: string; coordinates: number[][][][] | number[][][] } }).geometry;
const polygons: number[][][][] = land.type === "MultiPolygon" ? (land.coordinates as number[][][][]) : [land.coordinates as number[][][]];
const inRing = (p: [number, number], ring: number[][]) => {
  let c = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
/** Profondeur à l'intérieur des terres, en km (0 en mer) : distance au bord le plus proche. */
export function landDepthKm(p: [number, number]): number {
  const k = Math.cos((p[1] * Math.PI) / 180);
  for (const poly of polygons) {
    if (!inRing(p, poly[0]) || poly.slice(1).some((h) => inRing(p, h))) continue;
    let best = Infinity;
    for (const ring of poly) {
      for (let i = 1; i < ring.length; i++) {
        const ax = (ring[i - 1][0] - p[0]) * k, ay = ring[i - 1][1] - p[1], bx = (ring[i][0] - p[0]) * k, by = ring[i][1] - p[1];
        const dx = bx - ax, dy = by - ay;
        const t = Math.max(0, Math.min(1, -(ax * dx + ay * dy) / (dx * dx + dy * dy || 1e-12)));
        best = Math.min(best, Math.hypot(ax + t * dx, ay + t * dy) * 111.2);
      }
    }
    return best;
  }
  return 0;
}
