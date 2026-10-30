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
- **La fluidité du globe 3D sur un GPU réel** (animation du monde et scène des
  leviers de la couverture) : joués en rendu logiciel (SwiftShader), où ils
  fonctionnent mais saccadent ; les images par seconde ne sont pas mesurées. Le poids
  téléchargé l'est (section 2).
- **Les chiffres « 3 500 services rail et fluviaux » et « 1 500 services shortsea »** (cartes
  de la couverture) viennent de la direction ; ils ne sont recoupés avec aucune donnée vérifiée
  ici (le référentiel Appel d'Air 2026 du portail compte 2 906 services ferroviaires
  intermodaux, sans le fluvial ni le shortsea). À valider avant toute mise en ligne publique
  (DATA.md).
- **La scène des leviers est une illustration**, pas une donnée : liaisons dessinées,
  aucun service existant, aucun opérateur, aucun chiffre (LEVERS.md). Le choix de la
  région et des liaisons est éditorial, à valider.
- **Les impulsions animées** (carte à plat et schémas) utilisent `offset-path` en CSS :
  vérifié sous Chromium seulement, pas sous Safari ni Firefox.
- Pas de lecteur d'écran réel (NVDA, VoiceOver) : l'accessibilité est contrôlée par
  axe-core, au clavier et par l'arbre d'accessibilité, pas à l'oreille.
- Pas de test sur appareils physiques ni sur Safari/Firefox : Chromium uniquement.
- L'envoi du formulaire de contact n'a été testé qu'avec un faux Resend (tests) et,
  en recette, dans son état « non raccordé » (503).
- Les quotas du formulaire de contact sont en mémoire d'instance ; le stockage
  partagé facultatif n'a été testé qu'avec un faux serveur.

## 1. Tests automatisés (`npm test`)

258 tests dans 19 fichiers, tous réussis. Ils couvrent : parité FR/EN des textes et absence de Cobuild4ward et
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
Dourges – Poznań) ; présence des textes FR et EN et des cartes, sans chiffre écrit en dur).

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
  1 x /geo/borders-50m-europe.json statuts 200
  1 x /geo/land-50m-europe.json statuts 200

requêtes /api/* émises par la page Référentiels : aucune
requêtes vers un autre domaine : aucune
réponses JSON : uniquement le fond géographique public ? oui (/geo/borders-110m.json, /geo/land-110m.json, /geo/borders-50m-europe.json, /geo/land-50m-europe.json)
fond public (Natural Earth) : /geo/borders-110m.json 39 Ko, /geo/land-110m.json 75 Ko, /geo/borders-50m-europe.json 66 Ko, /geo/land-50m-europe.json 115 Ko
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
carte à plat (rendu par défaut ici)      total 350 Ko — document 17 · JS 140 · CSS 9 · polices 47 · images 41 · fond géographique 56
globe 3D (?renderer=globe)               total 683 Ko — document 17 · JS 412 · CSS 19 · polices 47 · images 41 · fond géographique 96
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

Scène des leviers de la couverture et schémas (FR et EN : six leviers listés,
titre inchangé, **la carte du levier actif en bas à droite** (un chiffre ou une phrase courte, propre à chaque levier ; contrôlée pour les six leviers, en FR et en EN : dans l'écran, sans toucher les pastilles, sans animation en mouvement réduit ; pleine largeur au-dessus des pastilles sur téléphone), les six pastilles sur toute la largeur du bas, aucun encart, sigle ni texte fixe sur l'image, lecture automatique, **aucun bouton pause**, choix d'un levier (il se joue puis reste
affiché), reprise de la lecture après vingt secondes sans geste, clavier, mouvement
réduit, téléphone sans recouvrement ni défilement horizontal, globe 3D forcé, schémas
décrits et animés à l'entrée dans l'écran, immobiles en mouvement réduit). Le temps d'un
levier suit l'horloge de l'écran : sur ce poste, sans GPU, il dure un peu plus que ses
9 s (15 s pour le report modal), et les attentes du script en tiennent compte :

```
== FR · mouvement normal ==
PASS six leviers listés, dans l’ordre — Report modal rail/fluvial | Shortsea côtier | Boucles | Cross-dock | Électrification | Mutualisation
PASS le premier levier est le report modal rail/fluvial
PASS le titre de la couverture est inchangé — Concevoir le transport au plus près du réel.
PASS la carte du levier est là d’emblée : une seule, celle du report modal
PASS carte du report modal : le chiffre et la précision, sans sigle ni filigrane — 3 500 |  | services ferroviaires et fluviaux · Europe |  | Illustration : liaisons dessinées pour expliquer, pas des services existants.
PASS carte : la mention d’illustration reste pour les lecteurs d’écran
PASS une seule note sur la couverture, aucune légende fixe sous l’image
PASS la carte porte une description accessible — Carte animée de l’Europe. Levier en cours : Report modal rail/fluvial.
PASS rendu à plat sans WebGL ou en logiciel : aucun canvas
PASS noms de lieux sur la carte, aucun encart qui empiète sur l’image
PASS lecture automatique : le levier suivant s’affiche — Shortsea côtier
PASS la barre de progression du levier en cours avance
PASS aucun bouton de pause ni de lecture
PASS un levier choisi s’affiche (électrification)
PASS la carte change avec le levier choisi
PASS le levier choisi se joue jusqu’au bout puis reste affiché (pas d’enchaînement immédiat) — progression=1.00
PASS sans geste, la lecture reprend d’elle-même (levier suivant) — Mutualisation
PASS clavier : Entrée sur un levier le choisit
PASS clavier : Espace sur le levier suivant le choisit
PASS aucune erreur JavaScript

== FR · un filigrane par levier ==
PASS Report modal rail/fluvial : carte propre au levier — 3 500 |  | services ferroviaires et fluviaux · Europe |  | Illustration : liaisons dessinées pour expliquer, pas des services existants.
PASS Report modal rail/fluvial : la carte est en bas à droite, dans l’écran et sans toucher les pastilles — carte=1048,737 304×135 pastilles touchées=0
PASS Shortsea côtier : carte propre au levier — 1 500 |  | services shortsea · Europe |  | Illustration : liaisons dessinées pour expliquer, pas des services existants.
PASS Shortsea côtier : la carte est en bas à droite, dans l’écran et sans toucher les pastilles — carte=1048,752 304×120 pastilles touchées=0
PASS Boucles : carte propre au levier — Des boucles se cachent |  | dans vos flux paneuropéens |  | Illustration : liaisons dessinées pour expliquer, pas des services existants.
PASS Boucles : la carte est en bas à droite, dans l’écran et sans toucher les pastilles — carte=1048,752 304×120 pastilles touchées=0
PASS Cross-dock : carte propre au levier — Consolider |  | de petits flux, un gros flux vers l’usine |  | Illustration : liaisons dessinées pour expliquer, pas des services existants.
PASS Cross-dock : la carte est en bas à droite, dans l’écran et sans toucher les pastilles — carte=1048,753 304×120 pastilles touchées=0
PASS Électrification : carte propre au levier — Des bornes partout en Europe |  | un flux bouclé et électrifié |  | Illustration : liaisons dessinées pour expliquer, pas des services existants.
PASS Électrification : la carte est en bas à droite, dans l’écran et sans toucher les pastilles — carte=1048,757 304×120 pastilles touchées=0
PASS Mutualisation : carte propre au levier — Des entreprises différentes |  | un même train : Dourges – Poznań |  | Illustration : liaisons dessinées pour expliquer, pas des services existants.
PASS Mutualisation : la carte est en bas à droite, dans l’écran et sans toucher les pastilles — carte=1048,758 304×120 pastilles touchées=0
PASS aucun encart de texte sur l’image, pour aucun levier

== FR · mouvement réduit ==
PASS pas de lecture automatique
PASS aucun bouton de lecture
PASS le levier s’affiche terminé (progression pleine)
PASS mouvement réduit : la carte est là d’emblée, sans animation
PASS mouvement réduit : chaque levier affiche sa carte d’emblée
PASS aucune impulsion ni onde animée — 0 animées

== FR · téléphone ==
PASS pas de défilement horizontal
PASS texte, carte et pastilles s’empilent sans se recouvrir — h1 bas=268 carte=707–1107 bandeau=1259
PASS la carte du levier s’affiche pleine largeur, au-dessus des pastilles, sans déborder — carte=1123–1243 carte(map)=707–1107 pastilles=1259
PASS cibles tactiles d’au moins 44 px — 0 trop petites

== EN · mouvement normal ==
PASS six leviers listés, dans l’ordre — Modal shift rail/waterway | Coastal shortsea | Loops | Cross-dock | Electrification | Pooling
PASS le premier levier est le report modal rail/fluvial
PASS le titre de la couverture est inchangé — Design transport as close to reality as possible.
PASS la carte du levier est là d’emblée : une seule, celle du report modal
PASS carte du report modal : le chiffre et la précision, sans sigle ni filigrane — 3,500 |  | rail and waterway services · Europe |  | Illustration: links drawn to explain, not existing services.
PASS carte : la mention d’illustration reste pour les lecteurs d’écran
PASS une seule note sur la couverture, aucune légende fixe sous l’image
PASS la carte porte une description accessible — Animated map of Europe. Current lever: Modal shift rail/waterway.
PASS rendu à plat sans WebGL ou en logiciel : aucun canvas
PASS noms de lieux sur la carte, aucun encart qui empiète sur l’image
PASS lecture automatique : le levier suivant s’affiche — Coastal shortsea
PASS la barre de progression du levier en cours avance
PASS aucun bouton de pause ni de lecture
PASS un levier choisi s’affiche (électrification)
PASS la carte change avec le levier choisi
PASS le levier choisi se joue jusqu’au bout puis reste affiché (pas d’enchaînement immédiat) — progression=1.00
PASS sans geste, la lecture reprend d’elle-même (levier suivant) — Pooling
PASS clavier : Entrée sur un levier le choisit
PASS clavier : Espace sur le levier suivant le choisit
PASS aucune erreur JavaScript

== EN · un filigrane par levier ==
PASS Modal shift rail/waterway : carte propre au levier — 3,500 |  | rail and waterway services · Europe |  | Illustration: links drawn to explain, not existing services.
PASS Modal shift rail/waterway : la carte est en bas à droite, dans l’écran et sans toucher les pastilles — carte=1048,752 304×120 pastilles touchées=0
PASS Coastal shortsea : carte propre au levier — 1,500 |  | shortsea services · Europe |  | Illustration: links drawn to explain, not existing services.
PASS Coastal shortsea : la carte est en bas à droite, dans l’écran et sans toucher les pastilles — carte=1048,752 304×120 pastilles touchées=0
PASS Loops : carte propre au levier — Loops are hiding |  | in your pan-European flows |  | Illustration: links drawn to explain, not existing services.
PASS Loops : la carte est en bas à droite, dans l’écran et sans toucher les pastilles — carte=1048,752 304×120 pastilles touchées=0
PASS Cross-dock : carte propre au levier — Consolidate |  | many small flows, one large flow to the plant |  | Illustration: links drawn to explain, not existing services.
PASS Cross-dock : la carte est en bas à droite, dans l’écran et sans toucher les pastilles — carte=1048,752 304×120 pastilles touchées=0
PASS Electrification : carte propre au levier — Chargers across Europe |  | one looped, electrified flow |  | Illustration: links drawn to explain, not existing services.
PASS Electrification : la carte est en bas à droite, dans l’écran et sans toucher les pastilles — carte=1048,758 304×120 pastilles touchées=0
PASS Pooling : carte propre au levier — Different companies |  | one shared train: Dourges–Poznań |  | Illustration: links drawn to explain, not existing services.
PASS Pooling : la carte est en bas à droite, dans l’écran et sans toucher les pastilles — carte=1048,758 304×120 pastilles touchées=0
PASS aucun encart de texte sur l’image, pour aucun levier

== EN · mouvement réduit ==
PASS pas de lecture automatique
PASS aucun bouton de lecture
PASS le levier s’affiche terminé (progression pleine)
PASS mouvement réduit : la carte est là d’emblée, sans animation
PASS mouvement réduit : chaque levier affiche sa carte d’emblée
PASS aucune impulsion ni onde animée — 0 animées

== EN · téléphone ==
PASS pas de défilement horizontal
PASS texte, carte et pastilles s’empilent sans se recouvrir — h1 bas=268 carte=680–1080 bandeau=1232
PASS la carte du levier s’affiche pleine largeur, au-dessus des pastilles, sans déborder — carte=1096–1216 carte(map)=680–1080 pastilles=1232
PASS cibles tactiles d’au moins 44 px — 0 trop petites

== globe 3D forcé ==
PASS le globe 3D se monte (canvas)
PASS un levier choisi sur le globe
PASS un levier choisi pendant le chargement se joue (noms de lieux posés sur le globe)
PASS aucune erreur JavaScript avec le globe

== schémas · mouvement normal ==
PASS six schémas, chacun avec une description
PASS sous la ligne de flottaison : cartes masquées avant d’entrer à l’écran — 6 masquées
PASS elles apparaissent en entrant à l’écran — 6 affichées
PASS les tracés se dessinent (animation CSS) — sch-draw

== schémas · mouvement réduit ==
PASS six schémas, chacun avec une description
PASS aucune carte masquée
PASS aucune impulsion animée — display=none

97/97 comportements vérifiés
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
PASS globe : des étiquettes de sites sont posées sur la carte — 10 étiquettes
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
chacun des six leviers en carte à plat, le globe en rendu logiciel, les schémas,
chaque page, FR et EN) : couverture, carte du levier et noms de lieux sans recouvrement du
texte, bandeau des leviers, repli sans WebGL, mouvement réduit. Corrections issues de
ces contrôles : échelle des ondes de la carte à plat (trop grandes sur une vue large), bulles qui se relaient au lieu de cohabiter sur une petite carte, taille estimée des bulles de la carte à plat (leur sous-titre passe à
la ligne et cachait un nom de lieu), en-tête passé en menu jusqu'à 1280 px (le
bouton de contact se coupait en deux à 1024 px), contraste d'un badge du parcours et
d'une pastille, titre de la couverture réduit pour que le bandeau des leviers tienne
dans le premier écran à 900 px de haut. Les captures sont un contrôle de la
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
approach mobile                          perf 100/99/100 a11y 100 bp 100 seo* 58 | LCP 1.8 s · 1.8 s · 2.0 s | CLS 0.000 | TBT 23 ms
contact desktop                          perf 100       a11y 100 bp 100 seo* 58 | LCP 0.5 s | CLS 0.000 | TBT 0 ms
contact mobile                           perf 99/99/100 a11y 100 bp 100 seo* 58 | LCP 1.8 s · 2.0 s · 2.3 s | CLS 0.000 | TBT 53 ms
datasets desktop                         perf 100       a11y 100 bp 100 seo* 58 | LCP 0.5 s | CLS 0.000 | TBT 0 ms
datasets mobile                          perf 98/99/99  a11y 100 bp 100 seo* 58 | LCP 2.0 s · 2.0 s · 2.5 s | CLS 0.000 | TBT 27 ms
home desktop                             perf 100       a11y 100 bp 100 seo* 61 | LCP 0.6 s | CLS 0.000 | TBT 0 ms
home mobile                              perf 87/98/98  a11y 100 bp 100 seo* 61 | LCP 2.3 s · 2.3 s · 3.0 s | CLS 0.000 | TBT 335 ms
solutions-transport-engineering desktop  perf 100       a11y 100 bp 100 seo* 58 | LCP 0.5 s | CLS 0.000 | TBT 0 ms
solutions-transport-engineering mobile   perf 99/99/99  a11y 100 bp 100 seo* 58 | LCP 2.0 s · 2.1 s · 2.2 s | CLS 0.000 | TBT 55 ms
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

- approach : 1,8 s · 1,8 s · 2,0 s
- contact : 1,8 s · 2,0 s · 2,3 s
- datasets : 2,0 s · 2,0 s · 2,5 s
- home : 2,3 s · 2,3 s · 3,0 s
- solutions-transport-engineering : 2,0 s · 2,1 s · 2,2 s

Pages dont au moins une exécution dépasse 2,5 s : home. Pages qui restent sous le seuil sur les trois exécutions : approach, contact, datasets, solutions-transport-engineering. L'accueil est le plus loin du seuil (2,3 s · 2,3 s · 3,0 s) ; la plus lente de ces trois exécutions est la première de la série, lancée juste après le démarrage du serveur (note de performance 87, TBT 335 ms) : trois exécutions de contrôle ensuite, dans les mêmes conditions, donnent 2,3 s · 2,3 s · 2,3 s. Éléments d'explication : l'élément LCP de l'accueil est le paragraphe d'accroche (du texte, pas une image) ; sans bridage ni latence réseau (poste local, cinq chargements), FCP et LCP de l'accueil sont à 104–124 ms ; c'est le modèle de simulation (environ 300 Ko chargés avant le LCP, sur une 4G lente, processeur ralenti ×4) qui porte l'estimation à 2,3–3,0 s. La carte de la couverture ne charge rien avant l'événement `load` (carte à plat : deux fonds géographiques, 57 Ko ; globe : MapLibre, voir section 2). Pistes non engagées : réduire le JavaScript de l'accueil (≈ 138 Ko), différer les courbes de niveau du parcours (22 Ko). La valeur de terrain (CrUX / RUM) tranchera après la mise en ligne ; d'ici là, ne pas annoncer « Core Web Vitals bons ».

## 8. Prévisualisation hébergée (Netlify)

Vérifié sur le déploiement de la pull request n° 23 :
`https://deploy-preview-23--p4wname.netlify.app` (le second site Netlify,
`https://deploy-preview-23--pool4wardv2.netlify.app`, est servi par le même commit),
au commit `ff99862`. Les essais partent de ce conteneur, par le proxy de l'environnement
(la vérification TLS reste active).

- **Contrôles Netlify de la pull request** (« Deploy Preview ») : réussis sur les deux sites
  pour le commit `ff99862`. Le job GitHub Actions `build` est le gabarit du dépôt (il
  n'exécute que des `echo`) : il ne démontre rien sur le site.
- **Redirections** (même script qu'en local) : 27/27 sur l'hébergeur.
- **Surface de routes** : 14/14 — aucune route de données, la source de la vitrine n'est
  pas servie, `/api/contact` répond 503 « non raccordé ».
- **Parcours complet FR et EN** : 40 vérifications réussies, formulaire compris (503
  attendu, message honnête).
- **Comportements de l'animation du monde** : 21/21 (carte à plat, mouvement réduit, globe
  3D forcé en rendu logiciel).
- **Scène des leviers et schémas** : 97/97, sur l'hébergeur, FR et EN, téléphone, globe 3D
  forcé compris.
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
