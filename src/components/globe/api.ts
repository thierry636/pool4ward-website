/**
 * Client des routes /api/globe/*. Le navigateur ne reçoit jamais de donnée :
 * un manifeste (couches, zones), des tuiles image, des synthèses de zone.
 */

export type LayerId = "services" | "carriers" | "parkings" | "charging" | "networks";
export type Availability = "demo" | "available" | "unavailable";

export interface ManifestLayer {
  id: LayerId;
  kind: "density" | "corridor";
  maxZoom: number;
  cellDeg: number;
  color: string;
  availability: Availability;
}

export interface ManifestZone {
  id: string;
  slug: string;
  bbox: [number, number, number, number];
}

export interface Manifest {
  mode: "demo" | "live";
  tileSize: number;
  maxActiveLayers: number;
  layers: ManifestLayer[];
  zones: ManifestZone[];
}

export interface LayerSummary {
  layer: LayerId;
  availability: Availability;
  range: { min: number; max: number | null } | null;
  suppressed: boolean;
  corridors?: boolean;
  asOf: string | null;
}

export interface ZoneSummary {
  zone: string;
  mode: "demo" | "live";
  layers: LayerSummary[];
}

export async function fetchManifest(): Promise<Manifest> {
  const res = await fetch("/api/globe/manifest");
  if (!res.ok) throw new Error(`manifest ${res.status}`);
  return (await res.json()) as Manifest;
}

export type SessionResult = "ok" | "limited" | "not_configured" | "error";

export async function openSession(): Promise<SessionResult> {
  try {
    const res = await fetch("/api/globe/session", { method: "POST", credentials: "same-origin" });
    if (res.ok) return "ok";
    if (res.status === 503) return "not_configured";
    if (res.status === 429 || res.status === 403) return "limited";
    return "error";
  } catch {
    return "error";
  }
}

export type ZoneResult =
  | { status: "ok"; summary: ZoneSummary }
  | { status: "limited" }
  | { status: "error" };

/** Une synthèse ; si la session a expiré (401), on en rouvre une et on réessaie une fois. */
export async function fetchZone(id: string): Promise<ZoneResult> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(`/api/globe/zones/${encodeURIComponent(id)}`, { credentials: "same-origin" });
      if (res.ok) return { status: "ok", summary: (await res.json()) as ZoneSummary };
      if (res.status === 401 && attempt === 0) {
        if ((await openSession()) === "ok") continue;
        return { status: "error" };
      }
      if (res.status === 429 || res.status === 403) return { status: "limited" };
      return { status: "error" };
    } catch {
      return { status: "error" };
    }
  }
  return { status: "error" };
}

export function zoneAt(zones: ManifestZone[], lon: number, lat: number): ManifestZone | undefined {
  return zones.find((z) => lon >= z.bbox[0] && lon < z.bbox[2] && lat >= z.bbox[1] && lat < z.bbox[3]);
}

export function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Rendu 3D logiciel (SwiftShader, llvmpipe…) : le globe y serait lent et
 * monopoliserait le processeur. On le détecte pour proposer d'emblée la carte à
 * plat, qui affiche les mêmes couches pour une fraction du coût.
 */
export function isSoftwareRenderer(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") || canvas.getContext("webgl")) as WebGLRenderingContext | null;
    const ext = gl?.getExtension("WEBGL_debug_renderer_info");
    const renderer = ext && gl ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "";
    return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer);
  } catch {
    return false;
  }
}

/** Le visiteur a explicitement demandé le globe (`?renderer=globe`, utile à la recette). */
export const forcesGlobe = () => new URLSearchParams(window.location.search).get("renderer") === "globe";

/** L'appareil ou la connexion invitent à ne rien charger de lourd sans demande. */
export function preferLightweight(): boolean {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string }; deviceMemory?: number };
  return (
    !!nav.connection?.saveData ||
    ["slow-2g", "2g", "3g"].includes(nav.connection?.effectiveType ?? "") ||
    (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) ||
    (navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 2)
  );
}

/** Forme associée à chaque couche : la couleur ne porte jamais seule la distinction. */
export const LAYER_GLYPH: Record<LayerId, "circle" | "diamond" | "square" | "triangle" | "line"> = {
  services: "circle",
  carriers: "diamond",
  parkings: "square",
  charging: "triangle",
  networks: "line",
};
