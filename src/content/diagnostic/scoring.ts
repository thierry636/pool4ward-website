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
  { id: "plan_subi", min: 0, max: 39 },
  { id: "plan_pilote", min: 40, max: 69 },
  { id: "plan_optimise", min: 70, max: 100 },
];

/**
 * Routage vers les deux sorties, déterminé par `ranking[0]` — JAMAIS par
 * l'indice. Un profil complets part en demande de flux quel que soit son score.
 */
export const OUTCOME_BY_BRANCH: Readonly<Record<FlowType, OutcomeId>> = {
  messagerie: "rdv",
  partiels: "rdv",
  complets: "flux",
};

/**
 * L'autre sortie reste toujours accessible en lien secondaire discret sous le
 * CTA principal. Personne ne doit se sentir aiguillé.
 */
export const ALTERNATE_OUTCOME: Readonly<Record<OutcomeId, OutcomeId>> = {
  rdv: "flux",
  flux: "rdv",
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
