"use client";

import type { DiagnosticCopy } from "@/content/diagnostic/copy";
import { format } from "@/content/diagnostic/copy";
import { BENCHMARK_ENABLED } from "@/content/diagnostic/scoring";
import type { KnownLeverId } from "@/content/diagnostic/levers";
import type { DiagnosticResult } from "@/lib/diagnostic/types";

/**
 * Écran 8 — le résultat.
 *
 * Indice, niveau et trois leviers, immédiatement et sans email. L'indice est
 * publié par branche, jamais globalement : comparer un profil messagerie et un
 * profil complets sur la même échelle n'aurait aucun sens.
 */
export function ResultScreen({
  copy,
  result,
}: {
  copy: DiagnosticCopy;
  result: DiagnosticResult;
}) {
  const branchCopy = copy.flows[result.branch];
  const levers = result.levers as readonly KnownLeverId[];
  const secondaryLever = result.secondaryLever as KnownLeverId | null;

  return (
    <div className="space-y-10">
      <section aria-labelledby="diagnostic-indice">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
          {copy.result.eyebrow}
        </p>

        <h2
          id="diagnostic-indice"
          className="mt-2 text-sm font-medium text-navy-500"
        >
          {format(copy.result.indexLabel, { flow: branchCopy.indexLabel })}
        </h2>

        <p className="mt-1 flex items-baseline gap-2">
          <span className="text-6xl font-bold tabular-nums tracking-tight text-navy-900">
            {result.indice}
          </span>
          <span className="text-lg font-medium text-navy-400">
            {copy.result.outOf}
          </span>
        </p>

        <p className="mt-4 inline-flex items-center rounded-full bg-navy-900 px-4 py-1.5 text-sm font-semibold text-white">
          {copy.levels[result.level]}
        </p>

        <p className="mt-5 text-[15px] leading-relaxed text-navy-700">
          {copy.verdicts[result.branch][result.level]}
        </p>

        {/* L'emplacement du benchmark reste réservé dans la maquette mais n'est
            plus affiché : la conclusion doit tenir en un indice, un niveau et
            une phrase. `BENCHMARK_ENABLED` le rouvrira le jour venu. */}
        {BENCHMARK_ENABLED ? (
          <p className="mt-4 rounded-xl border border-dashed border-navy-200 px-4 py-3 text-xs leading-relaxed text-navy-400">
            {copy.result.benchmarkPlaceholder}
          </p>
        ) : null}
      </section>

      <section aria-labelledby="diagnostic-leviers">
        <h2
          id="diagnostic-leviers"
          className="text-lg font-semibold text-navy-900"
        >
          {/* Le titre s'accorde au nombre réellement affiché : annoncer trois
              leviers quand un seul sort décrédibilise la restitution. */}
          {copy.result.leversTitleByCount[String(levers.length)] ??
            copy.result.leversTitle}
        </h2>
        <p className="mt-1 text-sm text-navy-500">
          {levers.length > 1
            ? copy.result.leversIntro
            : levers.length === 0
              ? copy.result.leversEmpty
              : null}
        </p>

        <ol className="mt-5 space-y-3">
          {levers.map((lever, index) => (
            <li
              key={lever}
              className="rounded-2xl border border-navy-200/60 bg-white p-5 shadow-premium"
            >
              {/* Le numéro reste dans le fil du titre : en colonne séparée, il
                  amputait le texte d'un tiers de la largeur sur mobile. */}
              <p className="font-semibold leading-snug text-navy-900">
                <span
                  aria-hidden="true"
                  className="mr-2.5 inline-flex h-6 w-6 shrink-0 translate-y-0.5 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700"
                >
                  {index + 1}
                </span>
                {copy.levers[lever].title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-navy-600">
                {copy.levers[lever].body}
              </p>
            </li>
          ))}
        </ol>

        {result.secondaryBranch ? (
          // Quatrième bloc court, visuellement distinct.
          <div className="mt-4 rounded-2xl border border-teal-200 bg-teal-50/50 p-5">
            <p className="font-semibold text-navy-900">
              {format(copy.result.secondaryTitle, {
                flow: copy.flows[result.secondaryBranch].alsoLabel,
              })}
            </p>
            {secondaryLever ? (
              <>
                <p className="mt-2 text-sm font-medium text-navy-800">
                  {copy.levers[secondaryLever].title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-navy-600">
                  {copy.levers[secondaryLever].body}
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm leading-relaxed text-navy-600">
                {copy.result.secondaryEmpty}
              </p>
            )}
          </div>
        ) : null}

        {result.otherFlows.length > 0 ? (
          <p className="mt-4 text-sm text-navy-500">
            {format(copy.result.otherFlows, {
              flows: result.otherFlows
                .map((flow) => copy.flows[flow].alsoLabel)
                .join(", "),
            })}
          </p>
        ) : null}
      </section>
    </div>
  );
}
