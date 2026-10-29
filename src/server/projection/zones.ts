import { createHash } from "node:crypto";

/**
 * Zones de synthèse : un découpage éditorial, grossier et FIXE du monde.
 *
 * Le site public ne répond jamais à une emprise arbitraire (qui permettrait de
 * quadriller la planète pas à pas) : il répond à l'une de ces zones, désignée
 * par un identifiant. Les zones ne se recouvrent pas, pour qu'on ne puisse pas
 * déduire une zone fine en soustrayant deux synthèses emboîtées.
 */

export interface Zone {
  /** Identifiant opaque, stable : `z-` suivi de six caractères hexadécimaux. */
  id: string;
  slug: string;
  /** [ouest, sud, est, nord], en degrés. */
  bbox: readonly [number, number, number, number];
}

const RAW: readonly (readonly [string, readonly [number, number, number, number]])[] = [
  ["iberia", [-10, 35, 3.5, 43]],
  ["france", [-5, 43, 6, 50]],
  ["benelux-rhine", [2.5, 50, 9, 54]],
  ["british-isles", [-11, 50, 2, 59]],
  ["germany-austria", [9, 47, 17, 54]],
  ["alps-north-italy", [6, 43, 14, 47]],
  ["south-italy", [8, 35, 19, 43]],
  ["central-eastern-europe", [17, 43, 32, 55]],
  ["balkans-greece", [19, 35, 30, 43]],
  ["nordics-baltics", [4, 55, 32, 71]],
  ["turkey-caucasus", [30, 35, 46, 43]],
  ["north-america", [-170, 15, -50, 72]],
  ["latin-america", [-120, -56, -30, 15]],
  ["north-africa-middle-east", [-18, 12, 60, 35]],
  ["sub-saharan-africa", [-20, -36, 52, 12]],
  ["central-asia-russia", [46, 35, 180, 72]],
  ["asia", [60, -12, 150, 35]],
  ["oceania", [110, -48, 180, -12]],
];

const idOf = (slug: string) =>
  "z-" + createHash("sha256").update(`p4w-zone-v1:${slug}`).digest("hex").slice(0, 6);

export const ZONES: readonly Zone[] = RAW.map(([slug, bbox]) => ({ id: idOf(slug), slug, bbox }));

const BY_ID = new Map(ZONES.map((z) => [z.id, z]));

/** Identifiant valide ET connu : tout le reste est rejeté avant d'atteindre les données. */
export const findZone = (id: string): Zone | undefined => (/^z-[0-9a-f]{6}$/.test(id) ? BY_ID.get(id) : undefined);
