/**
 * Politique de diffusion des couches du globe public.
 *
 * C'est ici — et nulle part ailleurs — que se décide ce que le site public
 * peut montrer d'un référentiel : quelles couches, avec quelle finesse, jusqu'à
 * quel zoom. Une valeur trop fine fait fuiter la base ; trop grossière, le
 * globe n'apprend rien. Toute modification passe par une revue des risques
 * (docs/version2/PROTECTION.md).
 */

export const LAYER_IDS = ["services", "carriers", "parkings", "charging", "networks"] as const;
export type LayerId = (typeof LAYER_IDS)[number];

export interface LayerPolicy {
  id: LayerId;
  /** `density` : zones de couverture agrégées ; `corridor` : liaisons généralisées. */
  kind: "density" | "corridor";
  /** Zoom maximal servi. Au-delà, la tuile n'existe pas (404) : pas de précision cachée. */
  maxZoom: number;
  /** Maille d'agrégation, en degrés. Aucune information plus fine n'est jamais diffusée. */
  cellDeg: number;
  /** Une cellule comptant moins que ce seuil est masquée (petits effectifs). */
  minCount: number;
  /** Effectif de référence pour l'échelle de couleur (racine carrée, bornée à 1). */
  refCount: number;
  /** Couleur de la couche, RGB. */
  color: readonly [number, number, number];
}

export const POLICY: Record<LayerId, LayerPolicy> = {
  services: { id: "services", kind: "density", maxZoom: 5, cellDeg: 2, minCount: 4, refCount: 90, color: [106, 178, 224] },
  carriers: { id: "carriers", kind: "density", maxZoom: 4, cellDeg: 3, minCount: 6, refCount: 300, color: [232, 185, 100] },
  parkings: { id: "parkings", kind: "density", maxZoom: 4, cellDeg: 3, minCount: 6, refCount: 120, color: [201, 194, 174] },
  charging: { id: "charging", kind: "density", maxZoom: 5, cellDeg: 2, minCount: 4, refCount: 60, color: [198, 216, 75] },
  networks: { id: "networks", kind: "corridor", maxZoom: 5, cellDeg: 1, minCount: 1, refCount: 1, color: [245, 242, 234] },
};

export const isLayerId = (v: string): v is LayerId => (LAYER_IDS as readonly string[]).includes(v);

/** Au plus ce nombre de couches simultanément actives côté interface. */
export const MAX_ACTIVE_LAYERS = 2;

/** Taille d'une tuile, en pixels. */
export const TILE_SIZE = 512;

/** Paliers d'effectifs publiés dans les synthèses de zone : jamais de valeur exacte. */
export const COUNT_BUCKETS = [0, 10, 25, 50, 100, 250, 500, 1000] as const;

/** Sous ce total, la synthèse d'une zone est masquée plutôt que montrée en petit effectif. */
export const MIN_ZONE_TOTAL = 10;
