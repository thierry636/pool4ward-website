# Note courte : données réelles, démonstration, vitrine publiée

## Ce qui est réel

- Les **textes** décrivant les fonctions logicielles : vérifiés dans le code lu
  (voir CAPABILITIES.md).
- Le **fond géographique** du globe (terres, frontières) : Natural Earth, domaine
  public, via le paquet `world-atlas` (ISC). Servi tel quel (`public/geo/`) ;
  polygones découpés à l'antiméridien par `scripts/build-geo.mjs`.
- Les **articles** du blog : ceux de la version 1, avec leurs sources.
- Les **positions des sites** de l'exemple : villes et ports réels, arrondis à
  ≈ 1 km. Rien d'autre n'y est réel.

## Ce qui est une démonstration (fictif, explicitement signalé)

- **Le cas du parcours** : « Groupe démonstrateur », quatre sites (Usine Nord,
  Plateforme Centre, Entrepôt Est, Usine Sud), six flux, créneaux, échéances de
  contrat, partenaires (profils, jamais des sociétés). Le plateau porte en
  permanence la mention « Cas démonstrateur — sites et valeurs fictifs ». Il ne
  calcule ni coût, ni gain, ni temps de parcours.
- **La vitrine d'exemple** (`src/content/showcase.json`, mode `demo`, 35 sites,
  29 liaisons, issue de `scripts/showcase/example.source.json`) : des liaisons
  d'illustration entre sites réels, **sans aucun nom d'opérateur**. Elles ne sont
  issues d'aucun référentiel Pool4ward et **n'affirment l'existence d'aucun
  service**. L'animation le dit à l'écran (« Exemple illustratif »), la liste
  des liaisons et le pied de page aussi.
- **Parkings sécurisés, bornes de recharge, réseaux** : aucune de ces couches
  n'est publiée par la vitrine (l'ancien globe d'exploration, qui les
  évoquait, a été retiré).

## Ce que sera la vitrine publiée (mode `curated`)

Un export de la base privée, validé et écrit par `npm run showcase:publish`
(PROTECTION.md). Il ne contient que des **sites** (nom, type, pays, position à
≈ 1 km), des **liaisons** (chapitre, mode, départ, passages, arrivée) et, si
validé, un **nom d'opérateur**. L'écran passe de « Exemple illustratif » à
« Vitrine publiée le … » ; le build de production refuse une vitrine `demo`.

## Règles de diffusion

1. Aucune donnée source, aucun identifiant de base, aucune coordonnée plus fine
   que le centième de degré, aucun contact ne quitte la base privée.
2. Le site n'embarque aucun accès à la base ; il lit un fichier statique.
3. Un format fermé : une colonne non prévue **bloque** la publication au lieu
   d'être écartée en silence.
4. Un référencé n'est pas un disponible : l'animation ne localise aucun véhicule,
   ne simule aucun suivi (les impulsions qui parcourent une liaison sont une
   animation, pas une position).
5. Un nom d'opérateur n'est publié que s'il a été validé. Sans validation, la
   liaison s'affiche sans nom : on ne comble pas les blancs.
6. Les chiffres de bases (services, gares, transporteurs…) ne sont publiés
   qu'après validation : un nombre de lignes n'est pas un nombre d'entreprises
   qualifiées (doublons et fiches hors périmètre signalés sur la base
   transporteurs). **La vitrine ne publie d'ailleurs aucun effectif.**

## Risque résiduel

La vitrine peut être copiée en entier ; elle est faite pour que ce soit sans
conséquence. Les points à trancher sont dans PROTECTION.md (« Limites à
connaître ») : publiabilité des noms d'opérateurs, précision des bases de
transporteurs.
