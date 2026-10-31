/**
 * Chapitres éditoriaux de l'animation. Les textes (titre, phrase) sont dans les
 * messages `Datasets.world.chapters.<id>` ; ici, ce qui structure les données :
 * quels modes un chapitre peut contenir, et où la caméra se pose.
 *
 * Ajouter un chapitre est un changement de code et de texte, pas de donnée : la
 * base ne peut pas en créer.
 */

export const MODES = ["rail", "shortsea", "barge", "road-reefer"];

export const SITE_KINDS = ["port", "rail-terminal", "inland-port", "hub", "carrier-base"];

export const CHAPTERS = [
  { id: "rail-intermodal", modes: ["rail"] },
  { id: "baltic-shortsea", modes: ["shortsea"] },
  { id: "reefer-germany", modes: ["road-reefer"] },
  { id: "barge-rhine", modes: ["barge"] },
];

/** Le monde, au départ : la caméra le quitte pour le premier chapitre. */
export const OVERVIEW = { lon: 12, lat: 38, zoom: 1.9 };
