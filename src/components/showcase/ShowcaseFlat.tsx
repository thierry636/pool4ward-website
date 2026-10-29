"use client";

import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import type { ChapterDef, Showcase } from "@/lib/showcase/types";
import { makePath, pointAt, routePath } from "@/lib/showcase/arcs";
import { MODE_STYLE, svgDash } from "./style";

/**
 * Carte à plat de repli (sans WebGL, rendu logiciel, appareil économe) : même
 * chapitres, mêmes liaisons, en SVG. Le cadre se recentre sur le chapitre, les
 * liaisons ont le tracé de leur mode, des impulsions les parcourent (SMIL) —
 * sauf si l'on a demandé moins de mouvement.
 */

const UNITS_PER_DEG = 10;
const WORLD_W = 360 * UNITS_PER_DEG;
const mx = (lon: number) => (lon + 180) * UNITS_PER_DEG;
const my = (lat: number) => {
  const s = Math.sin((Math.max(-85, Math.min(85, lat)) * Math.PI) / 180);
  return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * WORLD_W;
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
    else if (g.type === "LineString") ring(g.coordinates);
  }
  return d;
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export function ShowcaseFlat({
  data,
  chapters,
  active,
  playing,
  reducedMotion,
  ariaLabel,
  padBottom,
  padTop,
  reserved,
  onAdvance,
  onReady,
}: {
  data: Showcase;
  chapters: ChapterDef[];
  active: number;
  playing: boolean;
  reducedMotion: boolean;
  ariaLabel: string;
  /** Hauteur de la légende, en bas : le cadre se centre au-dessus. */
  padBottom: number;
  padTop: number;
  /** Zones à laisser libres d'étiquettes (légende, mention d'exemple). */
  reserved: MutableRefObject<{ x: number; y: number; w: number; h: number }[]>;
  onAdvance(): void;
  onReady(): void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ w: 640, h: 420 });
  const [land, setLand] = useState("");
  const [borders, setBorders] = useState("");
  const [box, setBox] = useState<Box | null>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth || 640, h: el.clientHeight || 420 });
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

  const siteById = useMemo(() => new Map(data.sites.map((s) => [s.id, s])), [data]);

  /** Liaisons du chapitre : tracé projeté, longueur, milieu. */
  const chapter = chapters[active];
  const routes = useMemo(() => {
    if (!chapter) return [];
    return data.services
      .filter((v) => v.chapter === chapter.id)
      .map((v) => {
        const stops = [v.from, ...(v.via ?? []), v.to].map((id) => siteById.get(id)!);
        const path = makePath(routePath(stops.map((s) => [s.lon, s.lat] as [number, number])));
        const d = path.points.map(([lon, lat], i) => `${i ? "L" : "M"}${mx(lon).toFixed(1)},${my(lat).toFixed(1)}`).join("");
        const mid = pointAt(path, 0.5);
        return { v, d, km: path.length, mid, stops };
      });
  }, [chapter, data, siteById]);

  /** Cadre cible : les sites du chapitre, avec de l'air, à la proportion de la scène. */
  const target = useMemo<Box | null>(() => {
    if (!routes.length) return null;
    const xs: number[] = [];
    const ys: number[] = [];
    for (const r of routes) {
      for (const s of r.stops) {
        xs.push(mx(s.lon));
        ys.push(my(s.lat));
      }
    }
    const x0 = Math.min(...xs);
    const x1 = Math.max(...xs);
    const y0 = Math.min(...ys);
    const y1 = Math.max(...ys);
    const freeH = Math.max(160, size.h - padBottom - padTop);
    const scale = Math.max(((x1 - x0) * 1.35) / size.w, ((y1 - y0) * 1.5) / freeH, 0.4);
    const w = scale * size.w;
    const h = scale * size.h;
    return { x: (x0 + x1) / 2 - w / 2, y: (y0 + y1) / 2 - (padTop + freeH / 2) * scale, w, h };
  }, [routes, size, padBottom, padTop]);

  /* Recadrage animé (instantané si l'on a demandé moins de mouvement). */
  const boxRef = useRef<Box | null>(null);
  boxRef.current = box;
  useEffect(() => {
    if (!target) return;
    const from = boxRef.current;
    if (!from || reducedMotion) return setBox(target);
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const k = ease(Math.min(1, (t - t0) / 1000));
      setBox({ x: lerp(from.x, target.x, k), y: lerp(from.y, target.y, k), w: lerp(from.w, target.w, k), h: lerp(from.h, target.h, k) });
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, reducedMotion]);

  /* Lecture automatique : un chapitre se lit en une dizaine de secondes. */
  useEffect(() => {
    if (!playing || reducedMotion) return;
    const id = window.setTimeout(onAdvance, 9000);
    return () => window.clearTimeout(id);
  }, [playing, reducedMotion, active, onAdvance]);

  /* Pause : les impulsions s'arrêtent là où elles sont. */
  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    if (playing && !reducedMotion) el.unpauseAnimations?.();
    else el.pauseAnimations?.();
  }, [playing, reducedMotion, routes]);

  const unit = box ? box.w / size.w : 1; // unités du dessin par pixel d'écran
  const view = box ?? { x: 0, y: 0, w: size.w, h: size.h };

  /* Étiquettes sans chevauchement, en pixels d'écran : d'abord les noms d'opérateurs (décalés plutôt que perdus), puis les sites. */
  const placed = useMemo(() => {
    const pills: { id: string; text: string; x: number; y: number; w: number }[] = [];
    const out: { id: string; name: string; x: number; y: number; anchor: "start" | "end" }[] = [];
    if (!box) return { pills, labels: out };
    const taken: { x: number; y: number; w: number; h: number }[] = [...reserved.current];
    const free = (r: { x: number; y: number; w: number; h: number }) =>
      r.x >= 2 && r.y >= 2 && r.x + r.w <= size.w - 2 && r.y + r.h <= size.h - 2 && !taken.some((t) => r.x < t.x + t.w && r.x + r.w > t.x && r.y < t.y + t.h && r.y + r.h > t.y);

    for (const r of routes) {
      if (!r.v.operator) continue;
      const w = r.v.operator.length * 6.4 + 18;
      const px = (mx(r.mid[0]) - box.x) / unit;
      const py = (my(r.mid[1]) - box.y) / unit;
      for (const dy of [0, 26, -26, 52, -52]) {
        const rect = { x: px - w / 2, y: py - 11 + dy, w, h: 22 };
        if (!free(rect)) continue;
        taken.push(rect);
        pills.push({ id: r.v.id, text: r.v.operator, x: rect.x, y: rect.y, w });
        break;
      }
    }

    const degree = new Map<string, number>();
    for (const r of routes) for (const s of r.stops) degree.set(s.id, (degree.get(s.id) ?? 0) + 1);
    const sites = [...degree.keys()].map((id) => siteById.get(id)!).sort((a, b) => degree.get(b.id)! - degree.get(a.id)!);
    for (const s of sites) {
      const px = (mx(s.lon) - box.x) / unit;
      const py = (my(s.lat) - box.y) / unit;
      const w = s.name.length * 6.1 + 6;
      const right = px + 9 + w < size.w - 6;
      const rect = { x: right ? px + 7 : px - 7 - w, y: py - 18, w, h: 14 };
      if (!free(rect)) continue;
      taken.push(rect);
      out.push({ id: s.id, name: s.name, x: right ? px + 8 : px - 8, y: py - 7, anchor: right ? "start" : "end" });
    }
    return { pills, labels: out };
  }, [box, routes, siteById, size, unit, reserved]);

  return (
    <div ref={host} className="h-full w-full">
      <svg ref={svg} role="img" aria-label={ariaLabel} viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`} className="h-full w-full" preserveAspectRatio="xMidYMid meet" style={{ background: "#071226" }}>
        <path d={land} fill="#0e1c38" stroke="#2a4272" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
        <path d={borders} fill="none" stroke="#5b7bb8" strokeOpacity="0.32" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
        <g key={chapter?.id} className="cap-fade">
          {routes.map((r) => (
            <path
              key={r.v.id}
              id={`flat-${r.v.id}`}
              d={r.d}
              fill="none"
              stroke={MODE_STYLE[r.v.mode].color}
              strokeWidth={MODE_STYLE[r.v.mode].width}
              strokeDasharray={svgDash(r.v.mode)}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {!reducedMotion &&
            routes.map((r, i) => {
              const dur = Math.max(2.5, r.km / 170);
              return (
                <circle key={r.v.id} r={3.4 * unit} fill={MODE_STYLE[r.v.mode].color} stroke="#020617" strokeWidth={1 * unit}>
                  <animateMotion dur={`${dur.toFixed(2)}s`} begin={`${(-((i * 0.37) % 1) * dur).toFixed(2)}s`} repeatCount="indefinite">
                    <mpath href={`#flat-${r.v.id}`} />
                  </animateMotion>
                </circle>
              );
            })}
          {[...new Set(routes.flatMap((r) => r.stops.map((s) => s.id)))].map((id) => {
            const s = siteById.get(id)!;
            return <circle key={id} cx={mx(s.lon)} cy={my(s.lat)} r={3.2 * unit} fill="#f1f5f9" stroke="#020617" strokeWidth={1.2 * unit} />;
          })}
        </g>
        {box &&
          placed.pills.map((p) => (
            <g key={`op-${p.id}`} transform={`translate(${box.x + p.x * unit} ${box.y + p.y * unit})`}>
              <rect width={p.w * unit} height={22 * unit} fill="#f1f5f9" stroke="#2dd4bf" strokeWidth={1 * unit} rx={6 * unit} />
              <text x={(p.w / 2) * unit} y={15 * unit} textAnchor="middle" fontSize={11 * unit} fontWeight="600" fill="#0f172a" fontFamily="var(--font-sans)">
                {p.text}
              </text>
            </g>
          ))}
        {box &&
          placed.labels.map((l) => (
            <text
              key={l.id}
              x={box.x + l.x * unit}
              y={box.y + l.y * unit}
              textAnchor={l.anchor}
              fontSize={11 * unit}
              fill="#e2e8f0"
              stroke="#020617"
              strokeWidth={3 * unit}
              paintOrder="stroke"
              fontFamily="var(--font-sans)"
              letterSpacing={0.04 * 11 * unit}
            >
              {l.name}
            </text>
          ))}
      </svg>
    </div>
  );
}
