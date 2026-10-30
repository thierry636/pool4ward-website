import { describe, expect, it } from "vitest";
import { PLACE_OFFSETS, overlaps, placeFirstFree, type Box } from "./layout";

const bounds = { w: 800, h: 600 };

describe("placement des étiquettes", () => {
  it("deux boîtes qui se touchent seulement par un bord ne se recouvrent pas", () => {
    expect(overlaps({ x: 0, y: 0, w: 10, h: 10 }, { x: 10, y: 0, w: 10, h: 10 })).toBe(false);
    expect(overlaps({ x: 0, y: 0, w: 10, h: 10 }, { x: 9, y: 9, w: 10, h: 10 })).toBe(true);
  });

  it("prend la première position libre, et la réserve", () => {
    const taken: Box[] = [];
    const a = placeFirstFree({ x: 300, y: 300 }, PLACE_OFFSETS(80), { w: 80, h: 16 }, taken, bounds);
    expect(a, "premier nom placé").not.toBeNull();
    expect(taken).toHaveLength(1);
    const b = placeFirstFree({ x: 300, y: 300 }, PLACE_OFFSETS(80), { w: 80, h: 16 }, taken, bounds);
    expect(b, "second nom placé ailleurs").not.toBeNull();
    expect(overlaps(a!, b!), "les deux noms ne se recouvrent pas").toBe(false);
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
});
