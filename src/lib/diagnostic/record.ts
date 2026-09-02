/**
 * Construction de l'enregistrement persisté.
 *
 * Un enregistrement par diagnostic terminé, créé dès l'écran de résultat —
 * AVANT la saisie de l'email. Un abandon avant email reste une donnée de
 * baromètre exploitable.
 */

import type {
  Answers,
  DiagnosticRecord,
  DiagnosticResult,
  LeadFields,
  OptionValue,
  QuestionId,
  UtmFields,
} from "./types";

export const EMPTY_LEAD: LeadFields = {
  email: null,
  societe: null,
  role: null,
  perimetre: null,
  budget: null,
  creneau_date: null,
  creneau_heure: null,
  message: null,
  fichiers: [],
};

export const EMPTY_UTM: UtmFields = {
  source: null,
  medium: null,
  campaign: null,
  content: null,
};

/** Réponses nettoyées de leurs trous, pour la sérialisation. */
function definedAnswers(answers: Answers): Record<QuestionId, OptionValue> {
  const result: Record<QuestionId, OptionValue> = {};
  for (const [id, value] of Object.entries(answers)) {
    if (value !== undefined) result[id] = value;
  }
  return result;
}

export interface BuildRecordInput {
  readonly result: DiagnosticResult;
  readonly answers: Answers;
  readonly id: string;
  readonly createdAt: Date;
  readonly durationSeconds: number;
  readonly locale: string;
  readonly lead?: LeadFields;
  readonly utm?: UtmFields;
}

export function buildRecord({
  result,
  answers,
  id,
  createdAt,
  durationSeconds,
  locale,
  lead = EMPTY_LEAD,
  utm = EMPTY_UTM,
}: BuildRecordInput): DiagnosticRecord {
  return {
    id,
    created_at: createdAt.toISOString(),
    locale,
    ranking: result.ranking,
    branch: result.branch,
    answers: definedAnswers(answers),
    points: result.points,
    max_servi: result.maxServed,
    indice: result.indice,
    level: result.level,
    levers: result.levers,
    outcome: result.outcome,
    lead,
    utm,
    duration_seconds: durationSeconds,
  };
}

/** Lit les paramètres UTM d'une URL de campagne. */
export function readUtm(search: string): UtmFields {
  const params = new URLSearchParams(search);
  return {
    source: params.get("utm_source"),
    medium: params.get("utm_medium"),
    campaign: params.get("utm_campaign"),
    content: params.get("utm_content"),
  };
}
