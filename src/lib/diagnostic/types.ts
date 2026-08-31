/**
 * Diagnostic « Indice de Productivité Transport » — modèle de données.
 *
 * Ce fichier ne contient que des types : la banque de questions et le barème
 * vivent dans `src/content/diagnostic`, le moteur dans `src/lib/diagnostic`.
 * Aucune chaîne affichable ne transite par ici — la copy est dans les objets
 * i18n (`src/content/diagnostic/copy.*.ts`).
 */

/** Les trois typologies de flux classables à l'écran 1. */
export type FlowType = "messagerie" | "partiels" | "complets";

/** Ordre d'importance déclaré par le répondant. `ranking[0]` fait la branche. */
export type Ranking = FlowType[];

/** Identifiant de question — « M1 », « P2 », « C4 », « G1 »… */
export type QuestionId = string;

/** Valeur d'option, stockée telle quelle dans l'enregistrement. */
export type OptionValue = string;

/** Réponses collectées, indexées par identifiant de question. */
export type Answers = Readonly<Record<QuestionId, OptionValue | undefined>>;

/**
 * Rôle sous lequel une question est servie.
 * - `primary`   : question de la branche classée n°1
 * - `secondary` : question unique de la branche classée n°2 (jamais scorée)
 * - `global`    : question de clôture, posée à tout le monde
 */
export type QuestionRole = "primary" | "secondary" | "global";

export interface QuestionOption {
  readonly value: OptionValue;
  /** `null` sur une question non scorée (C3, ou toute question servie en secondaire). */
  readonly points: number | null;
}

export interface Question {
  readonly id: QuestionId;
  /** Branche propriétaire, ou `global` pour la question de clôture. */
  readonly branch: FlowType | "global";
  /** Entre dans l'indice quand la question est servie en rôle `primary`/`global`. */
  readonly scored: boolean;
  /** Points maximum de la question. `0` si non scorée. */
  readonly max: number;
  readonly options: readonly QuestionOption[];
  /** Condition de service supplémentaire (ex. P4 sautée si « complets » non classé). */
  readonly when?: Condition;
}

/**
 * Langage de conditions évalué par le moteur.
 *
 * Le branchement n'est pas un arbre codé en dur : ajouter une question ou un
 * levier revient à ajouter une entrée de configuration, jamais à toucher au
 * moteur.
 */
export type Condition =
  | { readonly type: "always" }
  | { readonly type: "flowRanked"; readonly flow: FlowType }
  | { readonly type: "primaryBranch"; readonly flow: FlowType }
  | { readonly type: "secondaryBranch"; readonly flow: FlowType }
  | {
      readonly type: "answerIn";
      readonly question: QuestionId;
      readonly values: readonly OptionValue[];
    }
  | {
      readonly type: "answerNotIn";
      readonly question: QuestionId;
      readonly values: readonly OptionValue[];
    }
  | { readonly type: "all"; readonly of: readonly Condition[] }
  | { readonly type: "any"; readonly of: readonly Condition[] }
  | { readonly type: "not"; readonly of: Condition };

/** Contexte d'évaluation d'une condition. */
export interface EvaluationContext {
  readonly ranking: Ranking;
  readonly answers: Answers;
}

/** Question effectivement servie au répondant, avec son rôle et son poids réel. */
export interface ServedQuestion {
  readonly question: Question;
  readonly role: QuestionRole;
  /** `question.scored` ET rôle ≠ `secondary` — c'est ce booléen qui compte. */
  readonly scored: boolean;
}

export type LevelId = "plan_subi" | "plan_pilote" | "plan_optimise";

export interface LevelThreshold {
  readonly id: LevelId;
  readonly min: number;
  readonly max: number;
}

export type LeverId = string;

export interface LeverRule {
  readonly id: LeverId;
  readonly when: Condition;
}

/** Sortie de conversion : RDV direct ou demande de flux. */
export type OutcomeId = "rdv" | "flux";

export interface ScoreBreakdown {
  readonly points: number;
  readonly maxServed: number;
  readonly indice: number;
}

export interface DiagnosticResult extends ScoreBreakdown {
  readonly ranking: Ranking;
  readonly branch: FlowType;
  /** Branche classée n°2, si elle existe. */
  readonly secondaryBranch: FlowType | null;
  /** Flux classés au-delà du n°2 : profil seulement, aucune question servie. */
  readonly otherFlows: readonly FlowType[];
  readonly level: LevelId;
  readonly levers: readonly LeverId[];
  /** Levier déclenché par la question de branche secondaire, s'il y en a un. */
  readonly secondaryLever: LeverId | null;
  readonly outcome: OutcomeId;
  /** Sortie proposée en lien secondaire — personne ne doit se sentir aiguillé. */
  readonly alternateOutcome: OutcomeId;
  /** Phrases ajoutées au bloc de conversion, sélectionnées par condition. */
  readonly outcomeNotes: readonly string[];
}

export interface LeadFields {
  readonly email: string | null;
  readonly societe: string | null;
  readonly role: string | null;
  readonly perimetre: string | null;
  readonly budget: string | null;
}

export interface UtmFields {
  readonly source: string | null;
  readonly medium: string | null;
  readonly campaign: string | null;
  readonly content: string | null;
}

/** Enregistrement persisté, créé dès l'écran de résultat — avant l'email. */
export interface DiagnosticRecord {
  readonly id: string;
  readonly created_at: string;
  readonly ranking: Ranking;
  readonly branch: FlowType;
  readonly answers: Record<QuestionId, OptionValue>;
  readonly points: number;
  readonly max_servi: number;
  readonly indice: number;
  readonly level: LevelId;
  readonly levers: readonly LeverId[];
  readonly outcome: OutcomeId;
  readonly lead: LeadFields;
  readonly utm: UtmFields;
  readonly duration_seconds: number;
}
