/**
 * Moteur du diagnostic.
 *
 * Ne contient ni barème, ni libellé : il lit la configuration
 * (`src/content/diagnostic`) et évalue des conditions. Toutes les fonctions
 * sont pures — l'état de l'interface vit dans `useDiagnostic`.
 */

import {
  BRANCH_QUESTIONS,
  GLOBAL_QUESTIONS,
  QUESTION_BANK,
  SECONDARY_QUESTION_BY_FLOW,
} from "@/content/diagnostic/questions";
import { LEVER_RULES, SECONDARY_LEVER_RULES } from "@/content/diagnostic/levers";
import {
  ALTERNATE_OUTCOME,
  LEVEL_THRESHOLDS,
  MAX_LEVERS,
  OUTCOME_BY_BRANCH,
  OUTCOME_NOTE_RULES,
} from "@/content/diagnostic/scoring";
import { evaluateCondition } from "./conditions";
import type {
  Answers,
  DiagnosticResult,
  EvaluationContext,
  FlowType,
  LeverId,
  LevelId,
  OptionValue,
  OutcomeId,
  Question,
  QuestionId,
  Ranking,
  ScoreBreakdown,
  ServedQuestion,
} from "./types";

/* -------------------------------------------------------------------------- */
/* Branchement                                                                 */
/* -------------------------------------------------------------------------- */

/** Branche principale : le flux classé n°1, et rien d'autre. */
export function primaryBranch(ranking: Ranking): FlowType | null {
  return ranking[0] ?? null;
}

/** Branche secondaire : le flux classé n°2, s'il existe. */
export function secondaryBranch(ranking: Ranking): FlowType | null {
  return ranking[1] ?? null;
}

/**
 * Flux classés au-delà du n°2. Ils ne déclenchent aucune question : ils sont
 * enregistrés au profil et mentionnés dans le résultat.
 */
export function otherFlows(ranking: Ranking): FlowType[] {
  return ranking.slice(2);
}

/**
 * Questions effectivement servies, dans l'ordre des écrans :
 * les questions de la branche n°1, puis l'unique question de la branche n°2,
 * puis les questions de clôture.
 *
 * Les conditions sont évaluées contre les réponses déjà données : la liste est
 * recalculée à chaque réponse, ce qui permet à une question d'en ouvrir ou d'en
 * fermer une autre sans que le moteur ne le sache.
 */
export function servedQuestions(
  ranking: Ranking,
  answers: Answers = {},
): ServedQuestion[] {
  const branch = primaryBranch(ranking);
  if (!branch) return [];

  const context: EvaluationContext = { ranking, answers };
  const served: ServedQuestion[] = [];
  const seen = new Set<QuestionId>();

  const push = (question: Question, role: ServedQuestion["role"]) => {
    if (seen.has(question.id)) return;
    if (question.when && !evaluateCondition(question.when, context)) return;
    seen.add(question.id);
    served.push({
      question,
      role,
      // Une question servie en secondaire n'entre jamais dans l'indice.
      scored: question.scored && role !== "secondary",
    });
  };

  for (const question of BRANCH_QUESTIONS[branch]) {
    push(question, "primary");
  }

  const second = secondaryBranch(ranking);
  if (second) {
    const secondaryId = SECONDARY_QUESTION_BY_FLOW[second];
    const question = QUESTION_BANK[secondaryId];
    if (question) push(question, "secondary");
  }

  for (const question of GLOBAL_QUESTIONS) {
    push(question, "global");
  }

  return served;
}

/** Nombre d'écrans de question, hors accueil, classement et résultat. */
export function questionCount(ranking: Ranking, answers: Answers = {}): number {
  return servedQuestions(ranking, answers).length;
}

/* -------------------------------------------------------------------------- */
/* Indice                                                                      */
/* -------------------------------------------------------------------------- */

function pointsFor(question: Question, value: OptionValue | undefined): number {
  if (value === undefined) return 0;
  const option = question.options.find((candidate) => candidate.value === value);
  return option?.points ?? 0;
}

/**
 * indice = round( Σ points des questions scorées servies
 *               / Σ max  des questions scorées servies × 100 )
 *
 * La normalisation est indispensable : la branche complets ne compte que trois
 * questions scorées (C3 étant hors score), soit un maximum de 100, contre 125
 * pour messagerie et lots partiels.
 *
 * `points`, `max_servi` et `indice` sont conservés séparément : le jour où le
 * barème change, les réponses brutes permettent de recalculer l'historique.
 */
export function computeScore(ranking: Ranking, answers: Answers): ScoreBreakdown {
  let points = 0;
  let maxServed = 0;

  for (const served of servedQuestions(ranking, answers)) {
    if (!served.scored) continue;
    maxServed += served.question.max;
    points += pointsFor(served.question, answers[served.question.id]);
  }

  const indice = maxServed > 0 ? Math.round((points / maxServed) * 100) : 0;

  return { points, maxServed, indice };
}

/** Niveau correspondant à un indice, lu dans les seuils de configuration. */
export function levelFor(indice: number): LevelId {
  const threshold = LEVEL_THRESHOLDS.find(
    (candidate) => indice >= candidate.min && indice <= candidate.max,
  );
  // Les seuils couvrent 0–100 ; le fallback protège d'une configuration trouée.
  return threshold?.id ?? LEVEL_THRESHOLDS[0].id;
}

/* -------------------------------------------------------------------------- */
/* Leviers                                                                     */
/* -------------------------------------------------------------------------- */

/** Les trois premiers leviers dont la condition est vraie, dans l'ordre déclaré. */
export function selectLevers(
  ranking: Ranking,
  answers: Answers,
  limit: number = MAX_LEVERS,
): LeverId[] {
  const branch = primaryBranch(ranking);
  if (!branch) return [];

  const context: EvaluationContext = { ranking, answers };
  const selected: LeverId[] = [];

  for (const rule of LEVER_RULES[branch]) {
    if (selected.length >= limit) break;
    if (selected.includes(rule.id)) continue;
    if (evaluateCondition(rule.when, context)) selected.push(rule.id);
  }

  return selected;
}

/**
 * Levier du bloc secondaire, déclenché par l'unique question de la branche n°2.
 * `null` si le répondant est déjà bon sur cette question — le bloc se réduit
 * alors à la mention « vous faites aussi du … ».
 */
export function selectSecondaryLever(
  ranking: Ranking,
  answers: Answers,
): LeverId | null {
  const second = secondaryBranch(ranking);
  if (!second) return null;

  const context: EvaluationContext = { ranking, answers };
  const rule = SECONDARY_LEVER_RULES[second].find((candidate) =>
    evaluateCondition(candidate.when, context),
  );

  return rule?.id ?? null;
}

/* -------------------------------------------------------------------------- */
/* Routage                                                                     */
/* -------------------------------------------------------------------------- */

/** Le routage est déterminé par `ranking[0]`, jamais par l'indice. */
export function outcomeFor(branch: FlowType): OutcomeId {
  return OUTCOME_BY_BRANCH[branch];
}

/** L'autre sortie, toujours accessible en lien secondaire discret. */
export function alternateOutcomeFor(outcome: OutcomeId): OutcomeId {
  return ALTERNATE_OUTCOME[outcome];
}

/** Phrases d'accompagnement de la sortie, sélectionnées par condition. */
export function selectOutcomeNotes(
  ranking: Ranking,
  answers: Answers,
): string[] {
  const context: EvaluationContext = { ranking, answers };
  return OUTCOME_NOTE_RULES.filter((rule) =>
    evaluateCondition(rule.when, context),
  ).map((rule) => rule.id);
}

/* -------------------------------------------------------------------------- */
/* Résultat complet                                                            */
/* -------------------------------------------------------------------------- */

export function computeResult(
  ranking: Ranking,
  answers: Answers,
): DiagnosticResult | null {
  const branch = primaryBranch(ranking);
  if (!branch) return null;

  const { points, maxServed, indice } = computeScore(ranking, answers);
  const outcome = outcomeFor(branch);

  return {
    ranking,
    branch,
    secondaryBranch: secondaryBranch(ranking),
    otherFlows: otherFlows(ranking),
    points,
    maxServed,
    indice,
    level: levelFor(indice),
    levers: selectLevers(ranking, answers),
    secondaryLever: selectSecondaryLever(ranking, answers),
    outcome,
    alternateOutcome: alternateOutcomeFor(outcome),
    outcomeNotes: selectOutcomeNotes(ranking, answers),
  };
}

/** Le questionnaire est complet quand toute question servie a une réponse. */
export function isComplete(ranking: Ranking, answers: Answers): boolean {
  const served = servedQuestions(ranking, answers);
  return (
    served.length > 0 &&
    served.every((entry) => answers[entry.question.id] !== undefined)
  );
}

/**
 * Purge les réponses devenues orphelines — une question qui n'est plus servie
 * après un changement de classement ne doit pas polluer l'indice.
 */
export function pruneAnswers(ranking: Ranking, answers: Answers): Answers {
  const servedIds = new Set(
    servedQuestions(ranking, answers).map((entry) => entry.question.id),
  );
  const pruned: Record<QuestionId, OptionValue> = {};

  for (const [id, value] of Object.entries(answers)) {
    if (value !== undefined && servedIds.has(id)) pruned[id] = value;
  }

  return pruned;
}
