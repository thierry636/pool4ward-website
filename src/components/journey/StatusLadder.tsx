"use client";

import { useTranslations } from "next-intl";
import { STATUSES, statusIndex, type Status } from "@/content/journey/state";

/**
 * Les cinq niveaux de connaissance : référencé, détecté, étudié, confirmé,
 * contractualisé. Ils ne se confondent pas — un transporteur présent dans un
 * référentiel n'est pas un transporteur dont les camions sont disponibles — et
 * ils reviennent partout sur le site avec les mêmes mots.
 */
export function StatusLadder({ current, compact = false }: { current: Status; compact?: boolean }) {
  const t = useTranslations("Journey");
  const idx = statusIndex(current);

  return (
    <div>
      <p className="eyebrow mb-3">{t("ladderLabel")}</p>
      <ol className="grid grid-cols-5 gap-1.5" aria-label={t("ladderLabel")}>
        {STATUSES.map((s, i) => {
          const reached = i <= idx;
          const here = i === idx;
          return (
            <li key={s} aria-current={here ? "step" : undefined}>
              <span
                aria-hidden="true"
                className="block h-[3px] w-full transition-colors duration-500"
                style={{ background: reached ? "var(--warm)" : "var(--rule)" }}
              />
              <span
                className="mono mt-2 block text-[0.62rem] uppercase leading-tight tracking-[0.06em] sm:text-[0.68rem]"
                style={{ color: reached ? "var(--fg)" : "var(--fg-2)", fontWeight: here ? 700 : 400 }}
              >
                {t(`status.${s}.name`)}
              </span>
            </li>
          );
        })}
      </ol>
      {!compact && (
        <p className="mt-3 text-[0.9rem] leading-relaxed" style={{ color: "var(--fg-2)" }} aria-live="polite">
          <strong style={{ color: "var(--fg)" }}>{t(`status.${current}.name`)}</strong> — {t(`status.${current}.body`)}
        </p>
      )}
    </div>
  );
}
