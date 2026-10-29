import { emptyGrid, type AggregateGrid } from "./grid";
import { POLICY, type LayerId } from "./layers";

/**
 * Jeu de DÉMONSTRATION des couches du globe.
 *
 * Ces effectifs ne viennent d'aucun référentiel Pool4ward : ce sont des
 * densités illustratives, calculées au chargement à partir de quelques foyers,
 * pour que le globe, ses légendes, ses états de repli et ses protections
 * puissent être montrés et testés avant le raccordement aux vraies sources. Le
 * site l'affiche partout comme tel (« démonstration »). Le contrat que le vrai
 * backend de projection devra respecter est dans `source.ts`.
 */

type Hub = readonly [lon: number, lat: number, sigmaDeg: number, weight: number];

const HUBS: Record<Exclude<LayerId, "networks" | "parkings">, readonly Hub[]> = {
  services: [
    [4.4, 51.6, 1.6, 90], [10, 53.5, 1.4, 55], [6.8, 51.4, 1.5, 60], [0.1, 49.5, 1.4, 40], [5.4, 43.3, 1.4, 45],
    [4.8, 45.8, 1.6, 50], [9.2, 45.5, 1.8, 60], [8.9, 44.4, 1.2, 40], [2.2, 41.4, 1.4, 38], [-0.4, 39.5, 1.2, 30],
    [-3.7, 40.4, 1.6, 18], [8.7, 50.1, 1.5, 40], [11.6, 48.1, 1.5, 30], [16.4, 48.2, 1.4, 30], [21, 52.2, 1.8, 28],
    [19, 47.5, 1.4, 20], [29, 41, 1.6, 22], [-9.1, 38.7, 1.2, 14], [2.3, 48.9, 1.5, 34], [7.6, 47.6, 1.1, 30],
    [11.9, 57.7, 1.3, 16], [26.1, 44.4, 1.5, 16], [-0.1, 51.5, 1.5, 26], [23.7, 38, 1.2, 12],
    [121.5, 31.2, 2.4, 20], [103.8, 1.3, 1.6, 12], [-118.2, 34, 2.2, 12], [-74, 40.7, 2.2, 12], [-87.6, 41.9, 2.2, 8],
    [55.3, 25.2, 1.8, 10], [-46.3, -23.9, 2, 7], [72.9, 19, 2, 8], [32.3, 31.3, 1.4, 8], [151.2, -33.9, 2, 5],
  ],
  carriers: [
    [8.5, 51.5, 4.2, 150], [2.3, 47, 4.6, 130], [-3.7, 40.4, 3.6, 90], [12, 44.5, 4.2, 100], [19.5, 52, 4, 80],
    [5, 52, 2.6, 80], [-0.1, 52, 3.4, 60], [29, 40.5, 3.2, 50], [14, 48, 2.8, 36], [17, 59, 3.8, 20],
    [26, 44.5, 3, 24], [-8.2, 39.5, 2, 20], [23.7, 38, 2, 12],
  ],
  charging: [
    [4.9, 52.2, 1.6, 36], [8.5, 50.5, 2.2, 38], [2.4, 48.2, 2.2, 28], [4.8, 45.8, 1.6, 18], [9.2, 45.5, 1.8, 22],
    [2.2, 41.4, 1.4, 12], [-3.7, 40.4, 1.6, 8], [11.6, 48.1, 1.5, 20], [18, 59.3, 1.8, 10], [10.5, 55.7, 1.4, 12],
    [21, 52.2, 1.8, 8], [16.4, 48.2, 1.2, 12], [-0.1, 51.5, 1.5, 12],
  ],
};

/** Parkings sécurisés : aucun référentiel n'a été trouvé — la couche est déclarée non raccordée. */
const PARKING_HUBS: readonly Hub[] = [];

function hash(a: number, b: number, c: number): number {
  let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

function build(layer: Exclude<LayerId, "networks">, hubs: readonly Hub[]): AggregateGrid {
  const grid = emptyGrid(layer, "demo", null);
  const { rows, cols, cellDeg } = grid;
  const seed = layer.length * 131;
  for (let r = 0; r < rows; r++) {
    const lat = -90 + (r + 0.5) * cellDeg;
    const kx = Math.cos((lat * Math.PI) / 180);
    for (let c = 0; c < cols; c++) {
      const lon = -180 + (c + 0.5) * cellDeg;
      let v = 0;
      for (const [hl, ha, s, w] of hubs) {
        let dx = lon - hl;
        if (dx > 180) dx -= 360;
        if (dx < -180) dx += 360;
        const dy = lat - ha;
        const d2 = (dx * kx) ** 2 + dy ** 2;
        if (d2 < 36 * s * s) v += w * Math.exp(-d2 / (2 * s * s));
      }
      if (v < 0.6) continue;
      // Variation déterministe : même cellule, même valeur, à chaque requête.
      const jitter = 0.88 + 0.24 * hash(r, c, seed);
      grid.counts[r * cols + c] = Math.min(65535, Math.round(v * jitter));
    }
  }
  return grid;
}

/** Corridors schématiques (lon, lat), à la maille de 0,5° : ni service, ni tracé réel. */
export const DEMO_CORRIDORS: readonly (readonly (readonly [number, number])[])[] = [
  [[4.5, 52], [6.5, 51.5], [8.5, 49.5], [7.5, 47.5], [9, 45.5], [9, 44.5]],
  [[10, 53.5], [13.5, 52.5], [21, 52]],
  [[2, 41.5], [3, 43], [4.5, 45.5], [7.5, 48.5]],
  [[5.5, 43.5], [4.5, 45.5], [5, 47.5], [6.5, 49]],
  [[-9, 38.5], [-3.5, 40.5], [2, 41.5]],
  [[12.5, 56], [10, 53.5], [11.5, 48], [11, 45.5]],
  [[16.5, 48], [19, 47.5], [20.5, 44.5], [28.5, 44]],
  [[-118, 34], [-96, 38], [-87.5, 41.5], [-74, 40.5]],
  [[121.5, 31], [116.5, 40]],
];

const cache = new Map<LayerId, AggregateGrid>();

export function demoGrid(layer: Exclude<LayerId, "networks">): AggregateGrid {
  let g = cache.get(layer);
  if (!g) {
    g = build(layer, layer === "parkings" ? PARKING_HUBS : HUBS[layer]);
    cache.set(layer, g);
  }
  return g;
}

/** Les foyers ne servent qu'ici ; la politique reste la seule source des seuils. */
export const DEMO_REF = POLICY;
