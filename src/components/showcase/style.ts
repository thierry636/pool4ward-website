import type { TransportMode } from "@/lib/showcase/types";

/**
 * Habillage des modes. La couleur ne porte jamais seule la distinction : chaque
 * mode a aussi son tracé (plein, tirets courts, longs tirets, points).
 */
export const MODE_STYLE: Record<TransportMode, { color: string; width: number; dash: number[] | null }> = {
  rail: { color: "#f2efe6", width: 2.2, dash: null },
  shortsea: { color: "#7cc3ee", width: 2.2, dash: [2.4, 1.6] },
  barge: { color: "#8fc4ab", width: 2.8, dash: [5, 1.8] },
  "road-reefer": { color: "#e8b964", width: 2.4, dash: [0.1, 2.1] },
};

/** `stroke-dasharray` SVG équivalent (en unités de largeur de trait), pour la carte à plat. */
export function svgDash(mode: TransportMode): string | undefined {
  const d = MODE_STYLE[mode].dash;
  return d ? d.map((x) => x * MODE_STYLE[mode].width).join(" ") : undefined;
}
