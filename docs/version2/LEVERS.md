# La scène des leviers (couverture) et les schémas

**Ce que c'est.** La couverture montre un globe sur lequel six leviers sont joués, l'un
après l'autre, sur une même région du monde (la Méditerranée occidentale) :

1. **Rail** — le long cours passe au rail, la route garde le premier et le dernier kilomètre ;
2. **Shortsea côtier** — des flux côtiers, d'escale en escale, plutôt qu'une liaison directe ;
3. **Boucles** — des rotations fermées, le retour trouve une charge ;
4. **Cross-dock** — les envois partiels convergent vers une plateforme, se regroupent, repartent complets ;
5. **Électrification** — selon un réseau de bornes optimal, pas selon les bornes déjà installées ;
6. **Mutualisation** — plusieurs chargeurs sur un même service.

Sous la couverture, une section de six schémas animés (`LeverSchemas`) compare pour chaque
levier une situation de départ (gris, pointillé) à ce que le levier permet (couleur).

## Ce que ce n'est pas

**Une illustration, pas une donnée.** Les lieux sont réels (villes et ports, positions
arrondies) ; les liaisons sont **dessinées pour expliquer** chaque levier. Elles n'affirment
l'existence d'aucun service, ne portent aucun nom d'opérateur, aucun chiffre, aucun gain. L'écran
le dit en permanence (« Illustration · Méditerranée occidentale. Liaisons dessinées pour
expliquer chaque levier : ce ne sont pas des services existants. »), et la scène est
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
| `src/components/levers/LeverStage.tsx` | Orchestrateur : choix du rendu, lecture/pause, bandeau des six leviers, mesure du texte |
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

## Réserves

- Le globe est vérifié ici en rendu logiciel (SwiftShader), donc lentement : la fluidité sur GPU
  réel n'est pas mesurée.
- La région et les liaisons sont un choix éditorial à valider ; changer de région revient à
  modifier `PLACES` et `SCENES` (le reste suit).
