"use client";

import type { DiagnosticCopy } from "@/content/diagnostic/copy";
import { format } from "@/content/diagnostic/copy";
import { FLOW_TYPES } from "@/content/diagnostic/questions";
import type { FlowType, Ranking } from "@/lib/diagnostic/types";

/**
 * Écran 1 — le classement.
 *
 * Une carte a deux états lisibles au premier coup d'œil : « concerné », en
 * couleur, avec son rang ; « pas concerné », grisée. Le premier clic classe la
 * carte, le second la retire et renumérote les suivantes — le rang porte
 * l'ordre d'importance, la couleur porte le fait d'être concerné ou non.
 *
 * Cibles tactiles confortables au pouce : plus de la moitié du trafic est mobile.
 */
export function FlowRanking({
  copy,
  ranking,
  onToggle,
}: {
  copy: DiagnosticCopy;
  ranking: Ranking;
  onToggle: (flow: FlowType) => void;
}) {
  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {FLOW_TYPES.map((flow) => {
          const position = ranking.indexOf(flow);
          const selected = position >= 0;
          const flowCopy = copy.flows[flow];

          return (
            <li key={flow}>
              <button
                type="button"
                onClick={() => onToggle(flow)}
                aria-pressed={selected}
                aria-label={`${flowCopy.label}. ${
                  selected
                    ? format(copy.ranking.positionAria, { position: position + 1 })
                    : copy.ranking.unselectedAria
                }`}
                className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200 sm:p-5 ${
                  selected
                    ? "border-brand-500 bg-brand-50/60 shadow-premium"
                    : // Pas concerné : la carte s'efface sans disparaître.
                      "border-navy-200 bg-navy-50/70 opacity-60 hover:opacity-100 hover:border-navy-300"
                } focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2`}
              >
                <span
                  aria-hidden="true"
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-bold transition-colors duration-200 ${
                    selected
                      ? "bg-brand-600 text-white"
                      : "border-2 border-dashed border-navy-300 text-navy-300"
                  }`}
                >
                  {selected ? position + 1 : null}
                </span>

                <span className="min-w-0 flex-1">
                  {/* L'état voyage avec le titre : sur une largeur de pouce, un
                      badge en bout de ligne écraserait le libellé. */}
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span
                      className={`text-base font-semibold ${
                        selected ? "text-navy-900" : "text-navy-500"
                      }`}
                    >
                      {flowCopy.label}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition-colors duration-200 ${
                        selected
                          ? "bg-brand-600 text-white"
                          : "bg-navy-200/70 text-navy-500"
                      }`}
                    >
                      {selected
                        ? copy.ranking.concerned
                        : copy.ranking.notConcerned}
                    </span>
                  </span>
                  <span className="mt-1 block text-sm leading-snug text-navy-500">
                    {flowCopy.hint}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="pt-1 text-xs text-navy-500">{copy.ranking.hint}</p>
    </div>
  );
}
