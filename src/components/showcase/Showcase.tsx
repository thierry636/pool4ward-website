"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { chaptersOf } from "@/lib/showcase/chapters-of";
import type { Showcase as ShowcaseData, TransportMode } from "@/lib/showcase/types";
import { ShowcaseFlat } from "./ShowcaseFlat";
import { MODE_STYLE, svgDash } from "./style";
import { forcesGlobe, isSoftwareRenderer, preferLightweight, supportsWebGL } from "./support";

/** MapLibre pèse ≈ 250 Ko : il n'est téléchargé que si l'appareil sait afficher le globe. */
const ShowcaseGlobe = dynamic(() => import("./ShowcaseGlobe").then((m) => m.ShowcaseGlobe), { ssr: false });

type Renderer = "pending" | "globe" | "flat";
type FlatReason = "nowebgl" | "software" | "lightweight" | "lost";

function LegendSample({ mode }: { mode: TransportMode }) {
  const st = MODE_STYLE[mode];
  return (
    <svg width="34" height="8" viewBox="0 0 34 8" aria-hidden="true" className="shrink-0">
      <line x1="2" y1="4" x2="32" y2="4" stroke={st.color} strokeWidth={st.width} strokeDasharray={svgDash(mode)} strokeLinecap="round" />
    </svg>
  );
}

/**
 * L'animation du monde des services : un globe qui tourne et déroule des
 * chapitres (rail intermodal, shortsea en Baltique, frigorifique en Allemagne,
 * fluvial sur le Rhin). Ce n'est pas un outil de recherche : rien à saisir,
 * rien à interroger. La lecture se pilote par des chapitres et un bouton pause.
 */
export function Showcase({ data }: { data: ShowcaseData }) {
  const t = useTranslations("Showcase");
  const locale = useLocale();
  const reduced = usePrefersReducedMotion();
  const chapters = useMemo(() => chaptersOf(data), [data]);

  const [renderer, setRenderer] = useState<Renderer>("pending");
  const [reason, setReason] = useState<FlatReason | null>(null);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(0);
  /** Chapitre dont le contenu est à l'écran : la légende le suit, pas le clic. */
  const [shown, setShown] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [padBottom, setPadBottom] = useState(0);
  const [padTop, setPadTop] = useState(0);
  const section = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const caption = useRef<HTMLDivElement>(null);
  const tag = useRef<HTMLDivElement>(null);
  const reserved = useRef<{ x: number; y: number; w: number; h: number }[]>([]);

  /* Mesure de la légende et de la mention d'exemple : la carte se centre au-dessus, les étiquettes les évitent. */
  useEffect(() => {
    const els = [stage.current, caption.current, tag.current];
    if (els.some((e) => !e)) return;
    const measure = () => {
      const st = stage.current;
      const c = caption.current;
      const g = tag.current;
      // L'observateur peut se déclencher pendant le démontage (navigation) : références déjà nulles.
      if (!st || !c || !g) return;
      const top = c.offsetTop;
      reserved.current = [
        { x: 0, y: top + 40, w: st.clientWidth, h: Math.max(0, c.offsetHeight - 40) },
        { x: g.offsetLeft, y: g.offsetTop, w: g.offsetWidth + 12, h: g.offsetHeight + 8 },
      ];
      setPadBottom(Math.max(0, Math.round(c.offsetHeight - 36)));
      // Écran étroit : la mention d'exemple couvre la largeur, la carte se centre sous elle.
      setPadTop(st.clientWidth < 640 ? g.offsetHeight : 0);
    };
    measure();
    const ro = new ResizeObserver(measure);
    for (const e of els) ro.observe(e!);
    return () => ro.disconnect();
  }, [chapters.length]);

  /* Carte à plat : le contenu change dès la demande. Globe : le moteur le signale à l'échange. */
  useEffect(() => {
    if (renderer !== "globe") setShown(active);
  }, [renderer, active]);

  /* On ne décide du rendu — et on ne lance rien — qu'à l'approche de l'écran. */
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const decide = () => {
      // Lu ici, pas dans le hook : la lecture ne démarre jamais avant la vraie valeur de la préférence.
      const noMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const flat = (why: FlatReason) => {
        setReason(why);
        setRenderer("flat");
      };
      if (forcesGlobe()) setRenderer("globe");
      else if (!supportsWebGL()) flat("nowebgl");
      else if (isSoftwareRenderer()) flat("software");
      else if (preferLightweight()) flat("lightweight");
      else setRenderer("globe");
      setPlaying(!noMotion);
    };
    const io = new IntersectionObserver(
      ([en]) => {
        if (en.isIntersecting) {
          io.disconnect();
          decide();
        }
      },
      { rootMargin: "500px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduced) setPlaying(false);
  }, [reduced]);

  const advance = useCallback(() => setActive((a) => (a + 1) % chapters.length), [chapters.length]);
  const fatal = useCallback((r: "nowebgl" | "software" | "lost") => {
    setReason(r);
    setRenderer("flat");
  }, []);
  const onReady = useCallback(() => setReady(true), []);

  const chapter = chapters[Math.min(shown, chapters.length - 1)];
  if (!chapter) return null;
  const name = t(`chapters.${chapter.id}.name`);
  const mapLabel = t("mapLabel", { chapter: name });
  const published = data.publishedAt ? new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(new Date(data.publishedAt)) : null;

  return (
    <div ref={section} className="tone-dark">
      <div ref={stage} className="relative h-[32rem] overflow-hidden border sm:h-[38rem] lg:h-[42rem]" style={{ borderColor: "var(--rule)", background: "#071226" }}>
        {/* Visuel d'attente : le globe se dessine par-dessus. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/globe-poster.svg"
          alt=""
          aria-hidden="true"
          width={600}
          height={600}
          decoding="async"
          loading="lazy"
          className="absolute inset-0 m-auto h-full max-h-full w-auto max-w-full object-contain transition-opacity duration-500"
          style={{ opacity: ready ? 0 : 1 }}
        />

        {renderer === "globe" && (
          <div className="absolute inset-0">
            <ShowcaseGlobe
              data={data}
              chapters={chapters}
              active={active}
              playing={playing}
              reducedMotion={reduced}
              mobile={typeof window !== "undefined" && window.innerWidth < 768}
              ariaLabel={mapLabel}
              onAdvance={advance}
              onShown={setShown}
              padBottom={padBottom}
              padTop={padTop}
              reserved={reserved}
              onFatal={fatal}
              onReady={onReady}
            />
          </div>
        )}
        {renderer === "flat" && (
          <div className="absolute inset-0">
            <ShowcaseFlat data={data} chapters={chapters} active={active} playing={playing} reducedMotion={reduced} ariaLabel={mapLabel} padBottom={padBottom} padTop={padTop} reserved={reserved} onAdvance={advance} onReady={onReady} />
          </div>
        )}

        {/* Statut des données : exemple illustratif, ou vitrine publiée. */}
        <div ref={tag} className="pointer-events-none absolute left-0 top-0 max-w-[26rem] p-4 sm:p-5">
          {data.mode === "demo" ? (
            <>
              <p className="eyebrow inline-block border px-2 py-1" style={{ borderColor: "var(--warm)", color: "var(--warm)", background: "rgba(2,6,23,0.8)" }}>
                {t("demo.tag")}
              </p>
              <p className="mt-2 text-[0.8rem] leading-snug" style={{ color: "#cbd5e1", textShadow: "0 1px 3px #020617" }}>
                {t("demo.note")}
              </p>
            </>
          ) : (
            <p className="eyebrow inline-block px-2 py-1" style={{ color: "var(--fg-2)", background: "rgba(2,6,23,0.8)" }}>
              {t("curated", { date: published ?? "" })}
            </p>
          )}
        </div>

        {/* Légende et phrase du chapitre. */}
        <div
          ref={caption}
          className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-4 pt-16 sm:px-6 sm:pb-6"
          style={{ background: "linear-gradient(to top, rgba(2,6,23,0.94) 8%, rgba(2,6,23,0.6) 55%, rgba(2,6,23,0))" }}
        >
          <div key={chapter.id} className="cap-fade">
          <p className="mono text-[0.72rem] uppercase tracking-[0.14em]" style={{ color: "var(--warm)" }}>
            {String(shown + 1).padStart(2, "0")} / {String(chapters.length).padStart(2, "0")}
          </p>
          <p className="h3 mt-1" style={{ color: "#f1f5f9" }}>{name}</p>
          <p className="mt-2 max-w-2xl text-[0.95rem] leading-snug" style={{ color: "#cbd5e1" }}>{t(`chapters.${chapter.id}.body`)}</p>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
            {chapter.modes.map((m) => (
              <li key={m} className="flex items-center gap-2 text-[0.8rem]" style={{ color: "#cbd5e1" }}>
                <LegendSample mode={m} />
                {t(`modes.${m}`)}
              </li>
            ))}
          </ul>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3" role="group" aria-label={t("controls.label")}>
        <button type="button" className="btn btn-line" aria-pressed={playing} onClick={() => setPlaying((p) => !p)} data-autofocus>
          <span aria-hidden="true">{playing ? "❚❚" : "▶"}</span>
          {playing ? t("controls.pause") : t("controls.play")}
        </button>
        <ol className="flex flex-wrap gap-2">
          {chapters.map((c, i) => (
            <li key={c.id}>
              <button
                type="button"
                className="btn btn-line"
                aria-pressed={i === active}
                onClick={() => setActive(i)}
                style={i === active ? { background: "color-mix(in srgb, var(--fg) 14%, transparent)", borderColor: "var(--warm)" } : undefined}
              >
                {/* Pas d'aria-label : le nom accessible est le texte visible (« 01 Rail intermodal »), comme l'exige WCAG 2.5.3. */}
                <span className="mono text-[0.72rem]" style={{ color: "var(--warm)" }}>0{i + 1}</span>{" "}
                <span>{t(`chapters.${c.id}.short`)}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      {renderer === "flat" && reason && (
        <p className="mt-3 text-[0.86rem]" style={{ color: "var(--fg-2)" }}>
          {t(`states.flat.${reason}`)}
        </p>
      )}
    </div>
  );
}
