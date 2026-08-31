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
    // L'attribution n'a que deux modes réels : par zone, ou par comparaison
    // systématique. ⚠️ Conséquence de barème : le plus bas des deux vaut 20
    // sur 25, la question ne peut donc plus faire descendre l'indice de plus de
    // quatre points. Elle documente une pratique plus qu'elle ne la note.
    id: "M2",
    branch: "messagerie",
    scored: true,
    max: 25,
    // Sautée quand le répondant n'a qu'un seul prestataire : il n'y a rien à
    // attribuer. La condition est écrite en « non-exclusion » et pas en
    // « answerNotIn » pour que la question soit servie par défaut, y compris
    // avant que M1 n'ait été répondue.
    when: { type: "not", of: { type: "answerIn", question: "M1", values: ["unique"] } },
    options: [
      { value: "comparaison", points: 25 },
      { value: "zone", points: 20 },
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
      { value: "oui", points: 25 },
      { value: "parfois", points: 10 },
      { value: "non", points: 0 },
    ],
  },
  {
    // Largeur du panel consulté. Barème à plancher : même le pire cas vaut 40 %
    // du maximum. Consulter peu n'est pas une faute de gestion — c'est un
    // gisement — et un zéro rendrait le verdict accusatoire.
    id: "M5",
    branch: "messagerie",
    scored: true,
    max: 25,
    options: [
      { value: "plus_dix", points: 25 },
      { value: "six_dix", points: 20 },
      { value: "trois_cinq", points: 15 },
      { value: "moins_trois", points: 10 },
    ],
  },
  {
    // Renouvellement du panel. Même plancher à 40 % que M5 : c'est le couple
    // « panel large × entrants nouveaux » qui fait le haut du barème, pas l'une
    // ou l'autre prise seule.
    id: "M6",
    branch: "messagerie",
    scored: true,
    max: 25,
    options: [
      { value: "plusieurs", points: 25 },
      { value: "un_deux", points: 20 },
      { value: "rarement", points: 15 },
      { value: "aucun", points: 10 },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Branche LOTS PARTIELS                                                       */
/* -------------------------------------------------------------------------- */

const PARTIELS: readonly Question[] = [
  {
    // Sert aussi de question de branche secondaire.
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
    // Question la plus discriminante sur les branches partiels et complets :
    // elle sépare ceux qui renégocient des prix de ceux qui reconçoivent un
    // schéma. Elle n'est pas posée en messagerie, où la façon dont le plan a été
    // construit — 4PL, commissionnaire — ne dit rien d'utile : ce sont les deux
    // questions sur les appels d'offres qui y tiennent le rôle de clôture.
    id: "G1",
    branch: "global",
    scored: true,
    max: 25,
    when: { type: "not", of: { type: "primaryBranch", flow: "messagerie" } },
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
  partiels: "P1",
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
