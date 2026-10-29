import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Garde-fous sur les textes : mêmes clés en français et en anglais, aucune
 * mention de Cobuild4ward (l'application n'existe pas), aucune promesse
 * chiffrée reprise de la version 1.
 */

const ROOT = path.join(process.cwd(), "messages");
const ENSEMBLES = readdirSync(path.join(ROOT, "fr")).filter((f) => f.endsWith(".json"));

const load = (locale: string, file: string) =>
  JSON.parse(readFileSync(path.join(ROOT, locale, file), "utf8")) as Record<string, unknown>;

function keys(obj: unknown, prefix = ""): string[] {
  if (Array.isArray(obj)) return obj.flatMap((v, i) => keys(v, `${prefix}[${i}]`));
  if (obj && typeof obj === "object") {
    return Object.entries(obj).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k));
  }
  return [prefix];
}

describe("messages", () => {
  it("ont les mêmes ensembles dans les deux langues", () => {
    expect(readdirSync(path.join(ROOT, "en")).sort()).toEqual(ENSEMBLES.sort());
  });

  it.each(ENSEMBLES)("%s : mêmes clés en FR et en EN", (file) => {
    expect(keys(load("en", file)).sort()).toEqual(keys(load("fr", file)).sort());
  });

  it("n'ont aucune valeur vide", () => {
    for (const locale of ["fr", "en"]) {
      for (const file of ENSEMBLES) {
        const raw = readFileSync(path.join(ROOT, locale, file), "utf8");
        expect(raw, `${locale}/${file}`).not.toMatch(/:\s*""/);
      }
    }
  });

  it("ne présentent plus Cobuild4ward, ni les chiffres de gains de la version 1", () => {
    for (const locale of ["fr", "en"]) {
      for (const file of ENSEMBLES) {
        const raw = readFileSync(path.join(ROOT, locale, file), "utf8");
        expect(raw, `${locale}/${file}`).not.toMatch(/cobuild/i);
        expect(raw, `${locale}/${file}`).not.toMatch(/10-25\s?%|25-40\s?%|15-25\s?%|2-3×/);
      }
    }
  });
});
