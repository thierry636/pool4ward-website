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

  it("sert les six questions de la branche, sans la clôture G1", () => {
    // En messagerie, ce sont les deux questions sur les appels d'offres qui
    // tiennent le rôle de clôture : la façon dont le plan a été construit
    // (4PL, commissionnaire) n'y dit rien d'utile.
    expect(idsOf(ranking)).toEqual(["M1", "M2", "M3", "M4", "M5", "M6"]);
    expect(idsOf(ranking)).not.toContain("G1");
  });

  it("saute l'attribution quand le répondant n'a qu'un seul prestataire", () => {
    // Un prestataire unique : il n'y a rien à attribuer, la question n'a pas
    // de sens. Le maximum servi tombe de 150 à 125 et la normalisation absorbe
    // l'écart — c'est précisément ce pour quoi elle est là.
    expect(idsOf(ranking, { M1: "unique" })).toEqual([
      "M1",
      "M3",
      "M4",
      "M5",
      "M6",
    ]);
    expect(idsOf(ranking, { M1: "deux_cinq" })).toContain("M2");
    // Servie par défaut tant que M1 n'a pas été répondue : sans quoi la barre
    // de progression annoncerait cinq questions avant la première réponse.
    expect(idsOf(ranking, {})).toContain("M2");

    const answers: Answers = {
      M1: "unique", // 10 — point d'amélioration
      M3: "moins12mois", // 25
      M4: "oui", // 25
      M5: "plus_dix", // 25
      M6: "plusieurs", // 25
    };
    expect(computeScore(ranking, answers)).toEqual({
      points: 110,
      maxServed: 125,
      indice: 88,
    });
  });

  it("ne compte pas une réponse à M2 devenue caduque", () => {
    // Le répondant a répondu à M2, puis est revenu changer M1 en « un seul ».
    const answers: Answers = {
      M1: "unique",
      M2: "zone", // 10 points qui ne doivent plus compter
      M3: "jamais",
      M4: "non",
      M5: "moins_trois",
      M6: "aucun",
    };
    expect(scoredIdsOf(ranking, answers)).not.toContain("M2");
    expect(computeScore(ranking, answers).maxServed).toBe(125);
    expect(computeScore(ranking, answers).points).toBe(50);
    expect(pruneAnswers(ranking, answers)).not.toHaveProperty("M2");
  });

  it("vérifie l'invariant du barème sur tous les parcours à six questions", () => {
    // Tout le barème messagerie tient en une phrase : chaque question est OK
    // ou ne l'est pas, et chaque point d'amélioration coûte dix points
    // d'indice. Les leviers affichés sont exactement ces points, plafonnés à
    // trois. Ce test le vérifie sur les 1 536 combinaisons possibles.
    const ids = ["M1", "M2", "M3", "M4", "M5", "M6"];
    const options = Object.fromEntries(
      ids.map((id) => [id, QUESTION_BANK[id].options.map((o) => o.value)]),
    );
    let verifies = 0;

    const parcourir = (i: number, acc: Record<string, string>) => {
      if (i === ids.length) {
        const servies = servedQuestions(ranking, acc).map(
          (s) => s.question.id,
        );
        if (servies.length !== 6) return; // M2 sautée : pas ce cas ici
        const aAmeliorer = servies.filter(
          (id) =>
            QUESTION_BANK[id].options.find((o) => o.value === acc[id])!
              .points === 10,
        ).length;
        expect(computeScore(ranking, acc).indice).toBe(100 - 10 * aAmeliorer);
        expect(selectLevers(ranking, acc)).toHaveLength(
          Math.min(aAmeliorer, 3),
        );
        verifies += 1;
        return;
      }
      for (const v of options[ids[i]]) {
        parcourir(i + 1, { ...acc, [ids[i]]: v });
      }
    };
    parcourir(0, {});

    expect(verifies).toBe(1536);
  });

  it("continue de poser G1 sur les autres branches", () => {
    expect(idsOf(["complets"])).toContain("G1");
    // Messagerie classée en second ne retire pas G1 : seule la branche n°1 compte.
    expect(idsOf(["complets", "messagerie"])).toContain("G1");
  });

  it("ne sert aucune question des autres branches", () => {
    // Un acheteur messagerie ne doit jamais voir une question sur le ferroviaire.
    expect(idsOf(ranking)).not.toContain("C4");
    expect(idsOf(ranking).some((id) => id.startsWith("P"))).toBe(false);
  });

  it("normalise sur 150 : six questions scorées", () => {
    const answers: Answers = {
      M1: "deux_cinq", // 25
      M2: "comparaison", // 25
      M3: "moins12mois", // 25
      M4: "oui", // 25
      M5: "plus_dix", // 25
      M6: "plusieurs", // 25
    };
    expect(computeScore(ranking, answers)).toEqual({
      points: 150,
      maxServed: 150,
      indice: 100,
    });
  });

  it("applique le plancher de 40 % à chaque point d'amélioration", () => {
    // Barème binaire : une question vaut 25 si elle est OK, 10 sinon. Jamais
    // zéro — un chargeur en difficulté sur tout ne doit pas lire 10/100.
    const pire: Answers = {
      M1: "inconnu",
      M2: "zone",
      M3: "jamais",
      M4: "non",
      M5: "moins_trois",
      M6: "aucun",
    };
    expect(computeScore(ranking, pire)).toEqual({
      points: 60,
      maxServed: 150,
      indice: 40,
    });
  });

  it("fait perdre dix points par point d'amélioration, et rien d'autre", () => {
    // C'est tout le barème : chaque question est OK ou ne l'est pas.
    const parfait: Answers = {
      M1: "deux_cinq",
      M2: "comparaison",
      M3: "moins12mois",
      M4: "oui",
      M5: "plus_dix",
      M6: "plusieurs",
    };
    expect(computeScore(ranking, parfait).indice).toBe(100);
    expect(computeScore(ranking, { ...parfait, M4: "non" }).indice).toBe(90);
    expect(
      computeScore(ranking, { ...parfait, M4: "non", M2: "zone" }).indice,
    ).toBe(80);
    // Une réponse intermédiaire ne coûte rien : « parfois » vaut « oui ».
    expect(computeScore(ranking, { ...parfait, M4: "parfois" }).indice).toBe(100);
    expect(computeScore(ranking, { ...parfait, M6: "rarement" }).indice).toBe(100);
    expect(computeScore(ranking, { ...parfait, M1: "plus_dix" }).indice).toBe(100);
  });

  it("arrondit l'indice normalisé", () => {
    const answers: Answers = {
      M1: "six_dix", // 25 OK
      M2: "zone", // 10 à améliorer
      M3: "plus3ans", // 10 à améliorer
      M4: "parfois", // 25 OK
      M5: "trois_cinq", // 25 OK
      M6: "rarement", // 25 OK
    };
    // 120 / 150 = 80 %
    expect(computeScore(ranking, answers)).toEqual({
      points: 120,
      maxServed: 150,
      indice: 80,
    });
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
      "M6",
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
      [["messagerie"], 6],
      [["messagerie", "complets"], 7],
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
      M1: "deux_cinq",
      M2: "comparaison",
      M3: "moins12mois",
      M4: "oui",
      M5: "plus_dix",
      M6: "plusieurs",
      C1: "inconnu", // secondaire : 0 point, ne doit rien coûter
    };
    const seul = computeScore(["messagerie"], answers);
    const avecSecondaire = computeScore(["messagerie", "complets"], answers);

    expect(scoredIdsOf(["messagerie", "complets"], answers)).not.toContain("C1");
    expect(avecSecondaire.maxServed).toBe(150);
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
    // Les bornes sont calées sur le NOMBRE de points d'amélioration, pour que
    // trois points donnent le même niveau à cinq et à six questions servies.
    expect(levelFor(40)).toBe("plan_subi"); // 5 ou 6 points
    expect(levelFor(64)).toBe("plan_subi"); // 3 points sur 5 questions
    expect(levelFor(70)).toBe("plan_subi"); // 3 points sur 6 questions
    expect(levelFor(75)).toBe("plan_subi");
    expect(levelFor(76)).toBe("plan_pilote"); // 2 points sur 5 questions
    expect(levelFor(80)).toBe("plan_pilote"); // 2 points sur 6 questions
    expect(levelFor(84)).toBe("plan_pilote");
    expect(levelFor(88)).toBe("plan_optimise"); // 1 point sur 5 questions
    expect(levelFor(90)).toBe("plan_optimise"); // 1 point sur 6 questions
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
      M2: "zone",
      M3: "jamais",
      M4: "non",
      M5: "moins_trois",
      M6: "aucun",
    });
    expect(levers).toEqual([
      "grilles_comparables",
      "ouvrir_nouveaux_entrants",
      "elargir_panel",
    ]);
  });

  it("n'affiche un levier que sur un point d'amélioration", () => {
    const base: Answers = {
      M2: "comparaison",
      M3: "moins12mois",
      M4: "oui",
      M5: "plus_dix",
      M6: "plusieurs",
    };
    // Dès deux prestataires, la concurrence existe : rien à signaler.
    for (const m1 of ["deux_cinq", "six_dix", "plus_dix"]) {
      expect(selectLevers(["messagerie"], { ...base, M1: m1 }), m1).toEqual([]);
    }
    expect(selectLevers(["messagerie"], { ...base, M1: "unique" })).toEqual([
      "prestataire_unique",
    ]);
    expect(selectLevers(["messagerie"], { ...base, M1: "inconnu" })).toEqual([
      "panel_inconnu",
    ]);
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
