import { describe, expect, it } from "vitest";
import { typographieFr, typographieMessages } from "./typo-fr";

describe("typographieFr", () => {
  it("colle les ponctuations doubles au mot qui les précède", () => {
    expect(typographieFr("Quoi ? Vraiment !")).toBe("Quoi ? Vraiment !");
    expect(typographieFr("Étape : terrain")).toBe("Étape : terrain");
  });

  it("protège l'intérieur des guillemets", () => {
    expect(typographieFr("un « cas » démonstrateur")).toBe("un « cas » démonstrateur");
  });

  it("ne touche ni aux URL ni aux heures sans espace", () => {
    expect(typographieFr("https://pool4ward.com 14:00")).toBe("https://pool4ward.com 14:00");
  });

  it("lie le nombre à son unité", () => {
    expect(typographieFr("10 % de plus, 5 km")).toBe("10 % de plus, 5 km");
    expect(typographieFr("3 heures")).toBe("3 heures");
  });

  it("traverse les objets et les tableaux de messages", () => {
    expect(typographieMessages({ a: ["Oui ?"], b: { c: "Non !" }, d: 3 })).toEqual({
      a: ["Oui ?"],
      b: { c: "Non !" },
      d: 3,
    });
  });
});
