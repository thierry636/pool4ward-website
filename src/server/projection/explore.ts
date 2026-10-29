import { LAYER_IDS, type LayerId } from "./layers";

/**
 * Exploration détaillée — le seul endroit où le site pourrait parler d'actifs
 * précis. Elle est RÉSERVÉE à un compte authentifié et autorisé, et bornée :
 * résultats plafonnés, filtres tirés d'une liste fermée, pas de pagination
 * profonde, volume cumulé limité par organisation.
 *
 * Cette livraison ne la raccorde à rien : il n'existe pas, côté Pool4ward, de
 * mécanisme d'autorisation par organisation exploitable depuis un site public
 * (les API du portail exigent un JWT de compte et le contexte d'une
 * organisation). La route répond donc 401 sans justificatif et 501
 * « non raccordé » avec — et ne relaie jamais rien vers le portail. Le
 * contrat de validation ci-dessous, lui, est en place et testé : le futur
 * backend d'exploration l'hérite tel quel.
 */

export const EXPLORE_MAX_RESULTS = 25;
export const EXPLORE_MAX_PAGES = 3;
export const EXPLORE_MODES = ["rail", "fluvial", "shortsea", "deepsea"] as const;
const EXPLORABLE: readonly LayerId[] = LAYER_IDS.filter((l) => l !== "networks");

export interface ExploreQuery {
  layer: LayerId;
  mode?: (typeof EXPLORE_MODES)[number];
  /** Code pays ISO 3166-1 alpha-2. */
  country?: string;
  /** Zone de synthèse (identifiant opaque), jamais une emprise libre. */
  zone?: string;
  limit: number;
  page: number;
}

export type ExploreParse = { ok: true; query: ExploreQuery } | { ok: false; error: string };

const ALLOWED_KEYS = new Set(["layer", "mode", "country", "zone", "limit", "page"]);

export function parseExploreQuery(params: URLSearchParams): ExploreParse {
  for (const key of params.keys()) {
    // Toute clé inconnue — en particulier bbox, lat, lon, q, cursor — est refusée.
    if (!ALLOWED_KEYS.has(key)) return { ok: false, error: `parameter_not_allowed:${key.slice(0, 20)}` };
  }
  const layer = params.get("layer") ?? "";
  if (!EXPLORABLE.includes(layer as LayerId)) return { ok: false, error: "invalid_layer" };

  const mode = params.get("mode");
  if (mode !== null && !(EXPLORE_MODES as readonly string[]).includes(mode)) return { ok: false, error: "invalid_mode" };

  const country = params.get("country");
  if (country !== null && !/^[A-Z]{2}$/.test(country)) return { ok: false, error: "invalid_country" };

  const zone = params.get("zone");
  if (zone !== null && !/^z-[0-9a-f]{6}$/.test(zone)) return { ok: false, error: "invalid_zone" };

  const limitRaw = params.get("limit");
  const limit = limitRaw === null ? 10 : Number(limitRaw);
  if (!Number.isInteger(limit) || limit < 1 || limit > EXPLORE_MAX_RESULTS) return { ok: false, error: "invalid_limit" };

  const pageRaw = params.get("page");
  const page = pageRaw === null ? 1 : Number(pageRaw);
  if (!Number.isInteger(page) || page < 1 || page > EXPLORE_MAX_PAGES) return { ok: false, error: "invalid_page" };

  return {
    ok: true,
    query: {
      layer: layer as LayerId,
      mode: (mode as ExploreQuery["mode"]) ?? undefined,
      country: country ?? undefined,
      zone: zone ?? undefined,
      limit,
      page,
    },
  };
}

export interface Principal {
  organization: string;
  scopes: readonly string[];
}

/** Vérifie un justificatif. Par défaut : aucun n'est accepté. */
export interface Authorizer {
  authorize(authorizationHeader: string | null): Promise<Principal | null>;
}

export const denyAll: Authorizer = { authorize: async () => null };

let authorizer: Authorizer = denyAll;
export const getAuthorizer = () => authorizer;
export function setAuthorizerForTests(a: Authorizer) {
  authorizer = a;
}
