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
  // Avec un barème binaire à plancher, l'indice ne descend jamais sous 40 :
  // les seuils de la spec (0–39 / 40–69 / 70–100) rendraient « Plan subi »
  // inatteignable.
  //
  // Les bornes sont calées pour que le niveau dépende du NOMBRE de points
  // d'amélioration et non du nombre de questions servies — sans quoi trois
  // points valent « piloté » à six questions et « subi » à cinq :
  //   0 ou 1 point  → 100, 90, 88  → plan optimisé
  //   2 points      → 80, 76       → plan piloté
  //   3 points et + → 70, 64, …    → plan subi
  { id: "plan_subi", min: 0, max: 75 },
  { id: "plan_pilote", min: 76, max: 84 },
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
