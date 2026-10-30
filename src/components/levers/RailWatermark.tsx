import type { ReactNode, Ref } from "react";

/**
 * Le filigrane du report modal : le schéma de Move2Rail (la route qui devient une voie ferrée,
 * tracé de la tuile du portail) en grand et très estompé, avec l'idée en une phrase. Il se dessine
 * juste après le début du tracé des flux, puis s'efface quand un autre levier prend la main. La
 * visibilité est pilotée par `data-on` (LeverStage) ; les transitions sont en CSS (levers.css).
 * Le texte reste lisible par les lecteurs d'écran même quand le filigrane est invisible.
 */
export function RailWatermark({ label, children, note, rootRef }: { label: string; children: ReactNode; note: string; rootRef: Ref<HTMLDivElement> }) {
  return (
    <div ref={rootRef} role="note" aria-label={label} data-on="0" className="lever-wm">
      <svg className="wm-logo" viewBox="10 22 300 76" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <g stroke="#94a3b8" strokeWidth="3">
          <path className="wm-draw" pathLength={1} d="M24 60H140" style={{ ["--d" as string]: "0s" }} />
          <path className="wm-draw" pathLength={1} d="M140 60C170 60 170 48 200 48" style={{ ["--d" as string]: "0.5s" }} />
          <path className="wm-draw" pathLength={1} d="M140 60C170 60 170 72 200 72" style={{ ["--d" as string]: "0.5s" }} />
        </g>
        <g stroke="#818cf8" strokeWidth="3">
          <path className="wm-draw" pathLength={1} d="M200 48H298" style={{ ["--d" as string]: "0.9s" }} />
          <path className="wm-draw" pathLength={1} d="M200 72H298" style={{ ["--d" as string]: "0.9s" }} />
        </g>
        <path className="wm-fade" stroke="#818cf8" strokeOpacity=".55" strokeWidth="2.2" d="M214 42v36M232 42v36M250 42v36M268 42v36M286 42v36" style={{ ["--d" as string]: "1.3s" }} />
        <circle className="wm-fade" cx="64" cy="60" r="6" fill="#94a3b8" style={{ ["--d" as string]: "0s" }} />
        <g className="wm-train" style={{ ["--d" as string]: "1.5s" }}>
          <rect x="228" y="51" width="40" height="18" rx="5" fill="#818cf8" />
          <path d="M236 56h8M250 56h8" stroke="#0b1224" strokeOpacity=".45" strokeWidth="2.4" />
        </g>
      </svg>
      <p className="wm-text">{children}</p>
      <span className="sr-only">{note}</span>
    </div>
  );
}
