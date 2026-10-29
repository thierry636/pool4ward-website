"use client";

import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { PLACES, LEVER_SECONDS, type LeverId } from "@/lib/levers/data";
import { anchorOf, buildScene, lineOpacity, sceneBox } from "@/lib/levers/scene";
import { CALLOUT_OFFSETS, PLACE_OFFSETS, estimateCallout, placeFirstFree, type Box } from "@/lib/levers/layout";
import type { LeverGlobeProps } from "./LeverGlobe";
import "./levers.css";

/**
 * Carte à plat de la scène des leviers (sans WebGL, rendu logiciel, appareil économe) : mêmes
 * leviers, mêmes tracés, en SVG. Le dessin des tracés, l'apparition des lieux et des bulles et
 * les impulsions sont des animations CSS : rien ne tourne en JavaScript image par image.
 */

const UPD = 10;
const WORLD = 360 * UPD;
const mx = (lon: number) => (lon + 180) * UPD;
const my = (lat: number) => {
  const s = Math.sin((Math.max(-85, Math.min(85, lat)) * Math.PI) / 180);
  return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * WORLD;
};

function geoPath(geo: GeoJSON.Feature | GeoJSON.FeatureCollection, close: boolean): string {
  const feats = "features" in geo ? geo.features : [geo];
  let d = "";
  const ring = (pts: number[][]) => {
    pts.forEach(([lon, lat], i) => {
      d += `${i === 0 ? "M" : "L"}${mx(lon).toFixed(1)},${my(lat).toFixed(1)}`;
    });
    if (close) d += "Z";
  };
  for (const f of feats) {
    const g = f.geometry;
    if (g.type === "Polygon") g.coordinates.forEach(ring);
    else if (g.type === "MultiPolygon") g.coordinates.forEach((p) => p.forEach(ring));
    else if (g.type === "MultiLineString") g.coordinates.forEach(ring);
  }
  return d;
}

type FlatProps = Pick<LeverGlobeProps, "levers" | "active" | "playing" | "reducedMotion" | "locale" | "calloutText" | "ariaLabel" | "pad" | "reserved" | "onAdvance" | "onShown" | "onReady"> & {
  progress: MutableRefObject<number>;
};

export function LeverFlat(props: FlatProps) {
  const { levers, active, playing, reducedMotion, locale, calloutText, pad, reserved, onAdvance, onShown, onReady, progress } = props;
  const host = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 520 });
  const [land, setLand] = useState("");
  const [borders, setBorders] = useState("");

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth || 800, h: el.clientHeight || 520 });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetch("/geo/land-50m-europe.json").then((r) => r.json()), fetch("/geo/borders-50m-europe.json").then((r) => r.json())])
      .then(([l, b]) => {
        if (cancelled) return;
        setLand(geoPath(l, true));
        setBorders(geoPath(b, false));
        onReady();
      })
      .catch(() => !cancelled && onReady());
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scenes = useMemo(() => levers.map((id) => buildScene(id)), [levers]);
  const boxes = useMemo(() => levers.map((id) => sceneBox(id)), [levers]);
  const base = useMemo(() => scenes.flatMap((s) => s.lines.map((l) => l.path.points.map(([lo, la], i) => `${i ? "L" : "M"}${mx(lo).toFixed(1)},${my(la).toFixed(1)}`).join(""))), [scenes]);

  /** Échelle et translation qui cadrent l'emprise du levier dans l'espace que le texte laisse libre. */
  const fit = useMemo(
    () =>
      boxes.map((b) => {
        const x0 = mx(b.west);
        const x1 = mx(b.east);
        const y0 = my(b.north);
        const y1 = my(b.south);
        const fw = Math.max(200, size.w - pad.left - pad.right);
        const fh = Math.max(160, size.h - pad.top - pad.bottom);
        const s = Math.min(fw / ((x1 - x0) * 1.3), fh / ((y1 - y0) * 1.5));
        return { s, tx: pad.left + fw / 2 - ((x0 + x1) / 2) * s, ty: pad.top + fh / 2 - ((y0 + y1) / 2) * s };
      }),
    [boxes, size, pad],
  );

  const f = fit[active] ?? fit[0];
  const scene = scenes[active];
  const lever: LeverId = levers[active];
  const proj = (lon: number, lat: number) => ({ x: mx(lon) * f.s + f.tx, y: my(lat) * f.s + f.ty });

  /* Étiquettes et bulles : positions calculées une fois pour le levier, sur la vue d'arrivée. */
  const overlay = useMemo(() => {
    const taken: Box[] = [...reserved.current];
    const bounds = size;
    const callouts: { key: string; x: number; y: number; w: number; t0: number; t1: number; color: string; title: string; sub: string; ax: number; ay: number; ex: number; ey: number }[] = [];
    for (const co of scene.callouts) {
      const [lon, lat] = anchorOf(co.at);
      const a = proj(lon, lat);
      const tx = calloutText(lever, co.key);
      const est = estimateCallout(tx.title, tx.sub);
      const r = placeFirstFree(a, CALLOUT_OFFSETS(est.w, est.h), est, taken, bounds);
      if (!r) continue;
      callouts.push({ key: co.key, x: r.x, y: r.y, w: est.w, t0: co.t0, t1: co.t1, color: co.color, title: tx.title, sub: tx.sub, ax: a.x, ay: a.y, ex: r.dx > 0 ? r.x : r.x + est.w, ey: r.dy < 0 ? r.y + est.h : r.y });
    }
    const places: { id: string; x: number; y: number; t: number; name: string }[] = [];
    const seen = new Set<string>();
    for (const n of scene.nodes) {
      if (!n.label || typeof n.at !== "string" || seen.has(n.at)) continue;
      seen.add(n.at);
      const name = locale === "fr" ? PLACES[n.at].fr : PLACES[n.at].en;
      const a = proj(PLACES[n.at].lon, PLACES[n.at].lat);
      const w = name.length * 6.6;
      const r = placeFirstFree(a, PLACE_OFFSETS(w), { w, h: 16 }, taken, bounds);
      if (r) places.push({ id: n.at, x: r.x, y: r.y, t: n.t, name });
    }
    return { callouts, places };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, lever, size, pad, f, locale]);

  /* Horloge : avancement du levier (pour la barre de progression) et lecture automatique. */
  const clock = useRef({ u: 0, lever: -1 });
  useEffect(() => {
    clock.current = { u: reducedMotion ? 1 : 0, lever: active };
    progress.current = clock.current.u;
    onShown(active);
  }, [active, reducedMotion, onShown, progress]);
  useEffect(() => {
    let raf = 0;
    let last = 0;
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      const dt = last ? Math.min((t - last) / 1000, 0.1) : 0;
      last = t;
      if (document.hidden || reducedMotion) return;
      const c = clock.current;
      if (c.u < 1) {
        c.u = Math.min(1, c.u + dt / LEVER_SECONDS);
        progress.current = c.u;
      } else if (playing && c.lever === active) {
        c.lever = -2;
        onAdvance();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, reducedMotion, active, onAdvance, progress]);

  const px = (v: number) => v / f.s;
  const dur = (a: number, b: number) => Math.max(0.2, (b - a) * LEVER_SECONDS);
  const nodeStyle = (kind: string) =>
    kind === "charger-now"
      ? { r: 4.4, fill: "rgba(2,6,23,0.6)", stroke: "#94a3b8", sw: 1.8 }
      : kind === "charger-opt"
        ? { r: 5, fill: "#fbbf24", stroke: "#fff7d6", sw: 1.6 }
        : { r: kind === "hub" ? 5.4 : 4.2, fill: "#f1f5f9", stroke: "#020617", sw: 1.4 };

  return (
    <div ref={host} className="lever-flat relative h-full w-full" style={{ background: "#050d1f" }}>
      <svg role="img" aria-label={props.ariaLabel} width={size.w} height={size.h} viewBox={`0 0 ${size.w} ${size.h}`} className="absolute inset-0">
        <g style={{ transform: `translate(${f.tx}px, ${f.ty}px) scale(${f.s})`, transformOrigin: "0 0", transition: reducedMotion ? "none" : "transform 1.4s cubic-bezier(0.4, 0, 0.2, 1)" }}>
          <path d={land} fill="#0d1a35" stroke="#2a4a82" strokeWidth={px(1)} />
          <path d={borders} fill="none" stroke="#35528a" strokeOpacity="0.4" strokeWidth={px(0.8)} />
          {base.map((d, i) => (
            <path key={i} d={d} fill="none" stroke="#3b82f6" strokeOpacity="0.16" strokeWidth={px(1.1)} strokeLinecap="round" />
          ))}
          <g key={lever}>
            {scene.lines.map((b) => {
              const d = b.path.points.map(([lo, la], i) => `${i ? "L" : "M"}${mx(lo).toFixed(1)},${my(la).toFixed(1)}`).join("");
              const dashed = b.el.style === "dashed";
              const dotted = b.el.style === "dotted";
              const draw = !dashed && !dotted;
              const o = lineOpacity(b.el, 1);
              return (
                <g key={b.el.id}>
                  {b.el.halo && <path d={d} fill="none" stroke={b.el.halo} strokeOpacity="0.55" strokeWidth={px(b.el.width * 2.6)} strokeLinecap="round" className="lever-fade" style={{ animationDelay: `${b.el.t0 * LEVER_SECONDS}s`, animationDuration: `${dur(b.el.t0, b.el.t1)}s` }} />}
                  <path d={d} fill="none" stroke={b.el.color} strokeOpacity="0.26" strokeWidth={px(b.el.width * 3.4)} strokeLinecap="round" className="lever-fade" style={{ animationDelay: `${b.el.t0 * LEVER_SECONDS}s`, animationDuration: `${dur(b.el.t0, b.el.t1)}s` }} />
                  <path
                    d={d}
                    fill="none"
                    stroke={b.el.color}
                    strokeOpacity={o}
                    strokeWidth={px(b.el.width)}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={draw ? undefined : dashed ? `${px(b.el.width * 2.4)} ${px(b.el.width * 1.8)}` : `${px(0.1)} ${px(b.el.width * 2.2)}`}
                    pathLength={draw ? 1 : undefined}
                    className={draw ? "lever-draw" : "lever-fade"}
                    style={{ animationDelay: `${b.el.t0 * LEVER_SECONDS}s`, animationDuration: `${dur(b.el.t0, b.el.t1)}s` }}
                  />
                  {!reducedMotion &&
                    b.el.pulses &&
                    Array.from({ length: b.el.pulses }, (_, k) => (
                      <circle
                        key={k}
                        r={px(3.4)}
                        fill="#ffffff"
                        className="lever-pulse"
                        style={{
                          offsetPath: `path("${d}")`,
                          animationDuration: `${Math.max(2.4, b.path.length / 210)}s`,
                          animationDelay: `${b.el.t1 * LEVER_SECONDS + (k * Math.max(2.4, b.path.length / 210)) / b.el.pulses!}s`,
                        }}
                      />
                    ))}
                </g>
              );
            })}
            {scene.rings.map((r) => {
              const [lo, la] = anchorOf(r.at);
              return Array.from({ length: 3 }, (_, k) => (
                <circle key={`${r.at}-${k}`} cx={mx(lo)} cy={my(la)} r={px(10)} fill="none" stroke={r.color} strokeWidth={px(1.6)} className="lever-ring" style={{ animationDelay: `${r.t0 * LEVER_SECONDS + k * 0.8}s`, ["--s" as string]: String(px(36)) }} />
              ));
            })}
            {[
              ...scene.nodes.map((n) => ({ at: anchorOf(n.at), kind: n.style, t: n.t, color: n.color })),
              ...scene.chargers.flatMap((c) => c.points.map((p, i) => ({ at: p, kind: c.el.style as string, t: c.el.t0 + ((c.el.t1 - c.el.t0) * i) / Math.max(1, c.points.length), color: undefined as string | undefined }))),
            ].map((n, i) => {
              const st = nodeStyle(n.kind);
              return <circle key={i} cx={mx(n.at[0])} cy={my(n.at[1])} r={px(st.r)} fill={st.fill} stroke={n.color ?? st.stroke} strokeWidth={px(st.sw)} className="lever-fade" style={{ animationDelay: `${n.t * LEVER_SECONDS}s`, animationDuration: "0.4s" }} />;
            })}
          </g>
        </g>
        <g key={`l-${lever}`}>
          {overlay.callouts.map((c) => (
            <line key={c.key} x1={c.ax} y1={c.ay} x2={c.ex} y2={c.ey} stroke={c.color} strokeOpacity="0.7" strokeWidth="1.2" className="lever-fade" style={{ animationDelay: `${c.t0 * LEVER_SECONDS}s`, animationDuration: "0.4s" }} />
          ))}
        </g>
      </svg>
      <div key={`o-${lever}`} aria-hidden="true" className="lever-overlay pointer-events-none absolute inset-0 overflow-hidden">
        {overlay.places.map((p) => (
          <span key={p.id} className="lever-place lever-in" style={{ transform: `translate(${p.x}px, ${p.y}px)`, animationDelay: `${p.t * LEVER_SECONDS}s` }}>
            {p.name}
          </span>
        ))}
        {overlay.callouts.map((c) => (
          <div
            key={c.key}
            className="lever-callout lever-in"
            style={{
              transform: `translate(${c.x}px, ${c.y}px)`,
              ["--c" as string]: c.color,
              animation: c.t1 >= 0.97 ? `lever-in 0.4s ease ${c.t0 * LEVER_SECONDS}s both` : `lever-in 0.4s ease ${c.t0 * LEVER_SECONDS}s both, lever-out 0.4s ease ${c.t1 * LEVER_SECONDS}s forwards`,
            }}
          >
            <i />
            <span>
              <b>{c.title}</b>
              <em>{c.sub}</em>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
