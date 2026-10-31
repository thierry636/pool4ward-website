# La scène des leviers (couverture) et la planche des référentiels

**Ce que c'est.** La couverture montre une carte (un globe, ou la carte à plat) sur laquelle six
leviers sont joués, l'un après l'autre, sur toute l'Europe. Chaque levier suit la même
dramaturgie : **on voit d'abord les flux (ou les ports), puis on identifie ce qui peut changer,
puis les flux se transforment**.

1. **Report modal rail/fluvial** — trois flux partent du sud de l'Espagne vers la Pologne,
   chacun en direct par la route. Les réseaux ferré et fluvial se branchent en filigrane, un
   service ferroviaire est identifié (Saragosse → Poznań) et les flux se transforment en
   pré-acheminement routier vers Saragosse, traction ferroviaire jusqu'à Poznań, puis
   post-acheminement routier (15 s) ;
2. **Shortsea côtier** — deux flux par la route, **Paris → Rome** et **Oslo → Cologne** (de la
   Norvège vers l'Allemagne). On branche en filigrane les ports côtiers d'Europe (une quarantaine
   de points), puis on identifie deux services **de port à port**, sans escale : Le Havre →
   Civitavecchia (Manche, golfe de Gascogne, côte portugaise, détroit de Gibraltar, Méditerranée,
   mer Tyrrhénienne) et Oslo → Kiel (fjord d'Oslo, Skagerrak, Kattegat, Grand Belt). Les flux se
   transforment : pré-acheminement routier Paris → Le Havre, mer, post-acheminement routier
   Civitavecchia → Rome ; Kiel → Cologne par la route pour la Norvège (15 s). **Les tracés en mer
   restent dans l'eau** : leurs points de passage sont vérifiés par un test contre le jeu de
   polygones « terre » du fond de carte (`levers.test.ts`) ;
3. **Boucles** — une quarantaine de flux paneuropéens à sens unique, d'abord. **Dedans**, on repère
   quelques longues boucles triangulaires (Barcelone → Anvers → Milan, Varsovie → Hambourg →
   Vienne, Rome → Budapest → Munich) : leurs jambes chargées sont déjà des flux du fond, et une
   jambe à vide en pointillé referme deux d'entre elles. **Aucun nom de ville** sur cette scène
   (15 s) ;
4. **Cross-dock** — neuf petits flux d'origines variées convergent vers une plateforme (Lyon),
   se consolident, et repartent en **un seul gros flux**, bien plus épais, vers l'usine (12 s) ;
5. **Électrification** — comme le rail et le shortsea : les flux, puis **le réseau de bornes**
   en dessous (une centaine de bornes réparties sur l'Europe), puis un flux bouclé et
   électrifié (Lyon – Strasbourg – Francfort – Paris) qui se recharge sur quelques bornes bien
   placées du réseau (16 s) ;
6. **Mutualisation** — des flux d'entreprises différentes (une couleur par chargeur) sont
   regroupés sur un même train **Dourges → Poznań**, avec leur pré- et post-acheminement (15 s).

Sous la couverture, une planche présente autre chose : les **référentiels qui cartographient le
physique du transport** (voir plus bas, « La planche des référentiels »).

## La couverture : l'animation seule

Le titre de la couverture ne change pas (« Concevoir le transport au plus près du réel. »), avec
son paragraphe et ses trois pastilles de bénéfices. **Rien d'autre que l'animation** : plus de
bulle, de sigle, de filigrane, de carte de texte, de menu des leviers ni de boutons d'appel à
l'action sous le texte (l'accès au contact reste dans l'en-tête ; la section du parcours reste
plus bas sur la page). Les six leviers se jouent l'un après l'autre, en boucle, sans que
personne n'ait rien à choisir. Les noms de lieux restent sur la carte, mais pas tous (un seul
port nommé pour le shortsea, aucun pour les boucles).

Les chiffres « 3 500 services rail et fluviaux » et « 1 500 services shortsea » donnés par la
direction ne figurent donc plus nulle part sur le site : `src/content/figures.ts` a été supprimé
(l'historique git le garde). Ils n'avaient pas été recoupés (le référentiel Appel d'Air 2026 du
portail compte 2 906 services ferroviaires intermodaux, sans le fluvial ni le shortsea) : à
valider avant de les remettre.

La mention « Illustration : liaisons dessinées pour expliquer, pas des services existants »
n'est pas affichée ; elle reste dans la page, lisible par les lecteurs d'écran, et le libellé
accessible de la carte annonce le levier en cours.

## La planche des référentiels

La section qui suit la couverture (`Referentials`, id `referentiels`) met en avant la capacité de
Pool4ward à tenir des **référentiels qui décrivent le physique du transport**. C'est un **menu à
gauche et une fiche à droite** (sur mobile : des pastilles au-dessus de la fiche). Six référentiels,
regroupés en trois séries :

| Série | Référentiel | Ce que montre la fiche |
|---|---|---|
| Services | Services ferroviaires et fluviaux | 4 chiffres (services, liaisons, pays, opérateurs), la carte animée, les formes de services (sens unique, aller-retour, boucle, métro, métro bouclé, non organisé), une fiche de service (Poti → Batumi → Istanbul → Tekirdag) et ce qu'une fiche contient (horaires, fréquences, opérateur, contacts, terminaux) |
| Services | Services shortsea | services, continents, services en rotation, types de services (conteneurs, RoRo), la carte (ports, deux services de port à port, des rotations), les formes de services, une rotation dessinée en exemple |
| Réseaux | Réseaux ferroviaire et fluvial | la carte en pleine largeur (lignes, voies navigables en pointillé, nœuds et ports intérieurs) et ce que décrit le référentiel |
| Sites et acteurs | Bornes électriques privées | sites, bornes, pays, réseaux ; la carte des corridors et des hubs ; l'état des sites (anneau : en service, en construction, prévu) ; la fiche d'un site (Venlo) |
| Sites et acteurs | Parkings | la carte en pleine largeur (aires le long des grands axes) et ce que décrit le référentiel |
| Sites et acteurs | Transporteurs | transporteurs, sites ; la carte ; ce que décrit le référentiel ; la fiche d'un transporteur (note, capacités, contacts) |

**Les chiffres.** Ils vivent dans `src/content/referentials.ts` (jamais dans un message), avec leur
provenance en tête de fichier : services (2 500 = 1 978 rail + 522 fluvial, 2 360 liaisons, 36 pays,
formes de services) et shortsea (1 690, formes de services) lus sur les écrans du portail le
2026-10-31 — leurs totaux se recoupent (les formes somment au total, testé) ; bornes (111 sites, 337
bornes, 11 pays, 2 réseaux, 57 / 11 / 43 sites par état) recomptées dans les données du portail ;
**61 opérateurs, 3 continents, 15 000 sites et 80 000 transporteurs sont donnés par la direction et
non recoupés** (source et date à fournir avant toute mise en ligne publique). Les services ne sont
pas décrits « en temps réel » : la pastille dit **« Mise à jour journalière »** (services et
shortsea seulement).

**Les fiches d'exemple** sont des enregistrements réels dont le **nom d'opérateur ou de
transporteur est masqué** (« nom masqué ») ; celle du shortsea est une rotation **dessinée pour
l'exemple** (étiquetée « exemple illustratif »). Les cartes, elles, restent des animations : lieux
réels, tracés et positions indicatifs, et la note sous la planche le dit. **Aucune capture d'écran
n'est collée** : tout est composé (cartes SVG animées, anneau, barres, frise des arrêts).

**Comportement.** La planche attend d'entrer à l'écran pour jouer (les chiffres comptent, les
barres et l'anneau se tracent, les arrêts s'allument). Le défilement est automatique (une barre
de progression sous le référentiel affiché, 9 s) tant que la planche est à l'écran ; il s'arrête au
survol, quand le focus **clavier** s'y trouve, hors écran, et **définitivement dès qu'on choisit
soi-même un référentiel** (le bouton lecture/pause, toujours visible, le relance : WCAG 2.2.2).
Menu au clavier : flèches, Début, Fin (onglets, un seul tabulable). Sous « mouvement réduit » : pas
de défilement automatique (bouton désactivé), tout s'affiche terminé. Sans JavaScript : le premier
référentiel est dans le HTML, visible, avec ses chiffres finaux. Les mises en page à deux colonnes
se décident sur la largeur du panneau (requêtes de conteneur), pas sur celle de l'écran. Chaque
carte ne charge rien tant que la planche n'approche pas de l'écran (le fond est chargé une fois pour
toute la page, `lib/levers/geo.ts`), rejoue sa couche toutes les douze à treize secondes tant
qu'elle est visible et se fige hors écran.

## Ce que ce n'est pas

**Une illustration, pas une donnée.** Les lieux sont réels (villes et ports, positions
arrondies) ; les liaisons sont **dessinées pour expliquer** chaque levier. Les réseaux ferré
et fluvial du report modal sont des tracés **indicatifs** entre villes, pas des lignes ni des
voies d'eau relevées, et le service Saragosse → Poznań n'existe pas parce qu'on le dessine.
Les liaisons n'affirment l'existence d'aucun service, ne portent aucun nom d'opérateur, aucun
chiffre, aucun gain. Elles ne sont plus signalées à l'écran (voir plus haut : la carte du levier la porte pour les lecteurs d'écran), et la scène est
indépendante de la vitrine (`showcase.json`) et de la base privée : elle n'en lit rien.

> Les noms d'opérateurs visibles sur la carte du portail (capture fournie) ne sont **pas
> repris** ici : leur publication demande l'accord de l'équipe, et passerait par la vitrine
> validée (PROTECTION.md), jamais par ce fichier.

## Où est le code

| Fichier | Rôle |
|---|---|
| `src/lib/levers/data.ts` | La scène : lieux (villes, ports), six leviers = listes d'éléments (tracés, repères, anneaux, bornes) minutés de 0 à 1, durée de chaque levier |
| `src/lib/levers/scene.ts` | Calculs purs : tracé dessiné à l'avancement `u`, emprises, bornes le long d'un tracé (testés) |
| `src/lib/levers/layout.ts` | Placement sans chevauchement des noms de lieux (testé) |
| `src/lib/levers/geo.ts` | Projection de Mercator et fond de carte (terres, frontières), chargé une seule fois pour la page |
| `src/lib/levers/layers.ts` | Les six couches de la planche des référentiels (tracés, repères, anneaux, cadre) ; construit sur les constantes de `data.ts` |
| `src/components/levers/LeverGlobe.tsx` | Globe MapLibre incliné, sans interaction, piloté image par image ; étiquettes HTML |
| `src/components/levers/LeverFlat.tsx` | Même scène en SVG (sans WebGL, rendu logiciel, appareil économe) ; animations CSS |
| `src/components/levers/LeverStage.tsx` | Orchestrateur : choix du rendu, lecture automatique, mesure du texte ; aucun contrôle |
| `src/content/referentials.ts` | Les chiffres et les fiches d'exemple de la planche, avec leur provenance |
| `src/components/referentials/Referentials.tsx` | En-tête et note de la planche (serveur) ; fournit les messages `Home.referentials` au client |
| `src/components/referentials/ReferentialBoard.tsx` | Menu (onglets), défilement automatique, pause, clavier, attente de l'entrée à l'écran |
| `src/components/referentials/panels.tsx` · `blocks.tsx` | Les six panneaux et leurs blocs (chiffres qui comptent, formes de services, anneau, frise des arrêts, fiches) |
| `src/components/referentials/LayerMap.tsx` · `referentials.css` | La carte animée d'une couche ; tout le style de la planche (`.rb-*`) |
| `messages/*/home.json` → `Home.levers`, `Home.referentials` | Tous les textes, FR et EN (clés vérifiées par `levers.test.ts` et `layers.test.ts`) |
| `scripts/build-levers-poster.ts` | `public/images/levers-poster.svg`, image d'attente de la carte (`npm run poster:levers`) |

## Rendus

- **Globe 3D** (MapLibre, projection globe) : si l'appareil a WebGL accéléré. Chargé après
  l'événement `load` (≈ 250 Ko), jamais avant le premier affichage ; `?renderer=globe` le force
  (recette).
- **Carte à plat** (SVG, projection de Mercator) : sans WebGL, en rendu logiciel, ou sur
  connexion/appareil économe. Mêmes leviers, mêmes tracés.
- **Pas d'image d'attente avec un script** : la première seconde montre le titre sur un fond marine
  avec un halo bleu, et la carte apparaît en fondu quand elle est prête (le fond de carte est
  chargé, ou le globe est monté). Une image d'attente qui ne ressemblait pas à la scène (un
  zoom sur la Méditerranée et son réseau de tracés) donnait une première seconde brouillonne, et
  c'était l'élément le plus lent de l'accueil mobile (LCP). Sans script, `levers-poster.svg`
  (≈ 19 Ko : les terres de l'Europe, sans tracé ni point) s'affiche dans un `<noscript>`.

## Lecture

La lecture de la couverture est automatique et boucle sur les six leviers ; **il n'y a ni bouton
pause, ni moyen de choisir un levier**. Sous « mouvement réduit », il n'y a pas de lecture : le
premier levier s'affiche terminé, immobile. Arrêter ce qui bouge plus de cinq secondes est une
exigence d'accessibilité WCAG 2.2.2 : sans bouton, la réponse tient au seul mouvement réduit —
écart plus net qu'avec le bandeau précédent, à reconsidérer si la page doit satisfaire cette
exigence au niveau A (par exemple en arrêtant la boucle après un tour, ou en figeant la scène
quand la couverture sort de l'écran).

## Réserves

- Le globe est vérifié ici en rendu logiciel (SwiftShader), donc lentement : la fluidité sur GPU
  réel n'est pas mesurée.
- Les régions et les liaisons sont un choix éditorial à valider ; changer d'exemple revient à
  modifier `PLACES` et `SCENES` (le reste suit : cadrage, étiquettes, textes à ajouter).
