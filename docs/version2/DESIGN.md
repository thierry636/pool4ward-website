# Direction artistique

**Idée** : une carte qui se lit comme une couverture de revue — vert profond,
fonds minéraux, un seul accent chaud (ocre) réservé à ce qui se transforme ou
s'engage. Le motif unique est la courbe de niveau : le terrain, au sens propre.

## Marque

Le **sigma** est celui de la marque d'origine, tracé à l'identique
(`public/images/brand/logo-full.svg`) ; seule sa couleur change (de l'aplat bleu
dégradé à `currentColor`). Le « 4 » du nom prend l'accent chaud. Le portail reste
bleu (`#4361ee`, DESIGN_SYSTEM du portail) : l'audit y a relevé deux logos
Pool4ward différents et aucune charte arbitrée — à trancher avant de rapprocher les
deux.

## Palette et contrastes (tous ≥ 4,5:1)

| Couple | Rapport |
|---|---|
| Texte `#0e2219` sur fond minéral `#f5f2ea` | 14,9 |
| Texte secondaire `#4a5a50` sur `#f5f2ea` | 6,5 |
| Vert `#14573f` sur `#f5f2ea` | 7,6 |
| Ocre foncé `#8a5a10` sur `#f5f2ea` | 5,3 |
| Texte `#f5f2ea` sur vert `#0b241a` | 14,6 |
| Texte secondaire `#a7bdb0` sur `#0b241a` | 8,2 |
| Ocre `#e8b964` sur `#0b241a` | 9,0 |

L'information ne passe jamais par la couleur seule : tracés (plein, pointillé,
double trait), formes de trait (plein, tirets courts, longs tirets, points dans la légende de l'animation) et libellés doublent
chaque distinction.

## Typographie

- **Source Serif 4** (affichage) : réduite à la taille optique 40 et aux graisses
  300–600 (≈ 46 Ko au lieu de 119 Ko) ; version complète chargée par le seul blog.
- **Geist** (interface) et **Geist Mono** (étiquettes, chiffres, SVG), sous-ensemble
  latin, ≈ 22 Ko chacune. Aucune requête tierce.
- Typographie française (insécables avant `: ; ? !`, dans les guillemets, avant les
  unités) appliquée une fois au chargement des messages (`src/lib/typo-fr.ts`).

## Mouvement

Le mouvement explique une transformation : des flux séparés s'enchaînent en une
boucle ; un créneau déplacé ferme une complémentarité ; un lot devient un
engagement. Règles :

- aucune introduction qui bloque la navigation ; aucun détournement du défilement ;
  aucun son ;
- la scène de couverture ne joue qu'une fois par session, jamais sous « mouvement
  réduit » ; un curseur la rejoue ou la défait ;
- la lecture automatique du parcours (étape 1 seulement) démarre quand la section est
  vue, s'arrête au premier geste, a un bouton pause, n'existe pas sous « mouvement
  réduit » ;
- transitions CSS uniquement sur le plateau : rien ne tourne en boucle ;
- animation du monde (page Référentiels) : quatre chapitres, vol de caméra avec
  recul, liaisons qui se tracent puis impulsions qui les parcourent. Bouton pause
  en premier dans l'ordre de tabulation, puces de chapitre au clavier ; aucune
  interaction directe avec la carte (pas de glisser, pas de zoom, pas de capture du
  défilement) ; suspendue hors écran et onglet masqué ; sous « mouvement réduit »,
  pas de lecture automatique, pas de vol ni d'impulsions — le chapitre s'affiche
  tout tracé et se change par les puces.

## Accessibilité

Lien d'évitement, onglets du parcours au clavier (flèches, Début, Fin), groupes de
boutons radio natifs, cibles ≥ 44 px, focus visible, `aria-live` sur les panneaux
qui changent, carte à plat comme repli du globe, et liste textuelle des liaisons
(`<details>`, tableaux nommés, rendue côté serveur) comme équivalent de l'animation.
La légende du chapitre n'est pas une région `aria-live` : une lecture automatique
n'annonce rien à un lecteur d'écran.
