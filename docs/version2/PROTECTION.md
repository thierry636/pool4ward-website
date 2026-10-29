# Protection des référentiels : objectif, mécanismes, limites

**Objectif** : rendre visible la richesse des référentiels sans distribuer une base
exploitable au navigateur. **Ce n'est pas** « impossible à scraper » : tout ce qui
s'affiche peut être capturé, y compris en image et par OCR. On vise à minimiser ce
qui est divulgué, à interdire l'accès aux données brutes, et à rendre la
reconstitution systématique **coûteuse, limitée et détectable**.

Ni WebGL, ni le canvas, ni les tuiles vectorielles, ni l'obfuscation JavaScript ne
protègent ce qu'ils reçoivent ; HTTPS ne cache rien à celui qui reçoit ; CORS et
`robots.txt` ne sont pas des contrôles d'accès. Rien de ce qui suit ne s'appuie
sur eux.

## Trois périmètres

1. **Référentiels privés** — données sources, coordonnées précises, contacts,
   qualifications. Aucun accès depuis ce site : il n'embarque aucune clé du portail,
   ne relaie aucune API du portail, ne contient aucun secret dans ses bundles.
2. **Projection de démonstration** — agrégats et images générés côté serveur
   (`src/server/projection/`). Leur contenu doit être acceptable même copié en
   entier.
3. **Exploration détaillée** — `GET /api/globe/explore` : réservée à un compte
   autorisé, résultats plafonnés, filtres tirés d'une liste fermée. **Non raccordée**
   (INTEGRATIONS.md) : 401 sans justificatif, 501 avec.

## Ce que reçoit le navigateur

| Route | Contenu | Cache |
|---|---|---|
| `GET /api/globe/manifest` | couches (id, type, zoom max, maille, couleur, disponibilité) et zones (id opaque, emprise) — **aucune donnée** | public 5 min |
| `POST /api/globe/session` | cookie signé (HMAC), HttpOnly, SameSite=Lax, 30 min | no-store |
| `GET /api/globe/tiles/{couche}/{z}/{x}/{y}.png` | **image** PNG 512 px | `private`, `Vary: Cookie`, `CORP: same-origin` |
| `GET /api/globe/zones/{zone}` | paliers d'effectifs par couche, jamais la liste des actifs | no-store |

Une tuile est un raster calculé à partir d'une grille de **2 à 3°** (1° pour les
corridors) : masquage des cellules sous le seuil de petits effectifs, interpolation
bilinéaire, **cinq paliers** d'opacité, zoom servi plafonné (couches de densité :
4 ou 5 ; au-delà, 404 — pas de précision cachée). Aucun bruit par requête.
Les réponses privées ne sont jamais `public` : un CDN ne doit pas les resservir à
qui n'a pas passé la garde, sans quoi les quotas seraient contournés par le cache.

## Validation côté serveur (avant tout accès aux données)

Couche inconnue → 404 ; zoom au-delà de la politique → 404 ; `z/x/y` non entiers,
hors grille, avec zéros de tête ou notation exponentielle → 400. Zones : seuls les
18 identifiants opaques connus ; pas d'emprise libre, pas de `lat/lon`, pas de
pagination sans fin. Exploration : toute clé inconnue (`bbox`, `lat`, `lon`,
`cursor`, `q`…) est refusée ; `limit` ≤ 25, `page` ≤ 3.

## Garde, quotas, détection (`src/server/projection/guard.ts`)

| Signal | Seuil | Réponse |
|---|---|---|
| Sessions ouvertes par adresse | 12 / heure | 429, puis défi |
| Tuiles par session / par adresse | 300 / 900 par minute | 429 |
| Tuiles **distinctes** par session / par adresse | 450 / 800 par 10 min | 429 |
| Tuiles distinctes aux 2 zooms les plus fins, par session | 100 par 10 min | 429 (balayage) |
| Synthèses de zone par session ; zones distinctes | 40 ; 20 par 10 min | 429 |
| Refus répétés par adresse | 3 par heure | **403 + `X-P4W-Challenge: required`** |
| Refus répétés par adresse | 6 par heure | **blocage 15 min** |
| Charge > 60 % / 85 % du quota | — | ralentissement 250 / 800 ms |

La visite normale (un globe, deux couches, quelques zones) reste très en dessous.
Les événements sont journalisés en JSON (`globe.guard`) avec identifiants **hachés**.

## Limites à connaître

- **Stockage mémoire par instance** : sur du serverless (Netlify), chaque instance
  a ses compteurs. La garde est donc une barrière de bon sens, pas globale. Le même
  contrat se branche sur un stockage partagé (`UpstashStore`, variables
  `RATE_LIMIT_REDIS_URL` / `RATE_LIMIT_REDIS_TOKEN`) — **non éprouvé sur un service
  réel** ; testé avec un faux uniquement.
- **Défi non implémenté** : l'en-tête `X-P4W-Challenge` signale au pare-feu
  applicatif ou à la solution anti-bot qu'il doit en proposer un. Évaluer, selon
  l'offre réellement retenue, les règles de limitation de débit et la détection de
  bots de l'hébergeur ou d'un pare-feu (par exemple les bonnes pratiques de
  limitation Cloudflare). Une IP seule est un signal faible (NAT d'entreprise) :
  les quotas combinent session, adresse et comportement.
- **Un visiteur anonyme ouvre autant de sessions qu'il veut** — d'où la limite
  d'ouverture par adresse. Tokens et URL signées n'y changent rien : elles limitent
  la réutilisation d'un accès, pas la copie d'un contenu.
- **Contrôles effectifs en accès direct à l'origine** : ils sont dans les routes
  elles-mêmes, pas devant elles.
- **Secret de session** : `GLOBE_SESSION_SECRET` (≥ 32 caractères) est
  **obligatoire avec une source réelle** (sinon 503). Avec la source de
  démonstration — publique par construction — un secret dérivé permet à la
  prévisualisation de fonctionner sans configuration ; les quotas s'appliquent
  pareillement.

## Avant de raccorder une source réelle

1. Faire produire par le backend de projection (et non par le site) les agrégats
   au contrat de `source.ts` : champs en liste blanche, maille imposée.
2. Définir pour chaque couche la maille, le seuil `minCount`, le zoom maximal et
   la fraîcheur affichée ; faire valider par le responsable des données.
3. Vérifier les licences : le réseau fluvial EURIS est sous licence Zenodo
   « research purposes only » à clarifier avant tout usage commercial ; ne pas
   exposer les extraits tiers périmés (FVL 2014).
4. Poser un secret de session, un stockage de quotas partagé, et une règle de
   limitation côté pare-feu.
5. Rejouer les tests de `VERIFICATION.md` sur l'environnement réel.
