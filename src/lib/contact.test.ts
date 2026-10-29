import { describe, expect, it } from "vitest";
import { isValid, singleLine, validateContact } from "./contact";

describe("validateContact", () => {
  const ok = { name: "A", email: "a@b.fr", company: "C", message: "Bonjour", topic: "other" as const };

  it("accepte une demande complète", () => {
    expect(isValid(validateContact(ok))).toBe(true);
  });

  it("signale les champs manquants et l'e-mail mal formé", () => {
    const e = validateContact({ ...ok, name: " ", email: "pas-un-mail", message: "" });
    expect(e).toEqual({ name: "required", email: "invalidEmail", message: "required" });
  });
});

describe("singleLine", () => {
  it("empêche l'injection d'en-tête par saut de ligne", () => {
    expect(singleLine("Jean\r\nBcc: x@y.z")).toBe("Jean Bcc: x@y.z");
  });
});
