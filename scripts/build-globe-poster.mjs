/**
 * Génère public/images/globe-poster.svg : un globe orthographique statique
 * (terres Natural Earth, graticule, halo) avec les liaisons de la vitrine
 * (src/content/showcase.json), affiché sur l'accueil et en attendant l'animation.
 * C'est une image : l'animation, elle, ne se charge que sur la page Référentiels.
 * Elle ne reprend de la vitrine que ce qui y est déjà public — sites et liaisons,
 * sans nom d'opérateur.
 *
 * Usage : node scripts/build-globe-poster.mjs   (à relancer après chaque publication)
 */
import { readFileSync, writeFileSync } from "node:fs";

const land = JSON.parse(readFileSync("public/geo/land-110m.json", "utf8"));
const RAD = Math.PI / 180;
const LON0 = 12 * RAD;
const LAT0 = 36 * RAD;
const R = 270;
const C = 300;

function project(lon, lat) {
  const l = lon * RAD - LON0;
  const p = lat * RAD;
  let x = Math.cos(p) * Math.sin(l);
  let y = Math.cos(LAT0) * Math.sin(p) - Math.sin(LAT0) * Math.cos(p) * Math.cos(l);
  const c = Math.sin(LAT0) * Math.sin(p) + Math.cos(LAT0) * Math.cos(p) * Math.cos(l);
  if (c < 0) {
    // point caché : ramené sur le limbe, dans la même direction
    const n = Math.hypot(x, y) || 1;
    x /= n;
    y /= n;
  }
  return [C + R * x, C - R * y, c >= 0];
}

let d = "";
for (const f of land.features ?? [land]) {
  const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  for (const poly of polys) {
    for (const ring of poly) {
      let any = false;
      let seg = "";
      ring.forEach(([lon, lat], i) => {
        const [x, y, vis] = project(lon, lat);
        any ||= vis;
        seg += `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
      });
      if (any) d += seg + "Z";
    }
  }
}

let grat = "";
for (let lat = -60; lat <= 60; lat += 30) {
  const pts = [];
  for (let lon = -180; lon <= 180; lon += 4) {
    const [x, y, vis] = project(lon, lat);
    pts.push(vis ? `${x.toFixed(1)},${y.toFixed(1)}` : null);
  }
  grat += pts.reduce((acc, p, i) => (p ? acc + (pts[i - 1] ? "L" : "M") + p : acc), "");
}
for (let lon = -180; lon < 180; lon += 30) {
  const pts = [];
  for (let lat = -80; lat <= 80; lat += 4) {
    const [x, y, vis] = project(lon, lat);
    pts.push(vis ? `${x.toFixed(1)},${y.toFixed(1)}` : null);
  }
  grat += pts.reduce((acc, p, i) => (p ? acc + (pts[i - 1] ? "L" : "M") + p : acc), "");
}

/* ---- liaisons de la vitrine : arcs de grand cercle, seulement la face visible ---- */
const show = JSON.parse(readFileSync("src/content/showcase.json", "utf8"));
const site = new Map(show.sites.map((x) => [x.id, x]));
// Mêmes couleurs et mêmes tracés que src/components/showcase/style.ts.
const MODE = {
  rail: { color: "#f2efe6", dash: "" },
  shortsea: { color: "#7cc3ee", dash: "5 3.5" },
  barge: { color: "#8fc4ab", dash: "9 3.5" },
  "road-reefer": { color: "#e8b964", dash: "0.1 4.5" },
};
const vec = (lon, lat) => [Math.cos(lat * RAD) * Math.cos(lon * RAD), Math.cos(lat * RAD) * Math.sin(lon * RAD), Math.sin(lat * RAD)];
const unvec = ([x, y, z]) => [Math.atan2(y, x) / RAD, Math.asin(Math.max(-1, Math.min(1, z))) / RAD];
function arc(a, b, step = 1) {
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
  let d = "";
  for (let i = 0; i < stops.length - 1; i++) {
    const pts = arc([stops[i].lon, stops[i].lat], [stops[i + 1].lon, stops[i + 1].lat]);
    pts.forEach(([lon, lat], j) => {
      const [x, y, vis] = project(lon, lat);
      if (vis) d += `${d && (j || i) ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
    });
  }
  const st = MODE[v.mode];
  if (d) lines += `<path d="${d}" fill="none" stroke="${st.color}" stroke-width="1.6" stroke-linecap="round"${st.dash ? ` stroke-dasharray="${st.dash}"` : ""} opacity=".92"/>`;
}
let dots = "";
for (const st of show.sites) {
  const [x, y, vis] = project(st.lon, st.lat);
  if (vis) dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.4" fill="#f5f2ea" stroke="#0b241a" stroke-width=".8"/>`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
<defs>
<radialGradient id="sea" cx="40%" cy="35%" r="75%"><stop offset="0" stop-color="#14527e"/><stop offset="1" stop-color="#07213a"/></radialGradient>
<radialGradient id="halo" cx="50%" cy="50%" r="50%"><stop offset=".88" stop-color="#8fc4ab" stop-opacity=".0"/><stop offset=".95" stop-color="#8fc4ab" stop-opacity=".28"/><stop offset="1" stop-color="#8fc4ab" stop-opacity="0"/></radialGradient>
<clipPath id="disc"><circle cx="${C}" cy="${C}" r="${R}"/></clipPath>
</defs>
<circle cx="${C}" cy="${C}" r="${R + 24}" fill="url(#halo)"/>
<circle cx="${C}" cy="${C}" r="${R}" fill="url(#sea)"/>
<g clip-path="url(#disc)">
<path d="${grat}" fill="none" stroke="#8fc4ab" stroke-opacity=".16" stroke-width="1"/>
<path d="${d}" fill="#1d5a42" stroke="#79b59a" stroke-opacity=".5" stroke-width=".8"/>
${lines}
${dots}
</g>
<circle cx="${C}" cy="${C}" r="${R}" fill="none" stroke="#8fc4ab" stroke-opacity=".35"/>
</svg>
`;
writeFileSync("public/images/globe-poster.svg", svg);
console.log(`globe-poster.svg : ${(svg.length / 1024).toFixed(0)} Ko`);
