# Note courte : données réelles, agrégats, démonstrations

## Ce qui est réel

- Les **textes** décrivant les fonctions logicielles : vérifiés dans le code lu
  (voir CAPABILITIES.md).
- Le **fond géographique** du globe (terres, frontières) : Natural Earth, domaine
  public, via le paquet `world-atlas` (ISC). Servi tel quel (`public/geo/`).
- Les **articles** du blog : ceux de la version 1, avec leurs sources.

## Ce qui est une démonstration (fictif, explicitement signalé)

- **Le cas du parcours** : « Groupe démonstrateur », quatre sites (Usine Nord,
  Plateforme Centre, Entrepôt Est, Usine Sud), six flux, créneaux, échéances de
  contrat, partenaires (profils, jamais des sociétés). Le plateau porte en
  permanence la mention « Cas démonstrateur — sites et valeurs fictifs ». Il ne
  calcule ni coût, ni gain, ni temps de parcours.
- **Les couches du globe** (`src/server/projection/fixtures.ts`) : densités
  illustratives calculées à partir de quelques foyers, corridors schématiques. Elles
  **ne sont issues d'aucun référentiel Pool4ward**. L'interface le dit sur chaque
  vue (bandeau « Données de démonstration »), dans la légende, dans le tableau de
  couverture et dans le pied de page.
- **Parkings sécurisés** : aucun référentiel n'a été trouvé ; la couche est
  déclarée « Référentiel non raccordé » et ne dessine rien.

## Ce qui sera un agrégat (une fois le backend raccordé)

Des effectifs par maille de 1 à 3° (≈ 100 à 300 km) calculés **côté backend de
projection**, jamais côté site, jamais depuis les API du portail. Le site les
reçoit par un contrat strict (INTEGRATIONS.md), applique sa propre politique
(masquage des cellules sous seuil, cinq paliers de couleur, zoom plafonné) et ne
diffuse au navigateur que des **images** et des **paliers** d'effectifs.

## Règles de diffusion

1. Aucune donnée source, aucun identifiant, aucune coordonnée plus fine que la
   maille, aucun contact ne quitte les référentiels privés.
2. Aucun jeu complet — GeoJSON, JSON, CSV, MVT, PMTiles, buffer WebGL — n'est
   envoyé au navigateur ; la page n'embarque aucun payload de couche (vérifié :
   VERIFICATION.md).
3. Pas de bruit aléatoire par requête (il se moyennerait) : l'agrégation est stable.
4. Cellules sous le seuil masquées ; effectifs de zone publiés en paliers fixes
   (0, 10, 25, 50, 100, 250, 500, 1000) ; zones disjointes, pour qu'on ne déduise
   pas une zone fine par soustraction.
5. Un référencé n'est pas un disponible : le globe ne montre que le niveau
   « référencé », ne localise aucun véhicule, n'anime aucune particule simulant un
   suivi.
6. Une couverture mal documentée reste **vide** : on ne la complète pas.
7. Les chiffres de bases (services, gares, transporteurs…) ne sont publiés
   qu'après validation : un nombre de lignes n'est pas un nombre d'entreprises
   qualifiées (doublons et fiches hors périmètre signalés sur la base transporteurs).

## Risque résiduel

Tout ce qui est affiché peut être capturé, en image et par OCR. Les synthèses
visibles — zones de concentration, paliers — restent donc copiables. La
protection est dans la **faible précision de ce qui est montré** et dans la
détection des balayages, pas dans l'impossibilité de copier.
