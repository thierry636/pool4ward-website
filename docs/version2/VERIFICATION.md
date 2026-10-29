# Vérification

Résultats mesurés sur le build de production (`next build` puis `next start`) de la
branche `version2`, dans un conteneur de recette. **Ce sont des mesures de
laboratoire** — Lighthouse (simulation d'un mobile moyen sur réseau 4G lent, ou
bureau), Chromium sans carte graphique — **pas des données de fréquentation
réelle**. Les Core Web Vitals de terrain (CrUX / RUM) ne pourront être lus qu'après
la mise en ligne.

## Ce qui n'a PAS été vérifié

- Aucun déploiement hébergé : pas de prévisualisation en ligne, donc pas de mesure
  derrière un CDN, ni de test des quotas sur l'infrastructure réelle.
- Aucune source réelle : le globe tourne sur la démonstration ; le contrat du backend
  de projection est testé contre des réponses simulées.
- Le stockage de quotas partagé (`UpstashStore`) n'a été testé qu'avec un faux serveur.
- L'envoi du formulaire de contact n'a été testé qu'avec un faux Resend (tests) et,
  en recette, dans son état « non raccordé » (503).
- Pas de lecteur d'écran réel (NVDA, VoiceOver) : l'accessibilité est contrôlée par
  axe-core, au clavier et par l'arbre d'accessibilité, pas à l'oreille.
- Pas de test sur appareils physiques ni sur Safari/Firefox : Chromium uniquement.
- Le rendu 3D n'a été exercé qu'en rendu logiciel (SwiftShader), sans GPU.

## 1. Tests automatisés (`npm test`)

168 tests dans 16 fichiers, tous réussis. Ils couvrent : parité FR/EN des textes et absence de Cobuild4ward et
des chiffres de la v1 ; typographie française ; état et continuité du parcours
(jamais « confirmé » ni « contractualisé » dans un cas démonstrateur) ; contact
(validation, échappement, injection d'en-tête, champ piège, limite) ; blog (régions
qui défilent, repères) ; projection (session signée, expiration, falsification,
validation des tuiles, déterminisme, masquage des petits effectifs, quotas, balayage,
escalade, synthèses en paliers, zones disjointes, exploration refusée, contrat de la
source réelle, identification du client).

## 2. Protection des données : client HTTP pur, hors navigateur

`node protect-blackbox.mjs` (scripts de recette, hors dépôt) contre `next start`,
avec une adresse de client simulée par `X-Forwarded-For` :

```
PASS  manifeste public 200 sans donnée  — 1714 octets, cache-control: public, max-age=300
PASS  tuile sans session → 401  — 401
PASS  session émise (cookie HttpOnly, SameSite=Lax)  — p4w_gs=…; Path=/api/globe; HttpOnly; SameSite=Lax; Max-Age=1800
PASS  tuile avec session → image PNG  — 5911 octets
PASS  tuile : cache privé, Vary: Cookie, CORP same-origin, pas de CORS  — private, max-age=1800 | RSC, Next-Router-State-Tree, Next-Router-Prefetch, Cookie
PASS  cookie forgé → 401  — 401
PASS  hors limites : zoom au-delà de la politique (services z=6)  — attendu 404, reçu 404
PASS  hors limites : zoom au-delà (carriers z=5)  — attendu 404, reçu 404
PASS  hors limites : couche inconnue  — attendu 404, reçu 404
PASS  hors limites : x hors grille  — attendu 400, reçu 400
PASS  hors limites : y négatif  — attendu 400, reçu 400
PASS  hors limites : notation exponentielle  — attendu 400, reçu 400
PASS  hors limites : entier démesuré  — attendu 400, reçu 400
PASS  hors limites : traversée de chemin  — attendu 400, reçu 400
PASS  couche non raccordée (parkings) → 404, rien dessiné  — 404
PASS  synthèse de zone : paliers seulement  — {"layer":"services","availability":"demo","range":{"min":250,"max":499},"suppressed":false,"asOf":null}
PASS  zone « france » (slug, pas un id opaque) → 400  — 400
PASS  zone inconnue → 404  — 404
PASS  emprise libre ignorée : même réponse qu’une zone
PASS  zone sans session → 401
PASS  exploration sans justificatif → 401  — 401
PASS  exploration avec jeton quelconque → 401  — 401
PASS  exploration : aucune porte dérobée (bbox) même avec un jeton  — 401
PASS  balayage de tuiles au zoom fin coupé après 100 tuiles distinctes  — coupé à la tuile 100, statut 429
PASS  escalade 429 → 403 défi → blocage  — 429, 403+défi
PASS  adresse bloquée : plus de nouvelle session  — 429
PASS  une autre adresse n’est pas affectée  — 200
PASS  rafale d’ouvertures de session coupée au-delà de 12 / heure  — première coupure à la 12e
PASS  dépassement du débit par session coupé (300/min)  — coupé à 300, statut 429

29/29 vérifications réussies
```

Inspection de ce que reçoit réellement un navigateur (Chromium, globe ouvert, zone
choisie, couche changée) :

```
stockage navigateur: {"local":[],"session":[],"idb":[],"caches":[],"sw":0}
cookies: [{"name":"p4w_gs","httpOnly":true,"sameSite":"Lax","path":"/api/globe"},{"name":"NEXT_LOCALE","httpOnly":false,"sameSite":"Lax","path":"/"}]
  2 x /fr/datasets statuts 200
 19 x /_next/* assets statuts 200
  1 x /fonts/SourceSerif4-display-latin.woff2 statuts 200
  1 x /images/globe-poster.svg statuts 200
  1 x /images/terrain.svg statuts 200
  1 x /fr statuts 200
  1 x /fr/approach statuts 200
  1 x /fr/contact statuts 200
  1 x /fr/solutions statuts 200
  1 x /fr/blog statuts 200
  1 x /api/globe/manifest statuts 200
  1 x http://localhost:3000/243f9325-ea9f-4c39-8ec0-3fd53a85d6a7 statuts 200
  1 x /geo/land-110m.json statuts 200
  1 x /geo/borders-110m.json statuts 200
 47 x /api/globe/tiles/* (image/png) statuts 200
  1 x /api/globe/zones/z-58478f statuts 200
  1 x /geo/borders-50m.json statuts 200
  1 x /geo/land-50m.json statuts 200

réponses JSON reçues:
  /api/globe/manifest 1714 octets
  /geo/land-110m.json 76352 octets
  /geo/borders-110m.json 39526 octets
  /api/globe/zones/z-58478f 556 octets
  /geo/borders-50m.json 272197 octets
  /geo/land-50m.json 900895 octets
fuites dans les JSON de l’API: aucune
fond public (Natural Earth): /geo/land-110m.json 75Ko, /geo/borders-110m.json 39Ko, /geo/borders-50m.json 266Ko, /geo/land-50m.json 880Ko
exemple de synthèse de zone: {"zone":"z-58478f","mode":"demo","layers":[{"layer":"services","availability":"demo","range":{"min":500,"max":999},"suppressed":false,"asOf":null},{"layer":"carriers","availability":"demo","range":{"min":1000,"max":null},"suppressed":false,"asOf":null},{"layer":"parkings","availability":"unavailable","range":null,"suppressed":false,"asOf":null},{"layer":"charging","availability":"demo","range":{"m
HTML /fr/datasets:  60462 octets ; contient « fixtures »/« hubs »/coordonnées de foyers: false

scan de .next/static (bundles envoyés au navigateur):
  noms de secrets / code serveur de projection présents: aucun
  source maps: aucune
```

Lecture : aucune réponse JSON de l'API ne contient cellule, effectif brut,
coordonnée d'actif ni attribut ; le HTML de la page Référentiels n'embarque aucun
payload de couche ; les bundles envoyés ne contiennent ni nom de variable secrète ni
code de la projection côté serveur ; il n'y a pas de source map ; rien n'est écrit
dans `localStorage`, IndexedDB ni dans un cache de service worker. Les couches
n'arrivent que sous forme d'**images PNG** ; seul le fond géographique public
(Natural Earth) est en JSON.

**Risque résiduel** : les images et les paliers affichés sont capturables, en image
et par OCR, et assemblables. Ils sont volontairement grossiers (maille 1 à 3°, cinq
paliers, zoom plafonné) ; la détection de balayage et les quotas rendent une
collecte systématique lente et visible, pas impossible.

## 3. Parcours complet FR et EN

Accueil → méthode (parcours en trois étapes) → capacité → référentiel → contact :

```
== FR ==
PASS accueil : titre de la promesse — Concevoir le transport au plus près du réel.
PASS accueil : langue du document
PASS CTA principal → section du parcours
PASS étape 2 : scénario modal choisi, niveau « détecté »
PASS étape 3 : engagements atteints (capacité, service, durée…)
PASS page de capacité ouverte — /fr/solutions/carrier-search
PASS page Référentiels
PASS référentiel : synthèse de zone en paliers (jamais la liste) — SYNTHÈSE DE ZONE Benelux, Nord de la France, Rhin-Ruhr DONNÉES DE DÉMONSTRATION Services intermodaux 500 à 999 ressource
PASS référentiel : mention démonstration visible
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
PASS référentiel : synthèse de zone en paliers (jamais la liste) — ZONE SUMMARY Benelux, northern France, Rhine-Ruhr DEMONSTRATION DATA Intermodal services 500 to 999 referenced resources
PASS référentiel : mention démonstration visible
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

## 5. Accessibilité (axe-core : WCAG 2.0/2.1/2.2 A et AA + bonnes pratiques)

14 pages × 2 langues × 2 largeurs (1440 et 390 px), avec les états interactifs de
l'accueil. total violations axe: 0.
Aucune violation.

Lighthouse accessibilité : voir le tableau ci-dessous. Contrastes : voir DESIGN.md.

## 6. Débordement horizontal et lisibilité

120 pages × largeurs contrôlées, 0 débordement(s)

Contrôle visuel fait sur captures (accueil, chaque étape du parcours, globe, carte à
plat, menu mobile) à 390, 768 et 1440 px : premier écran, étapes, couches, détail
autorisé, repli sans WebGL, mouvement réduit. Les corrections qui en sont issues :
étiquettes de pastilles repositionnées, une seule couche d'annotations à la fois à
l'étape 1, légende de statuts verticale sur téléphone, menu mobile (le filtre
`backdrop-filter` du `<header>` écrasait le panneau), zones de défilement nommées et
atteignables au clavier.

## 7. Performance (Lighthouse 12, build de production local)

Mobile = simulation Lighthouse par défaut (4G lente, processeur ralenti ×4) ; bureau
= préréglage `desktop` (une exécution). Pour le mobile, trois exécutions par page :
la colonne LCP les donne triées, parce que les valeurs varient de quelques dixièmes
de seconde d'une exécution à l'autre ; performance, accessibilité et bonnes
pratiques sont donnés par exécution ou au pire des trois, CLS et TBT au pire des
trois. Le score SEO (58–61) est celui de la première exécution et il est abaissé par
deux artefacts de recette, pas par des défauts : `is-crawlable` (le site est
volontairement en `noindex` hors production) et `canonical` (la balise vise
`https://pool4ward.com/…` alors que Lighthouse mesure `http://localhost:3000`). Les
autres contrôles SEO passent (vérifié sur les 50 rapports de la série finale : ce
sont les deux seuls échecs, sur toutes les pages). La recette a aussi permis de corriger deux défauts
réels : l'accueil n'avait ni canonical ni hreflang, et les pages intérieures
perdaient l'image de partage Open Graph (test dans `src/lib/seo.test.ts`).

```
approach desktop                         perf 100       a11y 100 bp 100 seo* 58 | LCP 0.5 s | CLS 0.000 | TBT 0 ms
approach mobile                          perf 98/99/99  a11y 100 bp 100 seo* 58 | LCP 2.1 s · 2.1 s · 2.4 s | CLS 0.000 | TBT 23 ms
contact desktop                          perf 100       a11y 100 bp 100 seo* 58 | LCP 0.5 s | CLS 0.000 | TBT 0 ms
contact mobile                           perf 99/98/99  a11y 100 bp 100 seo* 58 | LCP 2.1 s · 2.3 s · 2.4 s | CLS 0.000 | TBT 30 ms
datasets desktop                         perf 100       a11y 100 bp 100 seo* 58 | LCP 0.5 s | CLS 0.000 | TBT 0 ms
datasets mobile                          perf 98/99/99  a11y 100 bp 100 seo* 58 | LCP 2.0 s · 2.2 s · 2.4 s | CLS 0.000 | TBT 28 ms
home desktop                             perf 100       a11y 100 bp 100 seo* 61 | LCP 0.7 s | CLS 0.000 | TBT 0 ms
home mobile                              perf 94/96/97  a11y 100 bp 100 seo* 61 | LCP 2.6 s · 2.7 s · 3.0 s | CLS 0.000 | TBT 43 ms
solutions-transport-engineering desktop  perf 100       a11y 100 bp 100 seo* 58 | LCP 0.6 s | CLS 0.000 | TBT 0 ms
solutions-transport-engineering mobile   perf 99/99/99  a11y 100 bp 100 seo* 58 | LCP 2.1 s · 2.1 s · 2.1 s | CLS 0.000 | TBT 19 ms
```

Seuils « bons » (CWV) : LCP ≤ 2,5 s, CLS ≤ 0,1, INP ≤ 200 ms (TBT sert de proxy de
laboratoire ; l'INP ne se mesure qu'avec de vraies interactions).

Ce qui a été fait pour tenir ces seuils : polices variables allégées et
sous-ensemblées (Geist ≈ 22 Ko, Geist Mono ≈ 23 Ko, serif d'affichage ≈ 46 Ko),
`font-display: optional` sur le texte principal (pas de bascule en cours de lecture),
messages passés aux composants client page par page (le document de l'accueil n'est
plus alourdi des textes des autres pages), pages rendues statiquement par langue,
MapLibre et le fond Natural Earth fin chargés **à la demande seulement** (ouverture
du globe, puis zoom), globe qui n'attend ni la fin du chargement ni une action sur un
appareil modeste, une connexion lente ou un rendu logiciel (carte à plat
proposée d'emblée).

**Le seuil de LCP ≤ 2,5 s n'est pas démontré tenu sur la page d'accueil en mobile.**
Dans la série finale ci-dessus, l'accueil donne 2,6 s, 2,7 s et 3,0 s (des séries
antérieures, sur des builds précédents au code de page identique, donnaient 2,3 à 2,9 s) : c'est **au-dessus** du seuil
dans la simulation Lighthouse. Les autres pages sont à 2,0–2,4 s dans cette série (une
série antérieure avait mesuré 2,5 s sur Contact : à la limite du seuil, donc sans marge). CLS vaut 0 partout, TBT reste sous 60 ms.
Éléments d'explication, mesurés et non extrapolés : sans bridage, FCP et LCP de
l'accueil sont à 175 ms ; c'est le modèle de simulation (environ 300 Ko chargés avant
le LCP, sur une 4G lente) qui porte l'estimation à ≈ 3 s. L'élément LCP est le
paragraphe d'accroche (texte), pas une image. Pistes non engagées : différer le
filigrane des courbes de niveau (22 Ko) et la police mono (24 Ko) hors du premier
écran, réduire le JavaScript de l'accueil (≈ 135 Ko). La valeur de terrain
(CrUX / RUM) tranchera après la mise en ligne ; d'ici là, ne pas annoncer « Core Web
Vitals bons » pour cette page.
