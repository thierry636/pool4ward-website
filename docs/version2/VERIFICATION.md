# Vérification

Résultats mesurés sur le build de production (`next build` puis `next start`) de la
branche `version2`, dans un conteneur de recette, puis sur le déploiement Netlify de
la pull request (section 8). **Ce sont des mesures de laboratoire** — Lighthouse
(simulation d'un mobile moyen sur réseau 4G lent, ou bureau), Chromium sans carte
graphique — **pas des données de fréquentation réelle**. Les Core Web Vitals de
terrain (CrUX / RUM) ne pourront être lus qu'après la mise en ligne.

## Ce qui n'a PAS été vérifié

- **Aucune donnée réelle** : la vitrine est un exemple illustratif (35 sites réels,
  29 liaisons d'illustration, aucun opérateur). L'export depuis la base privée
  n'existe pas encore (INTEGRATIONS.md §1).
- **Les noms d'opérateurs** ont été affichés une fois, avec des noms manifestement
  factices et en local seulement (jeu non versionné), pour vérifier leur placement
  sans chevauchement dans le globe et dans la carte à plat. Aucune publication réelle.
- **La fluidité du globe 3D sur un GPU réel** : il a été joué en rendu logiciel
  (SwiftShader), où il fonctionne mais saccade ; les images par seconde ne sont pas
  mesurées. Le poids téléchargé l'est (section 2).
- Pas de lecteur d'écran réel (NVDA, VoiceOver) : l'accessibilité est contrôlée par
  axe-core, au clavier et par l'arbre d'accessibilité, pas à l'oreille.
- Pas de test sur appareils physiques ni sur Safari/Firefox : Chromium uniquement.
- L'envoi du formulaire de contact n'a été testé qu'avec un faux Resend (tests) et,
  en recette, dans son état « non raccordé » (503).
- Les quotas du formulaire de contact sont en mémoire d'instance ; le stockage
  partagé facultatif n'a été testé qu'avec un faux serveur.

## 1. Tests automatisés (`npm test`)

201 tests dans 16 fichiers, tous réussis. Ils couvrent : parité FR/EN des textes et absence de Cobuild4ward et
des chiffres de la v1 ; typographie française ; état et continuité du parcours
(jamais « confirmé » ni « contractualisé » dans un cas démonstrateur) ; contact
(validation, échappement, injection d'en-tête, champ piège, limite) ; blog ; métadonnées
de partage ; **vitrine** (format fermé : clé inconnue, coordonnées trop fines, texte
ressemblant à une adresse, un lien ou un numéro, site inutilisé, mode hors chapitre,
plafonds, nom d'opérateur interdit en « demo », date de publication ; publication :
colonne non prévue refusée, identifiants de base jamais repris, arrondi, sortie
déterministe, vitrine livrée = exemple publié) ; **animation** (arcs de grand cercle,
antiméridien, vol de caméra et recul, dérive, cadrage d'une emprise à toute taille de
scène).

## 2. Surface serveur et données reçues par le navigateur

Il ne reste qu'une route serveur de contact ; les anciennes routes de données sont
retirées et la source de la vitrine n'est pas une URL publique :

```
PASS  ancienne route /api/globe/manifest → 404  — 404
PASS  ancienne route /api/globe/session → 404  — 404
PASS  ancienne route /api/globe/tiles/services/1/0/0.png → 404  — 404
PASS  ancienne route /api/globe/zones/z-abcdef → 404  — 404
PASS  ancienne route /api/globe/explore → 404  — 404
PASS  la source /data/showcase.json n'est pas servie  — 404
PASS  la source /showcase.json n'est pas servie  — 404
PASS  la source /content/showcase.json n'est pas servie  — 404
PASS  la source /src/content/showcase.json n'est pas servie  — 404
PASS  la source /scripts/showcase/example.source.json n'est pas servie  — 404
PASS  la source /example.source.json n'est pas servie  — 404
PASS  /api/contact : répond (503 non raccordé, ou 400 si raccordé) et ne fuit rien  — 503 {"error":"not_configured"}
PASS  /api/contact : GET refusé  — 405
PASS  /api/diagnostic/contact (diagnostic de campagne, inchangé) répond  — 503

14/14 vérifications réussies
```

Inspection de ce que reçoit réellement un navigateur sur la page Référentiels
(Chromium, globe ouvert, quatre chapitres parcourus) :

```
stockage navigateur: {"local":[],"session":[],"idb":[],"caches":[],"sw":0}
cookies: [{"name":"NEXT_LOCALE","httpOnly":false,"sameSite":"Lax","path":"/"}]
  2 x /fr/datasets statuts 200
 19 x /_next/* assets statuts 200
  1 x /fonts/SourceSerif4-display-latin.woff2 statuts 200
  1 x /images/terrain.svg statuts 200
  1 x /images/globe-poster.svg statuts 200
  1 x /fr statuts 200
  1 x /fr/approach statuts 200
  1 x /fr/solutions statuts 200
  1 x /fr/blog statuts 200
  1 x /fr/contact statuts 200
  1 x blob: (worker MapLibre) statuts 200
  1 x /geo/land-110m.json statuts 200
  1 x /geo/borders-110m.json statuts 200
  1 x /geo/land-50m-europe.json statuts 200
  1 x /geo/borders-50m-europe.json statuts 200

requêtes /api/* émises par la page Référentiels : aucune
requêtes vers un autre domaine : aucune
réponses JSON : uniquement le fond géographique public ? oui (/geo/land-110m.json, /geo/borders-110m.json, /geo/land-50m-europe.json, /geo/borders-50m-europe.json)
fond public (Natural Earth) : /geo/land-110m.json 75 Ko, /geo/borders-110m.json 39 Ko, /geo/land-50m-europe.json 115 Ko, /geo/borders-50m-europe.json 66 Ko
la vitrine n’est pas une URL publique : /data/showcase.json → 404 ; /content/showcase.json → 404 ; /src/content/showcase.json → 404 ; /showcase.json → 404
HTML /fr/datasets : 115514 octets ; 35/35 noms de sites présents (liste textuelle)
mots réservés (secret, token, URL de base…) dans le HTML : aucun
mention « Exemple illustratif » dans le HTML : cohérente avec le mode demo

scan de .next/static (bundles envoyés au navigateur) :
  noms de secrets / code de publication présents : aucun
  source maps : aucune
```

Poids transféré de la page Référentiels :

```
carte à plat (rendu par défaut ici)      total 378 Ko — document 16 · JS 133 · CSS 8 · polices 91 · images 41 · fond géographique 56
globe 3D (?renderer=globe)               total 711 Ko — document 16 · JS 404 · CSS 19 · polices 91 · images 41 · fond géographique 96
```

Lecture : la page n'émet **aucune requête `/api/*`** ; les seules réponses JSON
sont le fond géographique public (Natural Earth) ; la vitrine arrive dans le HTML de
la page, pas par une URL à part ; les bundles ne contiennent ni nom de variable
secrète ni code de publication ; il n'y a pas de source map ; rien n'est écrit dans
`localStorage`, IndexedDB ni dans un cache de service worker ; le seul cookie est
`NEXT_LOCALE`.

**Risque résiduel** : tout ce que la vitrine contient peut être copié, en entier ;
elle est faite pour que ce soit sans conséquence (PROTECTION.md). La vitrine
d'exemple ne contient aucun nom d'opérateur.

## 3. Parcours complet FR et EN

Accueil → méthode (parcours en trois étapes) → capacité → référentiels (animation :
chapitres, pause, liste des liaisons) → contact :

```
== FR ==
PASS accueil : titre de la promesse — Concevoir le transport au plus près du réel.
PASS accueil : langue du document
PASS CTA principal → section du parcours
PASS étape 2 : scénario modal choisi, niveau « détecté »
PASS étape 3 : engagements atteints (capacité, service, durée…)
PASS page de capacité ouverte — /fr/solutions/carrier-search
PASS page Référentiels
PASS animation : quatre chapitres proposés
PASS animation : mention « exemple illustratif » visible
PASS animation : aucun champ de recherche ni formulaire
PASS chapitre 3 choisi : la légende suit
PASS mouvement réduit : pas de lecture automatique (bouton « Lecture »)
PASS lecture lancée à la demande : le bouton propose « Pause »
PASS pause : le bouton propose de nouveau la lecture
PASS liste textuelle des liaisons : équivalent de l’animation — 29 liaisons listées
PASS page Contact
PASS formulaire : erreurs de champ obligatoire
PASS envoi non raccordé : message honnête, pas de faux « envoyé »
PASS envoi non raccordé : une seule réponse 503 de /api/contact, voulue — 1 réponse(s) 503
PASS aucune autre erreur JavaScript sur tout le parcours

== EN ==
PASS accueil : titre de la promesse — Design transport as close to reality as possible.
PASS accueil : langue du document
PASS CTA principal → section du parcours
PASS étape 2 : scénario modal choisi, niveau « détecté »
PASS étape 3 : engagements atteints (capacité, service, durée…)
PASS page de capacité ouverte — /en/solutions/carrier-search
PASS page Référentiels
PASS animation : quatre chapitres proposés
PASS animation : mention « exemple illustratif » visible
PASS animation : aucun champ de recherche ni formulaire
PASS chapitre 3 choisi : la légende suit
PASS mouvement réduit : pas de lecture automatique (bouton « Lecture »)
PASS lecture lancée à la demande : le bouton propose « Pause »
PASS pause : le bouton propose de nouveau la lecture
PASS liste textuelle des liaisons : équivalent de l’animation — 29 liaisons listées
PASS page Contact
PASS formulaire : erreurs de champ obligatoire
PASS envoi non raccordé : message honnête, pas de faux « envoyé »
PASS envoi non raccordé : une seule réponse 503 de /api/contact, voulue — 1 réponse(s) 503
PASS aucune autre erreur JavaScript sur tout le parcours

parcours complet vérifié en FR et EN
```

## 3 bis. Redirections de la v1 et absence de Cobuild4ward

Statut, destination et page atteinte de chaque ancienne adresse, en FR et en EN,
puis recherche de « cobuild » dans le HTML servi de toutes les pages du plan du
site :

```
PASS  /fr/products → /fr/solutions  — 308 /fr/solutions → 200
PASS  /fr/products/design4ward → /fr/solutions/transport-engineering  — 308 /fr/solutions/transport-engineering → 200
PASS  /fr/products/compute4ward → /fr/solutions/transport-engineering  — 308 /fr/solutions/transport-engineering → 200
PASS  /fr/products/modal4ward → /fr/solutions/carrier-search  — 308 /fr/solutions/carrier-search → 200
PASS  /fr/products/connect4ward → /fr/solutions/contract-management  — 308 /fr/solutions/contract-management → 200
PASS  /fr/products/cobuild4ward → /fr/approach  — 308 /fr/approach → 200
PASS  /fr/platform → /fr/approach  — 308 /fr/approach → 200
PASS  /fr/ecosystem → /fr/datasets  — 308 /fr/datasets → 200
PASS  /fr/resources → /fr/blog  — 308 /fr/blog → 200
PASS  /fr/solutions/logistics-optimization → /fr/solutions/transport-engineering  — 308 /fr/solutions/transport-engineering → 200
PASS  /fr/solutions/multimodal-strategy → /fr/solutions/transport-engineering  — 308 /fr/solutions/transport-engineering → 200
PASS  /fr/solutions/supply-chain-decarbonization → /fr/solutions/transport-engineering  — 308 /fr/solutions/transport-engineering → 200
PASS  /fr/solutions/collaborative-transport → /fr/approach  — 308 /fr/approach → 200
PASS  /en/products → /en/solutions  — 308 /en/solutions → 200
PASS  /en/products/design4ward → /en/solutions/transport-engineering  — 308 /en/solutions/transport-engineering → 200
PASS  /en/products/compute4ward → /en/solutions/transport-engineering  — 308 /en/solutions/transport-engineering → 200
PASS  /en/products/modal4ward → /en/solutions/carrier-search  — 308 /en/solutions/carrier-search → 200
PASS  /en/products/connect4ward → /en/solutions/contract-management  — 308 /en/solutions/contract-management → 200
PASS  /en/products/cobuild4ward → /en/approach  — 308 /en/approach → 200
PASS  /en/platform → /en/approach  — 308 /en/approach → 200
PASS  /en/ecosystem → /en/datasets  — 308 /en/datasets → 200
PASS  /en/resources → /en/blog  — 308 /en/blog → 200
PASS  /en/solutions/logistics-optimization → /en/solutions/transport-engineering  — 308 /en/solutions/transport-engineering → 200
PASS  /en/solutions/multimodal-strategy → /en/solutions/transport-engineering  — 308 /en/solutions/transport-engineering → 200
PASS  /en/solutions/supply-chain-decarbonization → /en/solutions/transport-engineering  — 308 /en/solutions/transport-engineering → 200
PASS  /en/solutions/collaborative-transport → /en/approach  — 308 /en/approach → 200
PASS  « Cobuild4ward » absent des 28 pages du plan du site (HTML servi)  — 28 URL

27/27 vérifications réussies
```

## 4. Comportements

Parcours (lecture automatique, pause, clavier, mouvement réduit, curseur de
couverture) :

```
PASS lecture automatique : avance d’une couche après ~3,4 s — 0
Les sites du groupe → 1
Les flux à servir
PASS pause : plus aucun avancement
PASS reprise après pause
PASS un clic sur une couche arrête la lecture automatique — 1
Les flux à servir
PASS mouvement réduit : la lecture automatique ne démarre pas — 0
Les sites du groupe
PASS mouvement réduit : la couverture s’ouvre dans son état final — curseur=100
PASS mouvement réduit : transitions du plateau coupées
PASS curseur : accessible au clavier jusqu’aux flux séparés
PASS flux séparés : la boucle disparaît — opacity=0
PASS onglets : flèche droite → étape 2
PASS onglets : Fin → étape 3
PASS onglets : Début → étape 1
PASS scénarios : flèche bas change de scénario (boutons radio natifs)
PASS niveau de connaissance affiché (Détecté pour la boucle ouverte)
PASS créneau avancé → « étudiée »

15/15 comportements vérifiés
```

Animation du monde (carte à plat, mouvement réduit, globe 3D) :

```
PASS carte à plat : rendu par défaut sans accélération 3D, avec explication
PASS lecture automatique démarrée à l’arrivée (bouton « Pause » proposé)
PASS lecture automatique : le chapitre suivant arrive tout seul — 01 → 02
PASS pause : plus aucun avancement — reste au chapitre 02
PASS pause : les impulsions sont arrêtées (animations SVG suspendues)
PASS reprise : l’avancement reprend — 02 → 03
PASS puce de chapitre : changement immédiat de la légende
PASS la molette sur la scène défile la page (pas de capture du défilement)
PASS clavier : Tab depuis la pause atteint la puce du chapitre 1 — 01 Rail intermodal
PASS clavier : Entrée sur une puce choisit le chapitre
PASS boutons de l’animation : cibles ≥ 44 px — 45, 45, 45, 45, 45
PASS aucune erreur JavaScript (carte à plat)
PASS mouvement réduit : pas de lecture automatique (bouton « Lecture » proposé)
PASS mouvement réduit : le chapitre ne change pas tout seul
PASS mouvement réduit : aucune impulsion animée
PASS mouvement réduit : les puces changent quand même de chapitre
PASS globe : un canvas WebGL, aucune carte à plat
PASS globe : zone de carte décrite (role=img, nom du chapitre)
PASS globe : la légende suit le chapitre à l’échange (pas au clic)
PASS globe : des étiquettes de sites sont posées sur la carte — 5 étiquettes
PASS aucune erreur JavaScript (globe)

21/21 comportements vérifiés
```

## 5. Accessibilité (axe-core : WCAG 2.0/2.1/2.2 A et AA + bonnes pratiques)

60 vues contrôlées : les pages × 2 langues × 2 largeurs (1440 et 390 px), avec
les états interactifs de l'accueil, et la page Référentiels en carte à plat comme en
globe, liste des liaisons dépliée. total violations axe: 0.
Aucune violation.

Lighthouse accessibilité : voir le tableau ci-dessous. Contrastes : voir DESIGN.md.

## 6. Débordement horizontal et lisibilité

120 pages × largeurs contrôlées, 0 débordement(s)

Contrôle visuel fait sur captures (accueil, chaque étape du parcours, chaque chapitre
de l'animation en globe et en carte à plat, mobile et bureau, FR et EN) : premier
écran, étapes, légende, étiquettes, repli sans WebGL, mouvement réduit. Corrections
issues de ces contrôles : fond de carte sans artefact (polygones découpés à
l'antiméridien — l'Eurasie était un anneau unique dont deux arêtes faisaient le
tour du pôle), cadrage calculé sur l'emprise réelle des sites (et non des zooms
fixés pour un écran de bureau), carte centrée au-dessus de la légende et sous la
mention d'exemple sur téléphone, légende qui suit le contenu affiché et non le
clic, noms d'opérateurs décalés plutôt qu'écartés en cas de collision.

## 7. Performance (Lighthouse 12, build de production local)

Mobile = simulation Lighthouse par défaut (4G lente, processeur ralenti ×4) ; bureau
= préréglage `desktop` (une exécution). Pour le mobile, trois exécutions par page :
la colonne LCP les donne triées, parce que les valeurs varient de quelques dixièmes
de seconde d'une exécution à l'autre ; CLS et TBT sont au pire des trois. Le score
SEO est celui de la première exécution et il est abaissé par deux artefacts de
recette, pas par des défauts : `is-crawlable` (le site est volontairement en
`noindex` hors production) et `canonical` (la balise vise `https://pool4ward.com/…`
alors que Lighthouse mesure `http://localhost:3000`). Les autres contrôles SEO
passent.

```
approach desktop                         perf 100       a11y 100 bp 100 seo* 58 | LCP 0.6 s | CLS 0.000 | TBT 0 ms
approach mobile                          perf 98/99/99  a11y 100 bp 100 seo* 58 | LCP 2.0 s · 2.1 s · 2.3 s | CLS 0.000 | TBT 26 ms
contact desktop                          perf 100       a11y 100 bp 100 seo* 58 | LCP 0.5 s | CLS 0.000 | TBT 0 ms
contact mobile                           perf 98/99/98  a11y 100 bp 100 seo* 58 | LCP 2.1 s · 2.3 s · 2.4 s | CLS 0.000 | TBT 37 ms
datasets desktop                         perf 100       a11y 100 bp 100 seo* 58 | LCP 0.6 s | CLS 0.000 | TBT 0 ms
datasets mobile                          perf 96/98/98  a11y 100 bp 100 seo* 58 | LCP 2.3 s · 2.4 s · 2.7 s | CLS 0.000 | TBT 83 ms
home desktop                             perf 100       a11y 100 bp 100 seo* 61 | LCP 0.7 s | CLS 0.000 | TBT 0 ms
home mobile                              perf 94/96/97  a11y 100 bp 100 seo* 61 | LCP 2.6 s · 2.6 s · 2.9 s | CLS 0.000 | TBT 76 ms
solutions-transport-engineering desktop  perf 100       a11y 100 bp 100 seo* 58 | LCP 0.6 s | CLS 0.000 | TBT 0 ms
solutions-transport-engineering mobile   perf 97/99/99  a11y 100 bp 100 seo* 58 | LCP 2.1 s · 2.1 s · 2.6 s | CLS 0.000 | TBT 83 ms
```

Seuils « bons » (CWV) : LCP ≤ 2,5 s, CLS ≤ 0,1, INP ≤ 200 ms (TBT sert de proxy de
laboratoire ; l'INP ne se mesure qu'avec de vraies interactions).

**La page Référentiels est mesurée en carte à plat** : Lighthouse tourne sans GPU,
donc sans WebGL, et l'animation prend son repli SVG (≈ 180 Ko de fond géographique
Europe, aucun script de carte). Le globe 3D, lui, charge MapLibre (voir le poids en
section 2) ; son coût sur un appareil réel n'est pas mesuré ici.

Ce qui a été fait pour tenir ces seuils : polices variables allégées et
sous-ensemblées, `font-display: optional` sur le texte principal (pas de bascule en
cours de lecture), messages passés aux composants client page par page, pages rendues
statiquement par langue, MapLibre **chargé à la demande seulement** (à l'approche de
la scène, sur un appareil capable de la 3D), fond géographique fin réduit à
l'Europe (183 Ko au lieu de 1,15 Mo pour le monde), vitrine intégrée au HTML (7 Ko,
aucune requête de données).

**Le seuil de LCP ≤ 2,5 s n'est pas démontré tenu sur toutes les pages en mobile.** Plages mesurées (trois exécutions chacune, simulation Lighthouse) :

- approach : 2,0 s · 2,1 s · 2,3 s
- contact : 2,1 s · 2,3 s · 2,4 s
- datasets : 2,3 s · 2,4 s · 2,7 s
- home : 2,6 s · 2,6 s · 2,9 s
- solutions-transport-engineering : 2,1 s · 2,1 s · 2,6 s

Pages dont au moins une exécution dépasse 2,5 s : datasets, home, solutions-transport-engineering. Pages qui restent sous le seuil sur les trois exécutions : approach, contact. L'accueil est le plus loin du seuil (2,6 s · 2,6 s · 2,9 s). Éléments d'explication, mesurés dans une série précédente : sans bridage, FCP et LCP de l'accueil sont à 175 ms ; c'est le modèle de simulation (environ 300 Ko chargés avant le LCP, sur une 4G lente) qui porte l'estimation à ≈ 3 s ; l'élément LCP est le paragraphe d'accroche (texte), pas une image. Pistes non engagées : différer le filigrane des courbes de niveau (22 Ko) et la police mono (24 Ko) hors du premier écran, réduire le JavaScript de l'accueil (≈ 135 Ko). La valeur de terrain (CrUX / RUM) tranchera après la mise en ligne ; d'ici là, ne pas annoncer « Core Web Vitals bons ».

## 8. Prévisualisation hébergée (Netlify)

Vérifié sur le déploiement de la pull request n° 23 :
`https://deploy-preview-23--pool4wardv2.netlify.app` (le second site Netlify,
`https://deploy-preview-23--p4wname.netlify.app`, donne les mêmes en-têtes), au
commit `e76ee75` pour les parcours et au commit `c38cdf0` pour les en-têtes des
fichiers statiques. Les essais partent de ce conteneur, par le proxy de
l'environnement (la vérification TLS reste active).

- **Contrôles Netlify de la pull request** (« Header rules », « Redirect rules »,
  « Pages changed ») : réussis sur les deux sites, pour chaque commit poussé. Le
  job GitHub Actions `build` est le gabarit du dépôt (il n'exécute que des `echo`) :
  il ne démontre rien sur le site.
- **Redirections** (même script qu'en local) : 27/27 sur l'hébergeur.
- **Surface de routes** : 14/14 — plus aucune route de données, la source de la
  vitrine n'est pas servie, `/api/contact` répond 503 « non raccordé ».
- **Parcours complet FR et EN** : 40 vérifications réussies, formulaire compris
  (503 attendu, message honnête).
- **Comportements de l'animation** : 21/21 (carte à plat, mouvement réduit, globe 3D
  forcé en rendu logiciel).
- **Inspection réseau** : aucune requête `/api/*`, un seul cookie (`NEXT_LOCALE`),
  rien dans le stockage du navigateur, réponses JSON limitées au fond géographique
  public, 35 sites sur 35 présents dans la liste textuelle, aucun mot réservé dans
  le HTML.

**En-têtes constatés sur l'hébergeur** : les pages portent `X-Content-Type-Options`,
`X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` et HSTS ; une prévisualisation
émet `X-Robots-Tag: noindex` et un `robots.txt` qui interdit tout. Les fichiers
statiques (polices, fond géographique, images, visuel de partage) sont servis en
`Cache-Control: public, max-age=604800` (polices et fond) ou `86400` (images), avec
`stale-while-revalidate`, et `X-Content-Type-Options: nosniff`.

Deux défauts d'hébergement ont été **trouvés et corrigés** grâce à cette vérification :
les fichiers statiques étaient servis en `max-age=0` (les règles `headers()` de
`next.config.mjs` ne s'appliquent pas aux fichiers statiques sur Netlify : la règle
vit désormais dans `netlify.toml`), puis sans `nosniff` (même cause).

**Netlify injecte ses propres scripts dans les prévisualisations.** Le navigateur
contacte `app.netlify.com` et `cdn.segment.com` via `/.netlify/scripts/cdp` (outil
de commentaires des prévisualisations) : ce n'est pas le code du site, qui n'émet
aucune requête tierce (vérifié en local et par recherche dans le code). Conséquence :
le poids mesuré sur la prévisualisation (≈ 2 Mo) est gonflé par Netlify et n'est pas
repris ici ; les poids de la section 2 sont ceux du build local. À reverifier en
production.

**Non mesuré sur l'hébergeur** : Lighthouse (les scripts de Netlify faussent la
mesure), les quotas du formulaire de contact (compteurs en mémoire d'instance), le
fonctionnement de l'identification du client (`x-nf-client-connection-ip`, variable
`NETLIFY`), la performance derrière le CDN d'un visiteur réel.
