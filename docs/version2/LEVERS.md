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

La section qui suit la couverture (`Referentials`, id `referentiels`) met en avant ce que Pool4ward
décrit du physique du transport. **Six tuiles claires**, une par référentiel, chacune avec **son chiffre,
une phrase et l'écran du portail présenté autour** (fenêtre, bulles, repère). Titre : « L'optimisation au contact du terrain » ; sous-titre : « Nos référentiels relient chaque
décision aux réalités physiques et économiques du transport : réseaux, sites, services, capacités et
prix de marché. » (aucun chiffre dans le titre).

| Tuile | Chiffre | L'écran présenté |
|---|---|---|
| Services intermodaux (grande) | 2 500 services · 36 pays · 61 opérateurs · « Mise à jour journalière » | capture de la carte des services (filtre par forme) et capture de la fiche d'un service, bulles « Filtre par forme » et « Horaires · fréquences · contacts » |
| Services shortsea (grande) | 1 690 services · 3 continents | capture de la carte du monde, bulle « Boucles · métros bouclés » |
| Réseaux ferroviaire et fluvial | — (« Réseaux ») | **la carte animée du site** (couche `networks`), en attendant une capture du portail |
| Bornes et parkings | « + 36 000 » points | capture de la fiche d'un site de recharge (opérateur masqué) |
| Transporteurs | « + 80 000 » | capture de fiches de transporteurs (noms masqués) |
| Prix de marché | — (« Benchmarks ») | un graphique d'illustration : la distribution des prix de marché, son premier quartile et sa médiane, et trois estimations positionnées face à ce marché (aucune valeur). Texte : les modèles de coûts croisent des dizaines de paramètres avec les données de marché (contrats, bases spot) pour comparer chaque estimation aux prix réellement pratiqués |

**Les chiffres** vivent dans `src/content/referentials.ts` (jamais dans un message), avec leur provenance :
services (2 500, 36 pays) et shortsea (1 690) lus sur les écrans du portail le 2026-10-31 ; **61
opérateurs, 3 continents, « + 36 000 points » et « + 80 000 transporteurs » sont donnés par la direction
et non recoupés** (le portail montre 111 sites et 337 bornes pour les réseaux privés de bornes, un
périmètre plus étroit). Les services sont dits **« mis à jour chaque jour »**, jamais « en temps réel ».

**Les captures** (`public/images/referentials/*.webp`) sont des captures du portail, **sans les noms
d'opérateurs ni de transporteurs** (remplacés par des barres grises avant d'être convertis), recadrées
(aucune barre de navigateur ni barre des tâches ; la capture des bornes est recadrée pour ne pas montrer
le « 111 sites · 337 bornes » du portail, qui contredirait le « + 36 000 »). Une légende sous la planche le
dit. Remplacer une capture : même nom de fichier, mêmes proportions, noms masqués avant l'enregistrement.

**Disposition.** Ordinateur (≥ 1100 px) : grille 7 + 5 puis 3 + 3 + 3 + 3, tout visible. De 800 à 1099 px :
deux colonnes. Mobile : un **carrousel au doigt** — défilement horizontal avec accroche
(`scroll-snap-type: x mandatory`), la tuile suivante dépassant sur le bord, six points de repère et deux
flèches (mêmes gestes pour qui n'a pas d'écran tactile ; la piste est atteignable au clavier). Pas de
lecture automatique. Les mises en page internes d'une tuile se décident sur la largeur de la tuile
(requêtes de conteneur), pas sur celle de l'écran.

**Mise en scène.** Chaque tuile se joue **une fois**, à son entrée à l'écran (y compris en défilant de
côté sur mobile) : le texte, le nombre qui compte, les écrans qui se mettent en place, puis les bulles
l'une après l'autre. Au survol (ordinateur) la tuile se soulève. Sans JavaScript, ou sous « mouvement
réduit », tout est affiché terminé (la planche n'est « armée » que si le script tourne et que le mouvement
est permis). Seule la carte des réseaux charge son fond de carte, quand sa tuile approche de l'écran.

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
| `src/lib/levers/layers.ts` | La couche « réseaux ferroviaire et fluvial » de la planche (tracés, repères, cadre) ; construite sur les constantes de `data.ts` |
| `src/components/levers/LeverGlobe.tsx` | Globe MapLibre incliné, sans interaction, piloté image par image ; étiquettes HTML |
| `src/components/levers/LeverFlat.tsx` | Même scène en SVG (sans WebGL, rendu logiciel, appareil économe) ; animations CSS |
| `src/components/levers/LeverStage.tsx` | Orchestrateur : choix du rendu, lecture automatique, mesure du texte ; aucun contrôle |
| `src/content/referentials.ts` | Les chiffres de la planche, avec leur provenance |
| `src/components/referentials/Referentials.tsx` | Titre, phrase et légende de la planche (serveur) ; fournit les messages `Home.referentials` au client |
| `src/components/referentials/TileBoard.tsx` | Les six tuiles, leur mise en scène à l'entrée à l'écran, le carrousel mobile (points, flèches) |
| `src/components/referentials/LayerMap.tsx` · `referentials.css` | La carte animée des réseaux ; tout le style de la planche (`.rt-*`) |
| `public/images/referentials/` | Les captures du portail, noms masqués |
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
