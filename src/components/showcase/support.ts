/** Détection des capacités de l'appareil : décide globe 3D ou carte à plat. */

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
 * plat, qui montre les mêmes liaisons pour une fraction du coût.
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
