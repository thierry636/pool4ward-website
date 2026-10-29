import { POLICY, type LayerId } from "./layers";

/**
 * Grille d'agrégation d'une couche : un effectif par cellule de `cellDeg`
 * degrés. C'est la seule représentation d'un référentiel que ce module
 * manipule ; elle ne contient ni identifiant, ni coordonnée plus fine que la
 * maille, ni attribut source.
 */
export interface AggregateGrid {
  layer: LayerId;
  cellDeg: number;
  rows: number;
  cols: number;
  /** Effectifs, ligne par ligne, du sud (−90°) au nord, de l'ouest (−180°) à l'est. */
  counts: Uint16Array;
  /** Date de l'extraction (AAAA-MM-JJ), ou null pour des données de démonstration. */
  asOf: string | null;
  provenance: "demo" | "live";
}

export function emptyGrid(layer: LayerId, provenance: "demo" | "live", asOf: string | null): AggregateGrid {
  const cellDeg = POLICY[layer].cellDeg;
  const rows = Math.round(180 / cellDeg);
  const cols = Math.round(360 / cellDeg);
  return { layer, cellDeg, rows, cols, counts: new Uint16Array(rows * cols), asOf, provenance };
}

/** Effectif d'une cellule après masquage des petits effectifs. */
export function visibleCount(grid: AggregateGrid, row: number, col: number): number {
  if (row < 0 || row >= grid.rows) return 0;
  const c = ((col % grid.cols) + grid.cols) % grid.cols;
  const n = grid.counts[row * grid.cols + c];
  return n < POLICY[grid.layer].minCount ? 0 : n;
}

/**
 * Valeur lissée en un point (interpolation bilinéaire entre centres de cellules,
 * sur les effectifs déjà masqués). Le lissage ne crée aucune information : il
 * ne fait qu'adoucir le raster, dont la résolution reste celle de la maille.
 */
export function sample(grid: AggregateGrid, lon: number, lat: number): number {
  const fx = (lon + 180) / grid.cellDeg - 0.5;
  const fy = (lat + 90) / grid.cellDeg - 0.5;
  const x0 = Math.floor(fx);
  const y0 = Math.floor(fy);
  const tx = fx - x0;
  const ty = fy - y0;
  const a = visibleCount(grid, y0, x0);
  const b = visibleCount(grid, y0, x0 + 1);
  const c = visibleCount(grid, y0 + 1, x0);
  const d = visibleCount(grid, y0 + 1, x0 + 1);
  return a * (1 - tx) * (1 - ty) + b * tx * (1 - ty) + c * (1 - tx) * ty + d * tx * ty;
}

/** Niveau 0..4 d'un effectif : échelle en racine carrée, cinq paliers. */
export function level(count: number, refCount: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  const v = Math.min(1, Math.sqrt(count / refCount));
  if (v < 0.18) return 1;
  if (v < 0.42) return 2;
  if (v < 0.7) return 3;
  return 4;
}
