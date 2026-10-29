import { visibleCount } from "./grid";
import { COUNT_BUCKETS, LAYER_IDS, MIN_ZONE_TOTAL, POLICY, type LayerId } from "./layers";
import type { AggregateSource, Availability } from "./source";
import type { Zone } from "./zones";

/**
 * Synthèse d'une zone : des paliers, jamais des effectifs exacts, jamais la
 * liste des actifs. Deux précautions contre les recoupements :
 *   - les paliers sont larges et fixes, donc la différence de deux synthèses ne
 *     livre rien de plus fin que le palier ;
 *   - sous `MIN_ZONE_TOTAL`, la zone est masquée plutôt que décrite en petit
 *     effectif.
 */

export interface LayerSummary {
  layer: LayerId;
  availability: Availability;
  /** Palier d'effectif : [min, max], max = null pour « et plus ». Null si masqué ou non applicable. */
  range: { min: number; max: number | null } | null;
  /** Vrai quand l'effectif est trop faible pour être décrit. */
  suppressed: boolean;
  /** Corridors généralisés traversant la zone (couche « réseaux »). */
  corridors?: boolean;
  asOf: string | null;
}

export interface ZoneSummary {
  zone: string;
  mode: "demo" | "live";
  layers: LayerSummary[];
}

export function bucketOf(total: number): { min: number; max: number | null } {
  let i = 0;
  while (i + 1 < COUNT_BUCKETS.length && total >= COUNT_BUCKETS[i + 1]) i++;
  const min = COUNT_BUCKETS[i];
  const max = i + 1 < COUNT_BUCKETS.length ? COUNT_BUCKETS[i + 1] - 1 : null;
  return { min, max };
}

function inBox(zone: Zone, lon: number, lat: number) {
  const [w, s, e, n] = zone.bbox;
  return lon >= w && lon < e && lat >= s && lat < n;
}

export async function summarize(source: AggregateSource, zone: Zone): Promise<ZoneSummary> {
  const layers: LayerSummary[] = [];

  for (const layer of LAYER_IDS) {
    const availability = source.availability(layer);
    if (availability === "unavailable") {
      layers.push({ layer, availability, range: null, suppressed: false, asOf: null });
      continue;
    }

    if (POLICY[layer].kind === "corridor") {
      const lines = await source.corridors();
      const crosses = lines.some((line) => line.some(([lon, lat]) => inBox(zone, lon, lat)));
      layers.push({ layer, availability, range: null, suppressed: false, corridors: crosses, asOf: null });
      continue;
    }

    const grid = await source.grid(layer as Exclude<LayerId, "networks">);
    if (!grid) {
      layers.push({ layer, availability: "unavailable", range: null, suppressed: false, asOf: null });
      continue;
    }
    let total = 0;
    for (let r = 0; r < grid.rows; r++) {
      const lat = -90 + (r + 0.5) * grid.cellDeg;
      for (let c = 0; c < grid.cols; c++) {
        const lon = -180 + (c + 0.5) * grid.cellDeg;
        if (inBox(zone, lon, lat)) total += visibleCount(grid, r, c);
      }
    }
    const suppressed = total < MIN_ZONE_TOTAL;
    layers.push({ layer, availability, range: suppressed ? null : bucketOf(total), suppressed, asOf: grid.asOf });
  }

  return { zone: zone.id, mode: source.mode, layers };
}
