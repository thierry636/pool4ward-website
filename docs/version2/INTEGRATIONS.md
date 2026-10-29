# Raccordements restants (liste exacte)

Rien ci-dessous n'est déclaré raccordé. Chaque ligne dit ce qui manque, ce qui est
prêt côté site, et ce que fait le site en l'attendant.

## 1. Base privée et export de la vitrine — **à construire côté Pool4ward**

Le site ne lit pas de base : il publie un fichier (`src/content/showcase.json`)
produit par `npm run showcase:publish` à partir d'un **export**. Ce qui reste à
faire est de l'autre côté :

- **Tenir la base à jour en superadmin**, dans l'application privée (le portail
  ou une application dédiée) : sites, liaisons, noms d'opérateurs, et un
  **drapeau « publiable »** par nom d'opérateur et par liaison. Un nom sans
  validation ne sort jamais.
- **Produire l'export** au format ci-dessous, depuis une **vue en lecture seule**
  (par exemple `showcase_sites`, `showcase_services`) et un rôle de base qui ne
  voit que ces vues. Une colonne en trop fait échouer la publication : le
  mécanisme est fait pour ça.

```json
{ "sites":    [{ "key": "hamburg", "name": "Hamburg", "kind": "port", "country": "DE", "lon": 9.97, "lat": 53.54 }],
  "services": [{ "chapter": "baltic-shortsea", "mode": "shortsea", "from": "kiel", "via": [], "to": "klaipeda", "operator": "Nom validé" }] }
```

  Valeurs : `kind` ∈ port, rail-terminal, inland-port, hub, carrier-base ;
  `mode` ∈ rail, shortsea, barge, road-reefer ; `chapter` ∈ rail-intermodal,
  baltic-shortsea, reefer-germany, barge-rhine (un mode n'est admis que dans
  son chapitre) ; `operator` facultatif. Exemple complet :
  `scripts/showcase/example.source.json`.
- **Décider qui publie, et comment** : l'export est déposé dans le dépôt puis
  `showcase:publish` écrit le fichier ; l'**écart** (liaisons ajoutées/retirées)
  se relit dans la revue avant fusion. La branche principale doit être protégée :
  qui modifie `src/content/showcase.json` publie.
- **Trancher la précision des bases de transporteurs** (position d'un siège à
  ≈ 1 km ou au centre de la ville) : PROTECTION.md.
- **Sources candidates relevées dans l'audit** (à traiter *dans* la base privée,
  jamais depuis le site) : miroir Modal4ward (`/api/v1/catalog/sync/state`,
  `/api/v1/map/network`) ; référentiel rail/fluvial embarqué (717 points, 3 764
  services à la date de l'export du 07/08/2026) ; 111 bornes poids lourds
  (ENGIE, Milence). **Aucun de ces effectifs ne doit être publié avant
  validation** ; les variables privilégiées du portail (`MODAL4WARD_API_KEY`,
  `CONNECT4WARD_PROVISION_SECRET`, `INTERNAL_API_SECRET`,
  `CARRIERBRIDGE_PUBLISH_KEY`, `ROADBRIDGE_API_KEY`) ne doivent **jamais** être
  utilisées par le site. Licences : le réseau fluvial EURIS est sous licence
  Zenodo « research purposes only » à clarifier avant tout usage commercial ; ne
  pas publier d'extraits tiers périmés (FVL 2014).
- **En attendant** : vitrine d'exemple (`demo`), signalée à l'écran et dans la
  liste ; le build de production la refuse (PROTECTION.md).

## 2. Exploration détaillée authentifiée — **hors de ce site**

Il n'y en a plus ici : le globe est une animation, pas un outil de recherche. Si
une exploration par compte est souhaitée, elle se construit dans le portail
(les API du portail exigent un JWT de compte et le contexte d'une organisation).

## 3. Formulaire de contact

`RESEND_API_KEY`, `CONTACT_EMAIL_TO` (à défaut `DIAGNOSTIC_EMAIL_TO`),
`CONTACT_EMAIL_FROM` (à défaut `DIAGNOSTIC_EMAIL_FROM`, domaine vérifié chez
Resend). Sans eux, la route répond 503 et le formulaire dit qu'il n'est pas
raccordé — il n'annonce jamais « envoyé ». Cinq envois par dix minutes et par
adresse ; champ piège anti-robot.

## 4. Adresses et environnement

- `NEXT_PUBLIC_SITE_URL` : racine des URL absolues (canoniques, Open Graph, sitemap).
- `NEXT_PUBLIC_SITE_ENV=production` : **seul** ce réglage (ou `CONTEXT=production`
  chez Netlify) rend le site indexable ; sinon `noindex` et `robots.txt`
  `Disallow: /`. Il active aussi le refus d'une vitrine `demo` au build.
- `NEXT_PUBLIC_PORTAL_URL` : URL du portail. **À confirmer** : le dépôt ne la
  contient pas, la valeur par défaut `https://app.pool4ward.com` est une hypothèse.

## 5. Contenus à fournir

- **Partenariat CERMICS** : l'audit du code n'y trouve **aucune mention**. Le site
  v1 affichait deux formulations qui ne se recoupent pas (« projet de recherche
  incubé au laboratoire CERMICS » et « brique algorithmique développée en
  partenariat avec le CERMICS »). Faute de pièce vérifiable, la version 2 **ne
  l'affiche pas**. À fournir : nature exacte (incubation, convention, thèse…),
  périmètre (quels algorithmes), dates, formulation validée par l'École.
- **Pages légales** (mentions, confidentialité, conditions) : absentes de la v1
  (liens `#`) ; non inventées ici.
- **Comparaison des offres / suite des contrats** : voir CAPABILITIES.md.
- **Périmètre commercial par module** : voir CAPABILITIES.md.

## 6. Identification du client (formulaire de contact)

La limite par adresse ne lit qu'un en-tête que l'hébergeur garantit :
`CLIENT_IP_HEADER` (par exemple `cf-connecting-ip`), à défaut
`x-nf-client-connection-ip` sur Netlify (variable `NETLIFY`), à défaut le dernier
maillon de `X-Forwarded-For`. Si aucun n'est fiable, tout le monde partage un
compteur : plus strict, jamais plus faible. **À régler selon l'hébergement réel.**
Le compteur est en mémoire d'instance : sur du serverless, c'est une barrière
de bon sens, pas une limite globale. Un stockage partagé est prévu mais
facultatif (`RATE_LIMIT_REDIS_URL`, `RATE_LIMIT_REDIS_TOKEN`, API REST Upstash
ou compatible) : **non éprouvé sur un service réel**, testé avec un faux
uniquement.

## 7. Cookies et traceurs

Le site pose **un seul cookie**, fonctionnel, et aucun outil de mesure d'audience :
`NEXT_LOCALE` (langue choisie, posé par `next-intl`).

Dans le navigateur, ni `localStorage`, ni IndexedDB, ni cache de service worker ;
seule la scène de couverture écrit un indicateur dans `sessionStorage`
(`p4w-cover-seen`) pour ne jouer son mouvement qu'une fois par session.
À faire valider par le responsable de la protection des données avant publication.

## 8. Prévisualisation séparée

Voir DEPLOY.md : les déploiements de la pull request sont actifs (Netlify).
