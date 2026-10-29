import { describe, expect, it, vi } from "vitest";
import { HttpAggregateSource, ProjectionError, parseCorridorsPayload, parseGridPayload } from "./source";

const ok = { layer: "services", cellDeg: 2, asOf: "2026-09-30", cells: [[10, 20, 7]] };

describe("contrat du backend de projection", () => {
  it("accepte une grille conforme", () => {
    const g = parseGridPayload("services", ok);
    expect(g.provenance).toBe("live");
    expect(g.asOf).toBe("2026-09-30");
    expect(g.counts[10 * g.cols + 20]).toBe(7);
  });

  it.each([
    ["champ inattendu (fuite d'attribut)", { ...ok, names: ["x"] }],
    ["mauvaise couche", { ...ok, layer: "carriers" }],
    ["maille plus fine que la politique", { ...ok, cellDeg: 0.1 }],
    ["date invalide", { ...ok, asOf: "hier" }],
    ["cellule non entière", { ...ok, cells: [[1.5, 2, 3]] }],
    ["cellule hors grille", { ...ok, cells: [[999, 2, 3]] }],
    ["effectif négatif", { ...ok, cells: [[1, 2, -3]] }],
    ["cellule à quatre valeurs (identifiant glissé)", { ...ok, cells: [[1, 2, 3, "id-42"]] }],
  ])("rejette : %s", (_nom, payload) => {
    expect(() => parseGridPayload("services", payload)).toThrow(ProjectionError);
  });

  it("généralise les corridors à la maille de 0,5° et plafonne leur nombre", () => {
    const out = parseCorridorsPayload({ corridors: [[[4.4123, 51.8777], [6.81, 51.42]]] });
    expect(out[0]).toEqual([[4.5, 52], [7, 51.5]]);
    expect(() => parseCorridorsPayload({ corridors: Array(201).fill([[0, 0], [1, 1]]) })).toThrow();
    expect(() => parseCorridorsPayload({ corridors: [[[0, 0]]], extra: 1 })).toThrow();
  });

  it("sert la dernière réponse valide si la source tombe, puis renonce", async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify(ok)))
      .mockRejectedValue(new Error("réseau"));
    const src = new HttpAggregateSource("https://projection.example", "t", fetchMock);
    expect(await src.grid("services")).not.toBeNull();
    vi.setSystemTime(Date.now() + 15 * 60_000); // cache expiré, source en panne
    expect(await src.grid("services")).not.toBeNull(); // dernière réponse valide
    vi.setSystemTime(Date.now() + 2 * 60 * 60_000);
    expect(await src.grid("services")).toBeNull(); // trop ancienne : couche non disponible
    vi.useRealTimers();
  });

  it("envoie le jeton au backend et à lui seul", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(ok)));
    await new HttpAggregateSource("https://projection.example", "jeton-test", fetchMock).grid("services");
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://projection.example/v1/aggregates/services");
    expect((init?.headers as Record<string, string>).Authorization).toBe("Bearer jeton-test");
  });
});
