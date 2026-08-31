import { describe, expect, it } from "vitest";

import {
  alternateOutcomeFor,
  computeResult,
  computeScore,
  isComplete,
  levelFor,
  outcomeFor,
  pruneAnswers,
  selectLevers,
  selectSecondaryLever,
  servedQuestions,
} from "./engine";
import { evaluateCondition } from "./conditions";
import type { Answers, FlowType, Ranking } from "./types";
import { QUESTION_BANK } from "@/content/diagnostic/questions";
import { LEVER_RULES, SECONDARY_LEVER_RULES } from "@/content/diagnostic/levers";

const idsOf = (ranking: Ranking, answers: Answers = {}) =>
  servedQuestions(ranking, answers).map((entry) => entry.question.id);

const scoredIdsOf = (ranking: Ranking, answers: Answers = {}) =>
  servedQuestions(ranking, answers)
    .filter((entry) => entry.scored)
    .map((entry) => entry.question.id);

/* -------------------------------------------------------------------------- */
/* Branchement                                                                 */
/* -------------------------------------------------------------------------- */

describe("branchement — branche messagerie", () => {
  const ranking: Ranking = ["messagerie"];

  it("sert les quatre questions de la branche puis la clôture", () => {
    expect(idsOf(ranking)).toEqual(["M1", "M2", "M3", "M4", "G1"]);
  });

  it("ne sert aucune question des autres branches", () => {
    // Un acheteur messagerie ne doit jamais voir une question sur le ferroviaire.
    expect(idsOf(ranking)).not.toContain("C4");
    expect(idsOf(ranking).some((id) => id.startsWith("P"))).toBe(false);
  });

  it("normalise sur 125 : quatre questions scorées plus G1", () => {
    const answers: Answers = {
      M1: "deux_trois", // 25
      M2: "competition", // 25
      M3: "moins12mois", // 25
      M4: "rapprochees", // 25
      G1: "redesign", // 25
    };
    expect(computeScore(ranking, answers)).toEqual({
      points: 125,
      maxServed: 125,
      indice: 100,
    });
  });

  it("arrondit l'indice normalisé", () => {
    const answers: Answers = {
      M1: "unique", // 8
      M2: "unique", // 8
      M3: "plus3ans", // 5
      M4: "affiches", // 10
      G1: "ao_periodique", // 12
    };
    // 43 / 125 = 34,4 %
    expect(computeScore(ranking, answers)).toEqual({
      points: 43,
      maxServed: 125,
      indice: 34,
    });
  });
});

describe("branchement — branche lots partiels", () => {
  it("saute P4 quand « complets » n'est pas classé", () => {
    expect(idsOf(["partiels"])).toEqual(["P1", "P2", "P3", "G1"]);
  });

  it("sert P4 dès que « complets » est classé", () => {
    expect(idsOf(["partiels", "complets"])).toContain("P4");
  });

  it("normalise sur 100 quand P4 est sautée, sur 125 sinon", () => {
    const answers: Answers = {
      P1: "regroupes", // 25
      P2: "48h", // 25
      P3: "oui_utilise", // 25
      P4: "meme_ao", // 25
      G1: "redesign", // 25
    };
    expect(computeScore(["partiels"], answers).maxServed).toBe(100);
    expect(computeScore(["partiels"], answers).indice).toBe(100);
    // Avec complets classé, P4 est servie ET C1 est servie en secondaire non scorée.
    expect(computeScore(["partiels", "complets"], answers).maxServed).toBe(125);
  });
});

describe("branchement — branche camions complets", () => {
  const ranking: Ranking = ["complets"];

  it("sert C1 à C4 puis la clôture", () => {
    expect(idsOf(ranking)).toEqual(["C1", "C2", "C3", "C4", "G1"]);
  });

  it("exclut C3 du score : maximum servi de 100, pas 125", () => {
    // Sans normalisation, un profil complets serait mécaniquement plus bas
    // qu'un profil messagerie à qualité de gestion égale.
    expect(scoredIdsOf(ranking)).toEqual(["C1", "C2", "C4", "G1"]);
    expect(QUESTION_BANK.C3.scored).toBe(false);

    const answers: Answers = {
      C1: "boucles", // 25
      C2: "en_place", // 25
      C3: "aleatoire", // hors score
      C4: "moins24mois", // 25
      G1: "redesign", // 25
    };
    expect(computeScore(ranking, answers)).toEqual({
      points: 100,
      maxServed: 100,
      indice: 100,
    });
  });

  it("ne pénalise pas un flux aléatoire", () => {
    const base: Answers = {
      C1: "partiellement",
      C2: "envisage",
      C4: "plus3ans",
      G1: "ao_periodique",
    };
    const stable = computeScore(ranking, { ...base, C3: "stable" });
    const aleatoire = computeScore(ranking, { ...base, C3: "aleatoire" });
    expect(aleatoire).toEqual(stable);
  });

  it("reproduit l'exemple d'enregistrement de la spécification", () => {
    const answers: Answers = {
      C1: "aller_simple", // 4
      C2: "jamais", // 0
      C3: "stable",
      C4: "ecarte_sans_etude", // 5
      G1: "reconduit", // 0
      M4: "non", // secondaire, hors score
    };
    const result = computeResult(["complets", "messagerie"], answers);
    expect(result).not.toBeNull();
    expect(result?.points).toBe(9);
    expect(result?.maxServed).toBe(100);
    expect(result?.indice).toBe(9);
    expect(result?.level).toBe("plan_subi");
    expect(result?.levers).toEqual([
      "retours_vide",
      "appariement_flux",
      "eligibilite_modale",
    ]);
    expect(result?.outcome).toBe("flux");
  });
});

/* -------------------------------------------------------------------------- */
/* Deux flux classés                                                           */
/* -------------------------------------------------------------------------- */

describe("deux flux classés", () => {
  it("sert une seule question de la branche secondaire, à la bonne place", () => {
    // Branche n°1, puis l'unique question de la branche n°2, puis la clôture.
    expect(idsOf(["messagerie", "complets"])).toEqual([
      "M1",
      "M2",
      "M3",
      "M4",
      "C1",
      "G1",
    ]);
    expect(idsOf(["complets", "partiels"])).toEqual([
      "C1",
      "C2",
      "C3",
      "C4",
      "P2",
      "G1",
    ]);
    expect(idsOf(["partiels", "messagerie"])).toEqual([
      "P1",
      "P2",
      "P3",
      "M4",
      "G1",
    ]);
  });

  it("garde le questionnaire entre six et huit questions", () => {
    const combinations: Ranking[] = [
      ["messagerie", "partiels"],
      ["messagerie", "complets"],
      ["partiels", "complets"],
      ["complets", "messagerie"],
      ["complets", "partiels", "messagerie"],
    ];
    for (const ranking of combinations) {
      const count = idsOf(ranking).length;
      expect(count, ranking.join(">")).toBeGreaterThanOrEqual(6);
      expect(count, ranking.join(">")).toBeLessThanOrEqual(8);
    }
  });

  it("descend à cinq questions dans le seul cas où P4 est sautée", () => {
    // Branche partiels sans complets classé : P4 n'a pas de sens, on la saute.
    // C'est la seule combinaison sous le plancher des six questions, et elle est
    // assumée — poser une question hors sujet coûterait plus cher.
    expect(idsOf(["partiels", "messagerie"])).toEqual([
      "P1",
      "P2",
      "P3",
      "M4",
      "G1",
    ]);
  });

  it("garde un indice dans 0–100 sur toutes les combinaisons de classement", () => {
    const flows: FlowType[] = ["messagerie", "partiels", "complets"];
    const rankings: Ranking[] = [];
    for (const a of flows) {
      rankings.push([a]);
      for (const b of flows.filter((flow) => flow !== a)) {
        rankings.push([a, b]);
        for (const c of flows.filter((flow) => flow !== a && flow !== b)) {
          rankings.push([a, b, c]);
        }
      }
    }

    for (const ranking of rankings) {
      for (const pick of [0, -1] as const) {
        // Le meilleur puis le pire choix possible sur chaque question servie.
        const answers: Record<string, string> = {};
        for (const entry of servedQuestions(ranking)) {
          const options = entry.question.options;
          answers[entry.question.id] =
            options[pick === 0 ? 0 : options.length - 1].value;
        }
        const score = computeScore(ranking, answers);
        expect(score.points, ranking.join(">")).toBeLessThanOrEqual(
          score.maxServed,
        );
        expect(score.indice, ranking.join(">")).toBeGreaterThanOrEqual(0);
        expect(score.indice, ranking.join(">")).toBeLessThanOrEqual(100);
        expect(score.maxServed, ranking.join(">")).toBeGreaterThan(0);
      }
    }
  });

  it("n'inclut jamais la question secondaire dans l'indice", () => {
    const answers: Answers = {
      M1: "deux_trois",
      M2: "competition",
      M3: "moins12mois",
      M4: "rapprochees",
      C1: "inconnu", // secondaire : 0 point, ne doit rien coûter
      G1: "redesign",
    };
    const seul = computeScore(["messagerie"], answers);
    const avecSecondaire = computeScore(["messagerie", "complets"], answers);

    expect(scoredIdsOf(["messagerie", "complets"], answers)).not.toContain("C1");
    expect(avecSecondaire.maxServed).toBe(125);
    expect(avecSecondaire).toEqual(seul);
    expect(avecSecondaire.indice).toBe(100);
  });

  it("marque la question secondaire comme non scorée même si elle est scorée en primaire", () => {
    const served = servedQuestions(["complets", "messagerie"]);
    const m4 = served.find((entry) => entry.question.id === "M4");
    expect(m4?.role).toBe("secondary");
    expect(m4?.question.scored).toBe(true);
    expect(m4?.scored).toBe(false);
  });

  it("ne sert pas deux fois la même question quand elle est déjà primaire", () => {
    // M4 est la question secondaire de la messagerie ; en branche messagerie
    // elle est déjà servie en primaire et ne doit pas revenir.
    const ids = idsOf(["messagerie", "partiels"]);
    expect(ids.filter((id) => id === "P2")).toHaveLength(1);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("le troisième flux ne déclenche aucune question mais reste au profil", () => {
    const deux = idsOf(["complets", "messagerie"]);
    const trois = idsOf(["complets", "messagerie", "partiels"]);
    expect(trois).toEqual(deux);

    const result = computeResult(["complets", "messagerie", "partiels"], {
      C1: "boucles",
      C2: "en_place",
      C3: "stable",
      C4: "moins24mois",
      M4: "non",
      G1: "redesign",
    });
    expect(result?.otherFlows).toEqual(["partiels"]);
    expect(result?.secondaryBranch).toBe("messagerie");
  });

  it("déclenche le levier du bloc secondaire depuis la question secondaire", () => {
    const answers: Answers = { M4: "non" };
    expect(selectSecondaryLever(["complets", "messagerie"], answers)).toBe(
      "grilles_comparables",
    );
    expect(
      selectSecondaryLever(["complets", "messagerie"], { M4: "rapprochees" }),
    ).toBeNull();
    expect(selectSecondaryLever(["messagerie"], answers)).toBeNull();
    expect(
      selectSecondaryLever(["messagerie", "partiels"], { P2: "aucun" }),
    ).toBe("verifier_exigence_client");
  });
});

/* -------------------------------------------------------------------------- */
/* Niveaux                                                                     */
/* -------------------------------------------------------------------------- */

describe("niveaux", () => {
  it("applique les seuils communs aux trois branches", () => {
    expect(levelFor(0)).toBe("plan_subi");
    expect(levelFor(39)).toBe("plan_subi");
    expect(levelFor(40)).toBe("plan_pilote");
    expect(levelFor(69)).toBe("plan_pilote");
    expect(levelFor(70)).toBe("plan_optimise");
    expect(levelFor(100)).toBe("plan_optimise");
  });
});

/* -------------------------------------------------------------------------- */
/* Leviers                                                                     */
/* -------------------------------------------------------------------------- */

describe("leviers", () => {
  it("prend au plus trois leviers, dans l'ordre de priorité", () => {
    const levers = selectLevers(["messagerie"], {
      M1: "unique",
      M2: "habitudes",
      M3: "jamais",
      M4: "non",
      G1: "reconduit",
    });
    expect(levers).toEqual([
      "grilles_comparables",
      "remise_en_competition",
      "reprise_attribution",
    ]);
  });

  it("saute les règles dont la condition est fausse", () => {
    const levers = selectLevers(["partiels", "complets"], {
      P1: "regroupes",
      P2: "depend_client",
      P3: "oui_pas_utilise",
      P4: "spot",
      G1: "redesign",
    });
    expect(levers).toEqual([
      "delai_matiere_premiere",
      "actif_existant",
      "partiels_dans_ao",
    ]);
  });

  it("ne déclenche pas un levier sur une question non servie", () => {
    // « M4 ≠ rapprochees » ne doit pas être vrai parce que M4 n'a pas été posée.
    const levers = selectLevers(["complets"], {
      C1: "boucles",
      C2: "en_place",
      C3: "stable",
      C4: "moins24mois",
      G1: "redesign",
    });
    expect(levers).toEqual([]);
  });

  it("croise régularité et évaluation modale pour l'éligibilité", () => {
    const base: Answers = { C1: "boucles", C2: "en_place", G1: "redesign" };
    expect(
      selectLevers(["complets"], { ...base, C3: "stable", C4: "plus3ans" }),
    ).toContain("eligibilite_modale");
    expect(
      selectLevers(["complets"], { ...base, C3: "stable", C4: "moins24mois" }),
    ).not.toContain("eligibilite_modale");
    expect(
      selectLevers(["complets"], { ...base, C3: "aleatoire", C4: "plus3ans" }),
    ).not.toContain("eligibilite_modale");
  });

  it("propose de commencer par la part stable sur un flux aléatoire", () => {
    const levers = selectLevers(["complets"], {
      C1: "boucles",
      C2: "en_place",
      C3: "aleatoire",
      C4: "moins24mois",
      G1: "redesign",
    });
    expect(levers).toEqual(["part_stable"]);
  });

  it("ne référence que des questions de la banque", () => {
    const allRules = [
      ...Object.values(LEVER_RULES).flat(),
      ...Object.values(SECONDARY_LEVER_RULES).flat(),
    ];
    for (const rule of allRules) {
      const conditions = [rule.when];
      while (conditions.length > 0) {
        const condition = conditions.pop()!;
        if (condition.type === "all" || condition.type === "any") {
          conditions.push(...condition.of);
        } else if (condition.type === "not") {
          conditions.push(condition.of);
        } else if (
          condition.type === "answerIn" ||
          condition.type === "answerNotIn"
        ) {
          const question = QUESTION_BANK[condition.question];
          expect(question, `${rule.id} → ${condition.question}`).toBeDefined();
          for (const value of condition.values) {
            expect(
              question.options.some((option) => option.value === value),
              `${rule.id} → ${condition.question}=${value}`,
            ).toBe(true);
          }
        }
      }
    }
  });
});

/* -------------------------------------------------------------------------- */
/* Routage                                                                     */
/* -------------------------------------------------------------------------- */

describe("routage", () => {
  it("route par ranking[0], jamais par l'indice", () => {
    expect(outcomeFor("messagerie")).toBe("rdv");
    expect(outcomeFor("partiels")).toBe("rdv");
    expect(outcomeFor("complets")).toBe("flux");
  });

  it("garde la demande de flux pour un profil complets, quel que soit le score", () => {
    const parfait = computeResult(["complets"], {
      C1: "boucles",
      C2: "en_place",
      C3: "aleatoire",
      C4: "moins24mois",
      G1: "redesign",
    });
    const nul = computeResult(["complets"], {
      C1: "inconnu",
      C2: "jamais",
      C3: "aleatoire",
      C4: "jamais",
      G1: "reconduit",
    });
    expect(parfait?.indice).toBe(100);
    expect(nul?.indice).toBe(0);
    expect(parfait?.outcome).toBe("flux");
    expect(nul?.outcome).toBe("flux");
  });

  it("propose toujours l'autre sortie en lien secondaire", () => {
    expect(alternateOutcomeFor("rdv")).toBe("flux");
    expect(alternateOutcomeFor("flux")).toBe("rdv");
    expect(computeResult(["messagerie"], {})?.alternateOutcome).toBe("flux");
  });
});

/* -------------------------------------------------------------------------- */
/* Garde-fous                                                                  */
/* -------------------------------------------------------------------------- */

describe("garde-fous", () => {
  it("ne rend aucun résultat sans classement", () => {
    expect(computeResult([], {})).toBeNull();
    expect(servedQuestions([])).toEqual([]);
    expect(computeScore([], {})).toEqual({
      points: 0,
      maxServed: 0,
      indice: 0,
    });
  });

  it("ne considère complet qu'un questionnaire entièrement répondu", () => {
    expect(isComplete(["messagerie"], { M1: "unique" })).toBe(false);
    expect(
      isComplete(["messagerie"], {
        M1: "unique",
        M2: "habitudes",
        M3: "jamais",
        M4: "non",
        G1: "reconduit",
      }),
    ).toBe(true);
  });

  it("purge les réponses orphelines après un changement de classement", () => {
    const answers: Answers = {
      M1: "unique",
      M2: "habitudes",
      C1: "boucles",
      G1: "reconduit",
    };
    expect(pruneAnswers(["messagerie"], answers)).toEqual({
      M1: "unique",
      M2: "habitudes",
      G1: "reconduit",
    });
    // C1 redevient légitime dès que complets est classé en second.
    expect(pruneAnswers(["messagerie", "complets"], answers)).toEqual(answers);
  });

  it("évalue les conditions composées", () => {
    const context = { ranking: ["complets"] as Ranking, answers: { C3: "stable" } };
    expect(evaluateCondition({ type: "always" }, context)).toBe(true);
    expect(
      evaluateCondition({ type: "primaryBranch", flow: "complets" }, context),
    ).toBe(true);
    expect(
      evaluateCondition({ type: "flowRanked", flow: "messagerie" }, context),
    ).toBe(false);
    expect(
      evaluateCondition(
        {
          type: "any",
          of: [
            { type: "answerIn", question: "C3", values: ["aleatoire"] },
            { type: "answerIn", question: "C3", values: ["stable"] },
          ],
        },
        context,
      ),
    ).toBe(true);
    expect(
      evaluateCondition(
        { type: "not", of: { type: "answerIn", question: "C3", values: ["stable"] } },
        context,
      ),
    ).toBe(false);
  });
});
