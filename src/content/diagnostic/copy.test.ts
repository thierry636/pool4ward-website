import { describe, expect, it } from "vitest";

import {
  DIAGNOSTIC_COPY,
  DIAGNOSTIC_LOCALES,
  format,
  getDiagnosticCopy,
} from "./copy";
import { LEVER_IDS } from "./levers";
import { LEVEL_THRESHOLDS, OUTCOME_BY_BRANCH } from "./scoring";
import { FLOW_TYPES, QUESTION_BANK } from "./questions";
import { SLOT_TIMES } from "@/lib/diagnostic/slots";

/**
 * La copy est en données, pas dans le markup : ces tests garantissent qu'aucune
 * chaîne ne peut manquer à l'écran, dans quelque langue que ce soit.
 */
describe.each(Object.entries(DIAGNOSTIC_COPY))("copy « %s »", (locale, copy) => {
  it("couvre chaque question de la banque, intitulé et options", () => {
    for (const question of Object.values(QUESTION_BANK)) {
      const entry = copy.questions[question.id];
      expect(entry, `${locale} → ${question.id}`).toBeDefined();
      expect(entry.label.length, `${locale} → ${question.id}`).toBeGreaterThan(0);
      for (const option of question.options) {
        expect(
          entry.options[option.value],
          `${locale} → ${question.id}.${option.value}`,
        ).toBeTruthy();
      }
    }
  });

  it("ne déclare aucune option orpheline", () => {
    for (const [id, entry] of Object.entries(copy.questions)) {
      const question = QUESTION_BANK[id];
      expect(question, `${locale} → ${id}`).toBeDefined();
      const known = new Set(question.options.map((option) => option.value));
      for (const value of Object.keys(entry.options)) {
        expect(known.has(value), `${locale} → ${id}.${value}`).toBe(true);
      }
    }
  });

  it("couvre le formulaire de contact et ses erreurs", () => {
    expect(copy.contact.title).toBeTruthy();
    expect(copy.contact.submit).toBeTruthy();
    expect(copy.contact.success.title).toBeTruthy();
    expect(copy.contact.confirmation.subject).toBeTruthy();
    for (const cle of [
      "required",
      "email",
      "filesTooMany",
      "filesTooLarge",
      "fileType",
      "network",
      "notConfigured",
    ] as const) {
      expect(copy.contact.errors[cle], `${locale} → ${cle}`).toBeTruthy();
    }
    // Les moments de la journée doivent correspondre aux créneaux du moteur.
    expect(copy.contact.creneauHeure.options.map((o) => o.value)).toEqual([
      ...SLOT_TIMES,
    ]);
  });

  it("couvre chaque levier déclaré en configuration", () => {
    for (const id of LEVER_IDS) {
      expect(copy.levers[id], `${locale} → ${id}`).toBeDefined();
      expect(copy.levers[id].title.length).toBeGreaterThan(0);
    }
  });

  it("couvre chaque niveau et chaque verdict de branche", () => {
    for (const threshold of LEVEL_THRESHOLDS) {
      expect(copy.levels[threshold.id], `${locale} → ${threshold.id}`).toBeTruthy();
      for (const flow of FLOW_TYPES) {
        expect(
          copy.verdicts[flow][threshold.id],
          `${locale} → ${flow}.${threshold.id}`,
        ).toBeTruthy();
      }
    }
  });

  it("couvre chaque flux et chaque sortie", () => {
    for (const flow of FLOW_TYPES) {
      expect(copy.flows[flow].label, `${locale} → ${flow}`).toBeTruthy();
      expect(copy.flows[flow].indexLabel).toBeTruthy();
      expect(copy.flows[flow].alsoLabel).toBeTruthy();
    }
    const outcomes = Object.values(OUTCOME_BY_BRANCH).filter(
      (outcome, index, all) => all.indexOf(outcome) === index,
    );
    for (const outcome of outcomes) {
      expect(copy.outcomes[outcome].title, `${locale} → ${outcome}`).toBeTruthy();
      expect(copy.outcomes[outcome].body, `${locale} → ${outcome}`).toBeTruthy();
    }
  });

  it("n'affiche aucun pourcentage d'économie dans les verdicts", () => {
    // Un chiffre inventé se paie au premier rendez-vous.
    for (const flow of FLOW_TYPES) {
      for (const verdict of Object.values(copy.verdicts[flow])) {
        expect(verdict, `${locale} → ${flow}`).not.toMatch(/\d+\s?%/);
      }
    }
  });
});

describe("registre de copy", () => {
  it("sert chaque langue traduite, et retombe sur le français sinon", () => {
    expect(getDiagnosticCopy("fr").locale).toBe("fr");
    expect(getDiagnosticCopy("en").locale).toBe("en");
    expect(getDiagnosticCopy("de")).toBe(getDiagnosticCopy("fr"));
  });

  it("propose exactement les langues réellement traduites", () => {
    // Un sélecteur qui offrirait une langue sans copy afficherait du français
    // sous un drapeau anglais.
    expect([...DIAGNOSTIC_LOCALES].sort()).toEqual(
      Object.keys(DIAGNOSTIC_COPY).sort(),
    );
  });

  it("interpole les gabarits", () => {
    expect(format("Question {current} sur {total}", { current: 3, total: 7 })).toBe(
      "Question 3 sur 7",
    );
    expect(format("Indice — flux {flow}", { flow: "messagerie" })).toBe(
      "Indice — flux messagerie",
    );
    // Une clé absente reste visible telle quelle plutôt que de disparaître.
    expect(format("{inconnu}", {})).toBe("{inconnu}");
  });
});
