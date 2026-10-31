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
