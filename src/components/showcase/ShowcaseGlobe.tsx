"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { ChapterDef, Showcase, TransportMode } from "@/lib/showcase/types";
import { makePath, pointAt, routePath, slice, type Path } from "@/lib/showcase/arcs";
import { HOLD_SECONDS, LEG_SECONDS, boxOf, easeInOutCubic, fitCam, holdCam, legCam, staggered, stageZoom, type Box, type Cam } from "@/lib/showcase/camera";
import { MODES, OVERVIEW } from "@/lib/showcase/chapters.mjs";
import { MODE_STYLE } from "./style";
import { forcesGlobe, isSoftwareRenderer, supportsWebGL } from "./support";
import "./showcase.css";

export interface ShowcaseGlobeProps {
  data: Showcase;
  chapters: ChapterDef[];
  /** Chapitre demandé (index dans `chapters`). Le globe y vole dès que cette valeur change. */
  active: number;
  playing: boolean;
  reducedMotion: boolean;
  mobile: boolean;
  ariaLabel: string;
  /** La lecture automatique demande le chapitre suivant. */
  onAdvance(): void;
  /** Le contenu d'un chapitre vient de remplacer le précédent à l'écran (pour synchroniser la légende). */
  onShown(index: number): void;
  /** Hauteur, en px, que la légende occupe en bas de la scène : la vue se centre au-dessus. */
  padBottom: number;
  /** Idem en haut, sur écran étroit où la mention d'exemple couvre toute la largeur. */
  padTop: number;
  /** Zones de la scène à laisser libres (légende, mention d'exemple) : aucune étiquette n'y est posée. */
  reserved: MutableRefObject<{ x: number; y: number; w: number; h: number }[]>;
  onFatal(reason: "nowebgl" | "software" | "lost"): void;
  onReady(): void;
}

interface Prepared {
  id: string;
  mode: TransportMode;
  path: Path;
  operator?: string;
  /** Décalage de l'impulsion le long de la liaison, stable d'un chargement à l'autre. */
  phase: number;
}

interface PreparedSite {
  id: string;
  name: string;
  lon: number;
  lat: number;
  degree: number;
  vec: [number, number, number];
}

interface PreparedChapter {
  def: ChapterDef;
  services: Prepared[];
  sites: PreparedSite[];
  /** Emprise des sites du chapitre : c'est elle qui cadre la caméra. */
  box: Box;
}

const RAD = Math.PI / 180;
const vec = (lon: number, lat: number): [number, number, number] => [Math.cos(lat * RAD) * Math.cos(lon * RAD), Math.cos(lat * RAD) * Math.sin(lon * RAD), Math.sin(lat * RAD)];

const hash01 = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return ((h >>> 0) % 1000) / 1000;
};

function prepare(data: Showcase, chapters: ChapterDef[]): PreparedChapter[] {
  const site = new Map(data.sites.map((s) => [s.id, s]));
  return chapters.map((def) => {
    const degree = new Map<string, number>();
    const services = data.services
      .filter((v) => v.chapter === def.id)
      .map((v): Prepared => {
        const stops = [v.from, ...(v.via ?? []), v.to].map((id) => {
          degree.set(id, (degree.get(id) ?? 0) + 1);
          const s = site.get(id)!;
          return [s.lon, s.lat] as [number, number];
        });
        return { id: v.id, mode: v.mode, path: makePath(routePath(stops)), operator: v.operator, phase: hash01(v.id) };
      });
    const sites = [...degree.entries()].map(([id, d]) => {
      const s = site.get(id)!;
      return { id, name: s.name, lon: s.lon, lat: s.lat, degree: d, vec: vec(s.lon, s.lat) };
    });
    return { def, services, sites, box: boxOf(sites.map((x) => [x.lon, x.lat] as [number, number])) };
  });
}

const EMPTY: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: [] };
const point = (lon: number, lat: number, props: Record<string, unknown>): GeoJSON.Feature => ({ type: "Feature", properties: props, geometry: { type: "Point", coordinates: [lon, lat] } });
const colorByMode = () => ["match", ["get", "mode"], ...MODES.flatMap((m) => [m, MODE_STYLE[m].color]), "#ffffff"] as unknown as maplibregl.ExpressionSpecification;

/** Vitesse des impulsions, en km par seconde d'écran, et durées de la mise en scène d'un chapitre. */
const PULSE_KM_PER_S = 170;
const FADE_OUT = 0.8;
const SWAP_AT = 1.1;
const REVEAL_SECONDS = 2.8;

/**
 * Le monde qui tourne : un globe MapLibre sans aucune interaction (ce n'est pas
 * un outil de recherche), piloté image par image. Un chapitre se joue en trois
 * temps : vol de caméra avec recul, tracé des liaisons, lecture à l'arrêt avec
 * des impulsions qui parcourent les liaisons. Les noms (sites, opérateurs) sont
 * des étiquettes HTML posées sans chevauchement.
 */
export function ShowcaseGlobe(props: ShowcaseGlobeProps) {
  const container = useRef<HTMLDivElement>(null);
  const labels = useRef<HTMLDivElement>(null);
  const live = useRef(props);
  live.current = props;
  const goto = useRef<((k: number) => void) | null>(null);

  useEffect(() => {
    const el = container.current;
    const labelEl = labels.current;
    if (!el || !labelEl) return;
    if (!supportsWebGL()) return live.current.onFatal("nowebgl");
    if (isSoftwareRenderer() && !forcesGlobe()) return live.current.onFatal("software");

    const { data, chapters, mobile } = live.current;
    const prepared = prepare(data, chapters);
    const origin = window.location.origin;

    const lineLayers: maplibregl.LayerSpecification[] = MODES.map((m) => {
      const st = MODE_STYLE[m];
      return {
        id: `line-${m}`,
        type: "line",
        source: "lines",
        filter: ["==", ["get", "mode"], m],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": st.color, "line-width": st.width, "line-opacity": 0.95, ...(st.dash ? { "line-dasharray": st.dash } : {}) },
      };
    });

    const map = new maplibregl.Map({
      container: el,
      interactive: false,
      attributionControl: false,
      renderWorldCopies: false,
      maxPitch: 0,
      minZoom: 0.5,
      maxZoom: 9,
      pixelRatio: Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2),
      canvasContextAttributes: { antialias: !mobile },
      fadeDuration: 0,
      center: [OVERVIEW.lon, OVERVIEW.lat],
      zoom: stageZoom(OVERVIEW.zoom, el.clientWidth, el.clientHeight),
      style: {
        version: 8,
        projection: { type: "globe" },
        sky: {
          "sky-color": "#0b241a",
          "horizon-color": "#8fc4ab",
          "fog-color": "#0b241a",
          "sky-horizon-blend": 0.6,
          "horizon-fog-blend": 0.5,
          "fog-ground-blend": 0.3,
          "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 1, 4, 0.8, 6, 0],
        },
        sources: {
          "land-110": { type: "geojson", data: `${origin}/geo/land-110m.json` },
          "borders-110": { type: "geojson", data: `${origin}/geo/borders-110m.json` },
          "land-fine": { type: "geojson", data: `${origin}/geo/land-50m-europe.json` },
          "borders-fine": { type: "geojson", data: `${origin}/geo/borders-50m-europe.json` },
          lines: { type: "geojson", data: EMPTY },
          sites: { type: "geojson", data: EMPTY },
          pulses: { type: "geojson", data: EMPTY },
        },
        layers: [
          { id: "ocean", type: "background", paint: { "background-color": "#0a2d4a" } },
          { id: "land", type: "fill", source: "land-110", maxzoom: 3.4, paint: { "fill-color": "#163f2f", "fill-outline-color": "#2f7d5c" } },
          { id: "borders", type: "line", source: "borders-110", maxzoom: 3.4, paint: { "line-color": "#79b59a", "line-opacity": 0.3, "line-width": 0.7 } },
          { id: "land-fine", type: "fill", source: "land-fine", minzoom: 3.2, paint: { "fill-color": "#163f2f", "fill-outline-color": "#3f8c6a" } },
          { id: "borders-fine", type: "line", source: "borders-fine", minzoom: 3.2, paint: { "line-color": "#79b59a", "line-opacity": 0.32, "line-width": 0.8 } },
          { id: "line-glow", type: "line", source: "lines", layout: { "line-cap": "round" }, paint: { "line-color": colorByMode(), "line-width": 8, "line-opacity": 0.12, "line-blur": 3 } },
          ...lineLayers,
          { id: "site-ring", type: "circle", source: "sites", paint: { "circle-radius": ["get", "r"], "circle-color": "rgba(0,0,0,0)", "circle-stroke-color": "#f5f2ea", "circle-stroke-width": 1, "circle-stroke-opacity": ["get", "ro"] } },
          { id: "site-dot", type: "circle", source: "sites", paint: { "circle-radius": ["get", "d"], "circle-color": "#f5f2ea", "circle-stroke-color": "#0b241a", "circle-stroke-width": 1.2, "circle-opacity": ["get", "o"], "circle-stroke-opacity": ["get", "o"] } },
          { id: "pulse-glow", type: "circle", source: "pulses", paint: { "circle-radius": 10, "circle-color": colorByMode(), "circle-opacity": ["*", 0.35, ["get", "a"]], "circle-blur": 1 } },
          { id: "pulse", type: "circle", source: "pulses", paint: { "circle-radius": 3.2, "circle-color": colorByMode(), "circle-opacity": ["get", "a"] } },
        ],
      },
    });

    const canvas = map.getCanvas();
    const lost = (ev: Event) => {
      ev.preventDefault();
      live.current.onFatal("lost");
    };
    canvas.addEventListener("webglcontextlost", lost);

    /* ---- état de la mise en scène ---- */
    let size = { w: el.clientWidth || 640, h: el.clientHeight || 640 };
    const ro = new ResizeObserver(() => {
      size = { w: el.clientWidth || size.w, h: el.clientHeight || size.h };
      map.resize();
    });
    ro.observe(el);

    /** Hauteur libre : la scène moins la légende. */
    const freeH = () => Math.max(160, size.h - live.current.padBottom - live.current.padTop);
    const viewOf = (k: number): Cam => fitCam(prepared[k].box, size.w, freeH());

    let cam: Cam = { lon: OVERVIEW.lon, lat: OVERVIEW.lat, zoom: stageZoom(OVERVIEW.zoom, size.w, size.h) };
    let target = -1; // chapitre vers lequel on vole ou qu'on lit
    let shown = -1; // chapitre dont les liaisons sont dans la source
    let phase: "leg" | "hold" = "leg";
    let legFrom = cam;
    let legT = 0;
    let holdT = 0;
    let advanced = false;
    let fade = 1;
    let reveal = 0;
    let clock = 0;
    let linesDirty = true;
    let lastFade = -1;
    let ready = false;
    let visible = true;
    let frame = 0;

    const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting), { threshold: 0.15 });
    io.observe(el);

    const lineFeatures = (ch: PreparedChapter, progress: number): GeoJSON.FeatureCollection => ({
      type: "FeatureCollection",
      features: ch.services.flatMap((s, i) => {
        const pts = slice(s.path, staggered(progress, i, ch.services.length));
        return pts.length > 1 ? [{ type: "Feature" as const, properties: { mode: s.mode }, geometry: { type: "LineString" as const, coordinates: pts } }] : [];
      }),
    });

    const setData = (id: string, fc: GeoJSON.FeatureCollection) => (map.getSource(id) as maplibregl.GeoJSONSource | undefined)?.setData(fc);

    const startLeg = (k: number) => {
      target = k;
      legFrom = cam;
      legT = 0;
      holdT = 0;
      phase = "leg";
      advanced = false;
    };
    goto.current = (k) => {
      if (k !== target && prepared[k]) startLeg(k);
    };

    /* ---- étiquettes (HTML, hors du canvas) ---- */
    const pool = new Map<string, HTMLSpanElement>();
    const place = (key: string, text: string, cls: string, x: number, y: number, opacity: number) => {
      let n = pool.get(key);
      if (!n) {
        n = document.createElement("span");
        n.textContent = text;
        n.className = cls;
        labelEl.appendChild(n);
        pool.set(key, n);
      }
      n.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      n.style.opacity = String(opacity);
    };
    const clearLabels = () => {
      for (const n of pool.values()) n.remove();
      pool.clear();
    };
    let labelsFor = -1;

    const updateLabels = () => {
      const ch = prepared[shown];
      if (!ch) return;
      if (labelsFor !== shown) {
        clearLabels();
        labelsFor = shown;
      }
      const zoomOk = Math.max(0, Math.min(1, (cam.zoom - stageZoom(3.4, size.w, freeH())) / 0.6));
      const opacity = zoomOk * fade * (reveal > 0.25 ? 1 : 0);
      const c = vec(cam.lon, cam.lat);
      const taken: { x: number; y: number; w: number; h: number }[] = [...live.current.reserved.current];
      const free = (x: number, y: number, w: number, h: number) => !taken.some((r) => x < r.x + r.w && x + w > r.x && y < r.y + r.h && y + h > r.y);
      const used = new Set<string>();

      type Cand = { key: string; text: string; cls: string; x: number; y: number; w: number; h: number; dys: number[]; prio: number };
      const cands: Cand[] = [];
      for (const s of ch.services) {
        if (!s.operator) continue;
        const [lon, lat] = pointAt(s.path, 0.5);
        const v = vec(lon, lat);
        if (v[0] * c[0] + v[1] * c[1] + v[2] * c[2] < 0.35) continue;
        const p = map.project([lon, lat]);
        const w = s.operator.length * 6.4 + 18;
        // Un nom d'opérateur compte plus qu'une étiquette de site : on le décale plutôt que de le perdre.
        cands.push({ key: `op:${s.id}`, text: s.operator, cls: "showcase-op", x: p.x - w / 2, y: p.y - 11, w, h: 22, dys: [0, 26, -26, 52, -52], prio: 0 });
      }
      const maxDeg = Math.max(1, ...ch.sites.map((s) => s.degree));
      for (const s of ch.sites) {
        if (s.vec[0] * c[0] + s.vec[1] * c[1] + s.vec[2] * c[2] < 0.35) continue;
        const p = map.project([s.lon, s.lat]);
        const w = s.name.length * 6.1 + 6;
        const right = p.x + 9 + w < size.w - 6;
        cands.push({ key: `s:${s.id}`, text: s.name, cls: "showcase-site", x: right ? p.x + 8 : p.x - 8 - w, y: p.y - 18, w, h: 16, dys: [0], prio: 1 + (maxDeg - s.degree) / maxDeg });
      }
      cands.sort((a, b) => a.prio - b.prio);
      for (const k of cands) {
        for (const dy of k.dys) {
          const y = k.y + dy;
          if (k.x < 4 || y < 4 || k.x + k.w > size.w - 4 || y + k.h > size.h - 4) continue;
          if (!free(k.x, y, k.w, k.h)) continue;
          taken.push({ x: k.x, y, w: k.w, h: k.h });
          used.add(k.key);
          place(k.key, k.text, k.cls, k.x, y, opacity);
          break;
        }
      }
      for (const [key, n] of pool) if (!used.has(key)) n.style.opacity = "0";
    };

    /* ---- boucle ---- */
    let raf = 0;
    let last = 0;
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      const p = live.current;
      const dtRaw = last ? Math.min((t - last) / 1000, 0.1) : 0;
      last = t;
      if (!ready || !visible || document.hidden || target < 0) return;
      const dt = dtRaw;
      const still = p.reducedMotion;
      const motion = p.playing && !still;
      frame++;

      /* vol / lecture */
      if (phase === "leg") {
        const dur = still ? 0 : LEG_SECONDS;
        legT += dt;
        const e = dur === 0 ? 1 : easeInOutCubic(Math.min(1, legT / dur));
        cam = legCam(legFrom, viewOf(target), e);
        if (shown !== target) {
          fade = still ? 1 : Math.max(0, 1 - legT / FADE_OUT);
          if (shown < 0 || legT >= SWAP_AT || still) {
            shown = target;
            p.onShown(shown);
            reveal = still ? 1 : 0;
            fade = 1;
            lastFade = -1;
            linesDirty = true;
            const ch = prepared[shown];
            setData("lines", lineFeatures(ch, reveal));
          }
        }
        if (legT >= dur) {
          phase = "hold";
          holdT = 0;
          cam = viewOf(target);
        }
      } else {
        if (motion) holdT += dt;
        cam = holdCam(viewOf(target), holdT / HOLD_SECONDS);
        if (motion && holdT >= HOLD_SECONDS && !advanced) {
          advanced = true;
          p.onAdvance();
        }
      }
      map.jumpTo({ center: [cam.lon, Math.max(-80, Math.min(80, cam.lat))], zoom: cam.zoom, padding: { top: Math.round(p.padTop), left: 0, right: 0, bottom: Math.round(p.padBottom) } });

      /* tracé des liaisons */
      const ch = prepared[shown];
      if (ch) {
        if (reveal < 1) {
          reveal = Math.min(1, reveal + dt / REVEAL_SECONDS);
          linesDirty = true;
        }
        if (linesDirty && (shown === target || fade < 1)) {
          setData("lines", lineFeatures(ch, reveal));
          linesDirty = reveal < 1;
        }
        if (fade !== lastFade) {
          lastFade = fade;
          for (const m of MODES) map.setPaintProperty(`line-${m}`, "line-opacity", 0.95 * fade);
          map.setPaintProperty("line-glow", "line-opacity", 0.12 * fade);
        }

        /* impulsions et anneaux : une image sur deux suffit */
        if (motion) clock += dt;
        if (frame % 2 === 0) {
          const showPulses = !still && reveal >= 0.35;
          setData(
            "pulses",
            showPulses
              ? {
                  type: "FeatureCollection",
                  features: ch.services.map((s, i) => {
                    const done = staggered(reveal, i, ch.services.length) >= 1;
                    const f = (s.phase + (clock * PULSE_KM_PER_S) / Math.max(s.path.length, 50)) % 1;
                    const a = done ? Math.sqrt(Math.sin(Math.PI * f)) * fade : 0;
                    const [lon, lat] = pointAt(s.path, f);
                    return point(lon, lat, { mode: s.mode, a });
                  }),
                }
              : EMPTY,
          );
          setData("sites", {
            type: "FeatureCollection",
            features: ch.sites.map((s) => {
              const q = still ? 0 : (clock * 0.5 + hash01(s.id)) % 1;
              return point(s.lon, s.lat, { d: 3 + Math.min(s.degree, 4) * 0.45, o: fade * Math.min(1, reveal * 4), r: 4 + 15 * q, ro: still ? 0 : (1 - q) * 0.55 * fade * Math.min(1, reveal * 2) });
            }),
          });
        }
        updateLabels();
      }
    };

    map.on("load", () => {
      ready = true;
      startLeg(Math.max(0, Math.min(prepared.length - 1, live.current.active)));
      raf = requestAnimationFrame(tick);
      live.current.onReady();
    });

    return () => {
      cancelAnimationFrame(raf);
      goto.current = null;
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener("webglcontextlost", lost);
      clearLabels();
      map.remove();
    };
    // Le globe se construit une fois ; les changements de chapitre passent par `goto`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    goto.current?.(props.active);
  }, [props.active]);

  return (
    <div className="relative h-full w-full">
      {/* Dimensions explicites : MapLibre impose `position: relative` à son conteneur, ce qui annulerait `absolute inset-0`. */}
      <div ref={container} role="img" aria-label={props.ariaLabel} className="h-full w-full" />
      <div ref={labels} aria-hidden="true" className="showcase-labels pointer-events-none absolute inset-0 overflow-hidden" />
    </div>
  );
}
