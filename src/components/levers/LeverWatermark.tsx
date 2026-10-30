import type { ReactNode, Ref } from "react";
import type { LeverId } from "@/lib/levers/data";
import { LeverGlyph } from "./glyphs";

/**
 * Le filigrane d'un levier : son sigle (le langage des tuiles du portail), très estompé, et
 * l'idée en une phrase. Il se dessine juste après le début du tracé des flux, puis s'efface
 * quand un autre levier prend la main. La visibilité est pilotée par `data-on` (LeverStage) ;
 * les transitions sont en CSS (levers.css). Le texte reste lisible par les lecteurs d'écran
 * même quand le filigrane est invisible.
 */
export function LeverWatermark({ lever, label, note, rootRef, children }: { lever: LeverId; label: string; note: string; rootRef: Ref<HTMLDivElement>; children: ReactNode }) {
  return (
    <div ref={rootRef} role="note" aria-label={label} data-on="0" data-lever={lever} className="lever-wm">
      <LeverGlyph lever={lever} />
      <p className="wm-text">{children}</p>
      <span className="sr-only">{note}</span>
    </div>
  );
}
