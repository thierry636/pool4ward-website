"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { LEVER_ORDER } from "@/lib/levers/data";
import { forcesGlobe, isSoftwareRenderer, preferLightweight, supportsWebGL } from "@/components/showcase/support";
import { LeverFlat } from "./LeverFlat";
import type { Rect } from "./LeverGlobe";

/** MapLibre pèse ≈ 250 Ko : il n'est téléchargé que si l'appareil sait afficher le globe. */
const LeverGlobe = dynamic(() => import("./LeverGlobe").then((m) => m.LeverGlobe), { ssr: false });

type Renderer = "pending" | "globe" | "flat";

const NO_PAD = { left: 0, right: 0, top: 0, bottom: 0 };

/**
 * La scène des leviers de la page de garde : une carte (globe 3D, ou carte à plat sans WebGL)
 * qui joue les six leviers l'un après l'autre sur toute l'Europe, et rien d'autre — ni texte, ni
 * menu, ni lien. Elle se place dans la section de la couverture, derrière le texte sur grand
 * écran, sous le texte sur téléphone. Fragment : le conteneur parent est un flex en colonne.
 * Sous « mouvement réduit », il n'y a pas de lecture : le premier levier s'affiche terminé.
 */
export function LeverStage() {
  const t = useTranslations("Home.levers");
  const locale = useLocale() === "en" ? "en" : "fr";
  const reduced = usePrefersReducedMotion();

  const [renderer, setRenderer] = useState<Renderer>("pending");
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [pad, setPad] = useState(NO_PAD);
  const [mobile, setMobile] = useState(false);
  const mapEl = useRef<HTMLDivElement>(null);
  const reserved = useRef<Rect[]>([]);
  const progress = useRef(0);

  /* Mesure du texte : la région se centre dans l'espace libre, les étiquettes l'évitent. */
  useEffect(() => {
    const map = mapEl.current;
    const section = map?.parentElement;
    if (!map || !section) return;
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
      const left = Math.round(Math.min(tr.right - m.left + 24, m.width * 0.58));
      const top = 92;
      reserved.current = [
        { x: tr.left - m.left - 8, y: tr.top - m.top - 8, w: tr.width + 16, h: tr.height + 16 },
        { x: 0, y: 0, w: m.width, h: 70 },
      ];
      setPad((p) => (p.left === left && p.bottom === 40 && p.top === top && p.right === 28 ? p : { left, right: 28, top, bottom: 40 }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(section);
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

  const advance = useCallback(() => {
    progress.current = 0;
    setActive((a) => (a + 1) % LEVER_ORDER.length);
  }, []);
  const fatal = useCallback(() => setRenderer("flat"), []);
  const onReady = useCallback(() => setReady(true), []);
  const noop = useCallback(() => {}, []);

  const name = t(`items.${LEVER_ORDER[active]}.name`);
  const label = t("mapLabel", { lever: name });

  return (
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
      <p className="sr-only">{t("note")}</p>
      {/* Fondu vers le texte et vers la section suivante. */}
      <div aria-hidden="true" className="lever-fade-x pointer-events-none absolute inset-0 hidden lg:block" />
      <div aria-hidden="true" className="lever-fade-y pointer-events-none absolute inset-0" />
    </div>
  );
}
