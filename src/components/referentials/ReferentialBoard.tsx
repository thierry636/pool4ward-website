"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { Icon, type IconName } from "@/components/ui/Icon";
import { CARRIERS, CHARGERS, SERVICES, SHORTSEA } from "@/content/referentials";
import { LAYER_IDS, type LayerId } from "@/lib/levers/layers";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { useFmt } from "./blocks";
import { PANELS } from "./panels";
import "./referentials.css";

/**
 * La planche des référentiels : un menu à gauche (au-dessus, sous forme de pastilles, sur mobile) et,
 * à droite, la fiche du référentiel choisi — chiffres, carte animée, détail d'un enregistrement.
 * Le défilement est automatique tant que la planche est à l'écran ; il s'arrête dès qu'on la survole,
 * qu'on y met le focus ou qu'on choisit soi-même un référentiel, et sous « mouvement réduit ».
 */

const ICON: Record<LayerId, IconName> = {
  services: "intermodal",
  shortsea: "ship",
  networks: "rails",
  chargers: "energy",
  parkings: "parking",
  carriers: "truck",
};

/** Le groupe qui ouvre chaque série du menu. */
const GROUP_OF: Record<LayerId, "services" | "networks" | "sites"> = {
  services: "services",
  shortsea: "services",
  networks: "networks",
  chargers: "sites",
  parkings: "sites",
  carriers: "sites",
};

/** Avant l'hydratation le panneau est visible (sans script, tout s'affiche) ; ensuite il attend d'entrer à l'écran. */
type Phase = "ssr" | "pending" | "live";

function Chevron({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={dir === "prev" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

function PlayPause({ playing }: { playing: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      {playing ? <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /> : <path d="M8 5.5v13l11-6.5z" />}
    </svg>
  );
}

export function ReferentialBoard() {
  const t = useTranslations("Home.referentials");
  const fmt = useFmt();
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const list = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  const [active, setActive] = useState(0);
  const [phase, setPhase] = useState<Phase>("ssr");
  const [epoch, setEpoch] = useState(0);
  const [inView, setInView] = useState(false);
  const [autoPref, setAutoPref] = useState(true);
  const [hover, setHover] = useState(false);
  const [focusIn, setFocusIn] = useState(false);
  /** Remet la barre de progression à zéro quand on revient sur le même référentiel. */
  const [tick, setTick] = useState(0);

  const auto = autoPref && !reduced;
  const playing = auto && inView && !hover && !focusIn && phase === "live";
  const n = LAYER_IDS.length;
  const id = LAYER_IDS[active];

  /* La planche attend d'entrer à l'écran pour jouer ses animations ; sans mouvement, elle s'affiche d'emblée. */
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (reduced) {
      setPhase("live");
      return;
    }
    setPhase((p) => (p === "ssr" ? "pending" : p));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          /* « assez visible » : une part de la planche, ou la moitié de l'écran quand la planche est plus haute que lui. */
          const share = e.isIntersecting ? Math.max(e.intersectionRatio, e.intersectionRect.height / window.innerHeight) : 0;
          setInView(share >= 0.1);
          if (share >= 0.3 && !started.current) {
            started.current = true;
            setEpoch((x) => x + 1);
            setPhase("live");
          }
        }
      },
      { threshold: [0, 0.1, 0.3, 0.5] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  /* Sur mobile le menu défile de côté : le référentiel affiché y reste visible, sans jamais faire défiler la page. */
  useEffect(() => {
    const box = list.current;
    const tab = tabs.current[active];
    if (!box || !tab || box.scrollWidth <= box.clientWidth) return;
    const t = tab.getBoundingClientRect();
    const b = box.getBoundingClientRect();
    box.scrollBy({ left: t.left - b.left - (b.width - t.width) / 2, behavior: reduced ? "auto" : "smooth" });
  }, [active, reduced]);

  const go = useCallback(
    (to: number) => {
      setActive(((to % n) + n) % n);
      setTick((x) => x + 1);
    },
    [n],
  );

  const choose = (to: number, focus = false) => {
    setAutoPref(false);
    go(to);
    if (focus) tabs.current[((to % n) + n) % n]?.focus();
  };

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const next: Record<string, number> = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: n - 1 };
    if (e.key in next) {
      e.preventDefault();
      choose(next[e.key], true);
    }
  };

  const Panel = PANELS[id];
  /* Les nombres du sous-titre de chaque entrée (les messages n'en portent aucun). */
  const subOf = (l: LayerId) =>
    t(`items.${l}.sub`, {
      n: fmt(l === "services" ? SERVICES.total : SHORTSEA.total),
      sites: fmt(CHARGERS.sites),
      chargers: fmt(CHARGERS.chargers),
      carriers: fmt(CARRIERS.carriers),
    });

  return (
    <div
      ref={root}
      className="rb"
      data-pending={phase === "pending" ? "true" : "false"}
      data-playing={playing ? "true" : "false"}
      data-auto={auto ? "true" : "false"}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={(e) => {
        /* Seul le focus au clavier met la lecture en pause : un clic de souris sur un bouton ne doit pas la figer. */
        setFocusIn(e.target.matches(":focus-visible"));
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocusIn(false);
      }}
    >
      <div className="rb-window">
        <nav className="rb-menu" aria-label={t("menu.label")}>
          <div ref={list} className="rb-list" role="tablist" aria-label={t("menu.label")} aria-orientation="vertical">
            {LAYER_IDS.map((l, i) => (
              <div key={l} className="rb-entry" role="presentation">
                {(i === 0 || GROUP_OF[l] !== GROUP_OF[LAYER_IDS[i - 1]]) && (
                  <p className="rb-group" aria-hidden="true">
                    {t(`menu.groups.${GROUP_OF[l]}`)}
                  </p>
                )}
                <button
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  id={`rb-tab-${l}`}
                  type="button"
                  role="tab"
                  className="rb-item"
                  aria-selected={i === active}
                  aria-controls="rb-panel"
                  tabIndex={i === active ? 0 : -1}
                  onClick={() => choose(i)}
                  onKeyDown={(e) => onKey(e, i)}
                >
                  <span className="rb-ic">
                    <Icon name={ICON[l]} size={18} />
                  </span>
                  <span className="rb-tx">
                    <b>{t(`items.${l}.name`)}</b>
                    <small>{subOf(l)}</small>
                  </span>
                  {i === active && <span key={`${l}-${epoch}-${tick}`} className="rb-bar" aria-hidden="true" onAnimationEnd={(e) => e.animationName === "rb-progress" && go(active + 1)} />}
                </button>
              </div>
            ))}
          </div>
          <div className="rb-ctl">
            <div className="rb-dots" aria-hidden="true">
              {LAYER_IDS.map((l, i) => (
                <i key={l} data-on={i === active} />
              ))}
            </div>
            <div className="rb-btns">
              <button type="button" className="rb-btn" onClick={() => choose(active - 1)} aria-label={t("controls.prev")}>
                <Chevron dir="prev" />
              </button>
              <button type="button" className="rb-btn" onClick={() => {
                  setAutoPref((a) => !a);
                  /* Relancer la lecture doit la relancer même si la souris est encore sur la planche. */
                  setHover(false);
                }} aria-label={auto ? t("controls.pause") : t("controls.play")} aria-pressed={auto} disabled={reduced}>
                <PlayPause playing={auto} />
              </button>
              <button type="button" className="rb-btn" onClick={() => choose(active + 1)} aria-label={t("controls.next")}>
                <Chevron dir="next" />
              </button>
            </div>
          </div>
          <p className="sr-only" aria-live={auto ? "off" : "polite"}>
            {t("controls.position", { n: active + 1, total: n })}
          </p>
        </nav>

        <div id="rb-panel" role="tabpanel" aria-labelledby={`rb-tab-${id}`} className="rb-stage" aria-live={auto ? "off" : "polite"}>
          <div key={`${id}-${epoch}`} className="rb-panel">
            <Panel animate={phase === "live" && !reduced} />
          </div>
        </div>
      </div>
    </div>
  );
}
