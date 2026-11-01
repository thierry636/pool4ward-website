/**
 * Les cinq capacités confirmées par la direction. Ce fichier ne porte que la
 * structure (identifiants, adresses) ; les textes sont dans les messages
 * (`Capabilities.*`) pour rester traduits. Les applications du portail qui
 * portent chaque capacité sont listées dans `apps` : leur existence a été
 * vérifiée dans le code avant d'être citée ici.
 */

export const CAPACITE_IDS = ["engineering", "tenders", "carriers", "comparison", "contracts"] as const;
export type CapaciteId = (typeof CAPACITE_IDS)[number];

export type AppId = "design4ward" | "compute4ward" | "modal4ward" | "connect4ward" | "carrierbridge";

export interface Capacite {
  id: CapaciteId;
  /** Segment d'URL : /solutions/<slug>. */
  slug: string;
  /** Applications du portail qui portent la capacité (noms d'usage). */
  apps: AppId[];
}

export const CAPACITES: Capacite[] = [
  { id: "engineering", slug: "transport-engineering", apps: ["design4ward", "compute4ward"] },
  { id: "tenders", slug: "tender-preparation", apps: ["design4ward", "carrierbridge"] },
  { id: "carriers", slug: "carrier-search", apps: ["modal4ward", "carrierbridge"] },
  // Aucune application n'est citée : les fonctions de comparaison des offres
  // reçues n'ont pas pu être vérifiées dans le code consulté (voir
  // docs/version2/CAPABILITIES.md). La page décrit la méthode.
  { id: "comparison", slug: "offer-comparison", apps: [] },
  { id: "contracts", slug: "contract-management", apps: ["connect4ward", "design4ward"] },
];

export const capaciteParSlug = (slug: string) => CAPACITES.find((c) => c.slug === slug);

/**
 * Les captures du portail montrées pour chaque capacité (`public/images/capabilities/`). Les noms
 * d'opérateurs et de transporteurs y sont masqués avant enregistrement ; les titres de fenêtre et les
 * textes alternatifs sont dans les messages (`Capabilities.<id>.shots`, même ordre).
 */
export interface Shot {
  /** Nom du fichier WebP, sans extension. */
  file: string;
  width: number;
  height: number;
}

export const SHOTS: Record<CapaciteId, readonly Shot[]> = {
  engineering: [{ file: "move2rail", width: 821, height: 341 }],
  tenders: [{ file: "bid-pack", width: 1100, height: 738 }],
  carriers: [
    { file: "carrier-search", width: 847, height: 580 },
    { file: "bid-list", width: 272, height: 455 },
  ],
  comparison: [{ file: "proposals", width: 939, height: 747 }],
  contracts: [{ file: "contract-grid", width: 1100, height: 671 }],
};

/** Les trois gestes de l'agent IA de chaque étape, dans l'ordre où ils s'animent. */
export const AGENT_ACTS = ["prioritize", "follow", "propose"] as const;
