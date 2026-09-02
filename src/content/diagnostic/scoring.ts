/**
 * Barème d'interprétation — CONFIGURATION.
 *
 * Seuils de niveau et table de routage des sorties. Le calcul lui-même est
 * dans `src/lib/diagnostic/engine.ts` et ne connaît aucune de ces valeurs.
 */

import type {
  FlowType,
  LeverRule,
  LevelThreshold,
  OutcomeId,
} from "@/lib/diagnostic/types";

/**
 * Trois niveaux, seuils communs à toutes les branches.
 * Les verdicts, eux, sont écrits par branche (voir la copy).
 */
export const LEVEL_THRESHOLDS: readonly LevelThreshold[] = [
  // Chaque question est bonne (25) ou ne l'est pas (10). Les bornes sont calées
  // sur le NOMBRE de questions non bonnes, pour que le niveau ne dépende pas du
  // nombre de questions servies — la messagerie en sert cinq, ou quatre quand
  // le prestataire est unique et que la comparaison n'a plus d'objet :
  //   0 ou 1  → 100, 88, 85  → plan optimisé
  //   2       → 76, 70       → plan piloté
  //   3 et +  → 64, 55, …    → plan subi
  { id: "plan_subi", min: 0, max: 69 },
  { id: "plan_pilote", min: 70, max: 84 },
  { id: "plan_optimise", min: 85, max: 100 },
];

/**
 * Routage vers les deux sorties, déterminé par `ranking[0]` — JAMAIS par
 * l'indice. Un profil complets part en demande de flux quel que soit son score.
 */
export const OUTCOME_BY_BRANCH: Readonly<Record<FlowType, OutcomeId>> = {
  messagerie: "rdv",
  complets: "flux",
};

/**
 * Phrases ajoutées au bloc de conversion, sélectionnées par condition.
 *
 * Un profil complets à flux aléatoires part malgré tout en demande de flux —
 * seule la phrase d'accompagnement change. La sortie, elle, ne bouge pas.
 */
export const OUTCOME_NOTE_RULES: readonly LeverRule[] = [
  {
    id: "irregular_flows",
    when: {
      type: "all",
      of: [
        { type: "primaryBranch", flow: "complets" },
        { type: "answerIn", question: "C3", values: ["aleatoire"] },
      ],
    },
  },
];

/**
 * Nombre maximum de leviers affichés sur l'écran de résultat.
 * On prend les premiers dont la condition est vraie, dans l'ordre déclaré.
 */
export const MAX_LEVERS = 3;

/**
 * Emplacement du benchmark (« vous vous situez au-dessus de 62 % des chargeurs
 * de votre profil ») : réservé dans le design dès la v1, activé au-delà de ce
 * nombre de répondants par branche. Hors périmètre v1 tant que la base est vide.
 */
export const BENCHMARK_MIN_RESPONDENTS = 50;
export const BENCHMARK_ENABLED = false;

/** Identifiants des phrases d'accompagnement, pour typer la copy. */
export type OutcomeNoteId = "irregular_flows";
