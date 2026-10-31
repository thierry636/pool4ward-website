/**
 * Les chiffres et les exemples de fiche de la planche des référentiels (`Referentials`). Les textes
 * sont dans les messages (`Home.referentials`) ; les nombres vivent ici, jamais dans un message.
 *
 * PROVENANCE — à rafraîchir avant toute mise en ligne publique :
 * - services (2 500 = 1 978 rail + 522 fluvial, 2 360 liaisons, 36 pays) et shortsea (1 690), avec leur
 *   répartition par forme : lus sur les écrans du portail le 2026-10-31 (les totaux se recoupent) ;
 * - 61 opérateurs, 3 continents, 15 000 sites et 80 000 transporteurs : donnés par la direction, non recoupés ;
 * - bornes : 111 sites, 337 bornes, 11 pays, 2 réseaux, 57 / 11 / 43 sites par état : recomptés dans les
 *   données du portail (flux-loop/charging), et conformes à l'écran (« 111 sites · 337 bornes publiées ») ;
 * - les fiches d'exemple sont des enregistrements réels dont le NOM d'opérateur ou de transporteur est masqué ;
 *   celle du shortsea est illustrative (une rotation dessinée, pas un enregistrement).
 */

export const SHAPE_IDS = ["oneWay", "roundTrip", "loop", "metro", "metroLoop", "free"] as const;
export type ShapeId = (typeof SHAPE_IDS)[number];
export type Shapes = Record<ShapeId, number>;

export const SERVICES = {
  total: 2500,
  modes: { rail: 1978, waterway: 522 },
  links: 2360,
  countries: 36,
  operators: 61,
  shapes: { oneWay: 17, roundTrip: 204, loop: 300, metro: 446, metroLoop: 0, free: 1533 } satisfies Shapes,
} as const;

export const SHORTSEA = {
  total: 1690,
  continents: 3,
  shapes: { oneWay: 19, roundTrip: 0, loop: 201, metro: 86, metroLoop: 1122, free: 262 } satisfies Shapes,
} as const;

/** Les services en rotation : les boucles et les métros bouclés. */
export const rotations = (s: Shapes) => s.loop + s.metroLoop;

export const CHARGERS = {
  sites: 111,
  chargers: 337,
  countries: 11,
  networks: 2,
  status: { inService: 57, construction: 11, planned: 43 },
} as const;

export const CARRIERS = { sites: 15000, carriers: 80000 } as const;

/** Un service « métro » réel : ses arrêts et leurs codes (terminus aux deux bouts). */
export const SAMPLE_ROUTE = {
  stops: [
    { name: "Poti", code: "GEPTI" },
    { name: "Batumi", code: "GEBUS" },
    { name: "Istanbul", code: "TRIST" },
    { name: "Tekirdag", code: "TRTEK" },
  ],
  services: 3,
} as const;

/** Une rotation shortsea dessinée pour l'exemple (illustrative). */
export const SAMPLE_ROTATION = { stops: ["Barcelone", "Marseille-Fos", "Gênes", "Naples"], calls: 7 } as const;

/** Un site de recharge réel, sans le nom de son opérateur. */
export const SAMPLE_SITE = { city: "Venlo", country: "NL", status: "inService", places: 12, bays: { count: 4, kw: 400, connector: "CCS2" }, maxKw: 400 } as const;

/** Un transporteur réel, sans son nom. */
export const SAMPLE_CARRIER = { country: "PT", rating: 4.6, reviews: 24 } as const;
