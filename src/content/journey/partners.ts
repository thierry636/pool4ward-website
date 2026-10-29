import { flowTag, type FlowId, type Pt } from "./geometry";
import type { ScenarioId } from "./state";

/**
 * Profils de partenaires à interroger, par scénario retenu. Ce sont des
 * profils (« transporteur routier régional »), jamais des entreprises : le
 * cas est démonstrateur, et aucune société réelle n'y est nommée.
 */

export type PartnerId = "roadRegional" | "railRoad" | "electricFleet" | "roadSecond" | "groupage";

export interface PartnerSlot {
  id: PartnerId;
  lot: 1 | 2;
}

type Retained = Exclude<ScenarioId, "baseline">;

export const PARTNERS: Record<Retained, PartnerSlot[]> = {
  loop: [
    { id: "roadRegional", lot: 1 },
    { id: "roadSecond", lot: 2 },
  ],
  pooling: [
    { id: "roadRegional", lot: 1 },
    { id: "groupage", lot: 1 },
  ],
  frequency: [{ id: "roadRegional", lot: 1 }],
  modal: [
    { id: "railRoad", lot: 1 },
    { id: "roadRegional", lot: 1 },
  ],
  electric: [
    { id: "electricFleet", lot: 1 },
    { id: "roadRegional", lot: 2 },
  ],
};

/** Gabarit des pastilles de partenaires : positions fixes, hors des tracés. */
export const PARTNER_BOX: Record<PartnerId, { x: number; y: number; w: number }> = {
  roadRegional: { x: 640, y: 80, w: 236 },
  railRoad: { x: 650, y: 470, w: 226 },
  electricFleet: { x: 640, y: 80, w: 236 },
  roadSecond: { x: 600, y: 560, w: 276 },
  groupage: { x: 600, y: 640, w: 276 },
};

/** Position de l'étiquette d'un lot sur le plateau. */
export function lotTagPos(scenario: ScenarioId, lot: 1 | 2): Pt {
  if (lot === 2) return flowTag("F5", 0.5, -62);
  const flow: FlowId = scenario === "pooling" ? "F5" : scenario === "frequency" ? "F1" : "F2";
  return flow === "F5" ? flowTag("F5", 0.5, -62) : flowTag(flow, 0.5, -46);
}
