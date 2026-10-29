# Pool4ward — version 2

Deuxième version du site public, développée sur la branche `version2`. Le site
actuel (`main`) n'est pas touché : rien ne passe sur le domaine public sans
décision distincte.

## Ce que contient cette branche

- **Une couverture et un parcours « du terrain aux engagements »** : un même cas
  démonstrateur (quatre sites, six flux, fictifs) traverse trois étapes —
  comprendre le terrain, concevoir le plan, contractualiser. Le plateau SVG
  (`src/components/journey/Board.tsx`) est animé par transitions CSS seulement,
  fixe sous « mouvement réduit », et ne calcule ni coût ni gain.
- **Cinq capacités** (ingénierie, appels d'offres, recherche de transporteurs,
  comparaison des offres, gestion des contrats), décrites par leurs fonctions
  vérifiées dans le code — voir [CAPABILITIES.md](CAPABILITIES.md).
- **Un globe des référentiels** (MapLibre, projection globe) dont les couches sont
  des images générées côté serveur à partir d'agrégats, avec garde, quotas et
  repli sans WebGL — voir [PROTECTION.md](PROTECTION.md).
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
| [DATA.md](DATA.md) | Note courte : données réelles, agrégats, démonstrations, règles de diffusion |
| [PROTECTION.md](PROTECTION.md) | Architecture de protection des référentiels, seuils, risque résiduel |
| [INTEGRATIONS.md](INTEGRATIONS.md) | Liste exacte des raccordements restants et variables d'environnement |
| [DEPLOY.md](DEPLOY.md) | Prévisualisation, variables, passage en production |
| [DESIGN.md](DESIGN.md) | Direction artistique, contrastes, mouvement, accessibilité |
| [VERIFICATION.md](VERIFICATION.md) | Résultats des vérifications et conditions de mesure |

## Démarrer

```bash
npm ci
npm run dev        # http://localhost:3000 — redirige vers /en ou /fr
npm test           # vitest : textes, parcours, projection, garde
npm run build && npm start
```

`?renderer=globe` force le globe 3D même sur un rendu logiciel (recette).

## Scripts de génération (versionnés, déterministes)

- `node scripts/build-terrain.mjs` → `public/images/terrain.svg` (courbes de niveau, décor).
- `node scripts/build-geo.mjs` → `public/geo/*.json` (Natural Earth, domaine public).
- `node scripts/build-globe-poster.mjs` → `public/images/globe-poster.svg`.

## Décisions à prendre (hors de ce dépôt)

Voir [INTEGRATIONS.md](INTEGRATIONS.md) : raccordement du backend de projection,
formulation vérifiée du partenariat CERMICS, pages légales, URL du portail,
activation de la prévisualisation sur l'hébergeur.
