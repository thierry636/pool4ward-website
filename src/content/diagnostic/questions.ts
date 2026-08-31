/**
 * Banque de questions et barème — CONFIGURATION.
 *
 * Ce fichier ne contient aucune logique et aucune chaîne affichable :
 * uniquement des identifiants, des points et des conditions de service.
 * Les libellés vivent dans les objets i18n (`copy.fr.ts`), le calcul dans
 * `src/lib/diagnostic/engine.ts`.
 *
 * Ajouter une question = ajouter une entrée ici + ses libellés dans la copy.
 * Le moteur n'a pas à être touché.
 */

import type { FlowType, Question, QuestionId } from "@/lib/diagnostic/types";

/** Les trois typologies de flux, dans l'ordre d'affichage de l'écran 1. */
export const FLOW_TYPES: readonly FlowType[] = [
  "complets",
  "partiels",
  "messagerie",
] as const;

/** Barème de référence : points maximum d'une question scorée. */
export const MAX_POINTS_PER_QUESTION = 25;

/* -------------------------------------------------------------------------- */
/* Branche MESSAGERIE                                                          */
/* -------------------------------------------------------------------------- */

const MESSAGERIE: readonly Question[] = [
  {
    // Tranches en ordre croissant. Le sommet du barème est au milieu, pas au
    // bout : deux à cinq prestataires font une vraie mise en compétition, un
    // seul supprime toute référence, et au-delà de dix les volumes s'éclatent
    // au point de ne plus peser dans aucune négociation.
    id: "M1",
    branch: "messagerie",
    scored: true,
    max: 25,
    options: [
      { value: "unique", points: 8 },
      { value: "deux_cinq", points: 25 },
      { value: "six_dix", points: 15 },
      { value: "plus_dix", points: 10 },
      { value: "inconnu", points: 0 },
    ],
  },
  {
    id: "M2",
    branch: "messagerie",
    scored: true,
    max: 25,
    options: [
      { value: "competition", points: 25 },
      { value: "attitre_zone", points: 20 },
      { value: "unique", points: 8 },
      { value: "habitudes", points: 0 },
    ],
  },
  {
    id: "M3",
    branch: "messagerie",
    scored: true,
    max: 25,
    options: [
      { value: "moins12mois", points: 25 },
      { value: "un_trois_ans", points: 15 },
      { value: "plus3ans", points: 5 },
      { value: "jamais", points: 0 },
    ],
  },
  {
    // M4 est la question qui vend l'offre : elle ne doit jamais être coupée,
    // même en version courte. Elle sert aussi de question de branche secondaire.
    id: "M4",
    branch: "messagerie",
    scored: true,
    max: 25,
    options: [
      { value: "rapprochees", points: 25 },
      { value: "affiches", points: 10 },
      { value: "non", points: 0 },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Branche LOTS PARTIELS                                                       */
/* -------------------------------------------------------------------------- */

const PARTIELS: readonly Question[] = [
  {
    id: "P1",
    branch: "partiels",
    scored: true,
    max: 25,
    options: [
      { value: "regroupes", points: 25 },
      { value: "opportuniste", points: 12 },
      { value: "chacun_seul", points: 0 },
    ],
  },
  {
    // P2 est le pivot du cross-dock : le délai de rétention est la matière
    // première de la massification. Sert aussi de question secondaire.
    id: "P2",
    branch: "partiels",
    scored: true,
    max: 25,
    options: [
      { value: "48h", points: 25 },
      { value: "24h", points: 18 },
      { value: "depend_client", points: 12 },
      { value: "aucun", points: 5 },
    ],
  },
  {
    id: "P3",
    branch: "partiels",
    scored: true,
    max: 25,
    options: [
      { value: "oui_utilise", points: 25 },
      { value: "prestataire", points: 18 },
      { value: "oui_pas_utilise", points: 8 },
      { value: "non", points: 5 },
    ],
  },
  {
    // Sautée si « complets » n'est pas classé : la question n'aurait pas de sens.
    // Le maximum servi baisse d'autant, la normalisation absorbe l'écart.
    id: "P4",
    branch: "partiels",
    scored: true,
    max: 25,
    when: { type: "flowRanked", flow: "complets" },
    options: [
      { value: "meme_ao", points: 25 },
      { value: "separes", points: 12 },
      { value: "spot", points: 0 },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Branche CAMIONS COMPLETS                                                    */
/* -------------------------------------------------------------------------- */

const COMPLETS: readonly Question[] = [
  {
    // Sert aussi de question de branche secondaire.
    id: "C1",
    branch: "complets",
    scored: true,
    max: 25,
    options: [
      { value: "boucles", points: 25 },
      { value: "partiellement", points: 14 },
      { value: "aller_simple", points: 4 },
      { value: "inconnu", points: 0 },
    ],
  },
  {
    id: "C2",
    branch: "complets",
    scored: true,
    max: 25,
    options: [
      { value: "en_place", points: 25 },
      { value: "envisage", points: 12 },
      { value: "jamais", points: 0 },
    ],
  },
  {
    // C3 n'est pas scorée volontairement : la régularité d'un flux est une
    // caractéristique du business, pas une qualité de gestion. La pénaliser
    // rendrait l'indice injuste. Elle conditionne les leviers (report modal).
    id: "C3",
    branch: "complets",
    scored: false,
    max: 0,
    options: [
      { value: "stable", points: null },
      { value: "saisonnier", points: null },
      { value: "aleatoire", points: null },
    ],
  },
  {
    id: "C4",
    branch: "complets",
    scored: true,
    max: 25,
    options: [
      { value: "moins24mois", points: 25 },
      { value: "plus3ans", points: 12 },
      { value: "ecarte_sans_etude", points: 5 },
      { value: "jamais", points: 0 },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Question de clôture — toutes branches                                       */
/* -------------------------------------------------------------------------- */

const GLOBAL: readonly Question[] = [
  {
    // Question la plus discriminante, tous profils confondus. Posée à tout le
    // monde, elle ne bouge jamais.
    id: "G1",
    branch: "global",
    scored: true,
    max: 25,
    options: [
      { value: "redesign", points: 25 },
      { value: "4pl", points: 15 },
      { value: "ao_periodique", points: 12 },
      { value: "reconduit", points: 0 },
    ],
  },
];

/** Questions de branche, dans l'ordre de service. */
export const BRANCH_QUESTIONS: Readonly<Record<FlowType, readonly Question[]>> = {
  messagerie: MESSAGERIE,
  partiels: PARTIELS,
  complets: COMPLETS,
};

/** Questions posées à tout le monde, servies après la branche. */
export const GLOBAL_QUESTIONS: readonly Question[] = GLOBAL;

/**
 * Question unique servie quand un deuxième flux est classé.
 * Toujours NON scorée : elle alimente le profil et les leviers, pas l'indice.
 */
export const SECONDARY_QUESTION_BY_FLOW: Readonly<Record<FlowType, QuestionId>> = {
  messagerie: "M4",
  partiels: "P2",
  complets: "C1",
};

/** Toutes les questions de la banque, indexées par identifiant. */
export const QUESTION_BANK: Readonly<Record<QuestionId, Question>> = Object.freeze(
  [...MESSAGERIE, ...PARTIELS, ...COMPLETS, ...GLOBAL].reduce<
    Record<QuestionId, Question>
  >((bank, question) => {
    bank[question.id] = question;
    return bank;
  }, {}),
);
