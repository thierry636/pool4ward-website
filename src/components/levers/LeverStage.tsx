"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { LEVER_COLOR, LEVER_ORDER, type LeverId } from "@/lib/levers/data";
import { forcesGlobe, isSoftwareRenderer, preferLightweight, supportsWebGL } from "@/components/showcase/support";
import { LeverFlat } from "./LeverFlat";
import { LeverIcon } from "./icons";
import { LeverCard } from "./LeverCard";
import { EUROPE_SERVICES_COUNT, SHORTSEA_SERVICES_COUNT } from "@/content/figures";
import type { Rect } from "./LeverGlobe";

/** MapLibre pèse ≈ 250 Ko : il n'est téléchargé que si l'appareil sait afficher le globe. */
const LeverGlobe = dynamic(() => import("./LeverGlobe").then((m) => m.LeverGlobe), { ssr: false });

type Renderer = "pending" | "globe" | "flat";

/** Après un choix manuel, le levier se joue puis reste affiché ; sans nouveau geste, la lecture reprend après ce délai. */
const IDLE_RESUME_MS = 20_000;

const NO_PAD = { left: 0, right: 0, top: 0, bottom: 0 };

/**
 * La scène des leviers de la page de garde : une carte (globe 3D, ou carte à plat sans
 * WebGL) qui joue les six leviers l'un après l'autre sur une même région, et le bandeau qui
 * les liste. Elle se place dans la section de la couverture, derrière le texte sur grand
 * écran, sous le texte sur téléphone. Fragment : le conteneur parent est un flex en colonne.
 */
export function LeverStage() {
  const t = useTranslations("Home.levers");
  const locale = useLocale() === "en" ? "en" : "fr";
  // Espace insécable ordinaire entre milliers : la fine de la locale française se voit à peine.
  const fmt = (n: number) => new Intl.NumberFormat(locale).format(n).replace(/\u202f/g, "\u00a0");
  const counts: Partial<Record<LeverId, string>> = { rail: fmt(EUROPE_SERVICES_COUNT), shortsea: fmt(SHORTSEA_SERVICES_COUNT) };
  const reduced = usePrefersReducedMotion();

  const [renderer, setRenderer] = useState<Renderer>("pending");
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [pad, setPad] = useState(NO_PAD);
  const [mobile, setMobile] = useState(false);
  const mapEl = useRef<HTMLDivElement>(null);
  const dockEl = useRef<HTMLDivElement>(null);
  const reserved = useRef<Rect[]>([]);
  const progress = useRef(0);
  const bars = useRef<(HTMLSpanElement | null)[]>([]);
  const cardBar = useRef<HTMLSpanElement>(null);
  const cardSlot = useRef<HTMLDivElement>(null);
  const playingRef = useRef(false);
  const reducedRef = useRef(false);
  playingRef.current = playing;
  reducedRef.current = reduced;

  /* Mesure du texte et du bandeau : la région se centre dans l'espace libre, les étiquettes les évitent. */
  useEffect(() => {
    const map = mapEl.current;
    const dock = dockEl.current;
    const section = map?.parentElement;
    if (!map || !dock || !section) return;
    const measure = () => {
      const text = section.querySelector<HTMLElement>("[data-cover-text]");
      const m = map.getBoundingClientRect();
      if (!text || m.width === 0) return;
      const wide = window.matchMedia("(min-width: 1024px)").matches;
      setMobile(window.innerWidth < 768);
      if (!wide) {
        reserved.current = [];
        setPad((p) => (p.left === 8 && p.right === 8 && p.top === 12 && p.bottom === 12 ? p : { left: 8, right: 8, top: 12, bottom: 12 }));
        return;
      }
      const tr = text.getBoundingClientRect();
      const dr = dock.getBoundingClientRect();
      const left = Math.round(Math.min(tr.right - m.left + 24, m.width * 0.58));
      const bottom = Math.round(m.bottom - dr.top + 10);
      const top = 92;
      const cr = cardSlot.current?.getBoundingClientRect();
      reserved.current = [
        { x: tr.left - m.left - 8, y: tr.top - m.top - 8, w: tr.width + 16, h: tr.height + 16 },
        { x: dr.left - m.left, y: dr.top - m.top - 6, w: dr.width, h: dr.height + 6 },
        { x: 0, y: 0, w: m.width, h: 70 },
        ...(cr ? [{ x: cr.left - m.left - 8, y: cr.top - m.top - 8, w: cr.width + 16, h: cr.height + 16 }] : []),
      ];
      setPad((p) => (p.left === left && p.bottom === bottom && p.top === top && p.right === 28 ? p : { left, right: 28, top, bottom }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(section);
    ro.observe(dock);
    if (cardSlot.current) ro.observe(cardSlot.current);
    const text = section.querySelector("[data-cover-text]");
    if (text) ro.observe(text);
    return () => ro.disconnect();
  }, []);

  /* Le rendu se décide après le chargement de la page, pour ne rien prendre au premier affichage. */
  useEffect(() => {
    let timer = 0;
    const decide = () => {
      if (forcesGlobe()) setRenderer("globe");
      else if (!supportsWebGL() || isSoftwareRenderer() || preferLightweight()) setRenderer("flat");
      else setRenderer("globe");
      setPlaying(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    };
    const later = () => {
      timer = window.setTimeout(decide, 200);
    };
    if (document.readyState === "complete") later();
    else window.addEventListener("load", later, { once: true });
    return () => {
      window.removeEventListener("load", later);
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (reduced) setPlaying(false);
  }, [reduced]);

  /* Barre de progression du levier en cours (écrite directement, sans repasser par React) ; la lecture
     reprend d'elle-même quand un levier choisi est terminé et que personne n'a rien touché depuis. */
  useEffect(() => {
    let raf = 0;
    let doneAt: number | null = null;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      bars.current.forEach((b, i) => {
        if (b) b.style.transform = `scaleX(${i === active ? progress.current : 0})`;
      });
      if (cardBar.current) cardBar.current.style.transform = `scaleX(${progress.current})`;
      if (!playingRef.current && !reducedRef.current && progress.current >= 1) {
        doneAt ??= now;
        if (now - doneAt > IDLE_RESUME_MS) {
          doneAt = null;
          setPlaying(true);
        }
      } else doneAt = null;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  const advance = useCallback(() => {
    progress.current = 0;
    setActive((a) => (a + 1) % LEVER_ORDER.length);
  }, []);
  const fatal = useCallback(() => setRenderer("flat"), []);
  const onReady = useCallback(() => setReady(true), []);
  const noop = useCallback(() => {}, []);
  const pick = (i: number) => {
    // Un choix manuel arrête le défilement : le levier se joue une fois, puis reste affiché.
    setPlaying(false);
    progress.current = 0;
    setActive(i);
  };

  const lever = LEVER_ORDER[active];
  const name = t(`items.${lever}.name`);
  const label = t("mapLabel", { lever: name });

  return (
    <>
      {/* La carte : fond de la couverture sur grand écran, bloc sous le texte sur téléphone. */}
      <div ref={mapEl} className="lever-map relative h-[25rem] overflow-hidden sm:h-[31rem] lg:absolute lg:inset-0 lg:-z-10 lg:h-auto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/levers-poster.svg"
          alt=""
          aria-hidden="true"
          width={1600}
          height={900}
          decoding="async"
          fetchPriority="low"
          className="absolute inset-0 h-full w-full object-cover object-[62%_50%] transition-opacity duration-700"
          style={{ opacity: ready ? 0 : 1 }}
        />
        {renderer === "globe" && (
          <div className="absolute inset-0">
            <LeverGlobe
              levers={LEVER_ORDER}
              active={active}
              playing={playing}
              reducedMotion={reduced}
              mobile={mobile}
              locale={locale}
              ariaLabel={label}
              pad={pad}
              reserved={reserved}
              progress={progress}
              onAdvance={advance}
              onShown={noop}
              onFatal={fatal}
              onReady={onReady}
            />
          </div>
        )}
        {renderer === "flat" && (
          <div className="absolute inset-0">
            <LeverFlat
              levers={LEVER_ORDER}
              active={active}
              playing={playing}
              reducedMotion={reduced}
              locale={locale}
              ariaLabel={label}
              pad={pad}
              reserved={reserved}
              progress={progress}
              onAdvance={advance}
              onShown={noop}
              onReady={onReady}
            />
          </div>
        )}
        {/* Fondu vers le texte et vers la section suivante. */}
        <div aria-hidden="true" className="lever-fade-x pointer-events-none absolute inset-0 hidden lg:block" />
        <div aria-hidden="true" className="lever-fade-y pointer-events-none absolute inset-0" />
      </div>

      {/* Sous l'image : les six leviers, de simples pastilles ; à droite, la carte du levier affiché
          (au-dessus des pastilles sur téléphone). */}
      <div ref={dockEl} className="wrap relative z-10 flex flex-col pb-5 pt-4 lg:pb-7 lg:pt-2">
        <ol className="flex flex-wrap gap-2 lg:max-w-[calc(100%-20.5rem)]" aria-label={t("listLabel")}>
          {LEVER_ORDER.map((id, i) => (
            <li key={id}>
              <button type="button" className="lever-chip" aria-pressed={i === active} onClick={() => pick(i)} style={{ ["--c" as string]: LEVER_COLOR[id] }}>
                <LeverIcon id={id} size={17} />
                <span>{t(`items.${id}.name`)}</span>
                <span
                  aria-hidden="true"
                  ref={(el) => {
                    bars.current[i] = el;
                  }}
                  className="lever-bar"
                />
              </button>
            </li>
          ))}
        </ol>
        <div ref={cardSlot} className="max-lg:order-first max-lg:mb-4 lg:absolute lg:bottom-7 lg:right-10 lg:w-[19rem]">
          <LeverCard
            key={lever}
            lever={lever}
            figure={counts[lever]}
            head={counts[lever] ? undefined : t(`items.${lever}.card.head`)}
            label={t(`items.${lever}.card.label`)}
            note={t("note")}
            ariaLabel={t("legendLabel")}
            barRef={cardBar}
          />
        </div>
      </div>
    </>
  );
}
