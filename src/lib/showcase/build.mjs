/**
 * Fabrique la vitrine publiée à partir d'un export de la base privée.
 *
 * Format d'entrée (voir scripts/showcase/example.source.json) :
 *   { "sites":    [{ "key", "name", "kind", "country", "lon", "lat" }],
 *     "services": [{ "chapter", "mode", "from", "via"?, "to", "operator"? }] }
 *
 * Trois principes :
 *  - liste blanche stricte : une colonne en trop dans l'export (un tarif, un
 *    contact, un identifiant interne) fait ÉCHOUER la publication, elle n'est
 *    pas ignorée en silence ;
 *  - minimisation : les identifiants de la base ne sortent jamais (les nouveaux
 *    sont dérivés du nom), les coordonnées sont arrondies au centième de degré,
 *    et un site qu'aucune liaison publiable n'utilise n'est pas publié ;
 *  - déterminisme : même export, même fichier, octet pour octet — la différence
 *    entre deux publications se relit.
 */
import { CHAPTERS } from "./chapters.mjs";
import { validateShowcase } from "./validate.mjs";

const SOURCE_SITE_KEYS = ["key", "name", "kind", "country", "lon", "lat"];
const SOURCE_SERVICE_KEYS = ["chapter", "mode", "from", "via", "to", "operator"];

const FOLD = { ł: "l", đ: "d", ø: "o", ß: "ss", æ: "ae", œ: "oe", ð: "d", þ: "th" };

export function slug(s) {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[łđøßæœðþ]/g, (c) => FOLD[c])
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const round2 = (n) => Math.round(n * 100) / 100;
const clean = (s) => (typeof s === "string" ? s.normalize("NFC").trim().replace(/\s+/g, " ") : s);

/**
 * @param {{ sites: any[], services: any[] }} source
 * @param {{ mode: "demo" | "curated", publishedAt?: string | null }} meta
 */
export function buildShowcase(source, { mode, publishedAt = null }) {
  const problems = [];
  if (!source || typeof source !== "object" || !Array.isArray(source.sites) || !Array.isArray(source.services)) {
    throw new Error("export illisible : { sites: [], services: [] } attendu");
  }
  for (const k of Object.keys(source)) if (k !== "sites" && k !== "services") problems.push(`clé inattendue à la racine de l'export : « ${k} »`);

  source.sites.forEach((s, i) => {
    for (const k of Object.keys(s ?? {})) if (!SOURCE_SITE_KEYS.includes(k)) problems.push(`sites[${i}] : colonne non prévue « ${k} » (publication refusée, pas ignorée)`);
  });
  source.services.forEach((v, i) => {
    for (const k of Object.keys(v ?? {})) if (!SOURCE_SERVICE_KEYS.includes(k)) problems.push(`services[${i}] : colonne non prévue « ${k} » (publication refusée, pas ignorée)`);
  });
  if (problems.length) throw new Error(problems.join("\n"));

  // Sites : identifiant dérivé du nom et du pays, jamais de la clé de la base.
  const idByKey = new Map();
  const taken = new Set();
  const siteOf = new Map();
  for (const s of source.sites) {
    if (idByKey.has(s.key)) throw new Error(`clé de site en double dans l'export : ${s.key}`);
    let id = `${slug(String(s.name ?? ""))}-${String(s.country ?? "").toLowerCase()}`;
    for (let n = 2; taken.has(id); n++) id = `${slug(String(s.name ?? ""))}-${String(s.country ?? "").toLowerCase()}-${n}`;
    taken.add(id);
    idByKey.set(s.key, id);
    siteOf.set(s.key, { id, name: clean(s.name), kind: s.kind, country: s.country, lon: round2(s.lon), lat: round2(s.lat) });
  }

  const order = (c) => CHAPTERS.findIndex((x) => x.id === c);
  const ref = (k) => {
    if (!idByKey.has(k)) throw new Error(`liaison vers un site absent de l'export : « ${k} »`);
    return idByKey.get(k);
  };
  const rows = source.services.map((v) => {
    const out = { chapter: v.chapter, mode: v.mode, from: ref(v.from), to: ref(v.to) };
    if (v.via?.length) out.via = v.via.map(ref);
    const op = clean(v.operator);
    if (op) out.operator = op;
    return out;
  });
  rows.sort((a, b) => order(a.chapter) - order(b.chapter) || a.from.localeCompare(b.from) || a.to.localeCompare(b.to) || (a.operator ?? "").localeCompare(b.operator ?? ""));

  const counters = {};
  const services = rows.map((r) => {
    counters[r.chapter] = (counters[r.chapter] ?? 0) + 1;
    return { id: `${r.chapter}-${counters[r.chapter]}`, chapter: r.chapter, mode: r.mode, from: r.from, ...(r.via ? { via: r.via } : {}), to: r.to, ...(r.operator ? { operator: r.operator } : {}) };
  });

  const used = new Set(services.flatMap((v) => [v.from, ...(v.via ?? []), v.to]));
  const sites = [...siteOf.values()].filter((s) => used.has(s.id)).sort((a, b) => a.id.localeCompare(b.id));
  const snapshot = { schema: 1, mode, publishedAt: mode === "curated" ? publishedAt : null, sites, services };

  const { ok, errors } = validateShowcase(snapshot);
  if (!ok) throw new Error(errors.join("\n"));

  return {
    snapshot,
    report: {
      sites: sites.length,
      droppedSites: source.sites.length - sites.length,
      services: services.length,
      perChapter: counters,
      operators: new Set(services.map((v) => v.operator).filter(Boolean)).size,
    },
  };
}

/** Sérialisation canonique du fichier publié : lisible en revue, identique d'une exécution à l'autre. */
export function serializeShowcase(snapshot) {
  const line = (o) => JSON.stringify(o);
  return [
    "{",
    `  "schema": ${snapshot.schema},`,
    `  "mode": ${line(snapshot.mode)},`,
    `  "publishedAt": ${line(snapshot.publishedAt)},`,
    `  "sites": [`,
    snapshot.sites.map((s) => `    ${line(s)}`).join(",\n"),
    "  ],",
    `  "services": [`,
    snapshot.services.map((v) => `    ${line(v)}`).join(",\n"),
    "  ]",
    "}",
    "",
  ].join("\n");
}
