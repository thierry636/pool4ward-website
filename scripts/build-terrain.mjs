/**
 * Génère public/images/terrain.svg : les courbes de niveau du plateau
 * « terrain → engagements ». Terrain procédural (bruit de valeur fractal,
 * déformé), donc purement décoratif : il ne représente aucun territoire.
 *
 * Usage : node scripts/build-terrain.mjs
 * Le fichier est déterministe — même graine, même dessin — et versionné.
 */
import { writeFileSync, mkdirSync } from "node:fs";

const W = 900;
const H = 760;
const STEP = 9;
const COLS = Math.ceil(W / STEP) + 1;
const ROWS = Math.ceil(H / STEP) + 1;

function hash(ix, iy, seed) {
  let h = (ix * 374761393 + iy * 668265263 + seed * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return ((h >>> 0) % 100000) / 100000;
}
const smooth = (t) => t * t * t * (t * (t * 6 - 15) + 10);
function vnoise(x, y, seed) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = smooth(x - ix);
  const fy = smooth(y - iy);
  const a = hash(ix, iy, seed);
  const b = hash(ix + 1, iy, seed);
  const c = hash(ix, iy + 1, seed);
  const d = hash(ix + 1, iy + 1, seed);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}
function fbm(x, y, seed) {
  let v = 0;
  let amp = 0.5;
  let f = 1;
  for (let o = 0; o < 5; o++) {
    v += amp * vnoise(x * f, y * f, seed + o * 17);
    amp *= 0.5;
    f *= 2.03;
  }
  return v;
}

const field = new Float32Array(COLS * ROWS);
for (let j = 0; j < ROWS; j++) {
  for (let i = 0; i < COLS; i++) {
    const x = (i * STEP) / 210;
    const y = (j * STEP) / 210;
    // déformation du domaine : les courbes ne suivent pas la grille
    const wx = x + 0.9 * (fbm(x * 0.7 + 5, y * 0.7, 3) - 0.5);
    const wy = y + 0.9 * (fbm(x * 0.7, y * 0.7 + 9, 4) - 0.5);
    field[j * COLS + i] = fbm(wx, wy, 11);
  }
}

let min = Infinity;
let max = -Infinity;
for (const v of field) {
  min = Math.min(min, v);
  max = Math.max(max, v);
}
const LEVELS = 17;
const levels = Array.from({ length: LEVELS }, (_, k) => min + ((k + 1) / (LEVELS + 1)) * (max - min));

const at = (i, j) => field[j * COLS + i];

function contour(level) {
  const segs = [];
  for (let j = 0; j < ROWS - 1; j++) {
    for (let i = 0; i < COLS - 1; i++) {
      const v0 = at(i, j) >= level ? 1 : 0;
      const v1 = at(i + 1, j) >= level ? 1 : 0;
      const v2 = at(i + 1, j + 1) >= level ? 1 : 0;
      const v3 = at(i, j + 1) >= level ? 1 : 0;
      const code = v0 | (v1 << 1) | (v2 << 2) | (v3 << 3);
      if (code === 0 || code === 15) continue;
      const lerp = (a, b) => (level - a) / (b - a);
      const top = [i + lerp(at(i, j), at(i + 1, j)), j];
      const right = [i + 1, j + lerp(at(i + 1, j), at(i + 1, j + 1))];
      const bottom = [i + lerp(at(i, j + 1), at(i + 1, j + 1)), j + 1];
      const left = [i, j + lerp(at(i, j), at(i, j + 1))];
      const add = (a, b) => segs.push([a, b]);
      switch (code) {
        case 1: case 14: add(left, top); break;
        case 2: case 13: add(top, right); break;
        case 3: case 12: add(left, right); break;
        case 4: case 11: add(right, bottom); break;
        case 5: add(left, top); add(right, bottom); break;
        case 6: case 9: add(top, bottom); break;
        case 7: case 8: add(left, bottom); break;
        case 10: add(top, right); add(left, bottom); break;
      }
    }
  }
  return segs;
}

function join(segs) {
  const key = (p) => `${p[0].toFixed(3)},${p[1].toFixed(3)}`;
  const ends = new Map();
  segs.forEach((s, idx) => {
    for (const p of s) {
      const k = key(p);
      if (!ends.has(k)) ends.set(k, []);
      ends.get(k).push(idx);
    }
  });
  const used = new Array(segs.length).fill(false);
  const lines = [];
  for (let s = 0; s < segs.length; s++) {
    if (used[s]) continue;
    used[s] = true;
    const line = [segs[s][0], segs[s][1]];
    for (const dir of [1, 0]) {
      for (;;) {
        const tip = dir ? line[line.length - 1] : line[0];
        const cand = (ends.get(key(tip)) || []).find((c) => !used[c]);
        if (cand === undefined) break;
        used[cand] = true;
        const [a, b] = segs[cand];
        const next = key(a) === key(tip) ? b : a;
        if (dir) line.push(next);
        else line.unshift(next);
      }
    }
    lines.push(line);
  }
  return lines;
}

const r = (n) => Math.round(n);
function toPath(line) {
  const pts = line.map(([i, j]) => [i * STEP, j * STEP]).filter((_, k, a) => k % 2 === 0 || k === a.length - 1);
  if (pts.length < 9) return "";
  // lissage : quadratiques entre milieux de segments
  let d = `M${r(pts[0][0])},${r(pts[0][1])}`;
  for (let k = 1; k < pts.length - 1; k++) {
    const mx = (pts[k][0] + pts[k + 1][0]) / 2;
    const my = (pts[k][1] + pts[k + 1][1]) / 2;
    d += `Q${r(pts[k][0])},${r(pts[k][1])} ${r(mx)},${r(my)}`;
  }
  return d;
}

let minor = "";
let index = "";
levels.forEach((lv, k) => {
  const d = join(contour(lv)).map(toPath).join("");
  if (k % 4 === 3) index += d;
  else minor += d;
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" fill="none">
<g stroke="#000" stroke-linecap="round" stroke-linejoin="round">
<path d="${minor}" stroke-width="1" stroke-opacity=".5"/>
<path d="${index}" stroke-width="1.7"/>
</g>
</svg>
`;
mkdirSync("public/images", { recursive: true });
writeFileSync("public/images/terrain.svg", svg);
console.log(`terrain.svg : ${(svg.length / 1024).toFixed(1)} Ko`);
