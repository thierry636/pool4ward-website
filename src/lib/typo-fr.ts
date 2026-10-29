/**
 * Typographie française des textes d'interface : espaces insécables avant les
 * ponctuations doubles et à l'intérieur des guillemets. Appliquée une fois, au
 * chargement des messages français (voir `src/i18n/request.ts`), pour qu'aucun
 * libellé n'ait à y penser. Les blocs markdown du blog ont leur propre passe.
 */

const NBSP = " ";
const NNBSP = " ";

export function typographieFr(texte: string): string {
  return (
    texte
      // « guillemets » : insécable à l'intérieur
      .replace(/«\s+/g, `«${NBSP}`)
      .replace(/\s+»/g, `${NBSP}»`)
      // ; ! ? : fine insécable avant. « : » prend l'insécable ordinaire, sauf
      // dans une heure (14 : 00) ou une URL (https://), où il n'y a pas
      // d'espace avant pour commencer.
      .replace(/[ \t]+([;!?])/g, `${NNBSP}$1`)
      .replace(/[ \t]+:/g, `${NBSP}:`)
      // Pourcentage et unités chiffrées : « 10 % », « 5 km »
      .replace(/(\d)[ \t]+(%|€|km|kg|h|min|t)(?![\p{L}])/gu, `$1${NNBSP}$2`)
  );
}

export function typographieMessages<T>(valeur: T): T {
  if (typeof valeur === "string") return typographieFr(valeur) as unknown as T;
  if (Array.isArray(valeur)) {
    return valeur.map((v) => typographieMessages(v)) as unknown as T;
  }
  if (valeur && typeof valeur === "object") {
    return Object.fromEntries(
      Object.entries(valeur).map(([cle, v]) => [cle, typographieMessages(v)]),
    ) as T;
  }
  return valeur;
}
