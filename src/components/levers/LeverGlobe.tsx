"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { easeInOutCubic, fitCam } from "@/lib/showcase/camera";
import { pointAt, type LonLat } from "@/lib/showcase/arcs";
import { LEVER_COLOR, LEVER_SECONDS, PLACES, type LeverId, type NodeKind } from "@/lib/levers/data";
import { anchorOf, buildScene, clamp01, drawnPart, lineOpacity, revealOf, sceneBox, type BuiltScene } from "@/lib/levers/scene";
import { forcesGlobe, isSoftwareRenderer, supportsWebGL } from "@/components/showcase/support";
import "./levers.css";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LeverGlobeProps {
  levers: readonly LeverId[];
  active: number;
  playing: boolean;
  reducedMotion: boolean;
  mobile: boolean;
  locale: "fr" | "en";
  /** Textes d'une bulle (titre, sous-titre) pour un levier et une clé. */
  calloutText(lever: LeverId, key: string): { title: string; sub: string };
  ariaLabel: string;
  /** Marges de la scène que le texte de la page recouvre : la région se centre dans l'espace libre. */
  pad: { left: number; right: number; top: number; bottom: number };
  /** Zones qu'aucune étiquette ne doit recouvrir (colonne de texte, bandeau des leviers). */
  reserved: MutableRefObject<Rect[]>;
  /** Avancement (0 → 1) du levier à l'écran, écrit à chaque image pour la barre de progression. */
  progress: MutableRefObject<number>;
  onAdvance(): void;
  /** Le levier à l'écran vient de changer (la légende de la page le suit). */
  onShown(index: number): void;
  onFatal(reason: "nowebgl" | "software" | "lost"): void;
  onReady(): void;
}

const EMPTY: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: [] };
const RAD = Math.PI / 180;
const vec = (lon: number, lat: number): [number, number, number] => [Math.cos(lat * RAD) * Math.cos(lon * RAD), Math.cos(lat * RAD) * Math.sin(lon * RAD), Math.sin(lat * RAD)];
const hash01 = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return ((h >>> 0) % 1000) / 1000;
};
const point = (lon: number, lat: number, props: Record<string, unknown>): GeoJSON.Feature => ({ type: "Feature", properties: props, geometry: { type: "Point", coordinates: [lon, lat] } });

const PITCH = 38;
const BEARING = -6;
const CAM_SECONDS = 1.9;
const INTRO_SECONDS = 3.6;
const PULSE_KM_PER_S = 210;
const FADE_OUT = 0.5;

const NODE_STYLE: Record<NodeKind, { r: number; fill: string | null; stroke: string; sw: number }> = {
  port: { r: 4.2, fill: "#f1f5f9", stroke: "#020617", sw: 1.4 },
  rail: { r: 4.2, fill: "#f1f5f9", stroke: "#020617", sw: 1.4 },
  hub: { r: 5.4, fill: "#f1f5f9", stroke: "#020617", sw: 1.6 },
  origin: { r: 3.8, fill: "#f1f5f9", stroke: "#020617", sw: 1.3 },
  "charger-now": { r: 4.4, fill: null, stroke: "#94a3b8", sw: 1.8 },
  "charger-opt": { r: 5, fill: "#fbbf24", stroke: "#fff7d6", sw: 1.6 },
};

interface Frame {
  lines: GeoJSON.Feature[];
  halos: GeoJSON.Feature[];
  nodes: GeoJSON.Feature[];
  pulses: GeoJSON.Feature[];
  rings: GeoJSON.Feature[];
}

/**
 * Ce que dessine un levier à l'avancement `u`, sous l'opacité `mul` (1, ou moins quand il
 * s'efface devant le suivant). `clock` anime impulsions et ondes.
 */
function frameOf(scene: BuiltScene, u: number, mul: number, clock: number, still: boolean): Frame {
  const out: Frame = { lines: [], halos: [], nodes: [], pulses: [], rings: [] };
  for (const b of scene.lines) {
    const part = drawnPart(b, u);
    const o = lineOpacity(b.el, u) * mul;
    const cls = b.el.style === "dashed" ? "d" : b.el.style === "dotted" ? "t" : "s";
    if (part.length > 1) {
      out.lines.push({ type: "Feature", properties: { c: b.el.color, w: b.el.width, o, cls }, geometry: { type: "LineString", coordinates: part } });
      if (b.el.halo) out.halos.push({ type: "Feature", properties: { c: b.el.halo, w: b.el.width * 2.6, o: 0.55 * mul }, geometry: { type: "LineString", coordinates: part } });
    }
    if (!still && b.el.pulses && revealOf(b.el.t0, b.el.t1, u) >= 1) {
      const n = b.el.pulses;
      for (let k = 0; k < n; k++) {
        const f = (clock * (PULSE_KM_PER_S / Math.max(b.path.length, 80)) + k / n + hash01(b.el.id) * 0.3) % 1;
        const [lon, lat] = pointAt(b.path, f);
        out.pulses.push(point(lon, lat, { c: b.el.color, a: Math.sqrt(Math.sin(Math.PI * f)) * mul }));
      }
    }
  }
  const addNode = (at: LonLat, style: NodeKind, color: string | undefined, appear: number) => {
    const st = NODE_STYLE[style];
    const k = clamp01((u - appear) / 0.05);
    if (k <= 0) return;
    out.nodes.push(
      point(at[0], at[1], { r: st.r * (0.6 + 0.4 * k), fc: st.fill ?? "rgba(2,6,23,0.6)", c: color ?? st.stroke, sw: st.sw, o: k * mul, g: style === "charger-opt" || style === "hub" ? 1 : 0 }),
    );
  };
  for (const n of scene.nodes) addNode(anchorOf(n.at), n.style, n.color, n.t);
  for (const c of scene.chargers) {
    c.points.forEach((p, i) => addNode(p, c.el.style, undefined, c.el.t0 + ((c.el.t1 - c.el.t0) * i) / Math.max(1, c.points.length)));
  }
  for (const r of scene.rings) {
    if (u < r.t0) continue;
    const p = anchorOf(r.at);
    for (let k = 0; k < 3; k++) {
      const q = (still ? 0.4 : (clock * 0.45 + k / 3) % 1);
      out.rings.push(point(p[0], p[1], { c: r.color, r: 8 + 34 * q, ro: (1 - q) * 0.7 * mul }));
    }
  }
  return out;
}

/**
 * La scène des leviers : un globe MapLibre incliné, sans interaction (ce n'est pas un outil de
 * recherche), piloté image par image. Un levier se joue en trois temps : la caméra se place,
 * les tracés se dessinent, les impulsions les parcourent pendant que les bulles expliquent.
 * Les noms (lieux, bulles) sont des éléments HTML posés sans chevauchement.
 */
export function LeverGlobe(props: LeverGlobeProps) {
  const container = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const leaders = useRef<SVGSVGElement>(null);
  const live = useRef(props);
  live.current = props;
  const goto = useRef<((k: number, user: boolean) => void) | null>(null);

  useEffect(() => {
    const el = container.current;
    const ov = overlay.current;
    const svg = leaders.current;
    if (!el || !ov || !svg) return;
    if (!supportsWebGL()) return live.current.onFatal("nowebgl");
    if (isSoftwareRenderer() && !forcesGlobe()) return live.current.onFatal("software");

    const { levers, mobile } = live.current;
    const scenes = levers.map((id) => buildScene(id));
    const boxes = levers.map((id) => sceneBox(id));
    const origin = window.location.origin;

    // Tous les tracés de tous les leviers, très discrets : un réseau vivant derrière le levier joué.
    const base: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: scenes.flatMap((s) => s.lines.filter((l) => !l.el.closed || true).map((l): GeoJSON.Feature => ({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: l.path.points } }))),
    };

    const map = new maplibregl.Map({
      container: el,
      interactive: false,
      attributionControl: false,
      renderWorldCopies: false,
      maxPitch: 60,
      minZoom: 0.5,
      maxZoom: 9,
      pixelRatio: Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2),
      canvasContextAttributes: { antialias: !mobile },
      fadeDuration: 0,
      center: [20, 28],
      zoom: 1.5,
      style: {
        version: 8,
        projection: { type: "globe" },
        sky: {
          "sky-color": "#020617",
          "horizon-color": "#3b5bdb",
          "fog-color": "#020617",
          "sky-horizon-blend": 0.55,
          "horizon-fog-blend": 0.6,
          "fog-ground-blend": 0.35,
          "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 1, 4, 0.9, 7, 0],
        },
        sources: {
          "land-110": { type: "geojson", data: `${origin}/geo/land-110m.json` },
          "borders-110": { type: "geojson", data: `${origin}/geo/borders-110m.json` },
          "land-fine": { type: "geojson", data: `${origin}/geo/land-50m-europe.json` },
          "borders-fine": { type: "geojson", data: `${origin}/geo/borders-50m-europe.json` },
          base: { type: "geojson", data: base },
          halos: { type: "geojson", data: EMPTY },
          flows: { type: "geojson", data: EMPTY },
          nodes: { type: "geojson", data: EMPTY },
          rings: { type: "geojson", data: EMPTY },
          pulses: { type: "geojson", data: EMPTY },
        },
        layers: [
          { id: "ocean", type: "background", paint: { "background-color": "#050d1f" } },
          { id: "land", type: "fill", source: "land-110", maxzoom: 3.4, paint: { "fill-color": "#0d1a35", "fill-outline-color": "#25406f" } },
          { id: "borders", type: "line", source: "borders-110", maxzoom: 3.4, paint: { "line-color": "#35528a", "line-opacity": 0.35, "line-width": 0.7 } },
          { id: "land-fine", type: "fill", source: "land-fine", minzoom: 3.2, paint: { "fill-color": "#0d1a35", "fill-outline-color": "#2a4a82" } },
          { id: "coast-glow", type: "line", source: "land-fine", minzoom: 3.2, paint: { "line-color": "#2f56b8", "line-opacity": 0.25, "line-width": 2.6, "line-blur": 3 } },
          { id: "borders-fine", type: "line", source: "borders-fine", minzoom: 3.2, paint: { "line-color": "#35528a", "line-opacity": 0.4, "line-width": 0.8 } },
          { id: "base", type: "line", source: "base", layout: { "line-cap": "round" }, paint: { "line-color": "#3b82f6", "line-opacity": 0.16, "line-width": 1.1 } },
          { id: "halos", type: "line", source: "halos", layout: { "line-cap": "round" }, paint: { "line-color": ["get", "c"], "line-width": ["get", "w"], "line-opacity": ["get", "o"], "line-blur": 3 } },
          { id: "flow-glow", type: "line", source: "flows", layout: { "line-cap": "round" }, paint: { "line-color": ["get", "c"], "line-width": ["*", ["get", "w"], 3.4], "line-opacity": ["*", ["get", "o"], 0.26], "line-blur": 5 } },
          { id: "flow-s", type: "line", source: "flows", filter: ["==", ["get", "cls"], "s"], layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": ["get", "c"], "line-width": ["get", "w"], "line-opacity": ["get", "o"] } },
          { id: "flow-d", type: "line", source: "flows", filter: ["==", ["get", "cls"], "d"], layout: { "line-cap": "butt", "line-join": "round" }, paint: { "line-color": ["get", "c"], "line-width": ["get", "w"], "line-opacity": ["get", "o"], "line-dasharray": [2.4, 1.8] } },
          { id: "flow-t", type: "line", source: "flows", filter: ["==", ["get", "cls"], "t"], layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": ["get", "c"], "line-width": ["get", "w"], "line-opacity": ["get", "o"], "line-dasharray": [0.1, 2.2] } },
          { id: "ring", type: "circle", source: "rings", paint: { "circle-radius": ["get", "r"], "circle-color": "rgba(0,0,0,0)", "circle-stroke-color": ["get", "c"], "circle-stroke-width": 1.6, "circle-stroke-opacity": ["get", "ro"] } },
          { id: "node-glow", type: "circle", source: "nodes", filter: ["==", ["get", "g"], 1], paint: { "circle-radius": ["*", ["get", "r"], 2.8], "circle-color": ["get", "c"], "circle-opacity": ["*", ["get", "o"], 0.28], "circle-blur": 1 } },
          { id: "node", type: "circle", source: "nodes", paint: { "circle-radius": ["get", "r"], "circle-color": ["get", "fc"], "circle-stroke-color": ["get", "c"], "circle-stroke-width": ["get", "sw"], "circle-opacity": ["get", "o"], "circle-stroke-opacity": ["get", "o"] } },
          { id: "pulse-glow", type: "circle", source: "pulses", paint: { "circle-radius": 11, "circle-color": ["get", "c"], "circle-opacity": ["*", 0.5, ["get", "a"]], "circle-blur": 1 } },
          { id: "pulse", type: "circle", source: "pulses", paint: { "circle-radius": 3.4, "circle-color": "#ffffff", "circle-opacity": ["get", "a"] } },
        ],
      },
    });

    const canvas = map.getCanvas();
    const lost = (ev: Event) => {
      ev.preventDefault();
      live.current.onFatal("lost");
    };
    canvas.addEventListener("webglcontextlost", lost);

    let size = { w: el.clientWidth || 800, h: el.clientHeight || 600 };
    const ro = new ResizeObserver(() => {
      size = { w: el.clientWidth || size.w, h: el.clientHeight || size.h };
      map.resize();
    });
    ro.observe(el);
    let visible = true;
    const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting), { threshold: 0.05 });
    io.observe(el);

    /** Vue d'un levier : emprise de ses lieux, cadrée dans l'espace que le texte de la page laisse libre. */
    const camOf = (k: number) => {
      const p = live.current.pad;
      const c = fitCam(boxes[k], Math.max(200, size.w - p.left - p.right), Math.max(160, size.h - p.top - p.bottom), { min: 3, max: 6 });
      return { lon: c.lon, lat: c.lat, zoom: c.zoom - 0.3 };
    };

    interface Cam { lon: number; lat: number; zoom: number; pitch: number; bearing: number }
    let cam: Cam = { lon: 28, lat: 28, zoom: 1.4, pitch: 0, bearing: 0 };
    let camFrom = cam;
    let camT = 0;
    let camDur = INTRO_SECONDS;
    let intro = true;
    let target = -1;
    let u = -0.3;
    let clock = 0;
    let force = false;
    let advanced = false;
    let leaving: { scene: BuiltScene; u: number; t: number } | null = null;
    let ready = false;
    let shown = -1;

    const startLever = (k: number, user: boolean) => {
      if (target >= 0 && scenes[target]) leaving = { scene: scenes[target], u: Math.max(0, u), t: 0 };
      target = k;
      camFrom = cam;
      camT = 0;
      camDur = intro ? INTRO_SECONDS : CAM_SECONDS;
      u = intro ? -0.3 : 0;
      advanced = false;
      force = user && !live.current.playing;
      clearOverlay();
      shown = -1;
    };
    goto.current = (k, user) => {
      if (k !== target && scenes[k]) startLever(k, user);
    };

    /* ---- étiquettes et bulles (HTML) ---- */
    const pool = new Map<string, HTMLElement>();
    const lines = new Map<string, SVGLineElement>();
    function clearOverlay() {
      for (const n of pool.values()) n.remove();
      pool.clear();
      for (const l of lines.values()) l.remove();
      lines.clear();
    }
    const text = live.current.calloutText;
    const placeName = (id: string) => (live.current.locale === "fr" ? PLACES[id].fr : PLACES[id].en);

    const updateOverlay = () => {
      const k = target;
      const scene = scenes[k];
      if (!scene) return;
      const p = live.current;
      const c = map.getCenter();
      const cv = vec(c.lng, c.lat);
      const taken: Rect[] = [...p.reserved.current];
      const free = (r: Rect) => r.x >= 6 && r.y >= 6 && r.x + r.w <= size.w - 6 && r.y + r.h <= size.h - 6 && !taken.some((t) => r.x < t.x + t.w && r.x + r.w > t.x && r.y < t.y + t.h && r.y + r.h > t.y);
      const used = new Set<string>();
      const zoomOk = clamp01((cam.zoom - 2.7) / 0.7);
      const front = (lon: number, lat: number) => {
        const v = vec(lon, lat);
        return v[0] * cv[0] + v[1] * cv[1] + v[2] * cv[2] > 0.3;
      };

      /* bulles d'explication */
      const usedLeaders = new Set<string>();
      for (const co of scene.callouts) {
        const ramp = Math.min(clamp01((u - co.t0) / 0.05), clamp01((co.t1 - u) / 0.05 + (co.t1 >= 0.97 ? 1 : 0)));
        if (ramp <= 0 || !zoomOk) continue;
        const [lon, lat] = anchorOf(co.at);
        if (!front(lon, lat)) continue;
        const a = map.project([lon, lat]);
        const key = `c:${k}:${co.key}`;
        let n = pool.get(key);
        if (!n) {
          const tx = text(levers[k], co.key);
          n = document.createElement("div");
          n.className = "lever-callout";
          n.style.setProperty("--c", co.color);
          n.innerHTML = `<i></i><span><b></b><em></em></span>`;
          n.querySelector("b")!.textContent = tx.title;
          n.querySelector("em")!.textContent = tx.sub;
          ov.appendChild(n);
          pool.set(key, n);
        }
        const w = n.offsetWidth || 210;
        const h = n.offsetHeight || 50;
        const options = [
          [20, -h - 26],
          [20, 26],
          [-w - 20, -h - 26],
          [-w - 20, 26],
          [20, -h - 90],
          [-w - 20, 90],
        ];
        let placed = false;
        for (const [dx, dy] of options) {
          const r = { x: a.x + dx, y: a.y + dy, w, h };
          if (!free(r)) continue;
          taken.push(r);
          n.style.transform = `translate(${r.x.toFixed(1)}px, ${r.y.toFixed(1)}px)`;
          n.style.opacity = String(ramp);
          used.add(key);
          // fil entre le lieu et la bulle
          let ln = lines.get(key);
          if (!ln) {
            ln = document.createElementNS("http://www.w3.org/2000/svg", "line");
            ln.setAttribute("stroke", co.color);
            ln.setAttribute("stroke-width", "1.2");
            svg.appendChild(ln);
            lines.set(key, ln);
          }
          const ex = dx > 0 ? r.x : r.x + w;
          const ey = dy < 0 ? r.y + h : r.y;
          ln.setAttribute("x1", a.x.toFixed(1));
          ln.setAttribute("y1", a.y.toFixed(1));
          ln.setAttribute("x2", ex.toFixed(1));
          ln.setAttribute("y2", ey.toFixed(1));
          ln.setAttribute("stroke-opacity", String(0.7 * ramp));
          usedLeaders.add(key);
          placed = true;
          break;
        }
        if (!placed) n.style.opacity = "0";
      }
      for (const [key, ln] of lines) if (!usedLeaders.has(key)) ln.setAttribute("stroke-opacity", "0");

      /* noms de lieux */
      const seen = new Set<string>();
      for (const nd of scene.nodes) {
        if (!nd.label || typeof nd.at !== "string" || seen.has(nd.at)) continue;
        seen.add(nd.at);
        const k2 = clamp01((u - nd.t) / 0.05);
        if (k2 <= 0 || !zoomOk) continue;
        const [lon, lat] = anchorOf(nd.at);
        if (!front(lon, lat)) continue;
        const a = map.project([lon, lat]);
        const key = `p:${k}:${nd.at}`;
        let n = pool.get(key);
        if (!n) {
          n = document.createElement("span");
          n.className = "lever-place";
          n.textContent = placeName(nd.at);
          ov.appendChild(n);
          pool.set(key, n);
        }
        const w = n.offsetWidth || placeName(nd.at).length * 6.6;
        const spots = [[9, -22], [-w - 9, -22], [9, 6], [-w - 9, 6]];
        let ok = false;
        for (const [dx, dy] of spots) {
          const r = { x: a.x + dx, y: a.y + dy, w, h: 16 };
          if (!free(r)) continue;
          taken.push(r);
          n.style.transform = `translate(${r.x.toFixed(1)}px, ${r.y.toFixed(1)}px)`;
          n.style.opacity = String(k2);
          used.add(key);
          ok = true;
          break;
        }
        if (!ok) n.style.opacity = "0";
      }
      for (const [key, n] of pool) if (!used.has(key)) n.style.opacity = "0";
    };

    const setData = (id: string, features: GeoJSON.Feature[]) => (map.getSource(id) as maplibregl.GeoJSONSource | undefined)?.setData({ type: "FeatureCollection", features });

    /* ---- boucle ---- */
    let raf = 0;
    let last = 0;
    let frameNo = 0;
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      const p = live.current;
      const dt = last ? Math.min((t - last) / 1000, 0.1) : 0;
      last = t;
      if (!ready || !visible || document.hidden || target < 0) return;
      frameNo++;
      const still = p.reducedMotion;

      /* temps : le levier avance quand on lit, ou une fois jusqu'au bout après un choix manuel */
      const running = !still && (p.playing || force);
      if (still) u = 1;
      else if (running) u = Math.min(1, u + dt / LEVER_SECONDS);
      if (u >= 1 && !advanced) {
        force = false;
        if (p.playing && !still) {
          advanced = true;
          p.onAdvance();
        }
      }
      p.progress.current = clamp01(u);
      if (!still && (running || u < 1)) clock += dt;
      if (leaving) {
        leaving.t += dt;
        if (leaving.t >= FADE_OUT) leaving = null;
      }

      /* caméra */
      camT += dt;
      const e = easeInOutCubic(clamp01(still ? 1 : camT / camDur));
      const goal = camOf(target);
      const lonStart = intro ? goal.lon - 70 : camFrom.lon;
      const latStart = intro ? goal.lat - 12 : camFrom.lat;
      const zStart = intro ? 1.5 : camFrom.zoom;
      const dip = intro ? 0 : Math.min(0.5, Math.hypot(goal.lon - camFrom.lon, goal.lat - camFrom.lat) * 0.04) * Math.sin(Math.PI * e);
      cam = {
        lon: lonStart + (goal.lon - lonStart) * e,
        lat: latStart + (goal.lat - latStart) * e,
        zoom: zStart + (goal.zoom - zStart) * e - dip,
        pitch: (intro ? 0 : camFrom.pitch) + (PITCH - (intro ? 0 : camFrom.pitch)) * e,
        bearing: (intro ? 0 : camFrom.bearing) + (BEARING - (intro ? 0 : camFrom.bearing)) * e,
      };
      if (e >= 1) {
        intro = false;
        // dérive très lente une fois en place
        cam = { ...cam, lon: cam.lon + Math.sin(clock * 0.12) * 0.25, bearing: BEARING + Math.sin(clock * 0.09) * 1.6 };
      }
      const pd = p.pad;
      map.jumpTo({ center: [cam.lon, Math.max(-80, Math.min(80, cam.lat))], zoom: cam.zoom, pitch: cam.pitch, bearing: cam.bearing, padding: { left: Math.round(pd.left), right: Math.round(pd.right), top: Math.round(pd.top), bottom: Math.round(pd.bottom) } });

      /* contenu : deux images sur trois suffisent pour les données, la caméra reste fluide */
      if (frameNo % 2 === 0 || still) {
        const cur = frameOf(scenes[target], Math.max(0, u), 1, clock, still);
        const old = leaving ? frameOf(leaving.scene, leaving.u, 1 - leaving.t / FADE_OUT, clock, still) : null;
        const all = (key: keyof Frame) => (old ? [...old[key], ...cur[key]] : cur[key]);
        setData("flows", all("lines"));
        setData("halos", all("halos"));
        setData("nodes", all("nodes"));
        setData("pulses", all("pulses"));
        setData("rings", all("rings"));
      }
      if (u > 0 && shown !== target) {
        shown = target;
        p.onShown(target);
      }
      updateOverlay();
    };

    map.on("load", () => {
      ready = true;
      startLever(Math.max(0, Math.min(scenes.length - 1, live.current.active)), false);
      raf = requestAnimationFrame(tick);
      live.current.onReady();
    });

    return () => {
      cancelAnimationFrame(raf);
      goto.current = null;
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener("webglcontextlost", lost);
      clearOverlay();
      map.remove();
    };
    // Le globe se construit une fois ; les changements de levier passent par `goto`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lastActive = useRef(props.active);
  useEffect(() => {
    if (lastActive.current !== props.active) {
      // un changement venu de la lecture automatique n'est pas un geste de l'utilisateur
      goto.current?.(props.active, !props.playing);
      lastActive.current = props.active;
    }
  }, [props.active, props.playing]);

  return (
    <div className="relative h-full w-full">
      <div ref={container} role="img" aria-label={props.ariaLabel} className="h-full w-full" />
      <div ref={overlay} aria-hidden="true" className="lever-overlay pointer-events-none absolute inset-0 overflow-hidden">
        <svg ref={leaders} className="absolute inset-0 h-full w-full" />
      </div>
    </div>
  );
}

export { LEVER_COLOR };
