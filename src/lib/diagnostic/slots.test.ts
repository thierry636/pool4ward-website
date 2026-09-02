import { describe, expect, it } from "vitest";

import {
  formatSlotDate,
  isWorkingDay,
  nextWorkingDays,
  toIsoDate,
} from "./slots";

describe("créneaux de rendez-vous", () => {
  it("commence au lendemain, jamais au jour même", () => {
    // Mercredi 2 septembre 2026.
    const jours = nextWorkingDays(new Date(2026, 8, 2), 3);
    expect(jours[0]).toBe("2026-09-03");
  });

  it("saute les samedis et les dimanches", () => {
    // Vendredi 4 septembre 2026 : le suivant est le lundi 7.
    const jours = nextWorkingDays(new Date(2026, 8, 4), 3);
    expect(jours).toEqual(["2026-09-07", "2026-09-08", "2026-09-09"]);
    for (const jour of jours) expect(isWorkingDay(jour)).toBe(true);
  });

  it("propose le nombre de jours demandé", () => {
    const jours = nextWorkingDays(new Date(2026, 8, 2), 10);
    expect(jours).toHaveLength(10);
    expect(new Set(jours).size).toBe(10);
  });

  it("passe correctement d'un mois et d'une année à l'autre", () => {
    // Jeudi 31 décembre 2026 → vendredi 1er, puis lundi 4 janvier.
    expect(nextWorkingDays(new Date(2026, 11, 31), 2)).toEqual([
      "2027-01-01",
      "2027-01-04",
    ]);
  });

  it("formate la date en heure locale, sans décalage UTC", () => {
    // Un passage par toISOString ferait basculer la date d'un jour selon le
    // fuseau : le répondant demanderait un créneau la veille de son choix.
    expect(toIsoDate(new Date(2026, 0, 1))).toBe("2026-01-01");
    expect(formatSlotDate("2026-09-03", "fr-FR")).toContain("septembre");
  });
});
