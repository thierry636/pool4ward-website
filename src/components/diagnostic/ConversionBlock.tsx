"use client";

import type { DiagnosticCopy } from "@/content/diagnostic/copy";
import type { OutcomeNoteId } from "@/content/diagnostic/scoring";
import type { DiagnosticResult } from "@/lib/diagnostic/types";

/**
 * Bandeau de conversion — le discours, pas l'action.
 *
 * L'action est le formulaire qui suit : contact, créneau souhaité et, pour un
 * profil camions complets, dépôt des ordres de transport. Ce bloc n'a donc plus
 * de bouton ni de lien : deux appels à l'action sur le même écran en font un de
 * trop.
 */
export function ConversionBlock({
  copy,
  result,
  onCtaClick,
}: {
  copy: DiagnosticCopy;
  result: DiagnosticResult;
  /** Suivi de l'affichage du bloc, pour mesurer le passage au formulaire. */
  onCtaClick: () => void;
}) {
  // Variante de discours quand la branche change ce qu'on vend.
  const base = copy.outcomes[result.outcome];
  const override = copy.outcomeByBranch[result.branch] ?? {};
  const outcome = { ...base, ...override };
  const notes = result.outcomeNotes as readonly OutcomeNoteId[];

  return (
    <section
      aria-labelledby="diagnostic-conversion"
      className="rounded-2xl bg-navy-900 p-6 text-white sm:p-8"
      onPointerEnter={onCtaClick}
    >
      <h2
        id="diagnostic-conversion"
        className="text-xl font-bold leading-snug sm:text-2xl"
      >
        {outcome.title}
      </h2>

      <p className="mt-3 text-[15px] leading-relaxed text-navy-300">
        {outcome.body}
      </p>

      {notes.map((note) => (
        <p
          key={note}
          className="mt-3 text-[15px] leading-relaxed text-navy-300"
        >
          {copy.outcomeNotes[note]}
        </p>
      ))}

      {outcome.details && outcome.details.length > 0 ? (
        <ul className="mt-5 flex flex-wrap gap-2">
          {outcome.details.map((detail) => (
            <li
              key={detail}
              className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-navy-100"
            >
              {detail}
            </li>
          ))}
        </ul>
      ) : null}

      {outcome.note ? (
        <p className="mt-4 text-xs leading-relaxed text-navy-400">
          {outcome.note}
        </p>
      ) : null}
    </section>
  );
}
