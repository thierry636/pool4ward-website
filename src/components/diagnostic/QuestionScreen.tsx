"use client";

import type { DiagnosticCopy } from "@/content/diagnostic/copy";
import type { OptionValue, ServedQuestion } from "@/lib/diagnostic/types";

/**
 * Une question par écran, pas de scroll.
 *
 * Les options sont un `radiogroup` natif : `fieldset` + `legend` + `input
 * type="radio"`. La navigation clavier, le regroupement et l'annonce du libellé
 * sont assurés par le navigateur — pas par une réimplémentation ARIA.
 *
 * Le clic à la souris ou au doigt fait avancer l'écran ; la navigation aux
 * flèches ne l'avance pas, pour laisser parcourir les options sans les valider.
 */
export function QuestionScreen({
  copy,
  served,
  value,
  onAnswer,
  onAdvance,
}: {
  copy: DiagnosticCopy;
  served: ServedQuestion;
  value: OptionValue | undefined;
  onAnswer: (value: OptionValue) => void;
  onAdvance: () => void;
}) {
  const question = served.question;
  const questionCopy = copy.questions[question.id];

  return (
    <fieldset className="min-w-0">
      <legend className="text-xl font-semibold leading-snug text-navy-900 sm:text-2xl">
        {questionCopy.label}
      </legend>

      {questionCopy.help ? (
        <p className="mt-2 text-sm leading-relaxed text-navy-500">
          {questionCopy.help}
        </p>
      ) : null}

      <div className="mt-6 space-y-2.5">
        {question.options.map((option) => {
          const checked = value === option.value;
          const id = `${question.id}-${option.value}`;

          return (
            <label
              key={option.value}
              htmlFor={id}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all duration-150 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500 has-[:focus-visible]:ring-offset-2 ${
                checked
                  ? "border-brand-500 bg-brand-50/60"
                  : "border-navy-200 bg-white hover:border-navy-300 hover:bg-navy-50/60"
              }`}
              onClick={(event) => {
                // `detail === 0` signale un clic déclenché au clavier : on laisse
                // alors le répondant valider lui-même avec « Continuer ».
                if (event.detail === 0) return;
                window.setTimeout(onAdvance, 180);
              }}
            >
              <input
                type="radio"
                id={id}
                name={question.id}
                value={option.value}
                checked={checked}
                onChange={() => onAnswer(option.value)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-brand-600 focus:outline-none"
              />
              <span className="text-[15px] leading-snug text-navy-800">
                {questionCopy.options[option.value]}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
