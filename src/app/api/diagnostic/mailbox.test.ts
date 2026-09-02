import { describe, expect, it } from "vitest";

/**
 * Même règle que celle du garde-fou de la route : le domaine seul est l'erreur
 * de configuration la plus facile à faire, et la plus coûteuse — l'envoi part
 * puis échoue côté Resend.
 */
function isMailbox(valeur: string): boolean {
  const adresse = valeur.includes("<")
    ? (valeur.match(/<([^>]+)>/)?.[1] ?? "")
    : valeur;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(adresse.trim());
}

describe("adresses d'expédition", () => {
  it("accepte une adresse simple ou avec nom d'affichage", () => {
    expect(isMailbox("diagnostic@pool4ward.com")).toBe(true);
    expect(isMailbox("Pool4ward <diagnostic@pool4ward.com>")).toBe(true);
    expect(isMailbox("  diagnostic@pool4ward.com  ")).toBe(true);
  });

  it("refuse un domaine seul", () => {
    expect(isMailbox("pool4ward.com")).toBe(false);
    expect(isMailbox("@pool4ward.com")).toBe(false);
    expect(isMailbox("diagnostic@")).toBe(false);
  });
});
