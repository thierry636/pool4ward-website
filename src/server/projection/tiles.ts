import { createHash } from "node:crypto";
import { POLICY, isLayerId, type LayerId } from "./layers";
import { blankTile, renderCorridorTile, renderDensityTile } from "./raster";
import type { AggregateSource } from "./source";

/**
 * Validation et rendu des tuiles. La validation passe AVANT tout accès aux
 * données : une tuile hors politique n'atteint jamais une grille.
 */

export interface TileRequest {
  layer: LayerId;
  z: number;
  x: number;
  y: number;
}

export type TileParse = { ok: true; tile: TileRequest } | { ok: false; status: 400 | 404; error: string };

const INT = /^(0|[1-9]\d{0,3})$/;

export function parseTile(layer: string, z: string, x: string, yRaw: string): TileParse {
  if (!isLayerId(layer)) return { ok: false, status: 404, error: "unknown_layer" };
  const y = yRaw.endsWith(".png") ? yRaw.slice(0, -4) : yRaw;
  if (![z, x, y].every((v) => INT.test(v))) return { ok: false, status: 400, error: "invalid_tile" };
  const [zi, xi, yi] = [Number(z), Number(x), Number(y)];
  if (zi > POLICY[layer].maxZoom) return { ok: false, status: 404, error: "zoom_not_served" };
  const n = 2 ** zi;
  if (xi >= n || yi >= n) return { ok: false, status: 400, error: "invalid_tile" };
  return { ok: true, tile: { layer, z: zi, x: xi, y: yi } };
}

/** Une tuile des deux niveaux de zoom les plus fins de sa couche. */
export const isDeep = (t: TileRequest) => t.z >= POLICY[t.layer].maxZoom - 1;

export const tileKey = (t: TileRequest) => `${t.layer}/${t.z}/${t.x}/${t.y}`;

/* Cache LRU borné : rend un balayage moins coûteux à servir, pas plus facile. */
const MAX_CACHE = 300;
const cache = new Map<string, { body: Buffer; etag: string }>();

export function clearTileCache() {
  cache.clear();
}

export async function getTile(source: AggregateSource, t: TileRequest): Promise<{ body: Buffer; etag: string } | null> {
  if (source.availability(t.layer) === "unavailable") return null;

  const k = `${source.mode}:${tileKey(t)}`;
  const hit = cache.get(k);
  if (hit) {
    cache.delete(k);
    cache.set(k, hit);
    return hit;
  }

  let body: Buffer | null;
  if (POLICY[t.layer].kind === "corridor") {
    body = renderCorridorTile(await source.corridors(), t.z, t.x, t.y);
  } else {
    const grid = await source.grid(t.layer as Exclude<LayerId, "networks">);
    if (!grid) return null;
    body = renderDensityTile(grid, t.z, t.x, t.y);
  }

  const png = body ?? blankTile();
  const entry = { body: png, etag: `"${createHash("sha1").update(png).digest("hex").slice(0, 16)}"` };
  cache.set(k, entry);
  if (cache.size > MAX_CACHE) cache.delete(cache.keys().next().value as string);
  return entry;
}
