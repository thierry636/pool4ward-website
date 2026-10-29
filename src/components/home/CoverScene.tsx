"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Board } from "@/components/journey/Board";
import { INITIAL_STATE, type JourneyState } from "@/content/journey/state";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

const SEEN = "p4w-cover-seen";

/** Le plateau de couverture : l'état « terrain » complet, plus un curseur. */
const COVER_STATE: JourneyState = { ...INITIAL_STATE, stage: 2, layer: 5, scenario: "loop", slotE: "early" };

/**
 * Scène de couverture. Les flux, d'abord séparés, s'enchaînent en une boucle.
 *
 * - Rien ne bloque la page : le texte et les appels à l'action sont déjà là.
 * - Le mouvement n'est joué qu'à la première visite d'une session, jamais sous
 *   « mouvement réduit », et le curseur permet de le rejouer ou de le défaire.
 * - Le plateau est une illustration : il le dit, en dessous.
 */
export function CoverScene() {
  const t = useTranslations("Home.cover");
  const reduced = usePrefersReducedMotion();
  const [p, setP] = useState(0);
  const [instant, setInstant] = useState(true);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN) === "1";
    } catch {
      /* stockage indisponible : on joue comme à la première visite */
    }

    if (reduced || seen) {
      setInstant(true);
      setP(1);
      return;
    }

    setInstant(false);
    const id = window.setTimeout(() => {
      setP(1);
      try {
        sessionStorage.setItem(SEEN, "1");
      } catch {
        /* sans effet */
      }
    }, 1100);
    return () => window.clearTimeout(id);
  }, [reduced]);

  return (
    <figure className="m-0">
      <div className={`lg:-mr-10 xl:-mr-24 ${instant || dragging ? "board-still" : ""}`}>
        <Board state={COVER_STATE} tone="dark" cover={p} label={t("boardLabel")} />
      </div>
      <figcaption className="mt-4">
        <div className="flex items-center gap-4">
          <span className="mono hidden shrink-0 text-[0.72rem] uppercase tracking-[0.12em] sm:block" style={{ color: "var(--fg-2)" }}>
            {t("sliderMin")}
          </span>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(p * 100)}
            aria-label={t("sliderLabel")}
            aria-valuetext={p > 0.5 ? t("sliderMax") : t("sliderMin")}
            onChange={(e) => {
              setDragging(true);
              setP(Number(e.target.value) / 100);
            }}
            onPointerUp={() => setDragging(false)}
            onKeyUp={() => setDragging(false)}
            onBlur={() => setDragging(false)}
            className="cover-range h-11 w-full cursor-pointer"
          />
          <span className="mono hidden shrink-0 text-right text-[0.72rem] uppercase tracking-[0.12em] sm:block" style={{ color: "var(--warm)" }}>
            {t("sliderMax")}
          </span>
        </div>
        <p className="mono mt-1 text-[0.72rem] sm:text-center" style={{ color: "var(--fg-2)" }}>
          {t("demoNote")}
        </p>
      </figcaption>
    </figure>
  );
}
