"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { CAPACITES } from "@/content/capabilities";

/**
 * Les cinq capacités en une ligne continue. À gauche la chaîne, à droite la
 * capacité ouverte ; sur téléphone, chaque capacité s'ouvre sous son titre.
 */
export function CapabilityExplorer() {
  const t = useTranslations("Capabilities");
  const [active, setActive] = useState(0);

  const detail = (i: number) => {
    const c = CAPACITES[i];
    const verbs = t.raw(`${c.id}.verbs`) as string[];
    const covers = t.raw(`${c.id}.covers`) as string[];
    return (
      <div>
        <p className="eyebrow">{t("decision")}</p>
        <p className="display mt-3 text-[clamp(1.6rem,3vw,2.5rem)]">{t(`${c.id}.question`)}</p>
        <p className="lede mt-5">{t(`${c.id}.summary`)}</p>

        <ul className="mono mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[0.76rem] uppercase tracking-[0.1em]">
          {verbs.map((v) => (
            <li key={v} className="flex items-center gap-2">
              <span aria-hidden="true" style={{ color: "var(--warm)" }}>◆</span>
              {v}
            </li>
          ))}
        </ul>

        <ul className="mt-6 space-y-3 text-[0.97rem] leading-relaxed" style={{ color: "var(--fg-2)" }}>
          {covers.slice(0, 2).map((line) => (
            <li key={line} className="flex gap-3">
              <span aria-hidden="true" style={{ color: "var(--warm)" }}>—</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>

        <Link href={`/solutions/${c.slug}`} className="btn btn-line mt-8">
          {t("open")} <span aria-hidden="true">→</span>
        </Link>
      </div>
    );
  };

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
      <ol className="relative">
        <span aria-hidden="true" className="absolute bottom-6 left-[0.95rem] top-6 w-px" style={{ background: "var(--rule-strong)" }} />
        {CAPACITES.map((c, i) => {
          const open = i === active;
          return (
            <li key={c.id} className="relative">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-expanded={open}
                aria-controls={`cap-panel-${c.id}`}
                className="flex min-h-[4.25rem] w-full items-center gap-5 py-3 text-left transition-opacity"
                style={{ color: open ? "var(--fg)" : "var(--fg-2)" }}
              >
                <span
                  aria-hidden="true"
                  className="mono relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full text-[0.74rem]"
                  style={{
                    background: open ? "var(--warm)" : "var(--bg)",
                    color: open ? "var(--bg)" : "var(--fg)",
                    border: "1px solid var(--rule-strong)",
                  }}
                >
                  {i + 1}
                </span>
                <span className="h3 !text-[1.35rem] sm:!text-[1.6rem]">{t(`${c.id}.name`)}</span>
              </button>
              <div
                id={`cap-panel-${c.id}`}
                hidden={!open}
                className="pb-8 pl-[3.25rem] lg:hidden"
              >
                {open && detail(i)}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="hidden lg:block" role="region" aria-live="polite" aria-label={t(`${CAPACITES[active].id}.name`)}>
        <div key={CAPACITES[active].id} className="cap-fade">{detail(active)}</div>
      </div>
    </div>
  );
}
