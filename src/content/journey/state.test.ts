import { describe, expect, it } from "vitest";
import { FLOW_IDS } from "./geometry";
import {
  INITIAL_STATE,
  SCENARIOS,
  focusStatus,
  flowLook,
  loopIsClosed,
  lotOf,
  lotsOf,
  retained,
  type JourneyState,
} from "./state";
import { PARTNERS } from "./partners";
import { FLOWS } from "./geometry";

const at = (p: Partial<JourneyState>): JourneyState => ({ ...INITIAL_STATE, ...p });

describe("parcours : niveau de connaissance", () => {
  it("part de « référencé » et n'atteint jamais « confirmé » ni « contractualisé » dans un cas démonstrateur", () => {
    const reached = new Set<string>();
    for (const stage of [1, 2, 3] as const) {
      for (const scenario of SCENARIOS) {
        for (const slotE of ["late", "early"] as const) {
          reached.add(focusStatus(at({ stage, scenario, slotE })));
        }
      }
    }
    expect(reached.has("confirmed")).toBe(false);
    expect(reached.has("contracted")).toBe(false);
    expect(focusStatus(INITIAL_STATE)).toBe("referenced");
  });

  it("fait passer la boucle de « détectée » à « étudiée » quand le créneau change", () => {
    expect(focusStatus(at({ stage: 2, scenario: "loop", slotE: "late" }))).toBe("detected");
    expect(focusStatus(at({ stage: 2, scenario: "loop", slotE: "early" }))).toBe("studied");
  });

  it("ne ferme la boucle que si le créneau de l'entrepôt Est le permet", () => {
    expect(loopIsClosed(at({ stage: 2, scenario: "loop", slotE: "late" }))).toBe(false);
    expect(loopIsClosed(at({ stage: 3, scenario: "loop", slotE: "late" }))).toBe(false);
    expect(loopIsClosed(at({ stage: 2, scenario: "loop", slotE: "early" }))).toBe(true);
    expect(loopIsClosed(at({ stage: 2, scenario: "modal", slotE: "early" }))).toBe(false);
  });
});

describe("parcours : continuité du cas", () => {
  it("garde les six mêmes flux à chaque étape (rien n'apparaît ni ne disparaît du cas)", () => {
    expect(FLOW_IDS).toHaveLength(6);
    for (const stage of [1, 2, 3] as const) {
      for (const id of FLOW_IDS) {
        const look = flowLook(id, FLOWS[id].volume, at({ stage, layer: 5, scenario: "loop", contractStep: 3 }));
        expect(look.width).toBeGreaterThan(0);
      }
    }
  });

  it("choisit la boucle quand l'étape 3 est atteinte sans scénario retenu", () => {
    expect(retained("baseline")).toBe("loop");
    expect(retained("modal")).toBe("modal");
  });

  it("donne à chaque scénario retenu au moins un lot et des partenaires correspondants", () => {
    for (const sc of SCENARIOS.filter((s) => s !== "baseline")) {
      const lots = lotsOf(sc);
      expect(lots.length, sc).toBeGreaterThan(0);
      for (const p of PARTNERS[sc as keyof typeof PARTNERS]) expect(lots, `${sc}:${p.id}`).toContain(p.lot);
      for (const id of FLOW_IDS) expect([0, ...lots]).toContain(lotOf(id, sc));
    }
  });
});
