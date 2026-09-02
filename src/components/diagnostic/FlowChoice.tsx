"use client";

import type { DiagnosticCopy } from "@/content/diagnostic/copy";
import { FLOW_TYPES } from "@/content/diagnostic/questions";
import type { FlowType, Ranking } from "@/lib/diagnostic/types";

/**
 * Écran 1 — le choix du flux principal.
 *
 * Deux typologies seulement : on choisit l'une ou l'autre, il n'y a plus de
 * classement à faire. Le choix est un `radiogroup` natif, comme les autres
 * questions — même sémantique, même navigation clavier.
 *
 * Cibles tactiles confortables au pouce : plus de la moitié du trafic est mobile.
 */
export function FlowChoice({
  copy,
  ranking,
  onSelect,
  onAdvance,
}: {
  copy: DiagnosticCopy;
  ranking: Ranking;
  onSelect: (flow: FlowType) => void;
  onAdvance: (flow: FlowType) => void;
}) {
  const selected = ranking[0] ?? null;

  return (
    <fieldset className="min-w-0">
      <legend className="text-xl font-semibold leading-snug text-navy-900 sm:text-2xl">
        {copy.ranking.title}
      </legend>
      <p className="mt-2 text-sm leading-relaxed text-navy-500">
        {copy.ranking.help}
      </p>

      <div className="mt-7 space-y-3">
        {FLOW_TYPES.map((flow) => {
          const checked = selected === flow;
          const flowCopy = copy.flows[flow];
          const id = `flux-${flow}`;

          return (
            <label
              key={flow}
              htmlFor={id}
              className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-all duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500 has-[:focus-visible]:ring-offset-2 sm:p-5 ${
                checked
                  ? "border-brand-500 bg-brand-50/60 shadow-premium"
                  : "border-navy-200 bg-white hover:border-navy-300 hover:bg-navy-50/60"
              }`}
              onClick={(event) => {
                // `detail === 0` signale un clic déclenché au clavier : on laisse
                // alors le répondant valider lui-même avec « Continuer ».
                if (event.detail === 0) return;
                window.setTimeout(() => onAdvance(flow), 180);
              }}
            >
              <input
                type="radio"
                id={id}
                name="flux"
                value={flow}
                checked={checked}
                onChange={() => onSelect(flow)}
                className="mt-1 h-5 w-5 shrink-0 accent-brand-600 focus:outline-none"
              />
              <span className="min-w-0">
                <span
                  className={`block text-base font-semibold ${
                    checked ? "text-navy-900" : "text-navy-800"
                  }`}
                >
                  {flowCopy.label}
                </span>
                <span className="mt-0.5 block text-sm leading-snug text-navy-500">
                  {flowCopy.hint}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
