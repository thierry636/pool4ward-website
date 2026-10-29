import { level, sample, type AggregateGrid } from "./grid";
import { POLICY, TILE_SIZE, type LayerId } from "./layers";
import { encodePng } from "./png";

/**
 * Rendu côté serveur d'une tuile raster d'une couche agrégée.
 *
 * Ce que reçoit le navigateur est une image : aucune coordonnée, aucun
 * attribut, aucun effectif exact. Et l'image elle-même est volontairement
 * pauvre — maille de plusieurs degrés, cinq paliers, zoom plafonné — parce
 * qu'une image se copie, s'assemble et se lit à la machine : ce qu'elle montre
 * doit rester acceptable même copié en entier.
 *
 * Le rendu est déterministe : aucun bruit n'est ajouté par requête, car des
 * observations répétées auraient permis de les moyenner et de retrouver la
 * valeur exacte.
 */

const ALPHA = [0, 44, 88, 132, 176] as const;

/** Mercator : tuile (z, x, y) + pixel → longitude/latitude. */
function pixelToLonLat(z: number, x: number, y: number, px: number, py: number): [number, number] {
  const n = 2 ** z;
  const wx = (x + (px + 0.5) / TILE_SIZE) / n;
  const wy = (y + (py + 0.5) / TILE_SIZE) / n;
  const lon = wx * 360 - 180;
  const lat = (Math.atan(Math.sinh(Math.PI * (1 - 2 * wy))) * 180) / Math.PI;
  return [lon, lat];
}

function lonLatToTilePixel(z: number, x: number, y: number, lon: number, lat: number): [number, number] {
  const n = 2 ** z;
  const sin = Math.sin((lat * Math.PI) / 180);
  const wx = ((lon + 180) / 360) * n;
  const wy = (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * n;
  return [(wx - x) * TILE_SIZE, (wy - y) * TILE_SIZE];
}

export function renderDensityTile(grid: AggregateGrid, z: number, x: number, y: number): Buffer | null {
  const policy = POLICY[grid.layer];
  const [r, g, b] = policy.color;
  const rgba = new Uint8Array(TILE_SIZE * TILE_SIZE * 4);
  let painted = false;

  for (let py = 0; py < TILE_SIZE; py++) {
    for (let px = 0; px < TILE_SIZE; px++) {
      const [lon, lat] = pixelToLonLat(z, x, y, px, py);
      const lv = level(sample(grid, lon, lat), policy.refCount);
      if (lv === 0) continue;
      const i = (py * TILE_SIZE + px) * 4;
      rgba[i] = r;
      rgba[i + 1] = g;
      rgba[i + 2] = b;
      rgba[i + 3] = ALPHA[lv];
      painted = true;
    }
  }
  return painted ? encodePng(rgba, TILE_SIZE, TILE_SIZE) : null;
}

export function renderCorridorTile(
  corridors: readonly (readonly (readonly [number, number])[])[],
  z: number,
  x: number,
  y: number,
): Buffer | null {
  const policy = POLICY.networks;
  const [r, g, b] = policy.color;
  const rgba = new Uint8Array(TILE_SIZE * TILE_SIZE * 4);
  // Trait de 3 px, quel que soit le zoom : une ligne généralisée, pas un tracé.
  const half = 1.6;
  let painted = false;

  for (const line of corridors) {
    for (let k = 0; k < line.length - 1; k++) {
      const [ax, ay] = lonLatToTilePixel(z, x, y, line[k][0], line[k][1]);
      const [bx, by] = lonLatToTilePixel(z, x, y, line[k + 1][0], line[k + 1][1]);
      const minX = Math.max(0, Math.floor(Math.min(ax, bx) - half - 1));
      const maxX = Math.min(TILE_SIZE - 1, Math.ceil(Math.max(ax, bx) + half + 1));
      const minY = Math.max(0, Math.floor(Math.min(ay, by) - half - 1));
      const maxY = Math.min(TILE_SIZE - 1, Math.ceil(Math.max(ay, by) + half + 1));
      if (minX > maxX || minY > maxY) continue;
      const dx = bx - ax;
      const dy = by - ay;
      const len2 = dx * dx + dy * dy || 1;
      for (let py = minY; py <= maxY; py++) {
        for (let px = minX; px <= maxX; px++) {
          const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
          const d = Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
          const cover = Math.max(0, Math.min(1, half + 0.5 - d));
          if (cover <= 0) continue;
          const i = (py * TILE_SIZE + px) * 4;
          const a = Math.round(210 * cover);
          if (a > rgba[i + 3]) {
            rgba[i] = r;
            rgba[i + 1] = g;
            rgba[i + 2] = b;
            rgba[i + 3] = a;
            painted = true;
          }
        }
      }
    }
  }
  return painted ? encodePng(rgba, TILE_SIZE, TILE_SIZE) : null;
}

/** Tuile entièrement transparente : toujours la même, calculée une fois. */
let blank: Buffer | null = null;
export function blankTile(): Buffer {
  if (!blank) blank = encodePng(new Uint8Array(TILE_SIZE * TILE_SIZE * 4), TILE_SIZE, TILE_SIZE);
  return blank;
}

export type { LayerId };
