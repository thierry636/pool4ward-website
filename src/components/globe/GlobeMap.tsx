"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { LayerId, Manifest, ManifestZone } from "./api";
import { forcesGlobe, isSoftwareRenderer, supportsWebGL } from "./api";

export interface GlobeMapHandle {
  zoomIn(): void;
  zoomOut(): void;
  reset(): void;
  flyToZone(zone: ManifestZone): void;
}

export interface GlobeMapProps {
  /** Reçoit les commandes de la carte (zoom, vue d'ensemble, vol vers une zone). */
  apiRef: MutableRefObject<GlobeMapHandle | null>;
  manifest: Manifest;
  active: LayerId[];
  zone: ManifestZone | null;
  rotating: boolean;
  reducedMotion: boolean;
  mobile: boolean;
  ariaLabel: string;
  onUserGesture(): void;
  onMapClick(lon: number, lat: number): void;
  onFatal(reason: "nowebgl" | "lost" | "software"): void;
  onTileProblem(kind: "unauthorized" | "limited" | "error"): void;
  onReady(): void;
}

const HOME = { center: [10, 42] as [number, number] };

/**
 * Zoom d'ouverture : le globe occupe environ 80 % de la plus petite dimension
 * du cadre (en projection globe, le diamètre vaut ≈ 163 × 2^zoom pixels).
 */
function homeZoom(el: HTMLElement | null): number {
  const size = el ? Math.min(el.clientWidth, el.clientHeight) : 600;
  return Math.max(0.7, Math.min(2.4, Math.log2((0.8 * size) / 163)));
}
const EMPTY: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: [] };

function bboxFeature(b: ManifestZone["bbox"]): GeoJSON.FeatureCollection {
  const [w, s, e, n] = b;
  return {
    type: "FeatureCollection",
    features: [{ type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[w, s], [e, s], [e, n], [w, n], [w, s]]] } }],
  };
}

/**
 * Globe MapLibre (projection « globe »). Le fond — terres et frontières — est
 * public (Natural Earth). Les couches des référentiels sont des sources
 * RASTER : des images générées côté serveur, jamais de la géométrie ni des
 * attributs. La carte plafonne le zoom de chaque couche au zoom servi.
 */
export function GlobeMap(props: GlobeMapProps) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const live = useRef(props);
  live.current = props;

  useEffect(() => {
    props.apiRef.current = {
    zoomIn: () => mapRef.current?.zoomIn({ duration: live.current.reducedMotion ? 0 : 350 }),
    zoomOut: () => mapRef.current?.zoomOut({ duration: live.current.reducedMotion ? 0 : 350 }),
    reset: () =>
      mapRef.current?.easeTo({ center: HOME.center, zoom: homeZoom(container.current), duration: live.current.reducedMotion ? 0 : 900 }),
    flyToZone: (z) => {
      const m = mapRef.current;
      if (!m) return;
      const [w, s, e, n] = z.bbox;
      const cam = m.cameraForBounds([[w, s], [e, n]], { padding: 40 });
      if (cam?.center) {
        const c = cam.center as { lng: number; lat: number } | [number, number];
        m.easeTo({
          center: Array.isArray(c) ? c : [c.lng, c.lat],
          zoom: Math.min(cam.zoom ?? 3, 4.2),
          duration: live.current.reducedMotion ? 0 : 1200,
        });
      }
    },
    };
    return () => {
      props.apiRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- création, une seule fois ---- */
  useEffect(() => {
    if (!container.current) return;
    if (!supportsWebGL()) {
      live.current.onFatal("nowebgl");
      return;
    }
    if (isSoftwareRenderer() && !forcesGlobe()) {
      live.current.onFatal("software");
      return;
    }
    const { manifest, mobile } = live.current;
    const origin = window.location.origin;

    const sources: Record<string, maplibregl.SourceSpecification> = {
      "land-110": { type: "geojson", data: `${origin}/geo/land-110m.json` },
      "borders-110": { type: "geojson", data: `${origin}/geo/borders-110m.json` },
      zone: { type: "geojson", data: EMPTY },
    };
    for (const l of manifest.layers) {
      if (l.availability === "unavailable") continue;
      sources[`r-${l.id}`] = {
        type: "raster",
        tiles: [`${origin}/api/globe/tiles/${l.id}/{z}/{x}/{y}.png`],
        tileSize: manifest.tileSize,
        minzoom: 0,
        maxzoom: l.maxZoom,
      };
    }

    const style: maplibregl.StyleSpecification = {
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
      sources,
      layers: [
        { id: "ocean", type: "background", paint: { "background-color": "#0a2d4a" } },
        { id: "land", type: "fill", source: "land-110", maxzoom: 3.4, paint: { "fill-color": "#163f2f", "fill-outline-color": "#2f7d5c" } },
        { id: "borders", type: "line", source: "borders-110", maxzoom: 3.4, paint: { "line-color": "#79b59a", "line-opacity": 0.3, "line-width": 0.7 } },
        ...manifest.layers
          .filter((l) => l.availability !== "unavailable")
          .map(
            (l): maplibregl.LayerSpecification => ({
              id: `r-${l.id}`,
              type: "raster",
              source: `r-${l.id}`,
              layout: { visibility: "none" },
              paint: { "raster-fade-duration": 200, "raster-resampling": "linear" },
            }),
          ),
        { id: "zone-fill", type: "fill", source: "zone", paint: { "fill-color": "#e8b964", "fill-opacity": 0.1 } },
        { id: "zone-line", type: "line", source: "zone", paint: { "line-color": "#e8b964", "line-width": 1.6 } },
      ],
    };

    const map = new maplibregl.Map({
      container: container.current,
      style,
      center: HOME.center,
      zoom: homeZoom(container.current),
      minZoom: 0.6,
      maxZoom: 6.2,
      maxPitch: 0,
      attributionControl: false,
      renderWorldCopies: false,
      pixelRatio: Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2),
      canvasContextAttributes: { antialias: !mobile },
      fadeDuration: 150,
    });
    mapRef.current = map;
    map.touchZoomRotate.disableRotation();

    let fine = false;
    const addFineBase = () => {
      if (fine || mobile) return;
      fine = true;
      map.addSource("land-50", { type: "geojson", data: `${origin}/geo/land-50m.json` });
      map.addSource("borders-50", { type: "geojson", data: `${origin}/geo/borders-50m.json` });
      map.addLayer({ id: "land-fine", type: "fill", source: "land-50", minzoom: 3.2, paint: { "fill-color": "#163f2f", "fill-outline-color": "#2f7d5c" } }, "zone-fill");
      map.addLayer({ id: "borders-fine", type: "line", source: "borders-50", minzoom: 3.2, paint: { "line-color": "#79b59a", "line-opacity": 0.3, "line-width": 0.7 } }, "zone-fill");
    };

    // Le fond fin n'est téléchargé que si l'on s'approche vraiment.
    map.on("zoom", () => {
      if (map.getZoom() > 2.6) addFineBase();
    });

    let readySent = false;
    map.on("load", () => {
      applyLayers();
      applyZone();
      if (!readySent) {
        readySent = true;
        live.current.onReady();
      }
    });

    const gesture = () => live.current.onUserGesture();
    for (const ev of ["mousedown", "touchstart", "wheel", "keydown"] as const) {
      map.getCanvasContainer().addEventListener(ev, gesture, { passive: true });
    }

    map.on("click", (e) => live.current.onMapClick(e.lngLat.lng, e.lngLat.lat));

    let lastProblem = 0;
    map.on("error", (e) => {
      const status = (e.error as { status?: number } | undefined)?.status;
      const src = (e as { sourceId?: string }).sourceId ?? "";
      if (!src.startsWith("r-") || Date.now() - lastProblem < 2000) return;
      lastProblem = Date.now();
      if (status === 401) live.current.onTileProblem("unauthorized");
      else if (status === 429 || status === 403) live.current.onTileProblem("limited");
      else live.current.onTileProblem("error");
    });

    const canvas = map.getCanvas();
    const lost = (ev: Event) => {
      ev.preventDefault();
      live.current.onFatal("lost");
    };
    canvas.addEventListener("webglcontextlost", lost);

    /* Rotation douce : facultative, arrêtée au premier geste, suspendue hors écran. */
    let raf = 0;
    let last = 0;
    let visible = true;
    const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting), { threshold: 0.1 });
    io.observe(container.current);
    const tick = (t: number) => {
      const dt = last ? Math.min(t - last, 64) : 0;
      last = t;
      const p = live.current;
      if (p.rotating && visible && !document.hidden && map.getZoom() < 3.2 && !map.isMoving()) {
        const c = map.getCenter();
        map.jumpTo({ center: [c.lng + dt * 0.0035, c.lat] });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    function applyLayers() {
      for (const l of live.current.manifest.layers) {
        if (!map.getLayer(`r-${l.id}`)) continue;
        map.setLayoutProperty(`r-${l.id}`, "visibility", live.current.active.includes(l.id) ? "visible" : "none");
      }
    }
    function applyZone() {
      const src = map.getSource("zone") as maplibregl.GeoJSONSource | undefined;
      src?.setData(live.current.zone ? bboxFeature(live.current.zone.bbox) : EMPTY);
    }
    (map as unknown as { __apply: () => void }).__apply = () => {
      if (!map.isStyleLoaded() && !map.getLayer("zone-fill")) return;
      applyLayers();
      applyZone();
    };

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      canvas.removeEventListener("webglcontextlost", lost);
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- synchronisation couches / zone ---- */
  useEffect(() => {
    const m = mapRef.current as (maplibregl.Map & { __apply?: () => void }) | null;
    m?.__apply?.();
  }, [props.active, props.zone]);

  return (
    <div
      ref={container}
      role="application"
      aria-label={props.ariaLabel}
      tabIndex={0}
      className="globe-canvas h-full w-full"
    />
  );
}
