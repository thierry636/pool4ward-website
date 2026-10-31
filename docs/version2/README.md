# Pool4ward — version 2

Deuxième version du site public, développée sur la branche `version2`. Le site
actuel (`main`) n'est pas touché : rien ne passe sur le domaine public sans
décision distincte.

## Ce que contient cette branche

- **Une couverture-carte** : un globe qui joue six leviers sur toute l'Europe (report modal
  rail/fluvial, shortsea côtier, boucles, cross-dock, électrification, mutualisation), **seul** —
  ni texte, ni menu, ni bouton —, suivi d'une planche de six référentiels du physique du transport
  (services rail et fluviaux, shortsea, réseaux, bornes, parkings, transporteurs ; menu à gauche, fiche à droite) — voir [LEVERS.md](LEVERS.md). C'est une illustration, pas une donnée.
- **Un parcours « du terrain aux engagements »** : un même cas
  démonstrateur (quatre sites, six flux, fictifs) traverse trois étapes —
  comprendre le terrain, concevoir le plan, contractualiser. Le plateau SVG
  (`src/components/journey/Board.tsx`) est animé par transitions CSS seulement,
  fixe sous « mouvement réduit », et ne calcule ni coût ni gain.
- **Cinq capacités** (ingénierie, appels d'offres, recherche de transporteurs,
  comparaison des offres, gestion des contrats), décrites par leurs fonctions
  vérifiées dans le code — voir [CAPABILITIES.md](CAPABILITIES.md).
- **Un monde qui tourne** (page Référentiels) : un globe animé (MapLibre,
  projection globe) déroule quatre chapitres — rail intermodal en Europe, shortsea
  en Baltique, transporteurs frigorifiques en Allemagne, fluvial sur le Rhin —
  avec les sites géolocalisés, les liaisons et, quand ils sont publiés, des noms
  d'opérateurs. Ce n'est pas un outil de recherche. Il lit une **vitrine
  statique** (`src/content/showcase.json`) produite par un export validé de la
  base privée ; repli en carte à plat sans WebGL — voir
  [PROTECTION.md](PROTECTION.md) et [DATA.md](DATA.md).
- **Pages** : Approche, Solutions (+ 5 pages), Référentiels, Analyses (le blog
  existant), Entreprise, Contact (formulaire réel). Le diagnostic de campagne
  (`/diagnostic`) est conservé tel quel.
- **Cobuild4ward n'existe plus** : ni page, ni menu, ni texte, ni métadonnée.
  Les anciennes URL sont redirigées (`next.config.mjs`).

## Documents

| Fichier | Contenu |
|---|---|
| [AUDIT.md](AUDIT.md) | Audit du dépôt et des accès |
| [CAPABILITIES.md](CAPABILITIES.md) | Ce qui est vérifié, par capacité, et ce qui ne l'est pas |
| [DATA.md](DATA.md) | Note courte : données réelles, démonstration, vitrine publiée, règles de diffusion |
| [PROTECTION.md](PROTECTION.md) | Modèle de protection : base privée, export validé, vitrine statique ; limites |
| [INTEGRATIONS.md](INTEGRATIONS.md) | Liste exacte des raccordements restants et variables d'environnement |
| [DEPLOY.md](DEPLOY.md) | Netlify ou Railway, prévisualisation, publication de la vitrine, passage en production |
| [LEVERS.md](LEVERS.md) | La scène des leviers de la couverture et la planche des référentiels : contenu, limites, code |
| [DESIGN.md](DESIGN.md) | Direction artistique, contrastes, mouvement, accessibilité |
| [VERIFICATION.md](VERIFICATION.md) | Résultats des vérifications et conditions de mesure |

## Démarrer

```bash
npm ci
npm run dev        # http://localhost:3000 — redirige vers /en ou /fr
npm test           # vitest : textes, parcours, vitrine (validation, publication, caméra)
npm run build && npm start
```

`?renderer=globe` force le globe 3D même sur un rendu logiciel (recette).

```bash
npm run showcase:demo      # régénère la vitrine d'exemple (mode demo)
npm run showcase:publish -- --from export.json --mode curated --date AAAA-MM-JJ
npm run showcase:check     # valide la vitrine (exécuté avant chaque build)
```

## Scripts de génération (versionnés, déterministes)

- `node scripts/build-terrain.mjs` → `public/images/terrain.svg` (courbes de niveau, décor).
- `node scripts/build-geo.mjs` → `public/geo/*.json` (Natural Earth, domaine public ; polygones découpés à l'antiméridien, extrait Europe à 50 m).
- `node scripts/build-globe-poster.mjs` → `public/images/globe-poster.svg` (aperçu du globe des services, avec les liaisons de la vitrine ; à relancer après chaque publication).
- `npm run poster:levers` → `public/images/levers-poster.svg` (carte de repli de la couverture, pour qui n'exécute pas de script).

## Décisions à prendre (hors de ce dépôt)

Voir [INTEGRATIONS.md](INTEGRATIONS.md) : base privée et export de la vitrine
(publiabilité des noms d'opérateurs, précision des bases de transporteurs),
formulation vérifiée du partenariat CERMICS, pages légales, URL du portail,
variables du formulaire de contact.
