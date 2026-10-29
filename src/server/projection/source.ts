import { demoGrid, DEMO_CORRIDORS } from "./fixtures";
import { emptyGrid, type AggregateGrid } from "./grid";
import { POLICY, type LayerId } from "./layers";

/**
 * Où le site va chercher ses agrégats.
 *
 * Le site public ne parle JAMAIS aux référentiels privés ni à une API du
 * portail. Il parle à un backend de projection dédié, qui applique une liste
 * blanche de champs, une granularité et une couverture autorisées, et ne
 * renvoie que des agrégats. Ce fichier définit le contrat de ce backend
 * (`HttpAggregateSource`) et fournit, en attendant son raccordement, une source
 * de démonstration qui l'imite.
 *
 * Contrat — GET {PROJECTION_BACKEND_URL}/v1/aggregates/{layer}, en-tête
 * `Authorization: Bearer {PROJECTION_BACKEND_TOKEN}` :
 *
 *   { "layer": "services", "cellDeg": 2, "asOf": "2026-09-30",
 *     "cells": [[row, col, count], …] }
 *
 * - `row`, `col` : indices de maille (voir `grid.ts`), `count` : effectif ;
 * - aucun autre champ n'est accepté (toute clé inconnue fait rejeter la réponse) ;
 * - `cellDeg` doit être exactement celui de la politique de la couche ;
 * - GET {PROJECTION_BACKEND_URL}/v1/corridors renvoie
 *   { "corridors": [[[lon, lat], …], …] }, au plus 200 lignes de 64 points.
 */

export type Availability = "demo" | "available" | "unavailable";

export interface AggregateSource {
  readonly mode: "demo" | "live";
  availability(layer: LayerId): Availability;
  grid(layer: Exclude<LayerId, "networks">): Promise<AggregateGrid | null>;
  corridors(): Promise<readonly (readonly (readonly [number, number])[])[]>;
}

/* ------------------------------------------------------------- démonstration */

export class DemoSource implements AggregateSource {
  readonly mode = "demo" as const;

  availability(layer: LayerId): Availability {
    // Aucun référentiel de parkings sécurisés n'a été trouvé : la couche est
    // déclarée non raccordée plutôt que simulée.
    return layer === "parkings" ? "unavailable" : "demo";
  }

  async grid(layer: Exclude<LayerId, "networks">) {
    return this.availability(layer) === "unavailable" ? null : demoGrid(layer);
  }

  async corridors() {
    return DEMO_CORRIDORS;
  }
}

/* -------------------------------------------------------------------- réelle */

export class ProjectionError extends Error {}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Valide STRICTEMENT une réponse de grille : tout écart est une erreur. */
export function parseGridPayload(layer: Exclude<LayerId, "networks">, payload: unknown): AggregateGrid {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new ProjectionError("forme invalide");
  const p = payload as Record<string, unknown>;
  const extra = Object.keys(p).filter((k) => !["layer", "cellDeg", "asOf", "cells"].includes(k));
  if (extra.length) throw new ProjectionError(`champ inattendu : ${extra[0]}`);
  if (p.layer !== layer) throw new ProjectionError("couche inattendue");
  if (p.cellDeg !== POLICY[layer].cellDeg) throw new ProjectionError("maille non conforme à la politique");
  if (typeof p.asOf !== "string" || !ISO_DATE.test(p.asOf)) throw new ProjectionError("date invalide");
  if (!Array.isArray(p.cells)) throw new ProjectionError("cellules invalides");

  const grid = emptyGrid(layer, "live", p.asOf);
  if (p.cells.length > grid.rows * grid.cols) throw new ProjectionError("trop de cellules");
  for (const cell of p.cells) {
    if (!Array.isArray(cell) || cell.length !== 3) throw new ProjectionError("cellule invalide");
    const [row, col, count] = cell as unknown[];
    if (!Number.isInteger(row) || !Number.isInteger(col) || !Number.isInteger(count)) throw new ProjectionError("cellule non entière");
    const r = row as number;
    const c = col as number;
    const n = count as number;
    if (r < 0 || r >= grid.rows || c < 0 || c >= grid.cols || n < 0 || n > 65535) throw new ProjectionError("cellule hors bornes");
    grid.counts[r * grid.cols + c] = n;
  }
  return grid;
}

export function parseCorridorsPayload(payload: unknown): (readonly (readonly [number, number])[])[] {
  if (!payload || typeof payload !== "object") throw new ProjectionError("forme invalide");
  const p = payload as Record<string, unknown>;
  if (Object.keys(p).some((k) => k !== "corridors") || !Array.isArray(p.corridors)) throw new ProjectionError("corridors invalides");
  if (p.corridors.length > 200) throw new ProjectionError("trop de corridors");
  return p.corridors.map((line) => {
    if (!Array.isArray(line) || line.length < 2 || line.length > 64) throw new ProjectionError("corridor invalide");
    // Généralisation imposée ici, quoi que renvoie le backend : maille de 0,5°.
    return line.map((pt) => {
      if (!Array.isArray(pt) || pt.length !== 2 || !pt.every((v) => typeof v === "number" && Number.isFinite(v))) {
        throw new ProjectionError("point invalide");
      }
      const [lon, lat] = pt as [number, number];
      if (lon < -180 || lon > 180 || lat < -85 || lat > 85) throw new ProjectionError("point hors bornes");
      return [Math.round(lon * 2) / 2, Math.round(lat * 2) / 2] as const;
    });
  });
}

const TTL = 10 * 60_000;
const STALE = 60 * 60_000;

export class HttpAggregateSource implements AggregateSource {
  readonly mode = "live" as const;
  private cache = new Map<string, { at: number; value: unknown }>();

  constructor(
    private readonly baseUrl: string,
    private readonly token: string,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  private async get(path: string): Promise<unknown> {
    const hit = this.cache.get(path);
    const now = Date.now();
    if (hit && now - hit.at < TTL) return hit.value;
    try {
      const res = await this.fetchImpl(`${this.baseUrl}${path}`, {
        headers: { Authorization: `Bearer ${this.token}`, Accept: "application/json" },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new ProjectionError(`backend ${res.status}`);
      const value = await res.json();
      this.cache.set(path, { at: now, value });
      return value;
    } catch (e) {
      // Panne de la source : on sert la dernière réponse valide, au plus une heure.
      if (hit && now - hit.at < STALE) return hit.value;
      throw e;
    }
  }

  availability(): Availability {
    return "available";
  }

  async grid(layer: Exclude<LayerId, "networks">) {
    try {
      return parseGridPayload(layer, await this.get(`/v1/aggregates/${layer}`));
    } catch (e) {
      console.error("[projection] source indisponible", layer, e instanceof Error ? e.message : e);
      return null;
    }
  }

  async corridors() {
    try {
      return parseCorridorsPayload(await this.get("/v1/corridors"));
    } catch (e) {
      console.error("[projection] corridors indisponibles", e instanceof Error ? e.message : e);
      return [];
    }
  }
}

let current: AggregateSource | null = null;

export function getSource(): AggregateSource {
  if (!current) {
    const url = process.env.PROJECTION_BACKEND_URL;
    const token = process.env.PROJECTION_BACKEND_TOKEN;
    current = url && token ? new HttpAggregateSource(url.replace(/\/$/, ""), token) : new DemoSource();
  }
  return current;
}

export function setSourceForTests(source: AggregateSource | null) {
  current = source;
}
