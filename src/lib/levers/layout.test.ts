import { describe, expect, it } from "vitest";
import { CALLOUT_OFFSETS, PLACE_OFFSETS, estimateCallout, overlaps, placeFirstFree, type Box } from "./layout";

const bounds = { w: 800, h: 600 };

describe("placement des étiquettes", () => {
  it("deux boîtes qui se touchent seulement par un bord ne se recouvrent pas", () => {
    expect(overlaps({ x: 0, y: 0, w: 10, h: 10 }, { x: 10, y: 0, w: 10, h: 10 })).toBe(false);
    expect(overlaps({ x: 0, y: 0, w: 10, h: 10 }, { x: 9, y: 9, w: 10, h: 10 })).toBe(true);
  });

  it("prend la première position libre, et la réserve", () => {
    const taken: Box[] = [];
    const a = placeFirstFree({ x: 300, y: 300 }, CALLOUT_OFFSETS(200, 50), { w: 200, h: 50 }, taken, bounds);
    expect(a, "première bulle placée").not.toBeNull();
    expect(taken).toHaveLength(1);
    const b = placeFirstFree({ x: 300, y: 300 }, CALLOUT_OFFSETS(200, 50), { w: 200, h: 50 }, taken, bounds);
    expect(b, "seconde bulle placée ailleurs").not.toBeNull();
    expect(overlaps(a!, b!), "les deux bulles ne se recouvrent pas").toBe(false);
  });

  it("saute une position qui sort de l'écran ou qui tombe sur une zone réservée", () => {
    const reserved: Box[] = [{ x: 0, y: 0, w: 400, h: 600 }];
    const r = placeFirstFree({ x: 420, y: 300 }, PLACE_OFFSETS(60), { w: 60, h: 16 }, reserved, bounds);
    expect(r, "nom de lieu placé à droite du texte réservé").not.toBeNull();
    expect(r!.x, "hors de la zone réservée").toBeGreaterThanOrEqual(400);
    const edge = placeFirstFree({ x: 2, y: 2 }, [[-50, -50]], { w: 60, h: 16 }, [], bounds);
    expect(edge, "rien ne sort du cadre").toBeNull();
  });

  it("renvoie null quand aucune position n'est libre", () => {
    const taken: Box[] = [{ x: 0, y: 0, w: 800, h: 600 }];
    expect(placeFirstFree({ x: 300, y: 300 }, PLACE_OFFSETS(60), { w: 60, h: 16 }, taken, bounds)).toBeNull();
  });

  it("estime une bulle plus haute quand le sous-titre passe à la ligne", () => {
    const short = estimateCallout("Rail", "Court");
    const long = estimateCallout("Réseau de bornes optimal", "Placé pour couvrir tout l’axe du trajet, de bout en bout");
    expect(long.h, "le sous-titre long prend plusieurs lignes").toBeGreaterThan(short.h);
    expect(long.w, "la largeur est plafonnée à 15 rem").toBeLessThanOrEqual(240);
  });
});
