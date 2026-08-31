"use client";

import type { DiagnosticCopy } from "@/content/diagnostic/copy";
import {
  isExternalHref,
  OUTCOME_HREF,
} from "@/content/diagnostic/destinations";
import type { OutcomeNoteId } from "@/content/diagnostic/scoring";
import type { DiagnosticResult, OutcomeId } from "@/lib/diagnostic/types";
import { Link } from "@/i18n/routing";

/**
 * Écran 9 — le bloc de conversion.
 *
 * Le CTA principal est routé par `ranking[0]`, jamais par l'indice. L'autre
 * sortie reste accessible en lien secondaire discret : personne ne doit se
 * sentir aiguillé.
 */
export function ConversionBlock({
  copy,
  result,
  onCtaClick,
}: {
  copy: DiagnosticCopy;
  result: DiagnosticResult;
  onCtaClick: () => void;
}) {
  // Variante de discours quand la branche change ce qu'on vend.
  const base = copy.outcomes[result.outcome];
  const override = copy.outcomeByBranch[result.branch] ?? {};
  const outcome = { ...base, ...override };

  const href = OUTCOME_HREF[result.outcome];
  const alternateHref = OUTCOME_HREF[result.alternateOutcome];

  const notes = result.outcomeNotes as readonly OutcomeNoteId[];

  return (
    <section
      aria-labelledby="diagnostic-conversion"
      className="rounded-2xl bg-navy-900 p-6 text-white sm:p-8"
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

      <div className="mt-7 space-y-4">
        <OutcomeLink
          href={href}
          onClick={onCtaClick}
          className="inline-flex w-full items-center justify-center rounded-lg bg-white px-8 py-4 text-base font-semibold text-navy-900 shadow-md transition-all duration-200 hover:bg-navy-50 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900 sm:w-auto"
        >
          {outcome.cta}
        </OutcomeLink>

        <OutcomeLink
          href={alternateHref}
          onClick={onCtaClick}
          className="block text-sm text-navy-400 underline underline-offset-4 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
        >
          {outcome.alternate}
        </OutcomeLink>
      </div>
    </section>
  );
}

function OutcomeLink({
  href,
  onClick,
  className,
  children,
}: {
  href: string;
  onClick: () => void;
  className: string;
  children: React.ReactNode;
}) {
  if (isExternalHref(href)) {
    return (
      <a href={href} onClick={onClick} className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href as "/"} onClick={onClick} className={className}>
      {children}
    </Link>
  );
}

export type { OutcomeId };
