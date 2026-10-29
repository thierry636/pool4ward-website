import { LAYER_IDS, MAX_ACTIVE_LAYERS, POLICY, TILE_SIZE } from "./layers";
import type { AggregateSource } from "./source";
import { ZONES } from "./zones";

/** Ce que l'interface a besoin de savoir pour se construire : aucune donnée. */
export function buildManifest(source: AggregateSource) {
  return {
    mode: source.mode,
    tileSize: TILE_SIZE,
    maxActiveLayers: MAX_ACTIVE_LAYERS,
    layers: LAYER_IDS.map((id) => ({
      id,
      kind: POLICY[id].kind,
      maxZoom: POLICY[id].maxZoom,
      cellDeg: POLICY[id].cellDeg,
      color: "#" + POLICY[id].color.map((v) => v.toString(16).padStart(2, "0")).join(""),
      availability: source.availability(id),
    })),
    zones: ZONES.map((z) => ({ id: z.id, slug: z.slug, bbox: z.bbox })),
  };
}
