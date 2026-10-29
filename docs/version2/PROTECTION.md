# Protection des données : un modèle de vitrine

**Constat.** Tout ce qu'un site public affiche peut être copié — à la main, en
image, par OCR. On ne peut pas « sécuriser à fond le scraping », et ce site ne
le prétend pas. Il règle la question en amont : **la base source n'est jamais en
ligne**, et le site ne publie que ce qu'il est acceptable de voir copié.

Ni WebGL, ni le canvas, ni l'obfuscation JavaScript, ni HTTPS, ni CORS, ni
`robots.txt` ne protègent ce qu'un navigateur reçoit. Rien de ce qui suit ne
s'appuie sur eux.

## Trois périmètres

1. **Base privée** — sources, contacts, qualifications, coordonnées précises,
   tenue à jour par un administrateur, **hors de ce site**. Le site n'a ni
   identifiants, ni variable d'environnement, ni code qui s'y connecte. Elle peut
   vivre dans le portail (voir DEPLOY.md, « Netlify ou Railway »).
2. **Export validé** — une publication à la fois, déclenchée par une personne :
   `npm run showcase:publish -- --from export.json --mode curated`
   (`scripts/showcase/publish.mjs`, `src/lib/showcase/build.mjs`). La publication
   **échoue** plutôt que de corriger en silence :
   - colonne non prévue dans l'export (un tarif, un contact, un identifiant
     interne) : refus, pas d'oubli silencieux ;
   - plafonds : 250 sites, 400 liaisons, 80 par chapitre, 3 sites de passage ;
   - coordonnées au centième de degré (≈ 1 km) : un site se situe, il ne se
     retrouve pas à la porte ;
   - textes : lettres, chiffres et ponctuation courante ; refus de tout ce qui
     ressemble à une adresse électronique, à un lien ou à un numéro de téléphone ;
   - identifiants **dérivés du nom** (`hamburg-de`), jamais les clés de la base ;
   - un site qu'aucune liaison publiable n'utilise n'est pas publié ;
   - aucun nom d'opérateur dans une vitrine « demo » ;
   - sortie déterministe : l'écart avec la version précédente s'affiche
     (liaisons ajoutées / retirées) et se relit en revue avant déploiement.
3. **Vitrine statique** — `src/content/showcase.json`, intégré au site à sa
   construction. Pas d'API, pas de requête vers la base, rien à interroger : ce
   qui est publié est ce qui est montré.

## Ce que contient la vitrine — et rien d'autre

| Donnée | Contenu | Précision |
|---|---|---|
| Sites | nom, type (port, terminal rail-route, port fluvial, plateforme, base de transporteur), pays | position à ≈ 1 km |
| Liaisons | chapitre, mode (rail, shortsea, fluvial, route frigorifique), départ, passages, arrivée | un arc entre sites, pas le tracé réel |
| Opérateur | un nom, seulement s'il a été validé pour la publication | jamais en « demo » |

Aucun volume, tarif, contact, identifiant de base, date de mise en service ni
nom de client.

## Garde-fous au build

`npm run build` exécute d'abord `showcase:check` (`prebuild`) : fichier valide, forme
canonique (donc écrit par le publieur), et **refus d'un build de production avec
une vitrine « demo »** (`SHOWCASE_ALLOW_DEMO=1` pour passer outre en
connaissance de cause). À l'exécution, `src/lib/showcase/load.ts` valide encore le
fichier : un fichier invalide fait échouer le build, il n'affiche pas
n'importe quoi. Les tests (`src/lib/showcase/showcase.test.ts`) rejouent ces
règles.

## Limites à connaître

- **La vitrine peut être copiée en entier.** C'est assumé : elle ne contient que
  ce que l'on accepte de voir copié. Les noms d'opérateurs sont donc les seules
  données dont la publication a une portée commerciale : la validation technique
  ne sait pas si un nom est publiable ; c'est le drapeau « publiable » de la base,
  puis la relecture de l'écart, qui en décident.
- **Une base de transporteur est une entreprise.** À ≈ 1 km, la position d'un
  siège peut l'identifier. À trancher avant la première publication réelle :
  publier ces sites au centre de leur ville (arrondi plus grossier) plutôt qu'à
  leur adresse.
- **Rien n'empêche d'afficher une liaison qui n'existe pas** : la vitrine dit
  « référencé », pas « disponible » ; la validation ne vérifie pas la réalité
  d'une liaison, seulement la forme de la donnée.
- **Le publieur tourne sur un poste de confiance** : il lit un export, écrit un
  fichier. Qui peut modifier `src/content/showcase.json` dans le dépôt peut
  publier ; la protection de la branche principale et la revue du diff sont
  donc le vrai contrôle d'accès.

## Code serveur restant

Le formulaire de contact (`/api/contact`) est la seule route serveur : limitation
à 5 envois par 10 minutes et par adresse, en mémoire d'instance — sur du
serverless, chaque instance a ses compteurs : une barrière de bon sens, pas
globale (INTEGRATIONS.md §6 : identification de l'adresse et stockage partagé
facultatif, non éprouvé sur un service réel).

## Historique

Une version précédente de ce site (commit `31a1e0f` de la branche `version2`)
affichait un globe d'**exploration** : couches de densité rendues en images côté
serveur, session signée, quotas, détection de balayage, synthèses de zone. Elle a
été retirée au profit de la vitrine animée : un outil d'exploration ne se protège
pas par des quotas, et l'on ne voulait pas d'un outil de recherche. Si une
exploration est un jour souhaitée, elle a sa place **derrière un compte, dans le
portail**, pas sur ce site.
