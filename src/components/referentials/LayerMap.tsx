"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { anchorOf } from "@/lib/levers/scene";
import {
  buildLayer,
  type DotShape,
  type Frame,
  type LayerId,
} from "@/lib/levers/layers";
import { loadGeo, mx, my, type GeoPaths } from "@/lib/levers/geo";
import "@/components/levers/levers.css";

/**
 * Une couche de référentiel jouée sur l'Europe : le même fond et les mêmes animations que la carte
 * de la couverture (classes `lever-*`), en plus petit. La carte ne se monte et ne joue que quand la
 * tuile approche de l'écran ; elle repart de zéro à intervalles réguliers tant qu'elle est visible,
 * se fige quand elle sort de l'écran, et s'affiche terminée sous « mouvement réduit ».
 */

const W = 400;
const H = 250;
/** Les traits et les repères sont dessinés un peu plus fins que sur la couverture. */
const K = 0.9;
const HOLD_SECONDS = 5;

/** Échelle et décalage qui cadrent la zone de la couche dans la tuile (calculés une fois par cadre). */
const fits = new Map<Frame, { s: number; tx: number; ty: number }>();
function fit(f: Frame) {
  let r = fits.get(f);
  if (!r) {
    const x0 = mx(f.west);
    const x1 = mx(f.east);
    const y0 = my(f.north);
    const y1 = my(f.south);
    const s = Math.min(W / (x1 - x0), H / (y1 - y0));
    r = {
      s,
      tx: (W - (x1 - x0) * s) / 2 - x0 * s,
      ty: (H - (y1 - y0) * s) / 2 - y0 * s,
    };
    fits.set(f, r);
  }
  return r;
}

const dPath = (pts: readonly (readonly [number, number])[]) =>
  pts
    .map(
      ([lo, la], i) =>
        `${i ? "L" : "M"}${mx(lo).toFixed(1)},${my(la).toFixed(1)}`,
    )
    .join("");

const DOT: Record<DotShape, { r: number; stroke: string; sw: number }> = {
  dot: { r: 2.6, stroke: "#020617", sw: 0.6 },
  square: { r: 3.2, stroke: "#020617", sw: 0.8 },
  hub: { r: 4, stroke: "#020617", sw: 1.2 },
  port: { r: 4.4, stroke: "", sw: 1.8 },
};

export function LayerMap({ layer, label }: { layer: LayerId; label: string }) {
  const host = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const [near, setNear] = useState(false);
  const [inView, setInView] = useState(false);
  const [geo, setGeo] = useState<GeoPaths | null>(null);
  const [cycle, setCycle] = useState(0);

  /* La tuile approche de l'écran : le fond se charge ; elle est à l'écran : la couche joue. */
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setNear(true);
          setInView(e.isIntersecting && e.intersectionRatio > 0.2);
        }
      },
      { rootMargin: "200px 0px", threshold: [0, 0.2] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!near) return;
    let cancelled = false;
    loadGeo().then((g) => !cancelled && setGeo(g));
    return () => {
      cancelled = true;
    };
  }, [near]);

  const built = buildLayer(layer);
  const secs = built.layer.seconds;
  const { s: S, tx: TX, ty: TY } = fit(built.layer.frame);
  const px = (v: number) => (v * K) / S;

  /* Rejoue la couche à intervalles réguliers tant qu'elle est visible. */
  useEffect(() => {
    if (!inView || reduced || !geo) return;
    const timer = window.setTimeout(
      () => setCycle((c) => c + 1),
      (secs + HOLD_SECONDS) * 1000,
    );
    return () => window.clearTimeout(timer);
  }, [inView, reduced, geo, cycle, secs]);

  const at = (s: number) => (reduced ? 0 : s);
  const dur = (a: number, b: number) => Math.max(0.2, (b - a) * secs);

  return (
    <div
      ref={host}
      className="layer-map lever-flat"
      data-ready={geo ? "true" : "false"}
      data-paused={inView ? "false" : "true"}
      data-cycle={cycle}
    >
      {geo && (
        <>
          {/* Le fond ne bouge jamais : il a son propre calque, pour que les animations ne le redessinent pas. */}
          <svg
            aria-hidden="true"
            focusable="false"
            className="layer-base"
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="xMidYMid slice"
          >
            <g
              style={{
                transform: `translate(${TX}px, ${TY}px) scale(${S})`,
                transformOrigin: "0 0",
              }}
            >
              <path
                d={geo.land}
                fill="#0d1a35"
                stroke="#2a4a82"
                strokeWidth={px(1)}
              />
            </g>
          </svg>
          <svg
            role="img"
            aria-label={label}
            className="layer-fx"
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="xMidYMid slice"
          >
            <g
              style={{
                transform: `translate(${TX}px, ${TY}px) scale(${S})`,
                transformOrigin: "0 0",
              }}
            >
              <g key={cycle}>
                {built.paths.map(({ el, points, km }) => {
                  const d = dPath(points);
                  const dashed = el.style === "dashed";
                  const delay = `${at(el.t0 * secs)}s`;
                  const length = Math.max(2.4, Math.min(8, km / 210));
                  return (
                    <g key={el.id}>
                      {el.halo && (
                        <path
                          d={d}
                          fill="none"
                          stroke={el.halo}
                          strokeOpacity="0.5"
                          strokeWidth={px(el.width * 2.6)}
                          strokeLinecap="round"
                          className="lever-fade"
                          style={{
                            animationDelay: delay,
                            animationDuration: `${dur(el.t0, el.t1)}s`,
                          }}
                        />
                      )}
                      <path
                        d={d}
                        fill="none"
                        stroke={el.color}
                        strokeOpacity={el.opacity ?? 1}
                        strokeWidth={px(el.width)}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray={
                          dashed
                            ? `${px(el.width * 2.4)} ${px(el.width * 1.8)}`
                            : undefined
                        }
                        pathLength={dashed ? undefined : 1}
                        className={dashed ? "lever-fade" : "lever-draw"}
                        style={{
                          animationDelay: delay,
                          animationDuration: `${dur(el.t0, el.t1)}s`,
                        }}
                      />
                      {!reduced &&
                        Array.from({ length: el.pulses ?? 0 }, (_, k) => (
                          <circle
                            key={k}
                            r={px(3)}
                            fill="#ffffff"
                            className="lever-pulse"
                            style={{
                              offsetPath: `path("${d}")`,
                              animationDuration: `${length}s`,
                              animationDelay: `${el.t1 * secs + (k * length) / (el.pulses ?? 1)}s`,
                            }}
                          />
                        ))}
                    </g>
                  );
                })}
                {built.layer.rings.map((r) => {
                  const [lo, la] = anchorOf(r.at);
                  return [0, 1].map((k) => (
                    <circle
                      key={`${r.at}-${k}`}
                      cx={mx(lo)}
                      cy={my(la)}
                      r={px(9)}
                      fill="none"
                      stroke={r.color}
                      strokeWidth={px(1.5)}
                      className="lever-ring"
                      style={{
                        animationDelay: `${at(r.t * secs + k * 0.9)}s`,
                        ["--s" as string]: "3.2",
                      }}
                    />
                  ));
                })}
                {built.layer.dots.map((d, i) => {
                  const [lo, la] = anchorOf(d.at);
                  const st = DOT[d.shape];
                  const r = px(st.r);
                  const x = mx(lo);
                  const y = my(la);
                  const style = {
                    animationDelay: `${at(d.t * secs)}s`,
                    animationDuration: "0.4s",
                  };
                  if (d.shape === "port")
                    return (
                      <rect
                        key={i}
                        x={x - r}
                        y={y - r}
                        width={2 * r}
                        height={2 * r}
                        rx={r * 0.35}
                        fill="#0b1224"
                        stroke={d.color}
                        strokeWidth={px(st.sw)}
                        className="lever-fade"
                        style={style}
                      />
                    );
                  if (d.shape === "square")
                    return (
                      <rect
                        key={i}
                        x={x - r}
                        y={y - r}
                        width={2 * r}
                        height={2 * r}
                        rx={r * 0.3}
                        fill={d.color}
                        stroke={st.stroke}
                        strokeWidth={px(st.sw)}
                        className="lever-fade"
                        style={style}
                      />
                    );
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r={r}
                      fill={d.color}
                      stroke={st.stroke}
                      strokeWidth={px(st.sw)}
                      className="lever-fade"
                      style={style}
                    />
                  );
                })}
              </g>
            </g>
          </svg>
        </>
      )}
    </div>
  );
}
