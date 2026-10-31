import { describe, expect, it } from "vitest";
import { IMAGE_PARTAGE, pageMetadata } from "./seo";

describe("pageMetadata", () => {
  const base = { title: "Titre", description: "Description" };

  it("porte l'image de partage : Next remplace openGraph en bloc, elle ne vient pas du layout", () => {
    const m = pageMetadata({ locale: "fr", path: "/approach", ...base });
    expect(m.openGraph?.images).toEqual([IMAGE_PARTAGE]);
  });

  it("pose canonique et alternates de langue, x-default en anglais", () => {
    const m = pageMetadata({ locale: "fr", path: "/approach", ...base });
    expect(m.alternates?.canonical).toBe("/fr/approach");
    expect(m.alternates?.languages).toEqual({ fr: "/fr/approach", en: "/en/approach", "x-default": "/en/approach" });
  });

  it("l'accueil (« / ») n'ajoute pas de barre finale", () => {
    const m = pageMetadata({ locale: "en", path: "/", ...base });
    expect(m.alternates?.canonical).toBe("/en");
    expect(m.alternates?.languages).toMatchObject({ fr: "/fr", en: "/en" });
    expect(String(m.openGraph?.url)).toMatch(/\/en$/);
  });

  it("la langue du partage suit la langue de la page", () => {
    expect(pageMetadata({ locale: "fr", path: "/", ...base }).openGraph).toMatchObject({ locale: "fr_FR" });
    expect(pageMetadata({ locale: "en", path: "/", ...base }).openGraph).toMatchObject({ locale: "en_GB" });
  });
});
