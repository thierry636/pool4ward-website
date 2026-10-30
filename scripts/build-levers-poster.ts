/**
 * Génère public/images/levers-poster.svg : l'image qui occupe la carte de la couverture avant
 * que le globe (ou la carte à plat) ne soit prêt, et pour qui n'exécute pas de script. Terres
 * Natural Earth, tracés de tous les leviers très discrets, sites sous forme de points.
 * Aucun nom, aucun chiffre : c'est l'ambiance de la scène, pas son contenu.
 *
 * Usage : npm run poster:levers   (à relancer si la scène ou le fond de carte change)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { LEVER_COLOR, LEVER_ORDER } from "../src/lib/levers/data";
import { anchorOf, buildScene } from "../src/lib/levers/scene";

const W = 1600;
const H = 900;
const LON_C = 4.5;
const LAT_C = 41.4;
const PPD = 50; // pixels par degré de longitude
const X_C = 1070;
const Y_C = 440;

const merc = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (Math.max(-85, Math.min(85, lat)) * Math.PI) / 360));
const px = (lon: number, lat: number): [number, number] => [X_C + (lon - LON_C) * PPD, Y_C - (merc(lat) - merc(LAT_C)) * (180 / Math.PI) * PPD];

type Pt = [number, number];

/** Sutherland–Hodgman sur le rectangle de l'image, marge comprise. */
function clipRing(ring: Pt[]): Pt[] {
  const M = 40;
  const edges: ((p: Pt) => boolean)[] = [(p) => p[0] >= -M, (p) => p[0] <= W + M, (p) => p[1] >= -M, (p) => p[1] <= H + M];
  const cut = (a: Pt, b: Pt, i: number): Pt => {
    const lim = [-M, W + M, -M, H + M][i];
    if (i < 2) {
      const t = (lim - a[0]) / (b[0] - a[0]);
      return [lim, a[1] + t * (b[1] - a[1])];
    }
    const t = (lim - a[1]) / (b[1] - a[1]);
    return [a[0] + t * (b[0] - a[0]), lim];
  };
  let out = ring;
  edges.forEach((inside, i) => {
    const input = out;
    out = [];
    input.forEach((cur, k) => {
      const prev = input[(k + input.length - 1) % input.length];
      if (inside(cur)) {
        if (!inside(prev)) out.push(cut(prev, cur, i));
        out.push(cur);
      } else if (inside(prev)) out.push(cut(prev, cur, i));
    });
  });
  return out;
}

const fmt = (p: Pt) => `${Math.round(p[0])},${Math.round(p[1])}`;

/** Ramer–Douglas–Peucker : un tracé de l'image d'attente n'a pas besoin d'un point tous les demi-degrés. */
function simplify(pts: Pt[], tol: number): Pt[] {
  if (pts.length < 3) return pts;
  const [a, b] = [pts[0], pts[pts.length - 1]];
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  let worst = 0;
  let at = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + b[0] * a[1] - b[1] * a[0]) / len;
    if (d > worst) {
      worst = d;
      at = i;
    }
  }
  if (worst <= tol) return [a, b];
  return [...simplify(pts.slice(0, at + 1), tol).slice(0, -1), ...simplify(pts.slice(at), tol)];
}
const ringPath = (r: Pt[]) => (r.length > 2 ? `M${r.map(fmt).join("L")}Z` : "");

/** Un anneau fermé se simplifie en deux moitiés, coupées au point le plus éloigné du départ. */
function simplifyRing(ring: Pt[], tol: number): Pt[] {
  if (ring.length < 8) return ring;
  let k = 1;
  let far = 0;
  ring.forEach((p, i) => {
    const d = Math.hypot(p[0] - ring[0][0], p[1] - ring[0][1]);
    if (d > far) {
      far = d;
      k = i;
    }
  });
  return [...simplify(ring.slice(0, k + 1), tol).slice(0, -1), ...simplify(ring.slice(k), tol)];
}

const featuresOf = (geo: GeoJSON.Feature | GeoJSON.FeatureCollection) => ("features" in geo ? geo.features : [geo]);

function rings(geo: GeoJSON.Feature | GeoJSON.FeatureCollection): Pt[][] {
  const out: Pt[][] = [];
  for (const f of featuresOf(geo)) {
    const g = f.geometry;
    const polys = g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : [];
    for (const poly of polys) for (const ring of poly) out.push(ring.map(([lon, lat]) => px(lon, lat)));
  }
  return out;
}

function lines(geo: GeoJSON.Feature | GeoJSON.FeatureCollection): Pt[][] {
  const out: Pt[][] = [];
  for (const f of featuresOf(geo)) {
    const g = f.geometry;
    const ls = g.type === "LineString" ? [g.coordinates] : g.type === "MultiLineString" ? g.coordinates : [];
    for (const l of ls) out.push(l.map(([lon, lat]) => px(lon, lat)));
  }
  return out;
}

const land = JSON.parse(readFileSync("public/geo/land-50m-europe.json", "utf8")) as GeoJSON.Feature | GeoJSON.FeatureCollection;
const borders = JSON.parse(readFileSync("public/geo/borders-50m-europe.json", "utf8")) as GeoJSON.Feature | GeoJSON.FeatureCollection;

const landD = rings(land)
  .map(clipRing)
  .map((r) => simplifyRing(r, 0.6))
  .map(ringPath)
  .join("");
const inView = (p: Pt) => p[0] > -20 && p[0] < W + 20 && p[1] > -20 && p[1] < H + 20;
const borderD = lines(borders)
  .map((l) => {
    let d = "";
    let pen = false;
    l.forEach((p, i) => {
      const ok = inView(p) || (i > 0 && inView(l[i - 1]));
      if (ok) {
        d += `${pen ? "L" : "M"}${fmt(p)}`;
        pen = true;
      } else pen = false;
    });
    return d;
  })
  .join("");

const net: string[] = [];
const dots = new Set<string>();
// Le report modal part du sud de l'Espagne vers la Pologne : il sort de cette image, centrée sur la Méditerranée.
for (const id of LEVER_ORDER.filter((x) => x !== "rail")) {
  const s = buildScene(id);
  for (const b of s.lines) {
    if (b.el.style === "dashed" || b.el.style === "dotted" || b.el.skipBase) continue;
    net.push(`<path d="M${simplify(b.path.points.map((p) => px(p[0], p[1])), 0.7).map(fmt).join("L")}" stroke="${LEVER_COLOR[id]}" stroke-opacity="0.32" stroke-width="1.6"/>`);
  }
  for (const n of s.nodes) {
    const [lon, lat] = anchorOf(n.at);
    dots.add(fmt(px(lon, lat)));
  }
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice">
<defs>
<radialGradient id="g" cx="66%" cy="48%" r="55%"><stop offset="0" stop-color="#1d3a8a" stop-opacity=".5"/><stop offset="1" stop-color="#050d1f" stop-opacity="0"/></radialGradient>
<g id="n" fill="none" stroke-linecap="round" stroke-linejoin="round">${net.join("")}</g>
</defs>
<rect width="${W}" height="${H}" fill="#050d1f"/>
<rect width="${W}" height="${H}" fill="url(#g)"/>
<path d="${landD}" fill="#0d1a35" stroke="#2a4a82" stroke-width="1.2" stroke-linejoin="round"/>
<path d="${borderD}" fill="none" stroke="#35528a" stroke-opacity=".4" stroke-width="1"/>
<use href="#n" stroke-width="5" opacity=".35"/>
<use href="#n"/>
<g fill="#f1f5f9" stroke="#020617" stroke-width="1.4">${[...dots].map((d) => `<circle cx="${d.split(",")[0]}" cy="${d.split(",")[1]}" r="4"/>`).join("")}</g>
</svg>
`;
writeFileSync("public/images/levers-poster.svg", svg);
console.log(`public/images/levers-poster.svg : ${(svg.length / 1024).toFixed(1)} Ko`);
