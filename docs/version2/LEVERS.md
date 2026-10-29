# La scène des leviers (couverture) et les schémas

**Ce que c'est.** La couverture montre un globe sur lequel six leviers sont joués, l'un
après l'autre. Cinq se jouent en Méditerranée occidentale ; le premier, le report modal,
part du sud de l'Espagne et va jusqu'en Pologne :

1. **Report modal rail/fluvial** — trois flux partent du sud de l'Espagne vers la Pologne,
   chacun en direct par la route. Les réseaux ferré et fluvial se branchent en filigrane, un
   service ferroviaire est identifié (Saragosse → Poznań) et les flux se transforment en
   pré-acheminement routier vers Saragosse, traction ferroviaire jusqu'à Poznań, puis
   post-acheminement routier (15 s, les autres leviers 9 s) ;
2. **Shortsea côtier** — des flux côtiers, d'escale en escale, plutôt qu'une liaison directe ;
3. **Boucles** — des rotations fermées, le retour trouve une charge ;
4. **Cross-dock** — les envois partiels convergent vers une plateforme, se regroupent, repartent complets ;
5. **Électrification** — selon un réseau de bornes optimal, pas selon les bornes déjà installées ;
6. **Mutualisation** — plusieurs chargeurs sur un même service.

Sous la couverture, une section de six schémas animés (`LeverSchemas`) compare pour chaque
levier une situation de départ (gris, pointillé) à ce que le levier permet (couleur).

## La couverture : une image seule

Pas d'encart sur l'image : le titre dit l'idée en une phrase (« 3 500 services rail et fluviaux
en Europe, une alternative à la route. »), la carte joue le report modal en premier, et six
pastilles permettent de passer d'un levier à l'autre. Les bulles d'explication existent encore
dans le code (`callouts`, textes `Home.levers.items.*.callouts`) mais la couverture les
désactive ; seuls les noms de lieux restent sur la carte. Une légende discrète rappelle que les
liaisons sont dessinées pour expliquer.

**Le chiffre « 3 500 »** vient de la direction (`src/content/figures.ts`). Il n'a pas été recoupé :
dans le portail, le référentiel Appel d'Air 2026 compte 2 906 services ferroviaires intermodaux
(sans le fluvial). À valider contre la base avant toute mise en ligne publique, puis à
changer au seul endroit où il est écrit.

## Ce que ce n'est pas

**Une illustration, pas une donnée.** Les lieux sont réels (villes et ports, positions
arrondies) ; les liaisons sont **dessinées pour expliquer** chaque levier. Les réseaux ferré
et fluvial du report modal sont des tracés **indicatifs** entre villes, pas des lignes ni des
voies d'eau relevées, et le service Saragosse → Poznań n'existe pas parce qu'on le dessine.
Les liaisons n'affirment l'existence d'aucun service, ne portent aucun nom d'opérateur, aucun
chiffre, aucun gain. L'écran le dit en permanence (« Illustration. Liaisons dessinées pour expliquer, pas des services existants. »), et la scène est
indépendante de la vitrine (`showcase.json`) et de la base privée : elle n'en lit rien.

> Les noms d'opérateurs visibles sur la carte du portail (capture fournie) ne sont **pas
> repris** ici : leur publication demande l'accord de l'équipe, et passerait par la vitrine
> validée (PROTECTION.md), jamais par ce fichier.

## Où est le code

| Fichier | Rôle |
|---|---|
| `src/lib/levers/data.ts` | La scène : lieux, six leviers = listes d'éléments (tracés, nœuds, bulles, bornes) minutés de 0 à 1 |
| `src/lib/levers/scene.ts` | Calculs purs : tracé dessiné à l'avancement `u`, emprises, bornes le long d'un tracé (testés) |
| `src/lib/levers/layout.ts` | Placement sans chevauchement des bulles et des noms de lieux (testé) |
| `src/components/levers/LeverGlobe.tsx` | Globe MapLibre incliné, sans interaction, piloté image par image ; étiquettes HTML |
| `src/components/levers/LeverFlat.tsx` | Même scène en SVG (sans WebGL, rendu logiciel, appareil économe) ; animations CSS |
| `src/components/levers/LeverStage.tsx` | Orchestrateur : choix du rendu, lecture automatique, pastilles des six leviers, mesure du texte |
| `src/components/levers/LeverSchemas.tsx` | Les six schémas animés (SVG inline, `reveal-in`) |
| `messages/*/home.json` → `Home.levers`, `Home.leverSchemas` | Tous les textes, FR et EN (clés vérifiées par `levers.test.ts`) |
| `scripts/build-levers-poster.ts` | `public/images/levers-poster.svg`, image d'attente de la carte (`npm run poster:levers`) |

## Rendus

- **Globe 3D** (MapLibre, projection globe) : si l'appareil a WebGL accéléré. Chargé après
  l'événement `load` (≈ 250 Ko), jamais avant le premier affichage ; `?renderer=globe` le force
  (recette).
- **Carte à plat** (SVG, projection de Mercator) : sans WebGL, en rendu logiciel, ou sur
  connexion/appareil économe. Mêmes leviers, mêmes tracés.
- **Image d'attente** (`levers-poster.svg`, ≈ 27 Ko) : affichée tant que la carte n'est pas prête
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
