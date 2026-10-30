# Direction artistique

**Idée** : retrouver l'identité de la version 1 — marine profond, bleu de marque,
turquoise — et lui donner du mouvement. Le fait marquant est la **couverture** : une
carte du monde (globe) qui joue, l'un après l'autre, six leviers sur une même
région, comme la carte du portail ; tout le reste du site la prolonge par des
schémas animés plutôt que par du texte.

## Marque

Le **sigma** est celui de la marque d'origine, tracé à l'identique
(`public/images/brand/logo-full.svg`) ; seule sa couleur change (de l'aplat bleu
dégradé à `currentColor`). Le « 4 » du nom prend le turquoise. Le portail reste bleu
(`#4361ee`) : l'audit y a relevé deux logos Pool4ward différents et aucune charte
arbitrée — à trancher avant de rapprocher les deux.

## Palette et contrastes (tous ≥ 4,5:1)

Jetons CSS dans `src/app/globals.css` (`.tone-light`, `.tone-light-2`, `.tone-dark`) ;
palettes `navy`, `brand` et `teal` de `tailwind.config.ts` (celles de la version 1).

| Couple | Rapport |
|---|---|
| Texte `#0f172a` sur blanc | 17,9 |
| Texte secondaire `#475569` sur blanc | 7,6 (7,2 sur `#f8fafc`) |
| Bleu de marque `#4263eb` sur blanc | 5,0 |
| Texte blanc sur bouton `#4263eb` | 5,0 |
| Pastille : `#3b5bdb` sur `#eef2ff` | 5,1 |
| Turquoise `#0f766e` sur blanc | 5,5 |
| Texte `#f1f5f9` sur marine `#020617` | 18,4 |
| Texte secondaire `#94a3b8` sur `#020617` | 7,9 |
| Turquoise `#2dd4bf` sur `#020617` | 10,8 |
| Noms de lieux `#cbd5e1` sur la carte `#050d1f` | 13,1 |

L'information ne passe jamais par la couleur seule : tracés (plein, tirets, points),
formes (carré = terminal, rond = site, anneau = bornes) et libellés doublent chaque
distinction. Les schémas ont tous une description textuelle (`aria-label`).

## Typographie

- **Inter** (variable, sous-ensemble latin, ≈ 48 Ko, SIL OFL — `public/fonts/OFL-Inter.txt`),
  auto-hébergée, `display: optional` : aucune requête tierce, aucun décalage de mise en page.
  C'est la police de la version 1. Titres en graisse 700, interlettrage serré ; une
  expression du titre peut porter le dégradé bleu → turquoise (`<em>` dans les messages).
- **Source Serif 4** : lecture des articles du blog seulement, comme en version 1.
- Typographie française (insécables avant `: ; ? !`, dans les guillemets, avant les
  unités) appliquée une fois au chargement des messages (`src/lib/typo-fr.ts`).

## Composants de la version 1 retrouvés

Pastilles (`.eyebrow`, `.pill`), boutons à coins arrondis et halo bleu (`.btn-solid`),
cartes à coins larges et ombre douce (`.card`, `.card-lift`), pastilles d'icône
(`.tile-icon`), bandeau d'appel à l'action en panneau sombre arrondi
(`CtaBand`), halos lumineux (`.glow-blue`, `.glow-teal`). Pictogrammes :
`src/components/ui/Icon.tsx` (traits de 1,6 px).

## Mouvement

Le mouvement explique, il ne décore. Règles :

- aucune introduction qui bloque la navigation ; aucun détournement du défilement ;
  aucun son ;
- **scène des leviers (couverture)** : six leviers joués à tour de rôle (12 à 16 s chacun selon
  le levier). Chacun suit les mêmes temps : les flux (ou les ports) se dessinent, on identifie ce
  qui peut changer, les flux se transforment. Les tracés se dessinent, des impulsions les
  parcourent. Aucun encart ni bulle sur l'image, aucun texte fixe, aucun sigle : les six
  leviers sont des pastilles sur toute la largeur du bas, et la **carte du levier actif**
  (un chiffre ou une phrase courte) est toujours en bas à droite. Pas de bouton pause : un clic sur
  une pastille arrête la lecture et joue le levier une fois, la lecture reprend vingt secondes
  après sa fin ; sous « mouvement réduit », pas de lecture automatique, ni vol, ni impulsion, ni
  animation d'entrée de la carte — le levier s'affiche terminé ;
- **schémas des leviers** : six cartes « situation de départ / avec le levier » ; les
  tracés se dessinent à l'entrée dans l'écran, une fois, puis des impulsions les
  parcourent ; terminés et immobiles sans script ou en mouvement réduit ;
- apparition au défilement (`data-reveal`, `RevealObserver`) : seuls les blocs sous la
  ligne de flottaison sont masqués puis révélés ; rien n'est caché sans script ni sous
  « mouvement réduit » ;
- la lecture automatique du parcours (étape 1 seulement) démarre quand la section est
  vue, s'arrête au premier geste, a un bouton pause, n'existe pas sous « mouvement
  réduit » ;
- animation du monde (page Référentiels) : quatre chapitres, vol de caméra,
  liaisons qui se tracent puis impulsions ; pause en premier dans l'ordre de
  tabulation, puces de chapitre au clavier ; aucune interaction directe avec la
  carte (pas de glisser, pas de zoom, pas de capture du défilement) ; suspendue hors
  écran et onglet masqué.

## Accessibilité

Lien d'évitement, onglets du parcours au clavier (flèches, Début, Fin), groupes de
boutons radio natifs, cibles ≥ 44 px, focus visible, carte à plat comme repli du globe,
et liste textuelle des liaisons (`<details>`, tableaux nommés, rendue côté serveur)
comme équivalent de l'animation du monde. Les légendes des animations ne sont pas des
régions `aria-live` : une lecture automatique n'annonce rien à un lecteur d'écran. **La
couverture n'a pas de bouton pause** (choix éditorial) : un geste sur un levier arrête la
lecture automatique, et « mouvement réduit » la supprime ; c'est un écart à WCAG 2.2.2
(« Pause, stop, hide », niveau A) pour un contenu qui bouge plus de cinq secondes, à
arbitrer.
