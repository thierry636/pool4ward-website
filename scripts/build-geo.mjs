/**
 * Génère le fond géographique PUBLIC du globe : terres émergées et frontières,
 * à partir de Natural Earth (domaine public) via le paquet `world-atlas`.
 *
 * Ces fichiers ne contiennent rien de propriétaire : ils peuvent être servis tels
 * quels. À l'inverse, les couches des référentiels ne passent jamais par ici —
 * elles sont rendues en images côté serveur (src/server/projection).
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

mkdirSync("public/geo", { recursive: true });

for (const res of ["110m", "50m"]) {
  const land = JSON.parse(readFileSync(`${dir}land-${res}.json`, "utf8"));
  const countries = JSON.parse(readFileSync(`${dir}countries-${res}.json`, "utf8"));
  const p = res === "110m" ? 2 : 2;

  const landGeo = feature(land, land.objects.land);
  for (const f of landGeo.features ?? [landGeo]) f.geometry.coordinates = roundCoords(f.geometry.coordinates, p);

  const borders = mesh(countries, countries.objects.countries, (a, b) => a !== b);
  borders.coordinates = roundCoords(borders.coordinates, p);

  const landOut = JSON.stringify(landGeo);
  const borderOut = JSON.stringify({ type: "Feature", properties: {}, geometry: borders });
  writeFileSync(`public/geo/land-${res}.json`, landOut);
  writeFileSync(`public/geo/borders-${res}.json`, borderOut);
  console.log(`${res}: terres ${(landOut.length / 1024).toFixed(0)} Ko, frontières ${(borderOut.length / 1024).toFixed(0)} Ko`);
}
