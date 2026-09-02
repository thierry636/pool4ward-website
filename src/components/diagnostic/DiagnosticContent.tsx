"use client";

import { useEffect, useRef } from "react";

import { format, getDiagnosticCopy } from "@/content/diagnostic/copy";
import { useDiagnostic } from "@/lib/diagnostic/useDiagnostic";
import { ConversionBlock } from "./ConversionBlock";
import { DiagnosticHeader } from "./DiagnosticHeader";
import { FlowChoice } from "./FlowChoice";
import { ContactForm } from "./ContactForm";
import { ProgressBar } from "./ProgressBar";
import { QuestionScreen } from "./QuestionScreen";
import { ResultScreen } from "./ResultScreen";

/**
 * Orchestration du parcours.
 *
 * Mobile d'abord : une colonne étroite, une action par écran, la navigation
 * ancrée en bas de l'écran là où le pouce l'atteint. Aucune chaîne affichable
 * n'est écrite ici — tout vient de l'objet i18n.
 */
export function DiagnosticContent({ locale }: { locale: string }) {
  const copy = getDiagnosticCopy(locale);
  const diagnostic = useDiagnostic(locale);
  const headingRef = useRef<HTMLDivElement>(null);

  const {
    screen,
    ranking,
    answers,
    current,
    result,
    step,
    totalSteps,
    submitState,
    submitError,
  } = diagnostic;

  // Un changement d'écran doit être annoncé : sans cela, un lecteur d'écran
  // reste sur le bouton qui vient d'être pressé.
  useEffect(() => {
    headingRef.current?.focus();
  }, [screen, current?.question.id]);

  const answered = current ? answers[current.question.id] !== undefined : false;
  const isLastQuestion = step >= totalSteps;

  return (
    // Bandeau sombre en haut de page : c'est la convention du site, et c'est ce
    // sur quoi l'en-tête fixe transparent est lisible.
    <div className="min-h-[100svh] bg-navy-900">
      <div className="mx-auto w-full max-w-xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
        <DiagnosticHeader homeLabel={copy.nav.home} />

        {/* Cible de focus au changement d'écran. */}
        <div ref={headingRef} tabIndex={-1} className="sr-only" aria-live="polite">
          {screen === "question" && current
            ? copy.questions[current.question.id].label
            : null}
        </div>

        {screen === "question" ? (
          <div className="mb-5">
            <ProgressBar
              step={step}
              total={totalSteps}
              label={format(copy.progress.label, {
                current: step,
                total: totalSteps,
              })}
              ariaLabel={copy.progress.ariaLabel}
            />
          </div>
        ) : null}

        <div className="rounded-2xl bg-white p-5 shadow-premium-lg sm:p-8">
          {/* ---------------------------------------------------------- */}
          {/* Écran 0 — accueil                                          */}
          {/* ---------------------------------------------------------- */}
          {screen === "intro" ? (
            <section className="flex min-h-[55svh] flex-col justify-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                {copy.intro.eyebrow}
              </p>
              <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-navy-900 sm:text-4xl">
                {copy.intro.title}
              </h1>
              <p className="mt-4 text-[15px] leading-relaxed text-navy-600">
                {copy.intro.subtitle}
              </p>

              <ul className="mt-8 space-y-2.5">
                {copy.intro.reassurance.map((line) => (
                  <li
                    key={line}
                    className="flex items-center gap-3 text-sm text-navy-700"
                  >
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500"
                    />
                    {line}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={diagnostic.start}
                className="mt-10 w-full rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 px-8 py-4 text-base font-semibold text-white shadow-md transition-all duration-200 hover:from-brand-700 hover:to-brand-800 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                {copy.intro.cta}
              </button>
            </section>
          ) : null}

          {/* ---------------------------------------------------------- */}
          {/* Écran 1 — classement                                       */}
          {/* ---------------------------------------------------------- */}
          {screen === "ranking" ? (
            <section className="flex min-h-[55svh] flex-col">
              <FlowChoice
                copy={copy}
                ranking={ranking}
                onSelect={diagnostic.selectFlow}
                onAdvance={diagnostic.submitRanking}
              />

              <NavBar
                backLabel={copy.nav.back}
                nextLabel={copy.nav.next}
                onBack={diagnostic.back}
                onNext={diagnostic.submitRanking}
                nextDisabled={ranking.length === 0}
              />
            </section>
          ) : null}

          {/* ---------------------------------------------------------- */}
          {/* Écrans 2 à 7 — une question par écran                      */}
          {/* ---------------------------------------------------------- */}
          {screen === "question" && current ? (
            <section className="flex min-h-[55svh] flex-col">
              <QuestionScreen
                copy={copy}
                served={current}
                value={answers[current.question.id]}
                onAnswer={(value) =>
                  diagnostic.answer(current.question.id, value)
                }
                onAdvance={diagnostic.next}
              />

              <NavBar
                backLabel={copy.nav.back}
                nextLabel={isLastQuestion ? copy.nav.seeResult : copy.nav.next}
                onBack={diagnostic.back}
                onNext={diagnostic.next}
                nextDisabled={!answered}
              />
            </section>
          ) : null}

          {/* ---------------------------------------------------------- */}
          {/* Écrans 8 à 10 — résultat, conversion, email                */}
          {/* ---------------------------------------------------------- */}
          {screen === "result" && result ? (
            <div className="space-y-8">
              <ResultScreen copy={copy} result={result} />

              <ConversionBlock
                copy={copy}
                result={result}
                onCtaClick={diagnostic.trackCta}
              />

              <ContactForm
                copy={copy}
                locale={locale}
                // Les ordres de transport n'ont de sens que là où la sortie
                // demande une matrice origine-destination.
                withFiles={result.outcome === "flux"}
                state={submitState}
                errorMessage={submitError}
                onSubmit={(lead, attachments) =>
                  diagnostic.submitLead(lead, attachments, {
                    network: copy.contact.errors.network,
                    notConfigured: copy.contact.errors.notConfigured,
                  })
                }
              />

              <div className="flex justify-center gap-6 pt-2">
                <button
                  type="button"
                  onClick={diagnostic.back}
                  className="text-sm text-navy-500 underline underline-offset-4 transition-colors hover:text-navy-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                  {copy.nav.back}
                </button>
                <button
                  type="button"
                  onClick={diagnostic.restart}
                  className="text-sm text-navy-500 underline underline-offset-4 transition-colors hover:text-navy-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                  {copy.nav.restart}
                </button>
              </div>
              </div>
            ) : null}
        </div>
      </div>
    </div>
  );
}

/**
 * Navigation ancrée en bas de colonne : le pouce y arrive sans repositionner
 * la main. Le retour arrière est toujours disponible, les réponses conservées.
 */
function NavBar({
  backLabel,
  nextLabel,
  onBack,
  onNext,
  nextDisabled,
}: {
  backLabel: string;
  nextLabel: string;
  onBack: () => void;
  onNext: () => void;
  nextDisabled: boolean;
}) {
  return (
    <div className="mt-auto flex items-center gap-3 pt-10">
      <button
        type="button"
        onClick={onBack}
        className="rounded-lg px-4 py-3 text-sm font-medium text-navy-500 transition-colors hover:bg-navy-100 hover:text-navy-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        {backLabel}
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="ml-auto rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 px-8 py-3.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-brand-700 hover:to-brand-800 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:from-navy-300 disabled:to-navy-300 disabled:shadow-none"
      >
        {nextLabel}
      </button>
    </div>
  );
}
