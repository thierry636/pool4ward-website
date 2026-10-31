/**
 * Génère le fond géographique PUBLIC du globe : terres émergées et frontières,
 * à partir de Natural Earth (domaine public) via le paquet `world-atlas`.
 *
 * Ces fichiers ne contiennent rien de propriétaire : ils peuvent être servis tels
 * quels. La vitrine (sites, liaisons) est un fichier à part, src/content/showcase.json,
 * produit par `npm run showcase:publish`.
 *
 * En plus du monde entier à 110 m, on écrit un extrait « Europe » du fond
 * fin (fenêtre EUROPE ci-dessous) : l'animation ne zoome que sur l'Europe et n'a pas
 * à télécharger les 1,1 Mo du monde entier.
 *
 * Usage : node scripts/build-geo.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { feature, mesh } from "topojson-client";

const require = createRequire(import.meta.url);
const dir = require.resolve("world-atlas/package.json").replace("package.json", "");

const round = (n, p) => Math.round(n * 10 ** p) / 10 ** p;
function roundCoords(c, p) {
  return typeof c[0] === "number" ? [round(c[0], p), round(c[1], p)] : c.map((x) => roundCoords(x, p));
}

/** Fenêtre de l'extrait fin : [ouest, sud, est, nord]. */
const EUROPE = [-25, 28, 50, 75];

/** Sutherland–Hodgman : un anneau contre la fenêtre (convexe). Renvoie null s'il n'en reste rien. */
function clipRing(ring, [w, s, e, n]) {
  const edges = [
    [(p) => p[0] >= w, (a, b) => [w, a[1] + ((b[1] - a[1]) * (w - a[0])) / (b[0] - a[0])]],
    [(p) => p[0] <= e, (a, b) => [e, a[1] + ((b[1] - a[1]) * (e - a[0])) / (b[0] - a[0])]],
    [(p) => p[1] >= s, (a, b) => [a[0] + ((b[0] - a[0]) * (s - a[1])) / (b[1] - a[1]), s]],
    [(p) => p[1] <= n, (a, b) => [a[0] + ((b[0] - a[0]) * (n - a[1])) / (b[1] - a[1]), n]],
  ];
  let pts = ring.slice(0, -1);
  for (const [inside, cut] of edges) {
    const out = [];
    pts.forEach((cur, i) => {
      const prev = pts[(i + pts.length - 1) % pts.length];
      if (inside(cur)) {
        if (!inside(prev)) out.push(cut(prev, cur));
        out.push(cur);
      } else if (inside(prev)) out.push(cut(prev, cur));
    });
    pts = out;
    if (pts.length < 3) return null;
  }
  pts = pts.map(([x, y]) => [round(x, 2), round(y, 2)]);
  return [...pts, pts[0]];
}

/**
 * Natural Earth (via world-atlas) ne coupe pas les polygones à l'antiméridien :
 * l'Eurasie est un seul anneau dont deux arêtes vont de −180° à +180° à 65° N. Une
 * carte Mercator les tolère ; le globe les dessine comme des cercles autour du
 * pôle et remplit le mauvais côté. On « déplie » chaque anneau (longitudes
 * continues), on le découpe par fuseaux de 360° et on ramène chaque morceau dans
 * [−180°, 180°]. Un anneau qui enroule un pôle (l'Antarctique) est laissé tel quel.
 */
function unwrapRing(ring) {
  const out = [[ring[0][0], ring[0][1]]];
  for (let i = 1; i < ring.length; i++) {
    let lon = ring[i][0];
    const prev = out[i - 1][0];
    while (lon - prev > 180) lon -= 360;
    while (lon - prev < -180) lon += 360;
    out.push([lon, ring[i][1]]);
  }
  return out;
}

function splitRing(ring) {
  const u = unwrapRing(ring);
  const net = u[u.length - 1][0] - u[0][0];
  if (Math.abs(net) > 1e-6) return [ring]; // anneau polaire
  const lons = u.map((p) => p[0]);
  const k0 = Math.floor((Math.min(...lons) + 180) / 360);
  const k1 = Math.floor((Math.max(...lons) + 180) / 360);
  const pieces = [];
  for (let k = k0; k <= k1; k++) {
    const piece = clipRing(u, [-180 + 360 * k, -90, 180 + 360 * k, 90]);
    if (piece) pieces.push(piece.map(([x, y]) => [round(x - 360 * k, 2), y]));
  }
  return pieces;
}

const inRing = ([x, y], ring) => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};

function cutAntimeridian(geo) {
  const polys = [];
  for (const f of geo.features ?? [geo]) {
    const g = f.geometry;
    for (const poly of g.type === "Polygon" ? [g.coordinates] : g.coordinates) {
      const outers = splitRing(poly[0]);
      for (const outer of outers) {
        const holes = poly.slice(1).filter((h) => inRing(h[0], outer));
        polys.push([outer, ...holes]);
      }
    }
  }
  return { type: "Feature", properties: {}, geometry: { type: "MultiPolygon", coordinates: polys } };
}

function clipLand(geo, box) {
  const polys = [];
  for (const f of geo.features ?? [geo]) {
    const g = f.geometry;
    for (const poly of g.type === "Polygon" ? [g.coordinates] : g.coordinates) {
      const outer = clipRing(poly[0], box);
      if (!outer) continue;
      polys.push([outer, ...poly.slice(1).map((r) => clipRing(r, box)).filter(Boolean)]);
    }
  }
  return { type: "Feature", properties: {}, geometry: { type: "MultiPolygon", coordinates: polys } };
}

/** Liang–Barsky par segment : les lignes de frontière sont découpées en tronçons. */
function clipLines(lines, [w, s, e, n]) {
  const out = [];
  for (const line of lines) {
    let cur = [];
    for (let i = 0; i < line.length - 1; i++) {
      const [x0, y0] = line[i];
      const [x1, y1] = line[i + 1];
      let t0 = 0;
      let t1 = 1;
      const dx = x1 - x0;
      const dy = y1 - y0;
      const tests = [[-dx, x0 - w], [dx, e - x0], [-dy, y0 - s], [dy, n - y0]];
      let visible = true;
      for (const [pp, q] of tests) {
        if (pp === 0) {
          if (q < 0) visible = false;
        } else {
          const r = q / pp;
          if (pp < 0) t0 = Math.max(t0, r);
          else t1 = Math.min(t1, r);
        }
      }
      if (!visible || t0 > t1) {
        if (cur.length > 1) out.push(cur);
        cur = [];
        continue;
      }
      const a = [round(x0 + t0 * dx, 2), round(y0 + t0 * dy, 2)];
      const b = [round(x0 + t1 * dx, 2), round(y0 + t1 * dy, 2)];
      if (!cur.length) cur.push(a);
      cur.push(b);
      if (t1 < 1) {
        out.push(cur);
        cur = [];
      }
    }
    if (cur.length > 1) out.push(cur);
  }
  return out;
}

mkdirSync("public/geo", { recursive: true });

for (const res of ["110m", "50m"]) {
  const land = JSON.parse(readFileSync(`${dir}land-${res}.json`, "utf8"));
  const countries = JSON.parse(readFileSync(`${dir}countries-${res}.json`, "utf8"));
  const p = res === "110m" ? 2 : 2;

  const landRaw = feature(land, land.objects.land);
  for (const f of landRaw.features ?? [landRaw]) f.geometry.coordinates = roundCoords(f.geometry.coordinates, p);
  const landGeo = cutAntimeridian(landRaw);

  const borders = mesh(countries, countries.objects.countries, (a, b) => a !== b);
  borders.coordinates = roundCoords(borders.coordinates, p);

  const landOut = JSON.stringify(landGeo);
  const borderOut = JSON.stringify({ type: "Feature", properties: {}, geometry: borders });
  // Le monde entier n'est publié qu'à 110 m ; à 50 m, seul l'extrait Europe l'est.
  if (res === "110m") {
    writeFileSync(`public/geo/land-${res}.json`, landOut);
    writeFileSync(`public/geo/borders-${res}.json`, borderOut);
    console.log(`${res}: terres ${(landOut.length / 1024).toFixed(0)} Ko, frontières ${(borderOut.length / 1024).toFixed(0)} Ko`);
  }

  if (res === "50m") {
    const lo = JSON.stringify(clipLand(landGeo, EUROPE));
    const bo = JSON.stringify({
      type: "Feature",
      properties: {},
      geometry: { type: "MultiLineString", coordinates: clipLines(borders.coordinates, EUROPE) },
    });
    writeFileSync("public/geo/land-50m-europe.json", lo);
    writeFileSync("public/geo/borders-50m-europe.json", bo);
    console.log(`50m Europe: terres ${(lo.length / 1024).toFixed(0)} Ko, frontières ${(bo.length / 1024).toFixed(0)} Ko`);
  }
}
