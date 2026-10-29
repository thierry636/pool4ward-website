"use client";

import { useEffect, useMemo, useState } from "react";
import type { LayerId, Manifest, ManifestZone } from "./api";

/**
 * Carte à plat de repli (sans WebGL, ou si le contexte 3D est perdu). Mêmes
 * couches, mêmes images de tuiles — au zoom 2 du schéma de tuilage — sur un
 * fond de terres Natural Earth projeté en Mercator.
 */

const SIZE = 1024; // monde à z = 2 : 4 tuiles de 256 unités
const Y_TOP = 180; // ≈ 75° N
const Y_BOTTOM = 716; // ≈ 58° S

const mercX = (lon: number) => ((lon + 180) / 360) * SIZE;
const mercY = (lat: number) => {
  const s = Math.sin((Math.max(-85, Math.min(85, lat)) * Math.PI) / 180);
  return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * SIZE;
};

function landPath(geo: GeoJSON.FeatureCollection | GeoJSON.Feature): string {
  const feats = "features" in geo ? geo.features : [geo];
  let d = "";
  for (const f of feats) {
    const g = f.geometry;
    const polys = g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : [];
    for (const poly of polys) {
      for (const ring of poly) {
        let prev: number | null = null;
        ring.forEach(([lon, lat]) => {
          // Un saut de plus de 180° est un passage de l'antiméridien : on
          // reprend un nouveau tracé plutôt que de barrer la carte d'un trait.
          const jump = prev !== null && Math.abs(lon - prev) > 180;
          d += `${prev === null || jump ? "M" : "L"}${mercX(lon).toFixed(1)},${mercY(lat).toFixed(1)}`;
          prev = lon;
        });
        d += "Z";
      }
    }
  }
  return d;
}

export function FlatMap({
  manifest,
  active,
  zone,
  ariaLabel,
  onMapClick,
  onTileProblem,
}: {
  manifest: Manifest;
  active: LayerId[];
  zone: ManifestZone | null;
  ariaLabel: string;
  onMapClick(lon: number, lat: number): void;
  onTileProblem(kind: "error"): void;
}) {
  const [land, setLand] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    fetch("/geo/land-110m.json")
      .then((r) => r.json())
      .then((g) => !cancelled && setLand(landPath(g)))
      .catch(() => !cancelled && onTileProblem("error"));
    return () => {
      cancelled = true;
    };
  }, [onTileProblem]);

  const tiles = useMemo(
    () => Array.from({ length: 16 }, (_, i) => ({ x: i % 4, y: Math.floor(i / 4) })),
    [],
  );

  const zoneRect = zone
    ? {
        x: mercX(zone.bbox[0]),
        y: mercY(zone.bbox[3]),
        w: mercX(zone.bbox[2]) - mercX(zone.bbox[0]),
        h: mercY(zone.bbox[1]) - mercY(zone.bbox[3]),
      }
    : null;

  const click = (e: React.MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * SIZE;
    const y = Y_TOP + ((e.clientY - r.top) / r.height) * (Y_BOTTOM - Y_TOP);
    const lon = (x / SIZE) * 360 - 180;
    const lat = (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / SIZE))) * 180) / Math.PI;
    onMapClick(lon, lat);
  };

  return (
    <svg
      viewBox={`0 ${Y_TOP} ${SIZE} ${Y_BOTTOM - Y_TOP}`}
      role="img"
      aria-label={ariaLabel}
      className="h-full w-full cursor-crosshair"
      preserveAspectRatio="xMidYMid meet"
      onClick={click}
      style={{ background: "#0a2d4a" }}
    >
      <path d={land} fill="#163f2f" stroke="#2f7d5c" strokeWidth="0.6" />
      {manifest.layers
        .filter((l) => active.includes(l.id) && l.availability !== "unavailable")
        .map((l) => (
          <g key={l.id}>
            {tiles.map((t) => (
              <image
                key={`${t.x}-${t.y}`}
                href={`/api/globe/tiles/${l.id}/2/${t.x}/${t.y}.png`}
                x={t.x * 256}
                y={t.y * 256}
                width="256"
                height="256"
                preserveAspectRatio="none"
              />
            ))}
          </g>
        ))}
      {zoneRect && (
        <rect x={zoneRect.x} y={zoneRect.y} width={zoneRect.w} height={zoneRect.h} fill="#e8b964" fillOpacity="0.1" stroke="#e8b964" strokeWidth="2" />
      )}
    </svg>
  );
}
