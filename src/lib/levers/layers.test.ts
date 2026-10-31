import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CARRIERS, CHARGERS, SERVICES, SHAPE_IDS, SHORTSEA, rotations, type Shapes } from "@/content/referentials";
import { distanceKm } from "@/lib/showcase/arcs";
import { landDepthKm } from "./land-depth.testutil";
import { anchorOf } from "./scene";
import { FRAME_CORE, FRAME_WIDE, LAYERS, LAYER_IDS, SEA_LOOPS, buildLayer, type LayerId } from "./layers";

describe("les couches des référentiels du physique du transport", () => {
  it("six couches, dans l'ordre du menu : services, shortsea, réseaux, bornes, parkings, transporteurs", () => {
    expect(LAYER_IDS).toEqual(["services", "shortsea", "networks", "chargers", "parkings", "carriers"]);
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
    expect(count("services").lines, "services et voies navigables").toBeGreaterThanOrEqual(25);
    expect(count("shortsea").dots, "ports").toBeGreaterThanOrEqual(30);
    expect(count("shortsea").lines, "services shortsea").toBeGreaterThanOrEqual(5);
    expect(count("networks").lines, "lignes et voies navigables").toBeGreaterThanOrEqual(25);
    expect(count("chargers").dots, "bornes").toBeGreaterThan(60);
    expect(count("parkings").dots, "parkings").toBeGreaterThan(30);
    expect(count("carriers").dots, "implantations de transporteurs").toBeGreaterThanOrEqual(15);
    expect(LAYERS.carriers.lines.length, "rayons d'action").toBeGreaterThan(0);
  });

  it("les services se distinguent du réseau : voies navigables en filigrane pointillé, services fluviaux épais, services ferroviaires animés", () => {
    const waterways = LAYERS.services.lines.filter((l) => l.id.startsWith("waterway-"));
    const barges = LAYERS.services.lines.filter((l) => l.id.startsWith("barge-"));
    const rails = LAYERS.services.lines.filter((l) => l.id.startsWith("service-"));
    expect(waterways.length, "des voies navigables en fond").toBeGreaterThan(0);
    expect(waterways.every((l) => l.style === "dashed"), "elles sont en pointillé").toBe(true);
    for (const s of barges) {
      expect(s.style, s.id).toBeUndefined();
      expect(s.width, s.id).toBeGreaterThan(Math.max(...waterways.map((l) => l.width)));
      expect(s.pulses ?? 0, s.id).toBeGreaterThan(0);
    }
    expect(rails.some((l) => (l.pulses ?? 0) > 0), "des services ferroviaires qui roulent").toBe(true);
    expect(Math.max(...LAYERS.networks.lines.filter((l) => l.id.startsWith("rail-")).map((l) => l.width)), "le réseau est plus fin que les services").toBeLessThan(Math.min(...rails.map((l) => l.width)));
  });
});

describe("shortsea : des rotations qui tournent, et qui restent dans l'eau", () => {
  const { paths } = buildLayer("shortsea");
  const loops = paths.filter((p) => p.el.id.startsWith("loop-"));

  it("les rotations viennent de SEA_LOOPS, fermées sur elles-mêmes, en deux couleurs (boucle, métro bouclé)", () => {
    expect(loops.map((p) => p.el.id)).toEqual(SEA_LOOPS.map((l) => `loop-${l.id}`));
    expect(loops.every((p) => p.el.closed), "elles se referment sur leur point de départ").toBe(true);
    expect(new Set(loops.map((p) => p.el.color)).size, "boucle et métro bouclé se distinguent").toBeGreaterThanOrEqual(2);
  });

  it("aucune rotation ne traverse les terres : au plus 12 km à l'intérieur, sauf aux abords des ports desservis (Rotterdam est à l'intérieur des terres)", () => {
    for (const { el, points, km } of loops) {
      expect(km, `${el.id} : un vrai trajet maritime`).toBeGreaterThan(300);
      const calls = el.stops.map((a) => anchorOf(a));
      const bad = points.filter((p) => landDepthKm(p) > 12 && calls.every((c) => distanceKm(p, c) > 30));
      expect(bad, `${el.id} : ${bad.length} point(s) à plus de 12 km à l'intérieur des terres, dont ${bad[0]?.map((x) => x.toFixed(2))}`).toHaveLength(0);
    }
  });
});

describe("les chiffres de la planche", () => {
  const sum = (s: Shapes) => SHAPE_IDS.reduce((n, id) => n + s[id], 0);

  it("les formes de services recoupent le total, pour les services ferroviaires et fluviaux comme pour le shortsea", () => {
    expect(sum(SERVICES.shapes), "formes de services = total").toBe(SERVICES.total);
    expect(sum(SHORTSEA.shapes), "formes shortsea = total").toBe(SHORTSEA.total);
  });

  it("le rail et le fluvial font le total des services, les états des bornes font le total des sites", () => {
    expect(SERVICES.modes.rail + SERVICES.modes.waterway, "rail + fluvial").toBe(SERVICES.total);
    expect(CHARGERS.status.inService + CHARGERS.status.construction + CHARGERS.status.planned, "en service + en construction + prévus").toBe(CHARGERS.sites);
  });

  it("les services en rotation du shortsea sont les boucles et les métros bouclés", () => {
    expect(rotations(SHORTSEA.shapes), "201 boucles + 1 122 métros bouclés").toBe(1323);
  });

  it("un site porte au moins une borne, un transporteur au moins un site", () => {
    expect(CHARGERS.chargers).toBeGreaterThanOrEqual(CHARGERS.sites);
    expect(CARRIERS.carriers).toBeGreaterThanOrEqual(CARRIERS.sites);
  });
});

describe("textes des référentiels (FR et EN)", () => {
  type Item = { name: string; sub: string; title: string; lead: string; ficheTitle: string };
  type Msg = {
    Home: {
      referentials: {
        eyebrow: string;
        title: string;
        lede: string;
        mapLabel: string;
        note: string;
        live: string;
        menu: { label: string; groups: Record<string, string> };
        controls: Record<string, string>;
        items: Record<string, Item>;
      };
    };
  };
  const load = (loc: string) => JSON.parse(readFileSync(`messages/${loc}/home.json`, "utf8")) as Msg;
  const OPERATORS = /milence|engie|hexafret|euris|novatrans|ctl logistics|hupac|contargo/i;

  it.each(["fr", "en"])("%s : chaque couche a un nom, un titre, une phrase et une fiche, sans nom d'opérateur", (loc) => {
    const r = load(loc).Home.referentials;
    expect(Object.keys(r.items), `${loc} : les mêmes couches que le code`).toEqual([...LAYER_IDS]);
    for (const id of LAYER_IDS) {
      const it = r.items[id];
      for (const k of ["name", "sub", "title", "lead", "ficheTitle"] as const) expect(it[k].length, `${loc}/${id}/${k}`).toBeGreaterThan(3);
      expect(JSON.stringify(it), `${loc}/${id} : aucun opérateur nommé`).not.toMatch(OPERATORS);
    }
  });

  it.each(["fr", "en"])("%s : aucun nombre n'est écrit dans un message, ils viennent tous du code", (loc) => {
    const r = load(loc).Home.referentials;
    for (const id of LAYER_IDS) {
      const it = r.items[id];
      expect(`${it.name} ${it.title} ${it.lead} ${it.ficheTitle}`, `${loc}/${id} : aucun chiffre annoncé`).not.toMatch(/\d/);
    }
  });

  it.each(["fr", "en"])("%s : le titre met un mot en valeur, la carte annonce sa couche, la mise à jour est dite journalière, la note dit que les noms sont masqués", (loc) => {
    const r = load(loc).Home.referentials;
    expect(r.title, `${loc} : un mot en valeur`).toMatch(/<em>.+<\/em>/);
    expect(r.mapLabel, `${loc}`).toContain("{name}");
    expect(r.live, `${loc} : journalière, pas en temps réel`).toMatch(loc === "fr" ? /journali/i : /daily/i);
    expect(r.live, `${loc} : jamais « temps réel »`).not.toMatch(/temps r[ée]el|real[- ]time/i);
    expect(r.note, `${loc} : noms masqués`).toMatch(loc === "fr" ? /masqu/i : /masked|hidden/i);
    expect(r.lede.length, `${loc} : une phrase`).toBeLessThan(160);
    expect(Object.keys(r.menu.groups), `${loc} : les trois groupes du menu`).toEqual(["services", "networks", "sites"]);
  });
});
