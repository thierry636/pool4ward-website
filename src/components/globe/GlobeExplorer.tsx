"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import {
  LAYER_GLYPH,
  fetchManifest,
  fetchZone,
  openSession,
  preferLightweight,
  zoneAt,
  type LayerId,
  type Manifest,
  type ManifestLayer,
  type ManifestZone,
  type ZoneSummary,
} from "./api";
import type { GlobeMapHandle } from "./GlobeMap";
import { FlatMap } from "./FlatMap";

/* MapLibre ne se charge qu'à la demande : ni le module ni sa feuille de style
   ne pèsent sur la première visite. */
const GlobeMap = dynamic(() => import("./GlobeMap").then((m) => m.GlobeMap), { ssr: false });

type Phase = "poster" | "loading" | "ready" | "error";
type Summary =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "ok"; data: ZoneSummary }
  | { state: "error" }
  | { state: "limited" };

export function GlobeExplorer({
  variant = "embedded",
  autoLoad = false,
  onClose,
  onFullscreen,
}: {
  variant?: "embedded" | "immersive";
  autoLoad?: boolean;
  onClose?: () => void;
  onFullscreen?: () => void;
}) {
  const t = useTranslations("Globe");
  const reduced = usePrefersReducedMotion();
  const shell = useRef<HTMLDivElement>(null);
  const mapCell = useRef<HTMLDivElement>(null);
  const map = useRef<GlobeMapHandle | null>(null);

  const [phase, setPhase] = useState<Phase>("poster");
  const [errorKey, setErrorKey] = useState<"manifestError" | "sessionError" | "notConnected">("manifestError");
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [renderer, setRenderer] = useState<"globe" | "flat">("globe");
  const [fatal, setFatal] = useState<"nowebgl" | "lost" | "software" | null>(null);
  const [active, setActive] = useState<LayerId[]>(["services", "networks"]);
  const [zone, setZone] = useState<ManifestZone | null>(null);
  const [summary, setSummary] = useState<Summary>({ state: "idle" });
  const [rotating, setRotating] = useState(true);
  const [notice, setNotice] = useState<"sourceError" | "tooMany" | "sessionError" | null>(null);
  const [mobile, setMobile] = useState(false);
  const [globeKey, setGlobeKey] = useState(0);
  const sessionRetry = useRef(0);

  useEffect(() => {
    setMobile(window.matchMedia("(max-width: 767px)").matches);
  }, []);

  /* Sous « mouvement réduit », la rotation ne démarre jamais d'elle-même. */
  useEffect(() => {
    if (reduced) setRotating(false);
  }, [reduced]);

  const load = useCallback(async () => {
    setPhase("loading");
    try {
      const [m, s] = await Promise.all([fetchManifest(), openSession()]);
      if (s === "not_configured") {
        setErrorKey("notConnected");
        setPhase("error");
        return;
      }
      if (s !== "ok") {
        setErrorKey("sessionError");
        setPhase("error");
        return;
      }
      setManifest(m);
      setActive((a) => a.filter((id) => m.layers.find((l) => l.id === id && l.availability !== "unavailable")).slice(-m.maxActiveLayers));
      setPhase("ready");
    } catch {
      setErrorKey("manifestError");
      setPhase("error");
    }
  }, []);

  /* Chargement différé : le contenu et les appels à l'action sont déjà là ;
     le globe ne démarre que lorsqu'il approche de l'écran, une fois la page
     chargée. */
  useEffect(() => {
    // Appareil modeste, mode économie de données ou connexion lente : le globe
    // attend une demande explicite (le bouton de l'aperçu).
    if (!autoLoad || phase !== "poster" || !mapCell.current || preferLightweight()) return;
    const el = mapCell.current;
    let io: IntersectionObserver | undefined;
    const start = () => {
      io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            io?.disconnect();
            void load();
          }
        },
        { threshold: 0.6 },
      );
      io.observe(el);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      io?.disconnect();
      window.removeEventListener("load", start);
    };
  }, [autoLoad, phase, load]);

  /* Synthèse de la zone sélectionnée. */
  useEffect(() => {
    if (!zone) {
      setSummary({ state: "idle" });
      return;
    }
    let cancelled = false;
    setSummary({ state: "loading" });
    fetchZone(zone.id).then((r) => {
      if (cancelled) return;
      if (r.status === "ok") setSummary({ state: "ok", data: r.summary });
      else setSummary({ state: r.status });
    });
    return () => {
      cancelled = true;
    };
  }, [zone]);

  const toggleLayer = (id: LayerId) => {
    if (!manifest) return;
    setActive((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id].slice(-manifest.maxActiveLayers)));
  };

  const selectZone = useCallback(
    (z: ManifestZone | null) => {
      setZone(z);
      if (z) map.current?.flyToZone(z);
    },
    [],
  );

  const onMapClick = useCallback(
    (lon: number, lat: number) => {
      if (!manifest) return;
      const z = zoneAt(manifest.zones, lon, lat);
      if (z) selectZone(z);
    },
    [manifest, selectZone],
  );

  const onTileProblem = useCallback(async (kind: "unauthorized" | "limited" | "error") => {
    if (kind === "limited") return setNotice("tooMany");
    if (kind === "unauthorized" && sessionRetry.current < 2) {
      sessionRetry.current += 1;
      const r = await openSession();
      if (r === "ok") {
        setGlobeKey((k) => k + 1);
        return;
      }
      setNotice(r === "limited" ? "tooMany" : "sessionError");
      return;
    }
    setNotice("sourceError");
  }, []);

  const onFatal = useCallback((reason: "nowebgl" | "lost" | "software") => {
    setFatal(reason);
    setRenderer("flat");
  }, []);

  const retryGlobe = () => {
    setFatal(null);
    setRenderer("globe");
    setGlobeKey((k) => k + 1);
  };

  const immersive = variant === "immersive";
  const sizeClass = immersive ? "h-full" : "";
  const mapHeight = immersive ? "h-[55vh] lg:h-full" : "h-[26rem] sm:h-[32rem] lg:h-[40rem]";

  return (
    <div
      ref={shell}
      className={`tone-dark ${sizeClass} ${immersive ? "grid lg:grid-cols-[minmax(0,1fr)_23rem]" : "grid border lg:grid-cols-[minmax(0,1fr)_23rem]"}`}
      style={{ borderColor: "var(--rule)" }}
    >
      {/* ---- carte ---- */}
      <div ref={mapCell} className={`relative min-h-0 ${mapHeight}`} style={{ background: "#071a12" }}>
        {phase === "poster" && <Poster onLoad={load} onFullscreen={onFullscreen} />}

        {phase === "loading" && (
          <div className="absolute inset-0 grid place-items-center" role="status">
            <Poster dim />
            <p className="mono relative text-[0.8rem] uppercase tracking-[0.12em]">{t("states.loading")}</p>
          </div>
        )}

        {phase === "error" && (
          <div className="absolute inset-0 grid place-items-center p-8 text-center" role="alert">
            <div>
              <p className="h3">{t(`states.${errorKey}`)}</p>
              <button type="button" className="btn btn-line mt-6" onClick={load}>
                {t("states.retry")}
              </button>
            </div>
          </div>
        )}

        {phase === "ready" && manifest && (
          <>
            {renderer === "globe" ? (
              <GlobeMap
                key={globeKey}
                apiRef={map}
                manifest={manifest}
                active={active}
                zone={zone}
                rotating={rotating}
                reducedMotion={reduced}
                mobile={mobile}
                ariaLabel={t("controls.map")}
                onUserGesture={() => setRotating(false)}
                onMapClick={onMapClick}
                onFatal={onFatal}
                onTileProblem={onTileProblem}
                onReady={() => setNotice(null)}
              />
            ) : (
              <FlatMap
                manifest={manifest}
                active={active}
                zone={zone}
                ariaLabel={t("label")}
                onMapClick={onMapClick}
                onTileProblem={() => setNotice("sourceError")}
              />
            )}

            <div className="absolute right-3 top-3 flex flex-col gap-2">
              {renderer === "globe" && (
                <>
                  <MapButton label={t("controls.zoomIn")} onClick={() => map.current?.zoomIn()}>+</MapButton>
                  <MapButton label={t("controls.zoomOut")} onClick={() => map.current?.zoomOut()}>−</MapButton>
                  <MapButton label={t("controls.reset")} onClick={() => map.current?.reset()}>⌂</MapButton>
                  <MapButton
                    label={rotating ? t("controls.pause") : t("controls.resume")}
                    pressed={rotating}
                    onClick={() => setRotating((r) => !r)}
                  >
                    {rotating ? "❚❚" : "▶"}
                  </MapButton>
                </>
              )}
              {onFullscreen && !immersive && (
                <MapButton label={t("controls.fullscreen")} onClick={onFullscreen}>⤢</MapButton>
              )}
            </div>

            {(fatal || notice) && (
              <div className="absolute inset-x-3 bottom-3 border p-3 text-[0.9rem] leading-snug" style={{ borderColor: "var(--rule-strong)", background: "color-mix(in srgb, var(--bg) 92%, transparent)" }} role="status">
                {fatal ? (
                  <span>
                    {t(fatal === "nowebgl" ? "states.noWebgl" : fatal === "software" ? "states.software" : "states.lost")}{" "}
                    {fatal !== "nowebgl" && (
                      <button type="button" className="underline underline-offset-4" onClick={retryGlobe}>
                        {t("states.retry")}
                      </button>
                    )}
                  </span>
                ) : (
                  notice && <span>{t(`states.${notice}`)}</span>
                )}
              </div>
            )}
          </>
        )}

        {immersive && onClose && (
          <button type="button" onClick={onClose} className="btn btn-line absolute left-3 top-3 !bg-[color-mix(in_srgb,var(--bg)_85%,transparent)]" data-autofocus>
            <span aria-hidden="true">←</span> {t("controls.close")}
          </button>
        )}
      </div>

      {/* ---- panneau ---- */}
      <aside className={`flex flex-col gap-6 border-t p-5 lg:border-l lg:border-t-0 ${immersive ? "overflow-y-auto" : "lg:max-h-[40rem] lg:overflow-y-auto"}`} style={{ borderColor: "var(--rule)", background: "var(--bg-2)" }} aria-label={t("label")}>
        {manifest?.mode === "demo" || phase !== "ready" ? (
          <div className="border-l-2 pl-3 text-[0.85rem] leading-relaxed" style={{ borderColor: "var(--warm)" }}>
            <p>{t("banner.demo")}</p>
            <p className="mono mt-1 text-[0.74rem]" style={{ color: "var(--fg-2)" }}>{t("banner.freshness")}</p>
          </div>
        ) : null}

        {manifest && (
          <>
            <fieldset>
              <legend className="eyebrow mb-1">{t("controls.layers")}</legend>
              <p className="mb-3 text-[0.8rem]" style={{ color: "var(--fg-2)" }}>{t("controls.layersHelp")}</p>
              <ul className="space-y-1">
                {manifest.layers.map((l) => (
                  <LayerRow key={l.id} layer={l} checked={active.includes(l.id)} onToggle={() => toggleLayer(l.id)} />
                ))}
              </ul>
            </fieldset>

            <div>
              <label htmlFor={`zone-${variant}`} className="eyebrow mb-2 block">{t("controls.zone")}</label>
              <select
                id={`zone-${variant}`}
                value={zone?.id ?? ""}
                onChange={(e) => selectZone(manifest.zones.find((z) => z.id === e.target.value) ?? null)}
                className="min-h-[2.75rem] w-full border bg-transparent px-3 text-[0.95rem]"
                style={{ borderColor: "var(--rule-strong)", borderRadius: 2 }}
              >
                <option value="" style={{ color: "#0e2219" }}>{t("controls.zoneNone")}</option>
                {[...manifest.zones]
                  .sort((a, b) => t(`zones.${a.slug}`).localeCompare(t(`zones.${b.slug}`)))
                  .map((z) => (
                    <option key={z.id} value={z.id} style={{ color: "#0e2219" }}>
                      {t(`zones.${z.slug}`)}
                    </option>
                  ))}
              </select>
            </div>

            <ZonePanel zone={zone} summary={summary} manifest={manifest} active={active} />
          </>
        )}

        <p className="mt-auto text-[0.76rem] leading-relaxed" style={{ color: "var(--fg-2)" }}>{t("legendNote")}</p>
      </aside>
    </div>
  );
}

/* ------------------------------------------------------------------ pièces */

function MapButton({ label, onClick, children, pressed }: { label: string; onClick(): void; children: React.ReactNode; pressed?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      className="mono grid h-11 w-11 place-items-center border text-[1.05rem] transition-colors hover:bg-[color-mix(in_srgb,var(--fg)_14%,transparent)]"
      style={{ borderColor: "var(--rule-strong)", background: "color-mix(in srgb, var(--bg) 80%, transparent)", borderRadius: 2 }}
    >
      {children}
    </button>
  );
}

function Poster({ onLoad, onFullscreen, dim }: { onLoad?: () => void; onFullscreen?: () => void; dim?: boolean }) {
  const t = useTranslations("Globe.poster");
  return (
    <div className="absolute inset-0 grid place-items-center overflow-hidden" style={{ opacity: dim ? 0.4 : 1 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/globe-poster.svg" alt="" aria-hidden="true" className="h-[92%] w-auto max-w-[92%] object-contain" />
      {onLoad && (
        <div className="absolute inset-x-0 bottom-6 flex flex-col items-center gap-3 px-4 text-center">
          <p className="mono max-w-sm text-[0.76rem]" style={{ color: "var(--fg-2)" }}>{t("label")}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" className="btn btn-solid" onClick={onLoad}>{t("load")}</button>
            {onFullscreen && (
              <button type="button" className="btn btn-line" onClick={onFullscreen}>{t("open")}</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Glyph({ kind, color }: { kind: (typeof LAYER_GLYPH)[LayerId]; color: string }) {
  const common = { fill: color } as const;
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" className="shrink-0">
      {kind === "circle" && <circle cx="11" cy="11" r="6.5" {...common} />}
      {kind === "diamond" && <rect x="5" y="5" width="12" height="12" transform="rotate(45 11 11)" {...common} />}
      {kind === "square" && <rect x="5" y="5" width="12" height="12" {...common} />}
      {kind === "triangle" && <path d="M11 4 L18 17 H4 Z" {...common} />}
      {kind === "line" && <path d="M2 14 L8 8 L14 12 L20 5" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
}

function LayerRow({ layer, checked, onToggle }: { layer: ManifestLayer; checked: boolean; onToggle(): void }) {
  const t = useTranslations("Globe");
  const off = layer.availability === "unavailable";
  return (
    <li>
      <label
        className={`flex min-h-[2.75rem] items-start gap-3 py-2 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 ${off ? "opacity-55" : "cursor-pointer"}`}
        style={{ outlineColor: "var(--focus)" }}
      >
        <input type="checkbox" checked={checked} disabled={off} onChange={onToggle} className="sr-only" />
        <span
          aria-hidden="true"
          className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center border"
          style={{ borderColor: "var(--rule-strong)", background: checked ? "var(--warm)" : "transparent", color: "var(--bg)", borderRadius: 2 }}
        >
          {checked && "✓"}
        </span>
        <Glyph kind={LAYER_GLYPH[layer.id]} color={layer.color} />
        <span className="min-w-0">
          <span className="block text-[0.95rem] font-medium leading-snug">{t(`layers.${layer.id}.short`)}</span>
          <span className="mono block text-[0.7rem] uppercase tracking-[0.06em]" style={{ color: "var(--fg-2)" }}>
            {t(`kind.${layer.kind}`)} · {t(`availability.${layer.availability}`)}
          </span>
        </span>
      </label>
    </li>
  );
}

function ZonePanel({ zone, summary, manifest, active }: { zone: ManifestZone | null; summary: Summary; manifest: Manifest; active: LayerId[] }) {
  const t = useTranslations("Globe");
  const tz = useTranslations("Globe.zonePanel");

  return (
    <div aria-live="polite" className="border-t pt-5" style={{ borderColor: "var(--rule)" }}>
      <h3 className="eyebrow">{tz("title")}</h3>
      {!zone && <p className="mt-3 text-[0.9rem] leading-relaxed" style={{ color: "var(--fg-2)" }}>{tz("none")}</p>}
      {zone && (
        <>
          <p className="h3 mt-3 !text-[1.25rem]">{t(`zones.${zone.slug}`)}</p>
          {summary.state === "loading" && <p className="mt-3 text-[0.9rem]">{tz("loading")}</p>}
          {summary.state === "error" && <p className="mt-3 text-[0.9rem]">{tz("error")}</p>}
          {summary.state === "limited" && <p className="mt-3 text-[0.9rem]">{t("states.tooMany")}</p>}
          {summary.state === "ok" && (
            <ul className="mt-3 space-y-3">
              {summary.data.layers
                .filter((l) => active.includes(l.layer))
                .map((l) => {
                  const meta = manifest.layers.find((m) => m.id === l.layer)!;
                  return (
                    <li key={l.layer} className="flex gap-3">
                      <Glyph kind={LAYER_GLYPH[l.layer]} color={meta.color} />
                      <div className="text-[0.9rem] leading-snug">
                        <p className="font-medium">{t(`layers.${l.layer}.short`)}</p>
                        <p style={{ color: "var(--fg-2)" }}>
                          {l.availability === "unavailable"
                            ? tz("unavailable")
                            : l.corridors !== undefined
                              ? tz(l.corridors ? "corridorsYes" : "corridorsNo")
                              : l.suppressed || !l.range
                                ? tz("suppressed")
                                : l.range.max === null
                                  ? tz("rangeOpen", { min: l.range.min })
                                  : tz("range", { min: l.range.min, max: l.range.max })}
                        </p>
                      </div>
                    </li>
                  );
                })}
              {active.length === 0 && <li className="text-[0.9rem]" style={{ color: "var(--fg-2)" }}>{tz("noLayer")}</li>}
            </ul>
          )}
          <p className="mt-4 text-[0.8rem] leading-relaxed" style={{ color: "var(--fg-2)" }}>{tz("note")}</p>
          <Link href="/contact" className="mono mt-2 inline-flex min-h-[2.75rem] items-center text-[0.78rem] uppercase tracking-[0.08em] underline underline-offset-4">
            {tz("request")} →
          </Link>
        </>
      )}
    </div>
  );
}
