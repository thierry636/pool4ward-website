"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { CAPACITES } from "@/content/capabilities";
import { Icon } from "@/components/ui/Icon";

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
        <p className="display mt-4 text-[clamp(1.5rem,2.6vw,2.2rem)]">{t(`${c.id}.question`)}</p>
        <p className="lede mt-4 !text-[1.02rem]">{t(`${c.id}.summary`)}</p>

        <ul className="mt-5 flex flex-wrap gap-2">
          {verbs.map((v) => (
            <li key={v} className="pill">
              {v}
            </li>
          ))}
        </ul>

        <ul className="mt-6 space-y-3 text-[0.96rem] leading-relaxed" style={{ color: "var(--fg-2)" }}>
          {covers.slice(0, 2).map((line) => (
            <li key={line} className="flex gap-3">
              <span aria-hidden="true" className="mt-1 shrink-0" style={{ color: "var(--warm)" }}>
                <Icon name="check" size={16} />
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ul>

        <Link href={`/solutions/${c.slug}`} className="btn btn-solid mt-8">
          {t("open")} <Icon name="arrow" size={17} />
        </Link>
      </div>
    );
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-12">
      <ol className="relative space-y-2">
        <span aria-hidden="true" className="absolute bottom-8 left-[1.9rem] top-8 w-px" style={{ background: "var(--rule-strong)" }} />
        {CAPACITES.map((c, i) => {
          const open = i === active;
          return (
            <li key={c.id} className="relative">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-expanded={open}
                aria-controls={`cap-panel-${c.id}`}
                className="relative flex min-h-[4.25rem] w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left transition"
                style={{
                  color: open ? "var(--fg)" : "var(--fg-2)",
                  borderColor: open ? "rgb(116 143 252 / 0.55)" : "transparent",
                  background: open ? "rgb(66 99 235 / 0.14)" : "transparent",
                }}
              >
                <span className="tile-icon relative z-10" style={open ? { background: "#4263eb", color: "#fff" } : { background: "#0b1224", boxShadow: "inset 0 0 0 1px var(--rule-strong)" }}>
                  <Icon name={c.id} />
                </span>
                <span className="text-[1.12rem] font-semibold tracking-tight sm:text-[1.25rem]">{t(`${c.id}.name`)}</span>
              </button>
              <div id={`cap-panel-${c.id}`} hidden={!open} className="px-2 pb-6 pt-4 lg:hidden">
                {open && detail(i)}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="hidden rounded-3xl border p-8 lg:block xl:p-10" style={{ borderColor: "var(--rule)", background: "var(--card)", boxShadow: "var(--shadow)" }} role="region" aria-live="polite" aria-label={t(`${CAPACITES[active].id}.name`)}>
        <div key={CAPACITES[active].id} className="cap-fade">{detail(active)}</div>
      </div>
    </div>
  );
}
