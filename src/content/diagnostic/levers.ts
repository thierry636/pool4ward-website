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
  messagerie: [
    {
      id: "grilles_comparables",
      when: { type: "answerNotIn", question: "M4", values: ["rapprochees"] },
    },
    {
      id: "remise_en_competition",
      when: { type: "answerIn", question: "M3", values: ["plus3ans", "jamais"] },
    },
    {
      id: "reprise_attribution",
      when: { type: "answerIn", question: "M2", values: ["habitudes"] },
    },
    {
      id: "prestataire_unique",
      when: { type: "answerIn", question: "M1", values: ["unique"] },
    },
    {
      id: "consolidation_volumes",
      when: { type: "answerIn", question: "M1", values: ["quatre_plus"] },
    },
    REOUVERTURE_CONCEPTION,
  ],

  partiels: [
    {
      id: "regrouper_avant_negocier",
      when: { type: "answerIn", question: "P1", values: ["chacun_seul"] },
    },
    {
      id: "delai_matiere_premiere",
      when: {
        type: "answerIn",
        question: "P2",
        values: ["48h", "24h", "depend_client"],
      },
    },
    {
      id: "verifier_exigence_client",
      when: { type: "answerIn", question: "P2", values: ["aucun"] },
    },
    {
      id: "actif_existant",
      when: { type: "answerIn", question: "P3", values: ["oui_pas_utilise"] },
    },
    {
      id: "massification_tiers",
      when: { type: "answerIn", question: "P3", values: ["non"] },
    },
    {
      id: "partiels_dans_ao",
      when: { type: "answerIn", question: "P4", values: ["separes", "spot"] },
    },
    REOUVERTURE_CONCEPTION,
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
      when: { type: "answerNotIn", question: "M4", values: ["rapprochees"] },
    },
  ],
  partiels: [
    {
      id: "delai_matiere_premiere",
      when: {
        type: "answerIn",
        question: "P2",
        values: ["48h", "24h", "depend_client"],
      },
    },
    {
      id: "verifier_exigence_client",
      when: { type: "answerIn", question: "P2", values: ["aucun"] },
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
  "reprise_attribution",
  "prestataire_unique",
  "consolidation_volumes",
  "regrouper_avant_negocier",
  "delai_matiere_premiere",
  "verifier_exigence_client",
  "actif_existant",
  "massification_tiers",
  "partiels_dans_ao",
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
  "P1",
  "P2",
  "P3",
  "P4",
  "C1",
  "C2",
  "C3",
  "C4",
  "G1",
];
