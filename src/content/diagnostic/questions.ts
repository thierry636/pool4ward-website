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
export const FLOW_TYPES: readonly FlowType[] = ["complets", "messagerie"] as const;

/** Barème de référence : points maximum d'une question scorée. */
export const MAX_POINTS_PER_QUESTION = 25;

/* -------------------------------------------------------------------------- */
/* Branche MESSAGERIE                                                          */
/* -------------------------------------------------------------------------- */

const MESSAGERIE: readonly Question[] = [
  {
    // Profondeur du panel. Un prestataire unique est un problème de
    // concurrence ; à partir de deux, c'est bon. C'est aussi cette réponse qui
    // décide si la question de la comparaison a un sens.
    id: "M1",
    branch: "messagerie",
    scored: true,
    max: 25,
    options: [
      { value: "un_seul", points: 10 },
      { value: "deux_plus", points: 25 },
    ],
  },
  {
    // Sautée quand il n'y a qu'un prestataire : il n'y a rien à comparer.
    // La condition est écrite en non-exclusion pour que la question reste
    // servie tant que M1 n'a pas été répondue — sans quoi la barre de
    // progression annoncerait une question de moins avant la première réponse.
    id: "M2",
    branch: "messagerie",
    scored: true,
    max: 25,
    when: {
      type: "not",
      of: { type: "answerIn", question: "M1", values: ["un_seul"] },
    },
    options: [
      { value: "oui", points: 25 },
      { value: "non", points: 10 },
    ],
  },
  {
    // Ancienneté du dernier appel d'offres. Moins d'un an : bon. Au-delà, il
    // faut le refaire.
    id: "M3",
    branch: "messagerie",
    scored: true,
    max: 25,
    options: [
      { value: "moins_1an", points: 25 },
      { value: "plus_1an", points: 10 },
    ],
  },
  {
    // M4 est la question qui vend l'offre : comparer des grilles messagerie
    // demande de les ramener sur la même base — tranches de poids, taxation
    // réelle ou volumétrique, zones, surcharge gazole, ad valorem, surcoûts.
    // Sans ce travail, l'offre retenue n'est pas la moins chère. Elle ne doit
    // jamais être coupée, et sert aussi de question de branche secondaire.
    id: "M4",
    branch: "messagerie",
    scored: true,
    max: 25,
    options: [
      { value: "oui", points: 25 },
      { value: "non", points: 10 },
    ],
  },
  {
    // Renouvellement du panel. Le nombre d'invités n'est plus demandé — c'est
    // M1 qui porte la profondeur du panel — mais l'arrivée de transporteurs
    // neufs reste le signal qui distingue une consultation d'une reconduction.
    id: "M5",
    branch: "messagerie",
    scored: true,
    max: 25,
    options: [
      { value: "oui", points: 25 },
      { value: "non", points: 10 },
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
    // Question la plus discriminante sur la branche complets : elle sépare ceux
    // qui renégocient des prix de ceux qui reconçoivent un schéma. Elle n'est
    // pas posée en messagerie, où la façon dont le plan a été construit — 4PL,
    // commissionnaire — ne dit rien d'utile : ce sont les deux questions sur les
    // appels d'offres qui y tiennent le rôle de clôture.
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
  complets: "C1",
};

/** Toutes les questions de la banque, indexées par identifiant. */
export const QUESTION_BANK: Readonly<Record<QuestionId, Question>> = Object.freeze(
  [...MESSAGERIE, ...COMPLETS, ...GLOBAL].reduce<
    Record<QuestionId, Question>
  >((bank, question) => {
    bank[question.id] = question;
    return bank;
  }, {}),
);
