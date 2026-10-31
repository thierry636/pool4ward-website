import { describe, expect, it } from "vitest";
import { distanceKm, greatCircle, makePath, pointAt, routePath, slice, type LonLat } from "./arcs";
import { boxOf, easeInOutCubic, fitCam, holdCam, legCam, legDip, shortLon, staggered, stageZoom } from "./camera";

const HAMBURG: LonLat = [9.97, 53.54];
const GDYNIA: LonLat = [18.53, 54.52];
const MILANO: LonLat = [9.19, 45.46];

describe("arcs de grand cercle", () => {
  it("distanceKm : Hamburg–Milano ≈ 900 km, Paris–New York ≈ 5 840 km", () => {
    expect(distanceKm(HAMBURG, MILANO)).toBeGreaterThan(880);
    expect(distanceKm(HAMBURG, MILANO)).toBeLessThan(920);
    expect(distanceKm([2.35, 48.86], [-74.0, 40.71])).toBeGreaterThan(5800);
    expect(distanceKm([2.35, 48.86], [-74.0, 40.71])).toBeLessThan(5880);
  });

  it("relie exactement les deux extrémités", () => {
    const arc = greatCircle(HAMBURG, GDYNIA);
    expect(arc[0]).toEqual(HAMBURG);
    expect(arc[arc.length - 1][0]).toBeCloseTo(GDYNIA[0], 6);
    expect(arc[arc.length - 1][1]).toBeCloseTo(GDYNIA[1], 6);
  });

  it("épouse le grand cercle : longueur = distance directe, et pas de saut", () => {
    const p = makePath(greatCircle(HAMBURG, MILANO));
    expect(p.length).toBeCloseTo(distanceKm(HAMBURG, MILANO), 0);
  });

  it("reste continu à l'antiméridien (pas de saut de 360°)", () => {
    const arc = greatCircle([170, 10], [-170, 20]);
    for (let i = 1; i < arc.length; i++) expect(Math.abs(arc[i][0] - arc[i - 1][0])).toBeLessThan(5);
    expect(arc[arc.length - 1][0]).toBeCloseTo(190, 4);
  });

  it("deux points confondus ne produisent ni NaN ni erreur", () => {
    const arc = greatCircle(HAMBURG, HAMBURG);
    expect(arc.every(([x, y]) => Number.isFinite(x) && Number.isFinite(y))).toBe(true);
  });

  it("routePath : enchaîne les étapes sans doublon à la jonction", () => {
    const direct = greatCircle(HAMBURG, GDYNIA).length;
    const via = routePath([HAMBURG, GDYNIA, MILANO]);
    expect(via[0]).toEqual(HAMBURG);
    const joins = via.filter(([x, y]) => Math.abs(x - GDYNIA[0]) < 1e-6 && Math.abs(y - GDYNIA[1]) < 1e-6);
    expect(joins).toHaveLength(1);
    expect(via.length).toBeGreaterThan(direct);
  });

  it("pointAt et slice lisent le tracé à une fraction de sa longueur", () => {
    const path = makePath(greatCircle(HAMBURG, GDYNIA));
    expect(pointAt(path, 0)).toEqual(HAMBURG);
    const mid = pointAt(path, 0.5);
    expect(distanceKm(HAMBURG, mid)).toBeCloseTo(path.length / 2, -1);
    expect(slice(path, 0)).toEqual([]);
    expect(slice(path, 1)).toBe(path.points);
    const part = slice(path, 0.4);
    const end = part[part.length - 1];
    expect(distanceKm(HAMBURG, end)).toBeCloseTo(path.length * 0.4, -1);
  });
});

describe("caméra", () => {
  const a = { lon: 10, lat: 47, zoom: 4.4 };
  const b = { lon: 17.5, lat: 57, zoom: 5 };

  it("un vol part de la vue de départ et arrive exactement sur celle d'arrivée", () => {
    expect(legCam(a, b, 0)).toEqual(a);
    const end = legCam(a, b, 1);
    expect(end.lon).toBeCloseTo(b.lon, 9);
    expect(end.lat).toBeCloseTo(b.lat, 9);
    expect(end.zoom).toBeCloseTo(b.zoom, 9);
  });

  it("recule à mi-vol, sans jamais dépasser la vue du monde", () => {
    const mid = legCam(a, b, 0.5);
    expect(mid.zoom).toBeLessThan(Math.min(a.zoom, b.zoom) - 0.5);
    expect(mid.zoom).toBeGreaterThanOrEqual(2.2);
    expect(legDip({ lon: 0, lat: 0, zoom: 2.5 }, { lon: 0, lat: 0, zoom: 2.6 })).toBeGreaterThanOrEqual(0.2);
    expect(legDip({ lon: 0, lat: 0, zoom: 9 }, { lon: 0, lat: 0, zoom: 9 })).toBeLessThanOrEqual(2.4);
  });

  it("tourne par le plus court chemin", () => {
    expect(shortLon(170, -170)).toBe(190);
    expect(shortLon(-170, 170)).toBe(-190);
    expect(shortLon(10, 20)).toBe(20);
  });

  it("la dérive d'un chapitre part exactement de la vue d'arrivée et reste lente", () => {
    expect(holdCam(b, 0)).toEqual(b);
    const end = holdCam(b, 1);
    expect(Math.abs(end.lon - b.lon)).toBeLessThan(2);
    expect(Math.abs(end.zoom - b.zoom)).toBeLessThan(0.1);
  });

  it("easeInOutCubic : bornes et symétrie", () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(1)).toBe(1);
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5, 12);
    expect(easeInOutCubic(0.25) + easeInOutCubic(0.75)).toBeCloseTo(1, 12);
  });

  it("stageZoom : 640 px ne change rien, une scène plus petite recule, bornée", () => {
    expect(stageZoom(5, 640, 900)).toBe(5);
    expect(stageZoom(5, 1200, 320)).toBeCloseTo(4, 12);
    expect(stageZoom(5, 100, 100)).toBeCloseTo(5 + Math.log2(240 / 640), 12);
  });

  it("staggered : décale les liaisons, toutes tracées à la fin", () => {
    expect(staggered(0, 0, 5)).toBe(0);
    expect(staggered(1, 4, 5)).toBe(1);
    for (let r = 0; r < 5; r++) expect(staggered(1, r, 5)).toBe(1);
    expect(staggered(0.3, 0, 5)).toBeGreaterThan(staggered(0.3, 4, 5));
    expect(staggered(0.5, 2, 1)).toBeGreaterThan(0);
  });
});

describe("cadrage d'un chapitre (fitCam)", () => {
  // Emprise du rail intermodal de l'exemple : de Barcelone à București, de Barcelone à Poznań.
  const rail = boxOf([[2.17, 41.39], [26.1, 44.43], [16.93, 52.41], [4.48, 51.92]]);

  it("boxOf : emprise exacte", () => {
    expect(rail).toEqual({ west: 2.17, east: 26.1, south: 41.39, north: 52.41 });
  });

  it("centre la vue sur l'emprise", () => {
    const c = fitCam(rail, 1200, 520);
    expect(c.lon).toBeCloseTo((2.17 + 26.1) / 2, 9);
    expect(c.lat).toBeCloseTo((41.39 + 52.41) / 2, 9);
  });

  it("recule sur une scène étroite : la largeur devient la contrainte", () => {
    const wide = fitCam(rail, 1264, 520);
    const narrow = fitCam(rail, 358, 330);
    expect(narrow.zoom).toBeLessThan(wide.zoom);
  });

  it("un chapitre plus petit se cadre de plus près", () => {
    const baltic = boxOf([[10.14, 54.32], [24.94, 60.17]]);
    expect(fitCam(baltic, 1200, 520).zoom).toBeGreaterThan(fitCam(rail, 1200, 520).zoom);
  });

  it("tout le chapitre tient dans la scène (largeur, avec la marge d'étiquettes)", () => {
    for (const [w, h] of [[1264, 520], [800, 400], [358, 330]]) {
      const c = fitCam(rail, w, h, { min: 0, max: 9 });
      const pxPerDegLon = (512 * 2 ** c.zoom) / 360;
      expect((rail.east - rail.west) * pxPerDegLon).toBeLessThanOrEqual(w);
      const pxPerDegLat = pxPerDegLon / Math.cos((c.lat * Math.PI) / 180);
      expect((rail.north - rail.south) * pxPerDegLat).toBeLessThanOrEqual(h);
    }
  });

  it("un site unique ne plonge pas dans la carte : zoom borné", () => {
    const one = boxOf([[10, 50]]);
    expect(fitCam(one, 1200, 600).zoom).toBe(6.4);
  });

  it("une emprise immense ne descend pas sous la borne basse", () => {
    const world = boxOf([[-120, -40], [140, 60]]);
    expect(fitCam(world, 400, 300).zoom).toBe(2.8);
  });
});
