import type { Ref } from "react";
import { LEVER_COLOR, type LeverId } from "@/lib/levers/data";

/**
 * La carte du levier affiché : son idée en deux lignes — un chiffre (rail/fluvial, shortsea) ou une
 * phrase courte —, en bas à droite de la couverture, au-dessus des pastilles sur téléphone. Elle
 * change avec le levier ; sa barre en bas montre l'avancement, comme celle de la pastille active.
 * La mention d'illustration reste lisible par les lecteurs d'écran.
 */
export function LeverCard({
  lever,
  figure,
  head,
  label,
  note,
  ariaLabel,
  barRef,
}: {
  lever: LeverId;
  figure?: string;
  head?: string;
  label: string;
  note: string;
  ariaLabel: string;
  barRef: Ref<HTMLSpanElement>;
}) {
  return (
    <div role="note" aria-label={ariaLabel} data-lever={lever} className="lever-card" style={{ ["--c" as string]: LEVER_COLOR[lever] }}>
      {figure ? <p className="lc-fig">{figure}</p> : <p className="lc-head">{head}</p>}
      <p className="lc-label">{label}</p>
      <span className="sr-only">{note}</span>
      <span ref={barRef} aria-hidden="true" className="lc-bar" />
    </div>
  );
}
