import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { anchorOf } from "./scene";
import { FRAME_CORE, FRAME_WIDE, LAYERS, LAYER_IDS, buildLayer, type LayerId } from "./layers";

describe("les couches des référentiels du physique du transport", () => {
  it("huit couches, dans l'ordre : bornes, shortsea, services ferroviaires, réseau ferroviaire, services fluviaux, réseau fluvial, parkings, transporteurs", () => {
    expect(LAYER_IDS).toEqual(["chargers", "shortsea", "railServices", "railNetwork", "barges", "waterways", "parkings", "carriers"]);
    for (const id of LAYER_IDS) expect(LAYERS[id].id).toBe(id);
  });

  it.each(LAYER_IDS)("%s : tous les lieux existent, tout tient dans le cadre de l'Europe et les temps vont de 0 à 1", (id) => {
    const { layer, paths } = buildLayer(id);
    const pts = [...paths.flatMap((p) => p.points), ...layer.dots.map((d) => anchorOf(d.at)), ...layer.rings.map((r) => anchorOf(r.at))];
    expect(pts.length, id).toBeGreaterThan(0);
    const { frame } = layer;
    for (const [lon, lat] of pts) {
      expect(lon, `${id} : longitude ${lon}`).toBeGreaterThanOrEqual(frame.west);
      expect(lon, `${id} : longitude ${lon}`).toBeLessThanOrEqual(frame.east);
      expect(lat, `${id} : latitude ${lat}`).toBeGreaterThanOrEqual(frame.south);
      expect(lat, `${id} : latitude ${lat}`).toBeLessThanOrEqual(frame.north);
    }
    for (const { el } of paths) {
      expect(el.t0, `${id}/${el.id}`).toBeGreaterThanOrEqual(0);
      expect(el.t1, `${id}/${el.id}`).toBeLessThanOrEqual(1);
      expect(el.t1, `${id}/${el.id}`).toBeGreaterThanOrEqual(el.t0);
    }
    for (const t of [...layer.dots.map((d) => d.t), ...layer.rings.map((r) => r.t)]) {
      expect(t, id).toBeGreaterThanOrEqual(0);
      expect(t, id).toBeLessThanOrEqual(1);
    }
    expect(layer.seconds, id).toBeGreaterThan(3);
  });

  it("le cadre serré sert à toutes les couches, sauf le shortsea qui monte jusqu'à Oslo et la Baltique", () => {
    for (const id of LAYER_IDS) expect(LAYERS[id].frame, id).toBe(id === "shortsea" ? FRAME_WIDE : FRAME_CORE);
  });

  it("chaque couche montre assez de choses pour se lire comme un référentiel, pas comme un exemple isolé", () => {
    const count = (id: LayerId) => ({ lines: LAYERS[id].lines.length, dots: LAYERS[id].dots.length });
    expect(count("chargers").dots, "bornes").toBeGreaterThan(60);
    expect(count("shortsea").dots, "ports").toBeGreaterThanOrEqual(30);
    expect(count("shortsea").lines, "services shortsea").toBeGreaterThanOrEqual(2);
    expect(count("railServices").lines, "services ferroviaires").toBeGreaterThanOrEqual(10);
    expect(count("railNetwork").lines, "lignes").toBeGreaterThanOrEqual(15);
    expect(count("waterways").lines, "voies navigables").toBeGreaterThanOrEqual(6);
    expect(LAYERS.barges.lines.filter((l) => l.id.startsWith("barge-")).length, "services de barges").toBeGreaterThanOrEqual(3);
    expect(count("parkings").dots, "parkings").toBeGreaterThan(30);
    expect(count("carriers").dots, "implantations de transporteurs").toBeGreaterThanOrEqual(15);
    expect(LAYERS.carriers.lines.length, "rayons d'action").toBeGreaterThan(0);
  });

  it("les services se distinguent du réseau : fluvial en pointillé fin, services de barges pleins, épais et animés ; services ferroviaires animés", () => {
    const net = LAYERS.waterways.lines;
    expect(net.every((l) => l.style === "dashed"), "le réseau fluvial est en pointillé").toBe(true);
    const services = LAYERS.barges.lines.filter((l) => l.id.startsWith("barge-"));
    for (const s of services) {
      expect(s.style, s.id).toBeUndefined();
      expect(s.width, s.id).toBeGreaterThan(Math.max(...net.map((l) => l.width)));
      expect(s.pulses ?? 0, s.id).toBeGreaterThan(0);
    }
    expect(LAYERS.railServices.lines.some((l) => (l.pulses ?? 0) > 0), "des services ferroviaires qui roulent").toBe(true);
    expect(Math.max(...LAYERS.railNetwork.lines.map((l) => l.width)), "le réseau est plus fin que les services").toBeLessThan(Math.min(...LAYERS.railServices.lines.map((l) => l.width)));
  });
});

describe("textes des référentiels (FR et EN)", () => {
  type Msg = { Home: { referentials: { eyebrow: string; title: string; lede: string; mapLabel: string; note: string; items: Record<string, { name: string; text: string }> } } };
  const load = (loc: string) => JSON.parse(readFileSync(`messages/${loc}/home.json`, "utf8")) as Msg;

  it.each(["fr", "en"])("%s : chaque couche a un nom et une phrase, sans chiffre ni nom d'opérateur", (loc) => {
    const r = load(loc).Home.referentials;
    expect(Object.keys(r.items), `${loc} : les mêmes couches que le code`).toEqual([...LAYER_IDS]);
    for (const id of LAYER_IDS) {
      const { name, text } = r.items[id];
      expect(name.length, `${loc}/${id}/name`).toBeGreaterThan(3);
      expect(text.length, `${loc}/${id}/text`).toBeGreaterThan(10);
      expect(`${name} ${text}`, `${loc}/${id} : aucun chiffre annoncé`).not.toMatch(/\d/);
      expect(`${name} ${text}`, `${loc}/${id} : aucun opérateur nommé`).not.toMatch(/milence|hexafret|euris|novatrans/i);
    }
  });

  it.each(["fr", "en"])("%s : le titre met un mot en valeur, la carte annonce sa couche, la note dit que ce n'est pas la donnée", (loc) => {
    const r = load(loc).Home.referentials;
    expect(r.title, `${loc} : un mot en valeur`).toMatch(/<em>.+<\/em>/);
    expect(r.mapLabel, `${loc}`).toContain("{name}");
    expect(r.note, `${loc} : ce sont des animations illustratives`).toMatch(/llustrati/);
    expect(r.lede.length, `${loc} : une phrase`).toBeLessThan(160);
  });
});
