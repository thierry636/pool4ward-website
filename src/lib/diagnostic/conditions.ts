/**
 * Évaluateur de conditions.
 *
 * Le moteur de branchement évalue des conditions déclarées en configuration ;
 * il ne code aucun arbre en dur. Ajouter une question ou un levier ne demande
 * jamais de toucher à ce fichier.
 */

import type { Condition, EvaluationContext } from "./types";

/** Réponse effectivement donnée à une question, ou `undefined`. */
function answerOf(context: EvaluationContext, question: string) {
  return context.answers[question];
}

export function evaluateCondition(
  condition: Condition,
  context: EvaluationContext,
): boolean {
  switch (condition.type) {
    case "always":
      return true;

    case "flowRanked":
      return context.ranking.includes(condition.flow);

    case "primaryBranch":
      return context.ranking[0] === condition.flow;

    case "secondaryBranch":
      return context.ranking[1] === condition.flow;

    case "answerIn": {
      const answer = answerOf(context, condition.question);
      return answer !== undefined && condition.values.includes(answer);
    }

    case "answerNotIn": {
      // Une question sans réponse ne déclenche rien : « ≠ rapprochees » ne doit
      // pas être vrai parce que la question n'a pas été servie.
      const answer = answerOf(context, condition.question);
      return answer !== undefined && !condition.values.includes(answer);
    }

    case "all":
      return condition.of.every((sub) => evaluateCondition(sub, context));

    case "any":
      return condition.of.some((sub) => evaluateCondition(sub, context));

    case "not":
      return !evaluateCondition(condition.of, context);
  }
}
