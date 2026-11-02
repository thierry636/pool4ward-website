/**
 * Génère public/images/services-flat-poster.svg : la carte à plat (Mercator) des services de la vitrine
 * (src/content/showcase.json), affichée sur l'accueil à la place de l'ancien globe statique. Terres et
 * frontières : Natural Earth, extrait Europe de `public/geo/`. Elle ne reprend de la vitrine que ce qui y
 * est déjà public — sites et liaisons, sans nom d'opérateur, sans nom de site.
 *
 * Usage : node scripts/build-flat-poster.mjs   (à relancer après chaque publication de la vitrine)
 */
import { readFileSync, writeFileSync } from "node:fs";

const W = 600;
const H = 520;
const FRAME = { west: -14, east: 37, south: 34, north: 62.5 };
const RAD = Math.PI / 180;
const mx = (lon) => lon * RAD;
const my = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * RAD) / 2));
const k = Math.min(W / (mx(FRAME.east) - mx(FRAME.west)), H / (my(FRAME.north) - my(FRAME.south)));
const x0 = (W - (mx(FRAME.east) - mx(FRAME.west)) * k) / 2 - mx(FRAME.west) * k;
const y0 = (H - (my(FRAME.north) - my(FRAME.south)) * k) / 2 + my(FRAME.north) * k;
const P = (lon, lat) => [x0 + mx(lon) * k, y0 - my(lat) * k];

const land = JSON.parse(readFileSync("public/geo/land-50m-europe.json", "utf8")).geometry;
const borders = JSON.parse(readFileSync("public/geo/borders-50m-europe.json", "utf8")).geometry;
const show = JSON.parse(readFileSync("src/content/showcase.json", "utf8"));

const simplify = (pts, min = 1.1) => pts.filter((p, i) => i === 0 || Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) >= min);
const path = (pts) => "M" + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join("L");

const polys = land.type === "MultiPolygon" ? land.coordinates : [land.coordinates];
let dLand = "";
for (const poly of polys) for (const ring of poly) {
  const pts = simplify(ring.map(([lo, la]) => P(lo, la)));
  if (pts.length > 2) dLand += path(pts) + "Z";
}
let dBorders = "";
for (const ln of borders.coordinates) {
  const pts = simplify(ln.map(([lo, la]) => P(lo, la)), 2.2);
  if (pts.length > 1 && pts.some(([x, y]) => x > -40 && x < W + 40 && y > -40 && y < H + 40)) dBorders += path(pts);
}

// Graticule discret
let grat = "";
for (let lat = 40; lat <= 60; lat += 10) grat += path([P(FRAME.west, lat), P(FRAME.east, lat)]);
for (let lon = -10; lon <= 30; lon += 10) grat += path([P(lon, FRAME.south), P(lon, FRAME.north)]);

// Mêmes couleurs et mêmes tracés que src/components/showcase/style.ts et l'ancien globe statique.
const MODE = {
  rail: { color: "#818cf8", dash: "" },
  shortsea: { color: "#2dd4bf", dash: "6 4" },
  barge: { color: "#38bdf8", dash: "10 4" },
  "road-reefer": { color: "#fbbf24", dash: "0.1 5" },
};
const site = new Map(show.sites.map((s) => [s.id, s]));
const vec = (lon, lat) => [Math.cos(lat * RAD) * Math.cos(lon * RAD), Math.cos(lat * RAD) * Math.sin(lon * RAD), Math.sin(lat * RAD)];
const unvec = ([x, y, z]) => [Math.atan2(y, x) / RAD, Math.asin(Math.max(-1, Math.min(1, z))) / RAD];
function arc(a, b, step = 1.5) {
  const va = vec(...a);
  const vb = vec(...b);
  const om = Math.acos(Math.max(-1, Math.min(1, va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2])));
  const n = Math.max(2, Math.ceil(om / RAD / step));
  return Array.from({ length: n + 1 }, (_, i) => {
    const f = i / n;
    const k0 = Math.sin((1 - f) * om) / Math.sin(om);
    const k1 = Math.sin(f * om) / Math.sin(om);
    return unvec([0, 1, 2].map((j) => k0 * va[j] + k1 * vb[j]));
  });
}
let lines = "";
for (const v of show.services) {
  const stops = [v.from, ...(v.via ?? []), v.to].map((id) => site.get(id));
  const pts = [];
  for (let i = 0; i < stops.length - 1; i++) {
    const seg = arc([stops[i].lon, stops[i].lat], [stops[i + 1].lon, stops[i + 1].lat]).map(([lo, la]) => P(lo, la));
    pts.push(...(i ? seg.slice(1) : seg));
  }
  const st = MODE[v.mode];
  lines += `<path d="${path(pts)}" fill="none" stroke="${st.color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"${st.dash ? ` stroke-dasharray="${st.dash}"` : ""} opacity=".95"/>`;
}
let dots = "";
for (const s of show.sites) {
  const [x, y] = P(s.lon, s.lat);
  dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.4" fill="#f1f5f9" stroke="#020617" stroke-width="1"/>`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
<defs>
<linearGradient id="sea" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#14306b"/><stop offset="1" stop-color="#050d1f"/></linearGradient>
<radialGradient id="vig" cx="50%" cy="50%" r="75%"><stop offset=".6" stop-color="#020617" stop-opacity="0"/><stop offset="1" stop-color="#020617" stop-opacity=".55"/></radialGradient>
</defs>
<rect width="${W}" height="${H}" fill="url(#sea)"/>
<path d="${grat}" fill="none" stroke="#4263eb" stroke-opacity=".16" stroke-width="1"/>
<path d="${dLand}" fill="#0d1a35" stroke="#3b5fb5" stroke-opacity=".9" stroke-width=".9" fill-rule="evenodd"/>
<path d="${dBorders}" fill="none" stroke="#3b5fb5" stroke-opacity=".4" stroke-width=".7"/>
${lines}
${dots}
<rect width="${W}" height="${H}" fill="url(#vig)"/>
</svg>
`;
writeFileSync("public/images/services-flat-poster.svg", svg);
console.log(`services-flat-poster.svg : ${(svg.length / 1024).toFixed(0)} Ko`);
