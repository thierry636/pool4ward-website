"use client";

import type { DiagnosticCopy } from "@/content/diagnostic/copy";
import { format } from "@/content/diagnostic/copy";
import { FLOW_TYPES } from "@/content/diagnostic/questions";
import type { FlowType, Ranking } from "@/lib/diagnostic/types";

/**
 * Écran 1 — le classement.
 *
 * Au clic, la carte prend un badge 1, puis 2, puis 3 dans l'ordre des clics.
 * Un second clic la retire et renumérote les suivantes. Les cartes non cliquées
 * valent « non concerné ».
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
                    : "border-navy-200 bg-white hover:border-navy-300 hover:bg-navy-50/60"
                } focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2`}
              >
                <span
                  aria-hidden="true"
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-bold transition-colors duration-200 ${
                    selected
                      ? "bg-brand-600 text-white"
                      : "border-2 border-dashed border-navy-300"
                  }`}
                >
                  {selected ? position + 1 : null}
                </span>
                <span className="min-w-0">
                  <span className="block text-base font-semibold text-navy-900">
                    {flowCopy.label}
                  </span>
                  <span className="mt-0.5 block text-sm text-navy-500">
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
