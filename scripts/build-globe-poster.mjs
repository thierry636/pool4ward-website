/**
 * Génère public/images/globe-poster.svg : un globe orthographique statique
 * (terres Natural Earth, graticule, halo), affiché avant le chargement du globe
 * interactif. C'est une image : le globe interactif, lui, ne se charge qu'à la
 * demande. Aucune donnée de référentiel n'y figure.
 *
 * Usage : node scripts/build-globe-poster.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";

const land = JSON.parse(readFileSync("public/geo/land-110m.json", "utf8"));
const RAD = Math.PI / 180;
const LON0 = 12 * RAD;
const LAT0 = 38 * RAD;
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
</g>
<circle cx="${C}" cy="${C}" r="${R}" fill="none" stroke="#8fc4ab" stroke-opacity=".35"/>
</svg>
`;
writeFileSync("public/images/globe-poster.svg", svg);
console.log(`globe-poster.svg : ${(svg.length / 1024).toFixed(0)} Ko`);
