# La scène des leviers (couverture) et les schémas

**Ce que c'est.** La couverture montre une carte (un globe, ou la carte à plat) sur laquelle six
leviers sont joués, l'un après l'autre, sur toute l'Europe. Chaque levier suit la même
dramaturgie : **on voit d'abord les flux (ou les ports), puis on identifie ce qui peut changer,
puis les flux se transforment**.

1. **Report modal rail/fluvial** — trois flux partent du sud de l'Espagne vers la Pologne,
   chacun en direct par la route. Les réseaux ferré et fluvial se branchent en filigrane, un
   service ferroviaire est identifié (Saragosse → Poznań) et les flux se transforment en
   pré-acheminement routier vers Saragosse, traction ferroviaire jusqu'à Poznań, puis
   post-acheminement routier (15 s) ;
2. **Shortsea côtier** — on voit d'abord les ports côtiers d'Europe (une quarantaine de points,
   de l'Atlantique à la Baltique et à la Méditerranée), puis un service méditerranéen, de port en
   port d'Algésiras à Naples, à la place d'une liaison directe qui s'efface (15 s) ;
3. **Boucles** — une quinzaine de flux paneuropéens à sens unique, puis l'identification de
   quelques boucles : des jambes chargées qui se referment, au besoin avec une jambe à vide en
   pointillé (15 s) ;
4. **Cross-dock** — neuf petits flux d'origines variées convergent vers une plateforme (Lyon),
   se consolident, et repartent en **un seul gros flux**, bien plus épais, vers l'usine (12 s) ;
5. **Électrification** — comme le rail et le shortsea : les flux, puis **le réseau de bornes**
   en dessous (une centaine de bornes réparties sur l'Europe), puis un flux bouclé et
   électrifié (Lyon – Strasbourg – Francfort – Paris) qui se recharge sur quelques bornes bien
   placées du réseau (16 s) ;
6. **Mutualisation** — des flux d'entreprises différentes (une couleur par chargeur) sont
   regroupés sur un même train **Dourges → Poznań**, avec leur pré- et post-acheminement (15 s).

Sous la couverture, une section de six schémas animés (`LeverSchemas`) compare pour chaque
levier une situation de départ (gris, pointillé) à ce que le levier permet (couleur) ; ils
racontent la même histoire que la scène (ports puis service ; flux à sens unique puis boucle ;
petits flux puis gros flux ; réseau de bornes puis boucle électrifiée ; départs de trois
entreprises puis train partagé).

## La couverture : une image seule, un filigrane par levier

Le titre de la couverture ne change pas (« Concevoir le transport au plus près du réel. »). Pas
d'encart sur l'image, pas de texte fixe : quand un levier commence à tracer ses flux, **un
filigrane très estompé se dessine** dans le coin libre de l'image — **le sigle du levier**
(animé, propre à chacun : voir `glyphs.tsx`) et **l'idée en une phrase punchy**, dont un
passage en gras :

| Levier | Filigrane (FR) |
|---|---|
| Report modal | **3 500 services** rail et fluviaux en Europe, une alternative à la route. |
| Shortsea | **1 500 services** shortsea en Europe, une alternative à la route. |
| Boucles | **Des boucles se cachent** dans vos flux paneuropéens. |
| Cross-dock | **Consolider** : de petits flux, un gros flux vers l'usine. |
| Électrification | **Des bornes partout en Europe**, un flux bouclé et électrifié. |
| Mutualisation | **Des entreprises différentes**, un même train : Dourges – Poznań. |

Il s'efface quand un autre levier prend la main (`LeverWatermark.tsx`, un par levier, remonté à
chaque changement ; piloté par `data-on` depuis `LeverStage.tsx`, seuil `WATERMARK_AT`) ; en
mouvement réduit, il est là d'emblée. La mention « Illustration : liaisons dessinées pour
expliquer, pas des services existants » n'est pas affichée (jugée inutile) : elle reste dans le
filigrane, lisible par les lecteurs d'écran. Six pastilles, sous l'image, passent d'un levier à
l'autre. **Il n'y a plus aucune bulle d'explication** sur l'image (le code, les textes et le CSS
correspondants ont été supprimés) ; seuls les noms de lieux restent sur la carte, et pas tous :
quatre escales du service shortsea sont nommées, pas huit, pour qu'ils ne se chevauchent pas.

**Les chiffres « 3 500 » et « 1 500 »** viennent de la direction (`src/content/figures.ts`).
Ils n'ont pas été recoupés : dans le portail, le référentiel Appel d'Air 2026 compte
2 906 services ferroviaires intermodaux (sans le fluvial ni le shortsea). À valider contre la
base avant toute mise en ligne publique, puis à changer au seul endroit où ils sont écrits.

## Ce que ce n'est pas

**Une illustration, pas une donnée.** Les lieux sont réels (villes et ports, positions
arrondies) ; les liaisons sont **dessinées pour expliquer** chaque levier. Les réseaux ferré
et fluvial du report modal sont des tracés **indicatifs** entre villes, pas des lignes ni des
voies d'eau relevées, et le service Saragosse → Poznań n'existe pas parce qu'on le dessine.
Les liaisons n'affirment l'existence d'aucun service, ne portent aucun nom d'opérateur, aucun
chiffre, aucun gain. Elles ne sont plus signalées à l'écran (voir plus haut : filigrane), et la scène est
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
| `src/components/levers/LeverGlobe.tsx` | Globe MapLibre incliné, sans interaction, piloté image par image ; étiquettes HTML |
| `src/components/levers/LeverFlat.tsx` | Même scène en SVG (sans WebGL, rendu logiciel, appareil économe) ; animations CSS |
| `src/components/levers/LeverStage.tsx` | Orchestrateur : choix du rendu, lecture automatique, pastilles des six leviers, mesure du texte |
| `src/components/levers/LeverWatermark.tsx` · `glyphs.tsx` | Le filigrane : sigle animé du levier + phrase (`items.<levier>.watermark`) |
| `src/components/levers/LeverSchemas.tsx` | Les six schémas animés (SVG inline, `reveal-in`) |
| `messages/*/home.json` → `Home.levers`, `Home.leverSchemas` | Tous les textes, FR et EN (clés vérifiées par `levers.test.ts`) |
| `scripts/build-levers-poster.ts` | `public/images/levers-poster.svg`, image d'attente de la carte (`npm run poster:levers`) |

## Rendus

- **Globe 3D** (MapLibre, projection globe) : si l'appareil a WebGL accéléré. Chargé après
  l'événement `load` (≈ 250 Ko), jamais avant le premier affichage ; `?renderer=globe` le force
  (recette).
- **Carte à plat** (SVG, projection de Mercator) : sans WebGL, en rendu logiciel, ou sur
  connexion/appareil économe. Mêmes leviers, mêmes tracés.
- **Image d'attente** (`levers-poster.svg`, ≈ 41 Ko) : affichée tant que la carte n'est pas prête
  et pour qui n'exécute pas de script.

## Lecture

La lecture est automatique et boucle sur les six leviers ; **il n'y a pas de bouton pause**.
Un clic ou une touche sur un levier le joue une fois et le laisse affiché ; sans nouveau geste,
la lecture reprend vingt secondes après la fin du levier. Sous « mouvement réduit », il n'y a
pas de lecture automatique : le levier s'affiche terminé, et se change par le bandeau.
(Arrêter ce qui bouge plus de cinq secondes est une exigence d'accessibilité WCAG 2.2.2 :
sans bouton, la réponse tient à ce geste et au mouvement réduit — à reconsidérer si la page
doit satisfaire cette exigence au niveau A.)

## Réserves

- Le globe est vérifié ici en rendu logiciel (SwiftShader), donc lentement : la fluidité sur GPU
  réel n'est pas mesurée.
- Les régions et les liaisons sont un choix éditorial à valider ; changer d'exemple revient à
  modifier `PLACES` et `SCENES` (le reste suit : cadrage, étiquettes, textes à ajouter).
