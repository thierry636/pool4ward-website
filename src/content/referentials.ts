/**
 * Les chiffres de la planche des référentiels (`Referentials`). Les textes sont dans les messages
 * (`Home.referentials`) ; les nombres vivent ici, jamais dans un message.
 *
 * PROVENANCE — à rafraîchir avant toute mise en ligne publique :
 * - services intermodaux (2 500 = 1 978 rail + 522 fluvial, 36 pays) et shortsea (1 690) : lus sur les
 *   écrans du portail le 2026-10-31 ; les captures de la planche montrent ces mêmes totaux ;
 * - 61 opérateurs, 3 continents, « plus de 36 000 points » (bornes de recharge et parkings poids lourds)
 *   et « plus de 80 000 transporteurs » : donnés par la direction, NON recoupés avec le portail (qui
 *   montre, pour les réseaux privés de bornes, 111 sites et 337 bornes : un périmètre plus étroit).
 *   Les deux « plus de » sont affichés tels quels, avec le signe « + ».
 */

export const SERVICES = { total: 2500, countries: 36, operators: 61 } as const;

export const SHORTSEA = { total: 1690, continents: 3 } as const;

/** Bornes de recharge et parkings poids lourds, ensemble : « plus de ». */
export const POINTS = 36000;

/** Transporteurs référencés : « plus de ». */
export const CARRIERS = 80000;
