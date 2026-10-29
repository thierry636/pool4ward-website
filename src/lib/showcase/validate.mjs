/**
 * Validation stricte de la vitrine. Rien ne passe qui ne soit explicitement
 * prévu : clés connues seulement, formats fermés, plafonds de volume, texte
 * sans adresse, lien ni numéro. Le même contrôle tourne à la publication, au
 * build du site et dans les tests — une vitrine invalide ne se déploie pas.
 */
import { CHAPTERS, MODES, SITE_KINDS } from "./chapters.mjs";

export const LIMITS = {
  sites: 250,
  services: 400,
  servicesPerChapter: 80,
  via: 3,
  nameLength: 60,
  operatorLength: 60,
};

const SITE_KEYS = ["id", "name", "kind", "country", "lon", "lat"];
const SERVICE_KEYS = ["id", "chapter", "mode", "from", "to", "via", "operator"];
const TOP_KEYS = ["schema", "mode", "publishedAt", "sites", "services"];
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TEXT = /^[\p{L}\p{N} .,'’&/()+-]+$/u;

/** Au plus deux décimales : ≈ 1 km, assez pour situer une plateforme, pas pour la retrouver à la porte. */
const centi = (n) => Number.isFinite(n) && Math.abs(n * 100 - Math.round(n * 100)) < 1e-7;

/** Une chaîne publiable : ni adresse électronique, ni lien, ni numéro de téléphone, ni balisage. */
export function textProblem(s) {
  if (typeof s !== "string") return "doit être un texte";
  if (s !== s.trim() || s !== s.normalize("NFC")) return "doit être normalisé (espaces, NFC)";
  if (s.length < 1) return "ne doit pas être vide";
  if (/@|:\/\/|www\./i.test(s)) return "ressemble à une adresse ou à un lien";
  if (/\d{6,}|(?:\d[ .-]?){8,}/.test(s)) return "ressemble à un numéro";
  if (!TEXT.test(s)) return "contient des caractères non prévus";
  return null;
}

/**
 * @param {unknown} input
 * @param {{ now?: Date }} [opts]
 * @returns {{ ok: boolean, errors: string[] }}
 */
export function validateShowcase(input, { now = new Date() } = {}) {
  const errors = [];
  const err = (m) => errors.push(m);

  if (!input || typeof input !== "object" || Array.isArray(input)) return { ok: false, errors: ["la vitrine doit être un objet"] };
  for (const k of Object.keys(input)) if (!TOP_KEYS.includes(k)) err(`clé inconnue à la racine : « ${k} »`);
  if (input.schema !== 1) err("schema doit valoir 1");
  if (input.mode !== "demo" && input.mode !== "curated") err("mode doit valoir « demo » ou « curated »");

  if (input.mode === "curated") {
    if (typeof input.publishedAt !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(input.publishedAt) || Number.isNaN(Date.parse(input.publishedAt))) {
      err("publishedAt (AAAA-MM-JJ) est obligatoire en mode « curated »");
    } else if (Date.parse(input.publishedAt) > now.getTime() + 864e5) {
      err("publishedAt est dans le futur");
    }
  } else if (input.mode === "demo" && input.publishedAt !== null) {
    err("publishedAt doit être nul en mode « demo »");
  }

  const sites = Array.isArray(input.sites) ? input.sites : (err("sites doit être une liste"), []);
  const services = Array.isArray(input.services) ? input.services : (err("services doit être une liste"), []);
  if (sites.length > LIMITS.sites) err(`trop de sites (${sites.length} > ${LIMITS.sites})`);
  if (services.length > LIMITS.services) err(`trop de liaisons (${services.length} > ${LIMITS.services})`);

  const siteIds = new Set();
  sites.forEach((s, i) => {
    const at = `sites[${i}]`;
    if (!s || typeof s !== "object") return err(`${at} doit être un objet`);
    for (const k of Object.keys(s)) if (!SITE_KEYS.includes(k)) err(`${at} : clé inconnue « ${k} »`);
    if (typeof s.id !== "string" || !ID.test(s.id) || s.id.length > 48) err(`${at}.id invalide`);
    else if (siteIds.has(s.id)) err(`${at}.id en double : ${s.id}`);
    else siteIds.add(s.id);
    const np = textProblem(s.name);
    if (np) err(`${at}.name ${np}`);
    else if (s.name.length > LIMITS.nameLength) err(`${at}.name trop long`);
    if (!SITE_KINDS.includes(s.kind)) err(`${at}.kind inconnu : ${s.kind}`);
    if (typeof s.country !== "string" || !/^[A-Z]{2}$/.test(s.country)) err(`${at}.country doit être un code ISO à deux lettres`);
    if (!(typeof s.lon === "number" && s.lon >= -180 && s.lon <= 180 && centi(s.lon))) err(`${at}.lon invalide (degrés, deux décimales au plus)`);
    if (!(typeof s.lat === "number" && s.lat >= -85 && s.lat <= 85 && centi(s.lat))) err(`${at}.lat invalide (degrés, deux décimales au plus)`);
  });

  const used = new Set();
  const seen = new Set();
  const serviceIds = new Set();
  const perChapter = {};
  services.forEach((v, i) => {
    const at = `services[${i}]`;
    if (!v || typeof v !== "object") return err(`${at} doit être un objet`);
    for (const k of Object.keys(v)) if (!SERVICE_KEYS.includes(k)) err(`${at} : clé inconnue « ${k} »`);
    if (typeof v.id !== "string" || !ID.test(v.id) || v.id.length > 48) err(`${at}.id invalide`);
    else if (serviceIds.has(v.id)) err(`${at}.id en double : ${v.id}`);
    else serviceIds.add(v.id);
    const chapter = CHAPTERS.find((c) => c.id === v.chapter);
    if (!chapter) err(`${at}.chapter inconnu : ${v.chapter}`);
    if (!MODES.includes(v.mode)) err(`${at}.mode inconnu : ${v.mode}`);
    else if (chapter && !chapter.modes.includes(v.mode)) err(`${at} : le mode « ${v.mode} » n'appartient pas au chapitre « ${chapter.id} »`);
    if (chapter) perChapter[chapter.id] = (perChapter[chapter.id] ?? 0) + 1;

    const route = [v.from, ...(v.via ?? []), v.to];
    if (v.via !== undefined && (!Array.isArray(v.via) || v.via.length > LIMITS.via)) err(`${at}.via doit être une liste de ${LIMITS.via} sites au plus`);
    for (const id of route) {
      if (!siteIds.has(id)) err(`${at} : site inconnu « ${id} »`);
      else used.add(id);
    }
    if (v.from === v.to) err(`${at} : origine et destination identiques`);
    if (new Set(route).size !== route.length) err(`${at} : un site apparaît deux fois sur la liaison`);

    if (v.operator !== undefined) {
      const op = textProblem(v.operator);
      if (op) err(`${at}.operator ${op}`);
      else if (v.operator.length > LIMITS.operatorLength) err(`${at}.operator trop long`);
      if (input.mode === "demo") err(`${at}.operator : aucun nom d'opérateur dans une vitrine « demo »`);
    }
    const key = [v.chapter, v.mode, ...route, v.operator ?? ""].join("|");
    if (seen.has(key)) err(`${at} : liaison en double`);
    seen.add(key);
  });

  for (const [c, n] of Object.entries(perChapter)) if (n > LIMITS.servicesPerChapter) err(`chapitre « ${c} » : trop de liaisons (${n} > ${LIMITS.servicesPerChapter})`);
  for (const id of siteIds) if (!used.has(id)) err(`site « ${id} » inutilisé : une donnée non utilisée n'est pas publiée`);

  return { ok: errors.length === 0, errors };
}
