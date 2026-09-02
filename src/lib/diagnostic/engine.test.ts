import { describe, expect, it } from "vitest";

import {
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

  it("sert les cinq questions de la branche, sans la clôture G1", () => {
    // En messagerie, ce sont les questions sur l'appel d'offres qui tiennent le
    // rôle de clôture : la façon dont le plan a été construit (4PL,
    // commissionnaire) n'y dit rien d'utile.
    expect(idsOf(ranking)).toEqual(["M1", "M2", "M3", "M4", "M5"]);
    expect(idsOf(ranking)).not.toContain("G1");
  });

  it("saute la mise en concurrence quand le prestataire est unique", () => {
    // Un seul prestataire : il n'y a rien à comparer. Le maximum servi tombe de
    // 125 à 100 et la normalisation absorbe l'écart.
    expect(idsOf(ranking, { M1: "un_seul" })).toEqual(["M1", "M3", "M4", "M5"]);
    expect(idsOf(ranking, { M1: "deux_plus" })).toContain("M2");
    // Servie par défaut tant que M1 n'a pas été répondue : sans quoi la barre
    // de progression annoncerait une question de moins avant la première
    // réponse.
    expect(idsOf(ranking, {})).toContain("M2");
  });

  it("continue de poser G1 sur les autres branches", () => {
    expect(idsOf(["complets"])).toContain("G1");
    // Messagerie classée en second ne retire pas G1 : seule la branche n°1 compte.
    expect(idsOf(["complets", "messagerie"])).toContain("G1");
  });

  it("ne sert aucune question des autres branches", () => {
    // Un acheteur messagerie ne doit jamais voir une question sur le ferroviaire.
    expect(idsOf(ranking)).not.toContain("C4");
  });

  it("chaque question est bonne ou ne l'est pas, sans valeur intermédiaire", () => {
    for (const id of ["M1", "M2", "M3", "M4", "M5"]) {
      const points = QUESTION_BANK[id].options.map((o) => o.points);
      expect(points, id).toHaveLength(2);
      expect(new Set(points), id).toEqual(new Set([25, 10]));
    }
  });

  it("normalise sur 125 avec cinq questions, sur 100 avec quatre", () => {
    const bon: Answers = {
      M1: "deux_plus",
      M2: "oui",
      M3: "moins_1an",
      M4: "oui",
      M5: "oui",
    };
    expect(computeScore(ranking, bon)).toEqual({
      points: 125,
      maxServed: 125,
      indice: 100,
    });

    const unSeul: Answers = {
      M1: "un_seul", // 10 — la seule question non bonne
      M3: "moins_1an",
      M4: "oui",
      M5: "oui",
    };
    expect(computeScore(ranking, unSeul)).toEqual({
      points: 85,
      maxServed: 100,
      indice: 85,
    });
  });

  it("ne descend jamais sous 40, même en répondant mal partout", () => {
    // Un chargeur en difficulté sur tout ne doit pas lire 10/100.
    const pire: Answers = {
      M1: "deux_plus",
      M2: "non",
      M3: "plus_1an",
      M4: "non",
      M5: "non",
    };
    expect(computeScore(ranking, pire)).toEqual({
      points: 65,
      maxServed: 125,
      indice: 52,
    });
    expect(
      computeScore(ranking, {
        M1: "un_seul",
        M3: "plus_1an",
        M4: "non",
        M5: "non",
      }).indice,
    ).toBe(40);
  });

  it("donne le même niveau au même nombre de questions non bonnes", () => {
    // Le niveau ne doit pas dépendre du nombre de questions servies : deux
    // points valent « piloté » à cinq questions comme à quatre.
    const cinq: Answers = {
      M1: "deux_plus",
      M2: "oui",
      M3: "moins_1an",
      M4: "oui",
      M5: "oui",
    };
    const quatre: Answers = {
      M1: "un_seul",
      M3: "moins_1an",
      M4: "oui",
      M5: "oui",
    };
    // Un point d'écart de chaque côté.
    expect(levelFor(computeScore(ranking, { ...cinq, M4: "non" }).indice)).toBe(
      "plan_optimise",
    );
    expect(levelFor(computeScore(ranking, quatre).indice)).toBe("plan_optimise");
    // Deux points d'écart.
    expect(
      levelFor(computeScore(ranking, { ...cinq, M4: "non", M5: "non" }).indice),
    ).toBe("plan_pilote");
    expect(
      levelFor(computeScore(ranking, { ...quatre, M4: "non" }).indice),
    ).toBe("plan_pilote");
    // Trois points d'écart.
    expect(
      levelFor(
        computeScore(ranking, { ...cinq, M3: "plus_1an", M4: "non", M5: "non" })
          .indice,
      ),
    ).toBe("plan_subi");
    expect(
      levelFor(computeScore(ranking, { ...quatre, M4: "non", M5: "non" }).indice),
    ).toBe("plan_subi");
  });

  it("vérifie l'invariant : un levier par question non bonne, plafonné à trois", () => {
    const ids = ["M1", "M2", "M3", "M4", "M5"];
    const options = Object.fromEntries(
      ids.map((id) => [id, QUESTION_BANK[id].options.map((o) => o.value)]),
    );
    let verifies = 0;

    const parcourir = (i: number, acc: Record<string, string>) => {
      if (i === ids.length) {
        const servies = servedQuestions(ranking, acc).map((s) => s.question.id);
        const reponses: Record<string, string> = {};
        for (const id of servies) reponses[id] = acc[id];

        const nonBonnes = servies.filter(
          (id) =>
            QUESTION_BANK[id].options.find((o) => o.value === reponses[id])!
              .points === 10,
        ).length;

        expect(selectLevers(ranking, reponses)).toHaveLength(
          Math.min(nonBonnes, 3),
        );
        const indice = computeScore(ranking, reponses).indice;
        expect(indice).toBeGreaterThanOrEqual(40);
        expect(indice).toBeLessThanOrEqual(100);
        verifies += 1;
        return;
      }
      for (const v of options[ids[i]]) {
        parcourir(i + 1, { ...acc, [ids[i]]: v });
      }
    };
    parcourir(0, {});
    expect(verifies).toBe(32);
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

/**
 * ⚠️ Depuis le passage de l'écran 1 en choix unique, l'interface ne produit
 * plus qu'un seul flux classé : ces cas ne sont plus atteignables par un
 * répondant. Le moteur reste général et testé — rouvrir un second flux ne
 * demanderait que de rétablir la sélection multiple à l'écran 1.
 */
describe("deux flux classés — capacité du moteur, hors parcours actuel", () => {
  it("sert une seule question de la branche secondaire, à la bonne place", () => {
    // Branche n°1, puis l'unique question de la branche n°2, puis la clôture.
    expect(idsOf(["messagerie", "complets"])).toEqual([
      "M1",
      "M2",
      "M3",
      "M4",
      "M5",
      "C1",
    ]);
    expect(idsOf(["complets", "messagerie"])).toEqual([
      "C1",
      "C2",
      "C3",
      "C4",
      "M4",
      "G1",
    ]);
  });

  it("fige la longueur du questionnaire pour chaque classement", () => {
    // ⚠️ La spec visait 6 à 8 questions. Seule la branche messagerie y est
    // encore : le retrait de P2, le saut de P4 hors contexte complets et C3
    // hors score raccourcissent nettement les deux autres. Ce test fige les
    // longueurs réelles pour qu'aucune ne bouge sans qu'on le voie.
    const longueurs: [Ranking, number][] = [
      [["messagerie"], 5],
      [["messagerie", "complets"], 6],
      [["complets"], 5],
      [["complets", "messagerie"], 6],
    ];
    for (const [ranking, attendu] of longueurs) {
      expect(idsOf(ranking).length, ranking.join(">")).toBe(attendu);
    }
  });

  it("garde un indice dans 0–100 sur toutes les combinaisons de classement", () => {
    const flows: FlowType[] = ["messagerie", "complets"];
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
      M1: "deux_plus",
      M2: "oui",
      M3: "moins_1an",
      M4: "oui",
      M5: "oui",
      C1: "inconnu", // secondaire : ne doit rien coûter
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
    const ids = idsOf(["messagerie", "complets"]);
    expect(ids.filter((id) => id === "C1")).toHaveLength(1);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("n'expose aucun flux au-delà du second : il n'y a que deux typologies", () => {
    const result = computeResult(["complets", "messagerie"], {
      C1: "boucles",
      C2: "en_place",
      C3: "stable",
      C4: "moins24mois",
      M4: "non",
      G1: "redesign",
    });
    expect(result?.secondaryBranch).toBe("messagerie");
    expect(result?.otherFlows).toEqual([]);
  });

  it("déclenche le levier du bloc secondaire depuis la question secondaire", () => {
    const answers: Answers = { M4: "non" };
    expect(selectSecondaryLever(["complets", "messagerie"], answers)).toBe(
      "grilles_comparables",
    );
    expect(
      selectSecondaryLever(["complets", "messagerie"], { M4: "oui" }),
    ).toBeNull();
    expect(selectSecondaryLever(["messagerie"], answers)).toBeNull();
    expect(
      selectSecondaryLever(["messagerie", "complets"], { C1: "inconnu" }),
    ).toBe("retours_vide");
  });
});

/* -------------------------------------------------------------------------- */
/* Niveaux                                                                     */
/* -------------------------------------------------------------------------- */

describe("niveaux", () => {
  it("applique les seuils communs aux trois branches", () => {
    // Les bornes sont calées sur le NOMBRE de questions non bonnes, pour que le
    // niveau ne dépende pas du nombre de questions servies.
    expect(levelFor(40)).toBe("plan_subi"); // 4 sur 4, ou 5 sur 5
    expect(levelFor(55)).toBe("plan_subi"); // 3 sur 4
    expect(levelFor(64)).toBe("plan_subi"); // 3 sur 5
    expect(levelFor(69)).toBe("plan_subi");
    expect(levelFor(70)).toBe("plan_pilote"); // 2 sur 4
    expect(levelFor(76)).toBe("plan_pilote"); // 2 sur 5
    expect(levelFor(84)).toBe("plan_pilote");
    expect(levelFor(85)).toBe("plan_optimise"); // 1 sur 4
    expect(levelFor(88)).toBe("plan_optimise"); // 1 sur 5
    expect(levelFor(100)).toBe("plan_optimise");
  });
});

/* -------------------------------------------------------------------------- */
/* Leviers                                                                     */
/* -------------------------------------------------------------------------- */

describe("leviers", () => {
  it("prend au plus trois leviers, dans l'ordre de priorité", () => {
    const levers = selectLevers(["messagerie"], {
      M1: "un_seul",
      M3: "plus_1an",
      M4: "non",
      M5: "non",
    });
    // Quatre questions non bonnes, trois leviers affichés, dans l'ordre déclaré.
    expect(levers).toEqual([
      "prestataire_unique",
      "grilles_comparables",
      "ouvrir_nouveaux_entrants",
    ]);
  });

  it("n'affiche un levier que sur une question non bonne", () => {
    const bon: Answers = {
      M1: "deux_plus",
      M2: "oui",
      M3: "moins_1an",
      M4: "oui",
      M5: "oui",
    };
    expect(selectLevers(["messagerie"], bon)).toEqual([]);
    expect(selectLevers(["messagerie"], { ...bon, M2: "non" })).toEqual([
      "cherry_picking",
    ]);
    expect(selectLevers(["messagerie"], { ...bon, M3: "plus_1an" })).toEqual([
      "remise_en_competition",
    ]);
    // Un prestataire unique retire M2 du parcours : son levier ne peut plus
    // sortir, celui de la diversification prend sa place.
    expect(
      selectLevers(["messagerie"], {
        M1: "un_seul",
        M3: "moins_1an",
        M4: "oui",
        M5: "oui",
      }),
    ).toEqual(["prestataire_unique"]);
  });

  it("saute les règles dont la condition est fausse", () => {
    const levers = selectLevers(["complets"], {
      C1: "boucles", // rien
      C2: "envisage", // appariement_flux
      C3: "stable",
      C4: "ecarte_sans_etude", // eligibilite_modale puis decision_modale_reprise
      G1: "reconduit", // reouverture_conception, hors des trois premiers
    });
    expect(levers).toEqual([
      "appariement_flux",
      "eligibilite_modale",
      "decision_modale_reprise",
    ]);
  });

  it("ne déclenche pas un levier sur une question non servie", () => {
    // « M4 ≠ oui » ne doit pas être vrai parce que M4 n'a pas été posée.
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
        M2: "zone",
        M3: "jamais",
        M4: "non",
        M5: "moins_trois",
        M6: "aucun",
      }),
    ).toBe(true);
  });

  it("purge les réponses orphelines après un changement de classement", () => {
    const answers: Answers = {
      M1: "six_dix",
      M2: "zone",
      C1: "boucles",
      G1: "reconduit",
    };
    // G1 n'étant pas servie en messagerie, elle est purgée comme C1.
    expect(pruneAnswers(["messagerie"], answers)).toEqual({
      M1: "six_dix",
      M2: "zone",
    });
    // C1 redevient légitime dès que complets est classé en second.
    expect(pruneAnswers(["messagerie", "complets"], answers)).toEqual({
      M1: "six_dix",
      M2: "zone",
      C1: "boucles",
    });
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
