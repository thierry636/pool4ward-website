import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildShowcase, serializeShowcase, slug, type ShowcaseSource } from "./build.mjs";
import { CHAPTERS } from "./chapters.mjs";
import { LIMITS, textProblem, validateShowcase } from "./validate.mjs";
import type { Showcase } from "./types";

const published = JSON.parse(readFileSync("src/content/showcase.json", "utf8")) as Showcase;
const example = JSON.parse(readFileSync("scripts/showcase/example.source.json", "utf8")) as ShowcaseSource;

const site = (key: string, name: string, over: Record<string, unknown> = {}) => ({ key, name, kind: "port", country: "DE", lon: 10, lat: 54, ...over });
const small = (): ShowcaseSource => ({
  sites: [site("a", "Kiel"), site("b", "Klaipėda", { country: "LT", lon: 21.13, lat: 55.7 })],
  services: [{ chapter: "baltic-shortsea", mode: "shortsea", from: "a", to: "b" }],
});
const snapshot = (): Showcase => structuredClone(buildShowcase(small(), { mode: "demo" }).snapshot);
const errorsOf = (s: unknown) => validateShowcase(s).errors.join(" | ");

describe("vitrine publiée (src/content/showcase.json)", () => {
  it("est valide", () => {
    expect(validateShowcase(published)).toEqual({ ok: true, errors: [] });
  });

  it("est dans la forme canonique, relisible en revue", () => {
    expect(serializeShowcase(published)).toBe(readFileSync("src/content/showcase.json", "utf8"));
  });

  it("n'est pas une URL publique à part : rien dans public/ ne la reprend", () => {
    expect(existsSync("public/data")).toBe(false);
  });

  it("couvre les quatre chapitres de l'animation", () => {
    for (const c of CHAPTERS) expect(published.services.some((v) => v.chapter === c.id), c.id).toBe(true);
  });

  it("ne cite aucun opérateur tant qu'elle est en mode « demo »", () => {
    if (published.mode === "demo") expect(published.services.every((v) => v.operator === undefined)).toBe(true);
  });

  it("reste légère : quelques dizaines de Ko au plus", () => {
    expect(readFileSync("src/content/showcase.json").length).toBeLessThan(60_000);
  });
});

describe("validateShowcase — ce qui doit être refusé", () => {
  it("accepte une vitrine minimale", () => {
    expect(validateShowcase(snapshot()).ok).toBe(true);
  });

  it("une clé inconnue, à la racine, sur un site ou sur une liaison", () => {
    const a = snapshot() as unknown as Record<string, unknown>;
    a.note = "x";
    expect(errorsOf(a)).toMatch(/clé inconnue à la racine/);
    const b = snapshot();
    (b.sites[0] as unknown as Record<string, unknown>).tarif = 1;
    expect(errorsOf(b)).toMatch(/sites\[0\] : clé inconnue « tarif »/);
    const c = snapshot();
    (c.services[0] as unknown as Record<string, unknown>).contact = "x";
    expect(errorsOf(c)).toMatch(/services\[0\] : clé inconnue « contact »/);
  });

  it("des coordonnées plus fines que le centième de degré", () => {
    const s = snapshot();
    s.sites[0].lat = 54.32111;
    expect(errorsOf(s)).toMatch(/lat invalide/);
  });

  it("un nom d'opérateur dans une vitrine « demo »", () => {
    const s = snapshot();
    s.services[0].operator = "Société Exemple";
    expect(errorsOf(s)).toMatch(/aucun nom d'opérateur dans une vitrine « demo »/);
  });

  it("une liaison vers un site absent, ou un site que rien n'utilise", () => {
    const a = snapshot();
    a.services[0].to = "inconnu";
    expect(errorsOf(a)).toMatch(/site inconnu/);
    const b = snapshot();
    b.sites.push({ id: "orphelin-de", name: "Orphelin", kind: "port", country: "DE", lon: 1, lat: 1 });
    expect(errorsOf(b)).toMatch(/site « orphelin-de » inutilisé/);
  });

  it("un mode qui n'appartient pas au chapitre", () => {
    const s = snapshot();
    s.services[0].mode = "rail";
    expect(errorsOf(s)).toMatch(/n'appartient pas au chapitre/);
  });

  it("origine = destination, site répété, plus de trois sites de passage", () => {
    const a = snapshot();
    a.services[0].to = a.services[0].from;
    expect(errorsOf(a)).toMatch(/origine et destination identiques/);
    const b = snapshot();
    b.services[0].via = [b.services[0].from];
    expect(errorsOf(b)).toMatch(/apparaît deux fois/);
    const c = snapshot();
    c.services[0].via = ["a-de", "b-de", "c-de", "d-de"];
    expect(errorsOf(c)).toMatch(/via doit être une liste de 3 sites au plus/);
  });

  it("une liaison en double", () => {
    const s = snapshot();
    s.services.push({ ...s.services[0], id: "baltic-shortsea-2" });
    expect(errorsOf(s)).toMatch(/liaison en double/);
  });

  it("les plafonds de volume", () => {
    const s = snapshot();
    s.services = Array.from({ length: LIMITS.services + 1 }, (_, i) => ({ ...s.services[0], id: `x-${i}`, operator: undefined }));
    expect(errorsOf(s)).toMatch(/trop de liaisons/);
  });

  it("le mode « curated » exige une date de publication, pas dans le futur", () => {
    const s = { ...snapshot(), mode: "curated" as const };
    expect(errorsOf(s)).toMatch(/publishedAt \(AAAA-MM-JJ\) est obligatoire/);
    expect(errorsOf({ ...s, publishedAt: "2999-01-01" })).toMatch(/dans le futur/);
    expect(validateShowcase({ ...s, publishedAt: "2026-10-29" }, { now: new Date("2026-10-30") }).ok).toBe(true);
  });

  it("le mode « demo » n'a pas de date de publication", () => {
    expect(errorsOf({ ...snapshot(), publishedAt: "2026-10-29" })).toMatch(/publishedAt doit être nul/);
  });
});

describe("textProblem — texte publiable", () => {
  it.each([
    ["contact@exemple.fr", /adresse|lien/],
    ["https://exemple.fr", /adresse|lien/],
    ["www.exemple.fr", /adresse|lien/],
    ["Tél 0612345678", /numéro/],
    ["+33 6 12 34 56 78", /numéro/],
    ["<b>gras</b>", /non prévus/],
    [" Espace ", /normalisé/],
    ["", /vide|normalisé|non prévus/],
  ])("refuse %j", (s, re) => {
    expect(textProblem(s)).toMatch(re);
  });

  it.each(["Klaipėda", "Göteborg", "București", "Frankfurt am Main", "Terminal 2", "Sàrl Dupont & Fils", "O'Neill (Nord)"])("accepte %j", (s) => {
    expect(textProblem(s)).toBeNull();
  });
});

describe("buildShowcase — de l'export à la vitrine", () => {
  it("refuse une colonne non prévue plutôt que de l'ignorer en silence", () => {
    const src = small();
    (src.sites[0] as Record<string, unknown>).tarif_moyen = 1250;
    expect(() => buildShowcase(src, { mode: "demo" })).toThrow(/colonne non prévue « tarif_moyen »/);
    const src2 = small();
    (src2.services[0] as Record<string, unknown>).contact = "x";
    expect(() => buildShowcase(src2, { mode: "demo" })).toThrow(/colonne non prévue « contact »/);
    expect(() => buildShowcase({ ...small(), extra: [] } as ShowcaseSource, { mode: "demo" })).toThrow(/clé inattendue/);
  });

  it("ne reprend jamais les clés de la base : les identifiants sont dérivés du nom", () => {
    const src = small();
    src.sites[0].key = "db-row-10431";
    src.services[0].from = "db-row-10431";
    const { snapshot: s } = buildShowcase(src, { mode: "demo" });
    expect(JSON.stringify(s)).not.toMatch(/10431/);
    expect(s.sites.map((x) => x.id)).toEqual(["kiel-de", "klaipeda-lt"]);
  });

  it("arrondit au centième de degré", () => {
    const src = small();
    src.sites[0].lat = 54.321987;
    src.sites[0].lon = 10.139999;
    const { snapshot: s } = buildShowcase(src, { mode: "demo" });
    expect(s.sites[0]).toMatchObject({ lon: 10.14, lat: 54.32 });
  });

  it("ne publie pas un site qu'aucune liaison n'utilise, et le dit", () => {
    const src = small();
    src.sites.push(site("c", "Hamburg"));
    const { snapshot: s, report } = buildShowcase(src, { mode: "demo" });
    expect(s.sites.map((x) => x.name)).not.toContain("Hamburg");
    expect(report.droppedSites).toBe(1);
  });

  it("deux sites de même nom et de même pays reçoivent des identifiants distincts", () => {
    const src = small();
    src.sites.push(site("c", "Kiel"));
    src.services.push({ chapter: "baltic-shortsea", mode: "shortsea", from: "c", to: "b" });
    const ids = buildShowcase(src, { mode: "demo" }).snapshot.sites.map((x) => x.id);
    expect(new Set(ids).size).toBe(3);
  });

  it("est déterministe : même export, même fichier, octet pour octet", () => {
    const a = serializeShowcase(buildShowcase(example, { mode: "demo" }).snapshot);
    const reversed = { sites: [...example.sites].reverse(), services: [...example.services].reverse() };
    expect(serializeShowcase(buildShowcase(reversed, { mode: "demo" }).snapshot)).toBe(a);
  });

  it("l'exemple fourni se publie en « demo » et donne le fichier livré", () => {
    expect(serializeShowcase(buildShowcase(example, { mode: "demo" }).snapshot)).toBe(readFileSync("src/content/showcase.json", "utf8"));
  });

  it("accepte des noms d'opérateurs en « curated », nettoyés", () => {
    const src = small();
    src.services[0].operator = "  Société   Exemple ";
    const { snapshot: s, report } = buildShowcase(src, { mode: "curated", publishedAt: "2026-10-29" });
    expect(s.services[0].operator).toBe("Société Exemple");
    expect(s.publishedAt).toBe("2026-10-29");
    expect(report.operators).toBe(1);
  });

  it("refuse un opérateur qui ressemble à un contact, même en « curated »", () => {
    const src = small();
    src.services[0].operator = "contact@exemple.fr";
    expect(() => buildShowcase(src, { mode: "curated", publishedAt: "2026-10-29" })).toThrow(/adresse|lien/);
  });

  it("refuse un « curated » sans date", () => {
    expect(() => buildShowcase(small(), { mode: "curated" })).toThrow(/publishedAt/);
  });
});

describe("slug", () => {
  it.each([
    ["Klaipėda", "klaipeda"],
    ["București", "bucuresti"],
    ["Göteborg", "goteborg"],
    ["Łódź", "lodz"],
    ["Frankfurt am Main", "frankfurt-am-main"],
    ["Rīga", "riga"],
  ])("%s → %s", (a, b) => {
    expect(slug(a)).toBe(b);
  });
});
