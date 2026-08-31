/**
 * Forme de l'objet i18n du diagnostic.
 *
 * Une clé par chaîne, aucune chaîne dans le markup. Ce type est ce qui garantit
 * qu'une version EN ne pourra pas être livrée à moitié : un fichier de copy
 * incomplet ne compile pas.
 *
 * Les enregistrements typés par identifiant (questions, options, leviers…) sont
 * dérivés de la configuration : ajouter une question à la banque fait apparaître
 * l'erreur de compilation qui rappelle d'écrire son libellé.
 */

import type {
  FlowType,
  LevelId,
  OutcomeId,
  QuestionId,
} from "@/lib/diagnostic/types";
import type { KnownLeverId } from "./levers";
import type { OutcomeNoteId } from "./scoring";

export interface QuestionCopy {
  /** Intitulé de la question, tel qu'il est lu à l'écran. */
  readonly label: string;
  /** Précision facultative sous l'intitulé. */
  readonly help?: string;
  /** Un libellé par valeur d'option de la banque. */
  readonly options: Readonly<Record<string, string>>;
}

export interface FlowCopy {
  /** Libellé de la carte de classement. */
  readonly label: string;
  /** Exemples affichés sous le libellé de la carte. */
  readonly hint: string;
  /** Forme utilisée dans « Indice de productivité — flux … ». */
  readonly indexLabel: string;
  /** Forme utilisée dans « Vous faites aussi du … ». */
  readonly alsoLabel: string;
}

export interface LeverCopy {
  readonly title: string;
  readonly body: string;
}

export interface OutcomeCopy {
  readonly title: string;
  readonly body: string;
  /** Détail facultatif — les cinq colonnes du fichier de flux, par exemple. */
  readonly details?: readonly string[];
  readonly note?: string;
  readonly cta: string;
  /** Lien discret vers l'autre sortie. */
  readonly alternate: string;
}

export interface SelectFieldCopy {
  readonly label: string;
  readonly placeholder: string;
  readonly options: readonly { readonly value: string; readonly label: string }[];
}

export interface TextFieldCopy {
  readonly label: string;
  readonly placeholder: string;
}

export interface DiagnosticCopy {
  readonly locale: string;

  readonly meta: {
    readonly title: string;
    readonly description: string;
  };

  readonly intro: {
    readonly eyebrow: string;
    readonly title: string;
    readonly subtitle: string;
    /** « 7 questions, deux minutes, aucune donnée de flux demandée. » */
    readonly reassurance: readonly string[];
    readonly cta: string;
  };

  readonly progress: {
    /** Gabarit avec {current} et {total}. */
    readonly label: string;
    readonly ariaLabel: string;
  };

  readonly nav: {
    readonly back: string;
    readonly next: string;
    readonly seeResult: string;
    readonly restart: string;
    /** Nom accessible du logo, qui ramène au site. */
    readonly home: string;
  };

  readonly ranking: {
    readonly title: string;
    readonly help: string;
    /** Gabarit avec {position}, lu par les lecteurs d'écran. */
    readonly positionAria: string;
    readonly unselectedAria: string;
    readonly hint: string;
    /** État affiché sur une carte classée. */
    readonly concerned: string;
    /** État affiché sur une carte laissée de côté. */
    readonly notConcerned: string;
  };

  readonly flows: Readonly<Record<FlowType, FlowCopy>>;
  readonly questions: Readonly<Record<QuestionId, QuestionCopy>>;

  readonly result: {
    readonly eyebrow: string;
    /** Gabarit avec {flow} et {score}. */
    readonly indexLabel: string;
    readonly outOf: string;
    readonly levelsTitle: string;
    readonly leversTitle: string;
    readonly leversIntro: string;
    /** Affiché quand aucune condition de levier n'est vraie — profil déjà mûr. */
    readonly leversEmpty: string;
    /** Gabarit avec {flow} — bloc court du deuxième flux classé. */
    readonly secondaryTitle: string;
    readonly secondaryEmpty: string;
    /** Gabarit avec {flows} — mention des flux classés au-delà du n°2. */
    readonly otherFlows: string;
    /** Emplacement réservé au benchmark, inactif tant que la base est vide. */
    readonly benchmarkPlaceholder: string;
  };

  readonly levels: Readonly<Record<LevelId, string>>;
  /** Un verdict par branche et par niveau. Aucun n'accuse, aucun ne chiffre. */
  readonly verdicts: Readonly<Record<FlowType, Readonly<Record<LevelId, string>>>>;
  readonly levers: Readonly<Record<KnownLeverId, LeverCopy>>;

  readonly outcomes: Readonly<Record<OutcomeId, OutcomeCopy>>;
  /** Variantes de sortie par branche, quand la branche change le discours. */
  readonly outcomeByBranch: Readonly<
    Partial<Record<FlowType, Partial<OutcomeCopy>>>
  >;
  /** Phrases d'accompagnement, indexées par identifiant de règle. */
  readonly outcomeNotes: Readonly<Record<OutcomeNoteId, string>>;

  readonly lead: {
    readonly title: string;
    readonly subtitle: string;
    readonly email: TextFieldCopy;
    readonly societe: TextFieldCopy;
    readonly role: SelectFieldCopy;
    readonly perimetre: SelectFieldCopy;
    readonly budget: SelectFieldCopy;
    readonly optional: string;
    readonly submit: string;
    readonly submitting: string;
    readonly success: string;
    readonly privacy: string;
    readonly errors: {
      readonly required: string;
      readonly email: string;
    };
  };
}
