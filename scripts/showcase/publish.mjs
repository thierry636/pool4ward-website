/**
 * Publication de la vitrine.
 *
 *   node scripts/showcase/publish.mjs --from export.json --mode curated --date 2026-11-02
 *   node scripts/showcase/publish.mjs --from scripts/showcase/example.source.json --mode demo
 *   node scripts/showcase/publish.mjs --check            (garde du build)
 *
 * Lit un export de la base privée, le valide (liste blanche, plafonds, texte
 * sans adresse ni lien), l'écrit dans src/content/showcase.json et affiche ce
 * qui change par rapport à la version publiée : c'est ce diff que l'on relit
 * avant de déployer. Rien ici ne se connecte à une base ni à un réseau.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { buildShowcase, serializeShowcase } from "../../src/lib/showcase/build.mjs";
import { validateShowcase } from "../../src/lib/showcase/validate.mjs";

const OUT = "src/content/showcase.json";
const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const opt = (n) => (args.includes(`--${n}`) ? args[args.indexOf(`--${n}`) + 1] : undefined);
const fail = (m) => {
  console.error(`✗ ${m}`);
  process.exit(1);
};
const read = (p) => JSON.parse(readFileSync(p, "utf8"));

function describe(snap) {
  const names = new Map(snap.sites.map((s) => [s.id, s.name]));
  return new Set(
    snap.services.map((v) => `${v.chapter} · ${[v.from, ...(v.via ?? []), v.to].map((i) => names.get(i)).join(" → ")}${v.operator ? ` · ${v.operator}` : ""}`),
  );
}

/** Le site tourne en production si le contexte Netlify ou la variable du site le dit (cf. src/lib/site.ts). */
const isProduction = () => (process.env.NEXT_PUBLIC_SITE_ENV ?? process.env.CONTEXT) === "production";

if (flag("check")) {
  const file = opt("check")?.startsWith("--") ? OUT : (opt("check") ?? OUT);
  if (!existsSync(file)) fail(`${file} absent : publiez une vitrine (npm run showcase:demo, ou showcase:publish).`);
  let snap;
  try {
    snap = read(file);
  } catch (e) {
    fail(`${file} n'est pas du JSON : ${e.message}`);
  }
  const { ok, errors } = validateShowcase(snap);
  if (!ok) fail(`vitrine invalide (${file}) :\n  - ${errors.join("\n  - ")}`);
  if (serializeShowcase(snap) !== readFileSync(file, "utf8")) fail(`${file} n'est pas dans la forme canonique : régénérez-le avec npm run showcase:publish.`);
  if (snap.mode === "demo" && isProduction() && process.env.SHOWCASE_ALLOW_DEMO !== "1") {
    fail("la vitrine est en mode « demo » et le build est en production : publiez une vitrine « curated » (ou posez SHOWCASE_ALLOW_DEMO=1 en connaissance de cause).");
  }
  console.log(`✓ vitrine valide : ${snap.mode}, ${snap.sites.length} sites, ${snap.services.length} liaisons${snap.publishedAt ? `, publiée le ${snap.publishedAt}` : ""}`);
  process.exit(0);
}

const from = opt("from");
const mode = opt("mode");
if (!from) fail("--from <export.json> manquant (ou --check).");
if (mode !== "demo" && mode !== "curated") fail("--mode demo|curated manquant.");
const publishedAt = mode === "curated" ? (opt("date") ?? new Date().toISOString().slice(0, 10)) : null;

let built;
try {
  built = buildShowcase(read(from), { mode, publishedAt });
} catch (e) {
  fail(`publication refusée :\n  - ${e.message.split("\n").join("\n  - ")}`);
}
const { snapshot, report } = built;

const before = existsSync(OUT) ? describe(read(OUT)) : new Set();
const after = describe(snapshot);
const added = [...after].filter((x) => !before.has(x));
const removed = [...before].filter((x) => !after.has(x));

if (!flag("dry-run")) writeFileSync(OUT, serializeShowcase(snapshot));
console.log(`${flag("dry-run") ? "(essai à blanc) " : ""}✓ ${OUT} : ${mode}, ${report.sites} sites, ${report.services} liaisons, ${report.operators} opérateur(s) nommé(s)`);
if (report.droppedSites) console.log(`  ${report.droppedSites} site(s) de l'export non utilisés par une liaison publiable : non publiés`);
console.log(`  par chapitre : ${Object.entries(report.perChapter).map(([c, n]) => `${c} ${n}`).join(" · ")}`);
console.log(`  ${added.length} liaison(s) ajoutée(s), ${removed.length} retirée(s) par rapport à la version précédente`);
for (const x of added.slice(0, 40)) console.log(`   + ${x}`);
for (const x of removed.slice(0, 40)) console.log(`   - ${x}`);
