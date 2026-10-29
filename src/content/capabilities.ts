/**
 * Les cinq capacités confirmées par la direction. Ce fichier ne porte que la
 * structure (identifiants, adresses) ; les textes sont dans les messages
 * (`Capabilities.*`) pour rester traduits. Les applications du portail qui
 * portent chaque capacité sont listées dans `apps` : leur existence a été
 * vérifiée dans le code (voir docs/version2/CAPABILITIES.md) avant d'être
 * citée ici.
 */

export const CAPACITE_IDS = ["engineering", "tenders", "carriers", "comparison", "contracts"] as const;
export type CapaciteId = (typeof CAPACITE_IDS)[number];

export interface Capacite {
  id: CapaciteId;
  /** Segment d'URL : /solutions/<slug>. */
  slug: string;
  /** Applications du portail qui portent la capacité (noms d'usage). */
  apps: string[];
}

export const CAPACITES: Capacite[] = [
  { id: "engineering", slug: "transport-engineering", apps: [] },
  { id: "tenders", slug: "tender-preparation", apps: [] },
  { id: "carriers", slug: "carrier-search", apps: [] },
  { id: "comparison", slug: "offer-comparison", apps: [] },
  { id: "contracts", slug: "contract-management", apps: [] },
];

export const capaciteParSlug = (slug: string) => CAPACITES.find((c) => c.slug === slug);
