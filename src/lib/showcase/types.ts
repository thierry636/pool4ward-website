/**
 * Format de la vitrine : le seul fichier de données que le site publie
 * (`src/content/showcase.json`). Il est produit par `npm run showcase:publish`
 * à partir d'un export de la base privée ; le site ne lit jamais la base.
 */

export type ShowcaseMode = "demo" | "curated";

export type SiteKind = "port" | "rail-terminal" | "inland-port" | "hub" | "carrier-base";

export type TransportMode = "rail" | "shortsea" | "barge" | "road-reefer";

export type ChapterId = "rail-intermodal" | "baltic-shortsea" | "reefer-germany" | "barge-rhine";

export interface ShowcaseSite {
  /** Identifiant opaque dérivé du nom et du pays — jamais une clé de base de données. */
  id: string;
  name: string;
  kind: SiteKind;
  /** Code pays ISO 3166-1 alpha-2. */
  country: string;
  /** Degrés décimaux, au centième (≈ 1 km) : précision voulue, pas une adresse. */
  lon: number;
  lat: number;
}

export interface ShowcaseService {
  id: string;
  chapter: ChapterId;
  mode: TransportMode;
  from: string;
  to: string;
  /** Sites de passage, dans l'ordre (3 au plus). */
  via?: string[];
  /** Nom d'opérateur à publier ; absent si non publiable. Jamais renseigné en mode « demo ». */
  operator?: string;
}

export interface Showcase {
  schema: 1;
  /** « demo » : exemple illustratif ; « curated » : vitrine publiée par un superadmin. */
  mode: ShowcaseMode;
  /** Date de publication (AAAA-MM-JJ) ; obligatoire en mode « curated », nulle en « demo ». */
  publishedAt: string | null;
  sites: ShowcaseSite[];
  services: ShowcaseService[];
}

export interface ChapterDef {
  id: ChapterId;
  modes: TransportMode[];
}
