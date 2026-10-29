"use client";

import { GlobeExplorer } from "./GlobeExplorer";
import { GlobeLauncher } from "./GlobeLauncher";

/** Le globe de la page Référentiels : chargé à l'approche de l'écran, avec ouverture plein écran. */
export function GlobeEmbed() {
  return <GlobeLauncher>{(open) => <GlobeExplorer autoLoad onFullscreen={open} />}</GlobeLauncher>;
}
