/**
 * Les référentiels présentés dans la section « Des référentiels pour décrire le transport tel qu'il existe » :
 * l'ordre et le visuel de chacun. Les textes sont dans les messages (`Home.referentialExplorer`) ; les nombres
 * viennent de `referentials.ts` (provenance dans son en-tête).
 */
export const REF_IDS = ["services", "networks", "points", "carriers", "prices"] as const;
export type RefId = (typeof REF_IDS)[number];

/** Le visuel de chaque référentiel : une carte illustrative (WebP, sans texte), ou un graphique (prix). */
export const REF_ART: Record<RefId, { file: string; width: number; height: number } | null> = {
  services: { file: "services", width: 1214, height: 845 },
  networks: { file: "networks", width: 1214, height: 845 },
  points: { file: "points", width: 1214, height: 845 },
  carriers: { file: "carriers", width: 1214, height: 845 },
  prices: null,
};

/** Les trois gestes de l'agent IA sur un référentiel, dans l'ordre où ils s'animent. */
export const REF_ACTS = ["collect", "normalize", "refresh"] as const;

/** La couleur de chaque entrée de la légende, dans l'ordre des messages (`legend`). */
export const REF_LEGEND_COLORS: Record<RefId, readonly string[]> = {
  services: ["#2563eb", "#0d9488", "#0891b2"],
  networks: ["#4c1d95", "#475569"],
  points: ["#16a34a", "#ea580c", "#94a3b8", "#2563eb"],
  carriers: ["#7c3aed", "#c4b5fd"],
  prices: [],
};
