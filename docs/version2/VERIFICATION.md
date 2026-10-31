# Vérification

Résultats mesurés sur le build de production (`next build` puis `next start`) de la
branche `version2` **au commit `39e2d80`**, dans un conteneur de recette ; la prévisualisation
hébergée (section 8) n'a pas été rejouée sur ce commit. **Ce sont des mesures de laboratoire** — Lighthouse
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
- **La fluidité du globe 3D sur un GPU réel** (animation du monde et scène des
  leviers de la couverture) : joués en rendu logiciel (SwiftShader), où ils
  fonctionnent mais saccadent ; les images par seconde ne sont pas mesurées. Le poids
  téléchargé l'est (section 2).
- **Les chiffres de la planche des référentiels** (`src/content/referentials.ts`, provenance en
  tête de fichier). **Recoupés** : services intermodaux (2 500 = 1 978 rail + 522 fluvial, 36 pays)
  et shortsea (1 690), lus sur les écrans du portail le 2026-10-31 (les captures affichées montrent
  ces mêmes totaux). **Donnés par la direction, non recoupés** : 61 opérateurs, 3 continents,
  « + 36 000 points » (bornes et parkings) et « + 80 000 transporteurs » — source et date à fournir
  avant toute mise en ligne publique ; le portail montre, pour les réseaux privés de bornes, 111 sites
  et 337 bornes, un périmètre plus étroit (ces deux nombres ne sont plus affichés). Les anciens
  « 3 500 » et « 1 500 » ne sont plus affichés (le référentiel Appel d'Air 2026 compte 2 906 services
  ferroviaires intermodaux, sans le fluvial ni le shortsea).
- **Les captures de la planche sont des captures du portail** (`public/images/referentials/`), **noms
  d'opérateurs et de transporteurs masqués** avant enregistrement (barres grises). Aucun nom n'est
  publié (accord de l'équipe requis). Les captures des réseaux et des prix manquent : la tuile des
  réseaux montre la carte animée du site, celle des prix un schéma sans donnée. « Mise à jour
  journalière » (services) est une indication de la direction, la fréquence réelle est à confirmer.
- **Le carrousel mobile** est contrôlé au toucher simulé (défilement, accroche, points, flèches) en
  Chromium, pas sur un téléphone réel ; l'accroche (`scroll-snap`) et les requêtes de conteneur
  (`@container`, `cqw`) ne sont pas vérifiées sous Safari ni Firefox.
- **Le mouvement de la couverture ne s'arrête pas** : plus de bouton pause ni de choix du levier,
  la lecture boucle sans fin (exigence WCAG 2.2.2 non satisfaite hors mouvement réduit, LEVERS.md).
- **La scène des leviers est une illustration**, pas une donnée : liaisons dessinées,
  aucun service existant, aucun opérateur, aucun chiffre (LEVERS.md). Le choix de la
  région et des liaisons est éditorial, à valider.
- **Les impulsions animées** (carte à plat et carte de la tuile des réseaux) utilisent `offset-path` en CSS :
  vérifié sous Chromium seulement, pas sous Safari ni Firefox.
- Pas de lecteur d'écran réel (NVDA, VoiceOver) : l'accessibilité est contrôlée par
  axe-core, au clavier et par l'arbre d'accessibilité, pas à l'oreille.
- Pas de test sur appareils physiques ni sur Safari/Firefox : Chromium uniquement.
- L'envoi du formulaire de contact n'a été testé qu'avec un faux Resend (tests) et,
  en recette, dans son état « non raccordé » (503).
- Les quotas du formulaire de contact sont en mémoire d'instance ; le stockage
  partagé facultatif n'a été testé qu'avec un faux serveur.

## 1. Tests automatisés (`npm test`)

262 tests dans 19 fichiers, tous réussis. Ils couvrent : parité FR/EN des textes et absence de Cobuild4ward et
des chiffres de la v1 ; typographie française ; état et continuité du parcours
(jamais « confirmé » ni « contractualisé » dans un cas démonstrateur) ; contact
(validation, échappement, injection d'en-tête, champ piège, limite) ; blog ; métadonnées
de partage ; **vitrine** (format fermé : clé inconnue, coordonnées trop fines, texte
ressemblant à une adresse, un lien ou un numéro, site inutilisé, mode hors chapitre,
plafonds, nom d'opérateur interdit en « demo », date de publication ; publication :
colonne non prévue refusée, identifiants de base jamais repris, arrondi, sortie
déterministe, vitrine livrée = exemple publié) ; **animation** (arcs de grand cercle,
antiméridien, vol de caméra et recul, dérive, cadrage d'une emprise à toute taille de
scène) ; **scène des leviers** (placement des noms de lieux sans chevauchement, minutages,
emprises, et pour chacun des six leviers sa structure : shortsea (deux flux par la route, plus
de trente ports, deux services de port à port sans escale — Le Havre → Civitavecchia, Oslo →
Kiel — dont **les tracés restent dans l'eau**, vérifié contre le jeu de polygones « terre » du
fond de carte) ; boucles (plus de trente-cinq flux de fond, trois triangles dont chaque côté
dépasse 500 km, dont Barcelone → Anvers, leurs jambes chargées étant déjà des flux du fond,
aucun nom de ville) ; cross-dock (au moins six flux entrants, un seul flux sortant bien plus
épais) ; électrification (plus de soixante bornes, une boucle fermée dont les bornes choisies
appartiennent au réseau) ; mutualisation (quatre entreprises, une couleur chacune, un train
Dourges – Poznań) ; messages réduits au nom de chaque levier, aucun bouton dans les messages de la couverture) ; **planche des référentiels** (la couche des réseaux : tous les lieux existent, tout tient dans le cadre, minutages entre 0 et 1, assez de lignes et de voies navigables, voies navigables en pointillé plus épaisses que les lignes ; chiffres de la direction cohérents entre eux ; textes FR et EN : six tuiles dans l'ordre, sans nom d'opérateur ni de transporteur, sans nombre écrit dans un message, mise à jour « journalière » et jamais « temps réel », légende « noms masqués »).

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
 18 x /_next/* assets statuts 200
  1 x /images/terrain.svg statuts 200
  1 x /images/globe-poster.svg statuts 200
  1 x /fr statuts 200
  1 x /fr/approach statuts 200
  1 x /fr/solutions statuts 200
  1 x /fr/blog statuts 200
  1 x /fr/contact statuts 200
  1 x blob: (worker MapLibre) statuts 200
  1 x /geo/borders-110m.json statuts 200
  1 x /geo/land-110m.json statuts 200
  1 x /geo/land-50m-europe.json statuts 200
  1 x /geo/borders-50m-europe.json statuts 200

requêtes /api/* émises par la page Référentiels : aucune
requêtes vers un autre domaine : aucune
réponses JSON : uniquement le fond géographique public ? oui (/geo/borders-110m.json, /geo/land-110m.json, /geo/land-50m-europe.json, /geo/borders-50m-europe.json)
fond public (Natural Earth) : /geo/borders-110m.json 39 Ko, /geo/land-110m.json 75 Ko, /geo/land-50m-europe.json 115 Ko, /geo/borders-50m-europe.json 66 Ko
la vitrine n’est pas une URL publique : /data/showcase.json → 404 ; /content/showcase.json → 404 ; /src/content/showcase.json → 404 ; /showcase.json → 404
HTML /fr/datasets : 121048 octets ; 35/35 noms de sites présents (liste textuelle)
mots réservés (secret, token, URL de base…) dans le HTML : aucun
mention « Exemple illustratif » dans le HTML : cohérente avec le mode demo

scan de .next/static (bundles envoyés au navigateur) :
  noms de secrets / code de publication présents : aucun
  source maps : aucune
```

Poids transféré de la page Référentiels :

```
carte à plat (rendu par défaut ici)      total 348 Ko — document 17 · JS 143 · CSS 8 · polices 47 · images 41 · fond géographique 56
globe 3D (?renderer=globe)               total 681 Ko — document 17 · JS 415 · CSS 19 · polices 47 · images 41 · fond géographique 96
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
PASS couverture : l’animation seule, sans bouton ni lien d’appel à l’action
PASS la section du parcours est sur la page
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
PASS couverture : l’animation seule, sans bouton ni lien d’appel à l’action
PASS la section du parcours est sur la page
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

Parcours « du terrain aux engagements » (lecture automatique, pause, clavier,
mouvement réduit) :

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
PASS mouvement réduit : transitions du plateau coupées
PASS onglets : flèche droite → étape 2
PASS onglets : Fin → étape 3
PASS onglets : Début → étape 1
PASS scénarios : flèche bas change de scénario (boutons radio natifs)
PASS niveau de connaissance affiché (Détecté pour la boucle ouverte)
PASS créneau avancé → « étudiée »

12/12 comportements vérifiés
```

Couverture et planche des référentiels (FR et EN : titre inchangé, **la couverture est
l'animation seule** — aucun lien, bouton ni élément interactif, plus de pastilles, de carte de
texte, de filigrane ni de bandeau ; carte accessible annonçant le levier en cours ; mention
d'illustration pour les lecteurs d'écran ; lecture automatique d'un levier au suivant, sans geste ;
mouvement réduit : le premier levier reste affiché, sans impulsion ; téléphone : texte puis carte
sans recouvrement ni défilement horizontal ; globe 3D forcé. La planche des référentiels est contrôlée dans le paragraphe qui suit la liste ci-dessous). Le temps d'un levier suit l'horloge de l'écran : sur ce poste, sans GPU, il dure un
peu plus que ses 12 à 16 s, et les attentes du script en tiennent compte :

```
== FR · couverture, mouvement normal ==
PASS le titre de la couverture est inchangé — Concevoir le transport au plus près du réel.
PASS aucun lien, bouton ni élément interactif dans la couverture (l’animation seule) — 0 trouvés
PASS plus de pastilles, de carte de texte, de filigrane ni de bandeau du bas
PASS aucun texte posé sur l’image hors noms de lieux : pas de role=note visible, pas de bulle
PASS la carte porte une description accessible : l’Europe et le levier en cours — Carte animée de l’Europe. Levier en cours : Report modal rail/fluvial.
PASS la mention d’illustration reste pour les lecteurs d’écran
PASS rendu à plat sans WebGL ou en logiciel : aucun canvas
PASS noms de lieux sur la carte
PASS lecture automatique : le levier suivant s’affiche tout seul — Carte animée de l’Europe. Levier en cours : Shortsea côtier.
PASS … puis le suivant, sans geste — Carte animée de l’Europe. Levier en cours : Boucles.
PASS aucun bouton de pause, de lecture ni de choix du levier sur la carte
PASS aucune erreur JavaScript

== FR · couverture, mouvement réduit ==
PASS pas de lecture automatique : le premier levier reste affiché — Carte animée de l’Europe. Levier en cours : Report modal rail/fluvial.
PASS aucun lien ni bouton dans la couverture
PASS aucune impulsion ni onde animée — 0 animées

== FR · couverture, téléphone ==
PASS pas de défilement horizontal
PASS le texte puis la carte s’empilent sans se recouvrir, la carte fait au moins 380 px de haut — h1 bas=268 carte=577–977
PASS aucun lien ni bouton dans la couverture

== EN · couverture, mouvement normal ==
PASS le titre de la couverture est inchangé — Design transport as close to reality as possible.
PASS aucun lien, bouton ni élément interactif dans la couverture (l’animation seule) — 0 trouvés
PASS plus de pastilles, de carte de texte, de filigrane ni de bandeau du bas
PASS aucun texte posé sur l’image hors noms de lieux : pas de role=note visible, pas de bulle
PASS la carte porte une description accessible : l’Europe et le levier en cours — Animated map of Europe. Current lever: Modal shift rail/waterway.
PASS la mention d’illustration reste pour les lecteurs d’écran
PASS rendu à plat sans WebGL ou en logiciel : aucun canvas
PASS noms de lieux sur la carte
PASS lecture automatique : le levier suivant s’affiche tout seul — Animated map of Europe. Current lever: Coastal shortsea.
PASS … puis le suivant, sans geste — Animated map of Europe. Current lever: Loops.
PASS aucun bouton de pause, de lecture ni de choix du levier sur la carte
PASS aucune erreur JavaScript

== EN · couverture, mouvement réduit ==
PASS pas de lecture automatique : le premier levier reste affiché — Animated map of Europe. Current lever: Modal shift rail/waterway.
PASS aucun lien ni bouton dans la couverture
PASS aucune impulsion ni onde animée — 0 animées

== EN · couverture, téléphone ==
PASS pas de défilement horizontal
PASS le texte puis la carte s’empilent sans se recouvrir, la carte fait au moins 380 px de haut — h1 bas=268 carte=550–950
PASS aucun lien ni bouton dans la couverture

== globe 3D forcé ==
PASS le globe 3D se monte (canvas)
PASS le globe joue le premier levier (noms de lieux posés sur le globe)
PASS aucun lien ni bouton dans la couverture avec le globe
PASS aucune erreur JavaScript avec le globe

40/40 comportements vérifiés
```

Planche des référentiels, les tuiles (FR et EN) : six tuiles dans la grille, planche armée mais aucune
tuile jouée avant l'arrivée à l'écran ; un seul grand nombre dans le titre ; points de repère et
flèches cachés sur ordinateur ; les tuiles à l'écran se jouent en défilant, le nombre compte jusqu'à
2 500, « + 36 000 » et « + 80 000 » s'affichent, les cinq captures sont chargées et décrites, la
carte des réseaux joue sa couche, grille 7 + 5 puis 3 + 3 + 3 + 3 sans défilement horizontal ;
**téléphone** : la piste défile de côté avec accroche et se prend au clavier, seule la première
tuile est jouée, la deuxième dépasse sur le bord, les flèches, les points et le doigt déplacent la
tuile courante (centrée, jouée à son arrivée), « précédent » et « suivant » se désactivent aux
extrémités ; mouvement réduit (planche non armée, tout affiché, nombres à leur valeur) ; sans
JavaScript (six tuiles et chiffres dans le HTML, écrans visibles) :

```
OK 62
```

Accessibilité de la planche (axe-core, balises WCAG 2.0/2.1/2.2 A et AA et bonnes pratiques),
1440, 1024 et 390 px, FR et EN, avec et sans mouvement réduit :

```
1440 fr reduce: 0 violation
1440 fr no-preference: 0 violation
1440 en reduce: 0 violation
1440 en no-preference: 0 violation
1024 fr reduce: 0 violation
1024 fr no-preference: 0 violation
1024 en reduce: 0 violation
1024 en no-preference: 0 violation
390 fr reduce: 0 violation
390 fr no-preference: 0 violation
390 en reduce: 0 violation
390 en no-preference: 0 violation
total 0
```

Animation du monde (carte à plat, mouvement réduit, globe 3D) :

```
PASS carte à plat : rendu par défaut sans accélération 3D, avec explication
PASS lecture automatique démarrée à l’arrivée (bouton « Pause » proposé)
PASS lecture automatique : le chapitre suivant arrive tout seul — 01 → 02
PASS pause : plus aucun avancement — reste au chapitre 02
PASS pause : les impulsions sont arrêtées (animations SVG suspendues)
PASS reprise : l’avancement reprend — 02 → 03
PASS puce de chapitre : changement immédiat de la légende (moins de 2 s)
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
PASS globe : des étiquettes de sites sont posées sur la carte — 3 étiquettes
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

Contrôle visuel fait sur captures (accueil à 390, 768, 1024, 1366, 1440 et 1920 px,
chacun des six leviers en carte à plat, le globe en rendu logiciel, la planche des référentiels,
chaque page, FR et EN) : couverture, noms de lieux sans recouvrement du
texte, planche des référentiels, repli sans WebGL, mouvement réduit. Corrections issues de
ces contrôles : échelle des ondes de la carte à plat (trop grandes sur une vue large), bulles qui se relaient au lieu de cohabiter sur une petite carte, taille estimée des bulles de la carte à plat (leur sous-titre passe à
la ligne et cachait un nom de lieu), en-tête passé en menu jusqu'à 1280 px (le
bouton de contact se coupait en deux à 1024 px), contraste d'un badge du parcours et
d'une pastille, puis, pour la planche, passage du menu sombre aux tuiles claires avec les écrans du portail. Les captures sont un contrôle de la
personne qui développe : le jugement sur le style est celui de l'équipe.

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
approach desktop                         perf 100       a11y 100 bp 100 seo* 58 | LCP 0.4 s | CLS 0.000 | TBT 0 ms
approach mobile                          perf 100/100/100 a11y 100 bp 100 seo* 58 | LCP 1.8 s · 1.8 s · 1.8 s | CLS 0.000 | TBT 16 ms
contact desktop                          perf 100       a11y 100 bp 100 seo* 58 | LCP 0.5 s | CLS 0.000 | TBT 0 ms
contact mobile                           perf 100/100/100 a11y 100 bp 100 seo* 58 | LCP 1.8 s · 1.8 s · 1.8 s | CLS 0.000 | TBT 18 ms
datasets desktop                         perf 100       a11y 100 bp 100 seo* 58 | LCP 0.5 s | CLS 0.000 | TBT 0 ms
datasets mobile                          perf 99/99/99  a11y 100 bp 100 seo* 58 | LCP 2.0 s · 2.0 s · 2.2 s | CLS 0.000 | TBT 74 ms
home desktop                             perf 100       a11y 100 bp 100 seo* 61 | LCP 0.6 s | CLS 0.000 | TBT 0 ms
home mobile                              perf 98/98/97  a11y 100 bp 100 seo* 61 | LCP 2.3 s · 2.3 s · 2.6 s | CLS 0.000 | TBT 34 ms
solutions-transport-engineering desktop  perf 100       a11y 100 bp 100 seo* 58 | LCP 0.5 s | CLS 0.000 | TBT 0 ms
solutions-transport-engineering mobile   perf 99/99/98  a11y 100 bp 100 seo* 58 | LCP 2.0 s · 2.0 s · 2.4 s | CLS 0.000 | TBT 62 ms
```

Seuils « bons » (CWV) : LCP ≤ 2,5 s, CLS ≤ 0,1, INP ≤ 200 ms (TBT sert de proxy de
laboratoire ; l'INP ne se mesure qu'avec de vraies interactions).

**La page Référentiels est mesurée en carte à plat** : Lighthouse tourne sans GPU,
donc sans WebGL, et l'animation prend son repli SVG (≈ 180 Ko de fond géographique
Europe, aucun script de carte). Le globe 3D, lui, charge MapLibre (voir le poids en
section 2) ; son coût sur un appareil réel n'est pas mesuré ici.

Ce qui a été fait pour tenir ces seuils : Inter variable sous-ensemblée (48 Ko), `font-display: optional` (pas de bascule en
cours de lecture), messages passés aux composants client page par page, pages rendues
statiquement par langue, MapLibre **chargé à la demande seulement** (après l'événement `load`, sur un
appareil capable de la 3D), fond géographique fin réduit à
l'Europe (183 Ko au lieu de 1,15 Mo pour le monde), vitrine intégrée au HTML (7 Ko,
aucune requête de données).

**Le seuil de LCP ≤ 2,5 s n'est pas démontré tenu sur toutes les pages en mobile.** Plages mesurées (trois exécutions chacune, simulation Lighthouse) :

- approach : 1,8 s · 1,8 s · 1,8 s
- contact : 1,8 s · 1,8 s · 1,8 s
- datasets : 2,0 s · 2,0 s · 2,2 s
- home : 2,4 s · 2,5 s · 3,0 s
- solutions-transport-engineering : 2,0 s · 2,0 s · 2,4 s

Seule la page d'accueil a été remesurée pour ce commit (deux séries de trois exécutions sur le même build : 2,5 · 2,7 · 2,9 s puis 2,4 · 2,5 · 3,0 s ; la ligne ci-dessus est la seconde) ; les autres lignes datent de la série précédente, ces pages n'ayant pas changé. L'élément LCP de l'accueil est le paragraphe d'introduction de la couverture (inchangé), dont le rendu attend ≈ 2 s : la dispersion d'une exécution à l'autre (≈ 0,5 s) est de l'ordre de l'écart avec la série précédente (2,3 · 2,3 · 2,6 s), donc **je ne peux pas dire si la planche en tuiles a coûté quelque chose ou non**.

Pages dont au moins une exécution dépasse 2,5 s : home. Pages qui restent sous le seuil sur les trois exécutions : approach, contact, datasets, solutions-transport-engineering. L'accueil est le plus loin du seuil (2,4 s · 2,5 s · 3,0 s). Éléments d'explication : depuis que la couverture est réduite à l'animation, l'élément LCP de l'accueil est **l'image d'attente de la carte** (`levers-poster.svg`) et non plus le paragraphe d'accroche ; avec une image de 53 Ko, l'accueil mobile mesurait 2,7–3,0 s (note 84–96) ; après allègement de l'image (23 Ko : tracés et terres simplifiés, plus de flou gaussien, réseau dessiné une seule fois, liaisons maritimes hors du réseau de fond), il mesure 2,4 s · 2,5 s · 3,0 s. C'est le modèle de simulation (processeur ralenti ×4, 4G lente) qui porte l'estimation à ces valeurs : sans bridage, FCP et LCP sont à une fraction de seconde. La carte de la couverture ne charge rien d'autre avant l'événement `load` (carte à plat : deux fonds géographiques, 57 Ko ; globe : MapLibre, voir section 2) ; la planche des référentiels ne charge rien avant d'approcher de l'écran. Pistes non engagées : réduire encore l'image d'attente ou la différer, réduire le JavaScript de l'accueil (≈ 142 Ko), différer les courbes de niveau du parcours (22 Ko). La valeur de terrain (CrUX / RUM) tranchera après la mise en ligne ; d'ici là, ne pas annoncer « Core Web Vitals bons ».

## 8. Prévisualisation hébergée (Netlify)

**Section non rejouée pour la planche en tuiles** : les mesures ci-dessous datent d'un commit antérieur
(`1401956`, avant la refonte de la planche des référentiels). Elles restent valables pour les pages
qui n'ont pas changé ; elles ne disent rien de la planche actuelle. À refaire sur le déploiement de ce commit.

Vérifié sur le déploiement de la pull request n° 23 :
`https://deploy-preview-23--p4wname.netlify.app` (le second site Netlify,
`https://deploy-preview-23--pool4wardv2.netlify.app`, est servi par le même commit),
au commit `1401956`. Les essais partent de ce conteneur, par le proxy de l'environnement
(la vérification TLS reste active).

- **Contrôles Netlify de la pull request** (« Deploy Preview ») : réussis sur les deux sites
  pour le commit `1401956`. Le job GitHub Actions `build` est le gabarit du dépôt (il
  n'exécute que des `echo`) : il ne démontre rien sur le site.
- **Redirections** (même script qu'en local) : 27/27 sur l'hébergeur.
- **Surface de routes** : 14/14 — aucune route de données, la source de la vitrine n'est
  pas servie, `/api/contact` répond 503 « non raccordé ».
- **Parcours complet FR et EN** : 42 vérifications réussies, formulaire compris (503
  attendu, message honnête).
- **Comportements de l'animation du monde** : 21/21 (carte à plat, mouvement réduit, globe
  3D forcé en rendu logiciel).
- **Couverture et planche des référentiels** : 74/74, sur l'hébergeur, FR et EN, téléphone,
  globe 3D forcé compris (couverture sans lien ni bouton, lecture automatique, huit tuiles de
  référentiels qui jouent, se figent hors écran et se rejouent).
- **Inspection réseau** : aucune requête `/api/*`, un seul cookie (`NEXT_LOCALE`), rien dans
  le stockage du navigateur.

**En-têtes constatés sur l'hébergeur** : les pages portent `X-Content-Type-Options`,
`X-Frame-Options`, `Referrer-Policy` et HSTS ; une prévisualisation émet `X-Robots-Tag: noindex`.
Les fichiers statiques (fond géographique, images dont `levers-poster.svg`, polices) sont
servis avec `Cache-Control: public, max-age=604800` (fond) ou `86400` (images), avec
`stale-while-revalidate`, et `X-Content-Type-Options: nosniff`.

**Netlify injecte ses propres scripts dans les prévisualisations.** Le navigateur contacte
`app.netlify.com`, `cdn.segment.com` et `sessions.bugsnag.com` via `/.netlify/scripts/cdp`
(outil de commentaires des prévisualisations) : ce n'est pas le code du site, qui n'émet
aucune requête tierce (vérifié en local). Conséquence : le poids mesuré sur la
prévisualisation (≈ 2 Mo) est gonflé par Netlify et n'est pas repris ici ; les poids de la
section 2 sont ceux du build local. À reverifier en production.

**Non mesuré sur l'hébergeur** : Lighthouse (les scripts de Netlify faussent la mesure), les
quotas du formulaire de contact (compteurs en mémoire d'instance), la performance derrière
le CDN d'un visiteur réel, et le déploiement **de production** de la branche : il exige
`NEXT_PUBLIC_SITE_ENV=preview` tant que la vitrine est un exemple (DEPLOY.md), sans quoi le
garde-fou `prebuild` refuse le build.
