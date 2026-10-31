import type { FlowId, SiteId } from "./geometry";

/* ------------------------------------------------------------------------
 * Machine d'états du parcours « du terrain aux engagements ».
 *
 * Le plateau est un objet unique : les mêmes quatre sites et six flux
 * traversent les trois étapes. Ce module décide, de façon pure et testable, ce
 * que chaque élément montre à un instant donné ; `Board.tsx` ne fait que
 * l'animer. Rien ici ne calcule un coût, un gain ou un temps de parcours.
 * ---------------------------------------------------------------------- */

export type Stage = 1 | 2 | 3;

/** Étape 1 : couches du terrain, révélées une à une. */
export const TERRAIN_LAYERS = ["flows", "volumes", "slots", "assets", "contracts"] as const;
export type TerrainLayer = (typeof TERRAIN_LAYERS)[number];

/** Étape 2 : organisations alternatives. */
export const SCENARIOS = ["baseline", "loop", "pooling", "frequency", "modal", "electric"] as const;
export type ScenarioId = (typeof SCENARIOS)[number];

/** Étape 3 : de la consultation au contrat. */
export const CONTRACT_STEPS = ["lots", "partners", "offers", "commitments"] as const;
export type ContractStep = (typeof CONTRACT_STEPS)[number];

/** Les cinq niveaux de connaissance que le site distingue partout. */
export const STATUSES = ["referenced", "detected", "studied", "confirmed", "contracted"] as const;
export type Status = (typeof STATUSES)[number];

export type SlotE = "late" | "early";

export interface JourneyState {
  stage: Stage;
  /** Index de couche atteint à l'étape 1 (0 = sites seuls). */
  layer: number;
  scenario: ScenarioId;
  /** Créneau de l'entrepôt Est : celui d'origine, ou celui qui ouvre la boucle. */
  slotE: SlotE;
  /** Index d'avancement à l'étape 3 (0 = lots). */
  contractStep: number;
}

export const INITIAL_STATE: JourneyState = {
  stage: 1,
  layer: 0,
  scenario: "baseline",
  slotE: "late",
  contractStep: 0,
};

/** Fenêtres de quai, en heures sur 24 h (sans unité : lisibles dans les deux langues). Le plateau n'en déduit aucun temps de trajet. */
export const SLOT_WINDOWS: Record<SiteId, string> = {
  N: "06–09",
  C: "08–12",
  E: "14–16",
  S: "05–08",
};
export const SLOT_E_EARLY = "10–12";

/* ------------------------------------------------------- statut du cas */

/**
 * Niveau de connaissance atteint par l'objet que l'on regarde. Les deux
 * derniers niveaux ne sont jamais atteints dans un cas démonstrateur : ils
 * exigent une réponse écrite d'un partenaire, puis un contrat signé.
 */
export function focusStatus(s: JourneyState): Status {
  if (s.stage === 1) return "referenced";
  if (s.stage === 2) {
    if (s.scenario === "baseline") return "referenced";
    if (s.scenario === "loop") return s.slotE === "early" ? "studied" : "detected";
    return "detected";
  }
  return "studied";
}

/** Indice de 0 à 4 dans l'échelle des statuts. */
export const statusIndex = (st: Status) => STATUSES.indexOf(st);

/* ---------------------------------------------- ce que chaque flux montre */

export interface FlowLook {
  /** Opacité du trait de base. */
  opacity: number;
  /** Épaisseur, en unités du plateau. */
  width: number;
  /** Famille de couleur. */
  tone: "muted" | "group" | "electric" | "lot1" | "lot2";
  /** Le trait de base cède la place à une variante (boucle, rail). */
  replaced: boolean;
}

const VOLUME_WIDTH = { 1: 3, 2: 5.5, 3: 8 } as const;

/** Les flux concernés par chaque scénario. */
export const SCENARIO_FLOWS: Record<ScenarioId, FlowId[]> = {
  baseline: [],
  loop: ["F1", "F2", "F3", "F4"],
  pooling: ["F5", "F6"],
  frequency: ["F1"],
  modal: ["F2"],
  electric: ["F1", "F2"],
};

export interface FlowVolume {
  volume: 1 | 2 | 3;
}

export function flowLook(id: FlowId, volume: 1 | 2 | 3, s: JourneyState): FlowLook {
  const base = VOLUME_WIDTH[volume];

  // Étape 1 : rien avant la couche « flux », puis les flux séparés, en gris.
  if (s.stage === 1) {
    const shown = s.layer >= 1;
    return { opacity: shown ? 0.95 : 0, width: s.layer >= 2 ? base : 3.2, tone: "muted", replaced: false };
  }

  const touched = SCENARIO_FLOWS[s.scenario].includes(id);

  if (s.stage === 2) {
    if (s.scenario === "baseline" || !touched) {
      return { opacity: s.scenario === "baseline" ? 0.95 : 0.4, width: base, tone: "muted", replaced: false };
    }
    switch (s.scenario) {
      case "loop":
        return { opacity: 0.16, width: base, tone: "muted", replaced: true };
      case "modal":
        return { opacity: 0.14, width: base, tone: "muted", replaced: true };
      case "pooling":
        if (id === "F6") return { opacity: 0, width: base, tone: "group", replaced: true };
        return { opacity: 1, width: VOLUME_WIDTH[2], tone: "group", replaced: false };
      case "frequency":
        return { opacity: 1, width: base + 1.5, tone: "group", replaced: false };
      case "electric":
        return { opacity: 1, width: base, tone: "electric", replaced: false };
      default:
        return { opacity: 0.95, width: base, tone: "muted", replaced: false };
    }
  }

  // Étape 3 : le scénario retenu est lu en lots.
  const lot = lotOf(id, s.scenario);
  if (lot === 0) return { opacity: 0.3, width: base, tone: "muted", replaced: false };
  const replaced = s.scenario === "loop" || s.scenario === "modal";
  return {
    opacity: replaced ? 0.12 : 1,
    width: base,
    tone: lot === 1 ? "lot1" : "lot2",
    replaced,
  };
}

/** Lot de consultation auquel appartient un flux dans le scénario retenu (0 = hors lots). */
export function lotOf(id: FlowId, scenario: ScenarioId): 0 | 1 | 2 {
  switch (scenario) {
    case "loop":
      return id === "F5" || id === "F6" ? 2 : 1;
    case "pooling":
      return id === "F5" || id === "F6" ? 1 : 0;
    case "frequency":
      return id === "F1" ? 1 : 0;
    case "modal":
      return id === "F2" ? 1 : 0;
    case "electric":
      return id === "F1" || id === "F2" ? 1 : 2;
    default:
      return 0;
  }
}

/** Les lots du scénario, dans l'ordre. `baseline` n'en a pas : l'étape 3 part d'un scénario retenu. */
export function lotsOf(scenario: ScenarioId): (1 | 2)[] {
  switch (scenario) {
    case "loop":
    case "electric":
      return [1, 2];
    case "pooling":
    case "frequency":
    case "modal":
      return [1];
    default:
      return [];
  }
}

/**
 * Un parcours part toujours d'un scénario retenu. Si le visiteur arrive à
 * l'étape 3 sans en avoir choisi (situation actuelle), on retient la boucle,
 * qui est le scénario que l'étape 2 met en avant.
 */
export function retained(scenario: ScenarioId): Exclude<ScenarioId, "baseline"> {
  return scenario === "baseline" ? "loop" : scenario;
}

/**
 * La boucle n'est refermée que si le créneau de l'entrepôt Est la rend
 * compatible. À l'étape 3, un créneau resté à 14–16 h laisse un point ouvert :
 * le plateau le signale, il ne le masque pas.
 */
export function loopIsClosed(s: JourneyState): boolean {
  return s.scenario === "loop" && s.slotE === "early";
}
