/**
 * Règles de sélection des leviers — CONFIGURATION.
 *
 * Ordre de priorité : on prend les `MAX_LEVERS` premières règles dont la
 * condition est vraie. Les conditions sont des données évaluées par le moteur,
 * pas du code : ajouter un levier ne demande de toucher à aucune logique.
 */

import type { FlowType, LeverRule, QuestionId } from "@/lib/diagnostic/types";

/** Levier commun à toutes les branches, toujours en dernière position. */
const REOUVERTURE_CONCEPTION: LeverRule = {
  id: "reouverture_conception",
  when: { type: "answerIn", question: "G1", values: ["reconduit"] },
};

export const LEVER_RULES: Readonly<Record<FlowType, readonly LeverRule[]>> = {
  // G1 n'étant pas posée en messagerie, REOUVERTURE_CONCEPTION n'y figure pas :
  // ce sont les deux règles sur les appels d'offres qui portent la conception.
  messagerie: [
    {
      id: "grilles_comparables",
      when: { type: "answerNotIn", question: "M4", values: ["oui"] },
    },
    {
      id: "ouvrir_nouveaux_entrants",
      when: { type: "answerIn", question: "M6", values: ["aucun", "rarement"] },
    },
    {
      id: "elargir_panel",
      when: {
        type: "answerIn",
        question: "M5",
        values: ["moins_trois", "trois_cinq"],
      },
    },
    {
      id: "remise_en_competition",
      when: { type: "answerIn", question: "M3", values: ["plus3ans", "jamais"] },
    },
    {
      id: "comparaison_systematique",
      when: { type: "answerIn", question: "M2", values: ["zone"] },
    },
    {
      id: "prestataire_unique",
      when: { type: "answerIn", question: "M1", values: ["unique"] },
    },
    {
      id: "consolidation_volumes",
      when: { type: "answerIn", question: "M1", values: ["six_dix", "plus_dix"] },
    },
  ],

  complets: [
    {
      id: "retours_vide",
      when: {
        type: "answerIn",
        question: "C1",
        values: ["aller_simple", "inconnu"],
      },
    },
    {
      id: "appariement_flux",
      when: { type: "answerIn", question: "C2", values: ["jamais", "envisage"] },
    },
    {
      // L'éligibilité au report modal se joue sur la régularité bien plus que
      // sur la distance — d'où le croisement C3 × C4.
      id: "eligibilite_modale",
      when: {
        type: "all",
        of: [
          { type: "answerIn", question: "C3", values: ["stable", "saisonnier"] },
          { type: "answerNotIn", question: "C4", values: ["moins24mois"] },
        ],
      },
    },
    {
      id: "decision_modale_reprise",
      when: {
        type: "answerIn",
        question: "C4",
        values: ["ecarte_sans_etude"],
      },
    },
    {
      id: "part_stable",
      when: { type: "answerIn", question: "C3", values: ["aleatoire"] },
    },
    REOUVERTURE_CONCEPTION,
  ],
};

/**
 * Levier du bloc secondaire — celui déclenché par l'unique question de la
 * branche classée n°2. Une seule règle peut sortir ; aucune si le répondant est
 * déjà bon sur cette question.
 */
export const SECONDARY_LEVER_RULES: Readonly<
  Record<FlowType, readonly LeverRule[]>
> = {
  messagerie: [
    {
      id: "grilles_comparables",
      when: { type: "answerNotIn", question: "M4", values: ["oui"] },
    },
  ],
  complets: [
    {
      id: "retours_vide",
      when: {
        type: "answerIn",
        question: "C1",
        values: ["aller_simple", "inconnu"],
      },
    },
  ],
};

/** Tous les identifiants de levier utilisés, pour typer la copy. */
export const LEVER_IDS = [
  "grilles_comparables",
  "remise_en_competition",
  "ouvrir_nouveaux_entrants",
  "elargir_panel",
  "comparaison_systematique",
  "prestataire_unique",
  "consolidation_volumes",
  "retours_vide",
  "appariement_flux",
  "eligibilite_modale",
  "decision_modale_reprise",
  "part_stable",
  "reouverture_conception",
] as const;

export type KnownLeverId = (typeof LEVER_IDS)[number];

/** Questions référencées par les règles de leviers, pour vérification. */
export const LEVER_QUESTION_IDS: readonly QuestionId[] = [
  "M1",
  "M2",
  "M3",
  "M4",
  "M5",
  "M6",
  "C1",
  "C2",
  "C3",
  "C4",
  "G1",
];
