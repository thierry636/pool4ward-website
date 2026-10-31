/**
 * Fond de carte à plat des scènes : projection de Mercator en unités de 0,1°, et chemin SVG des
 * terres et des frontières. Le jeu de données est chargé une fois pour toute la page (la couverture
 * et les tuiles des référentiels s'en servent), jamais deux fois.
 */

const UPD = 10;
const WORLD = 360 * UPD;

export const mx = (lon: number) => (lon + 180) * UPD;
export const my = (lat: number) => {
  const s = Math.sin((Math.max(-85, Math.min(85, lat)) * Math.PI) / 180);
  return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * WORLD;
};

export function geoPath(geo: GeoJSON.Feature | GeoJSON.FeatureCollection, close: boolean): string {
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

export interface GeoPaths {
  land: string;
  borders: string;
}

let pending: Promise<GeoPaths> | null = null;

/** Les terres et les frontières de l'Europe, en chemins SVG ; un échec rend un fond vide, sans être mémorisé (le prochain appel réessaie). */
export function loadGeo(): Promise<GeoPaths> {
  pending ??= Promise.all([fetch("/geo/land-50m-europe.json").then((r) => r.json()), fetch("/geo/borders-50m-europe.json").then((r) => r.json())])
    .then(([l, b]) => ({ land: geoPath(l, true), borders: geoPath(b, false) }))
    .catch(() => {
      pending = null;
      return { land: "", borders: "" };
    });
  return pending;
}
