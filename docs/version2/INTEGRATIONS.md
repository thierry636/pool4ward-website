# Raccordements restants (liste exacte)

Rien ci-dessous n'est déclaré raccordé. Chaque ligne dit ce qui manque, ce qui est
prêt côté site, et ce que fait le site en l'attendant.

## 1. Backend de projection des référentiels — **à construire côté Pool4ward**

- **Variables** : `PROJECTION_BACKEND_URL`, `PROJECTION_BACKEND_TOKEN` (jeton
  dédié au site, lecture seule).
- **Contrat** (strict ; toute clé inconnue, maille non conforme, valeur hors
  bornes ou cellule à plus de trois valeurs fait rejeter la réponse) :
  `GET /v1/aggregates/{layer}` → `{ layer, cellDeg, asOf, cells: [[row,col,count],…] }` ;
  `GET /v1/corridors` → `{ corridors: [[[lon,lat],…],…] }` (≤ 200 lignes de 64
  points ; arrondis à 0,5° par le site).
- **Prêt côté site** : `HttpAggregateSource` (validation, cache 10 min, repli sur la
  dernière réponse valide jusqu'à 1 h), tests dans `source.test.ts`.
- **En attendant** : source de démonstration, signalée partout comme telle.
- **Sources candidates relevées dans l'audit** (à traiter *dans* le backend, jamais
  depuis le site) : miroir Modal4ward (`/api/v1/catalog/sync/state`,
  `/api/v1/map/network`, avec une clé de profil `external` dédiée) ;
  référentiel rail/fluvial embarqué (717 points, 3 764 services à la date de
  l'export du 07/08/2026) ; 111 bornes poids lourds (ENGIE, Milence). **Aucun
  de ces effectifs ne doit être publié avant validation** ; les variables
  privilégiées du portail (`MODAL4WARD_API_KEY`, `CONNECT4WARD_PROVISION_SECRET`,
  `INTERNAL_API_SECRET`, `CARRIERBRIDGE_PUBLISH_KEY`, `ROADBRIDGE_API_KEY`) ne
  doivent **jamais** être utilisées par le site.
- **Sans source** : parkings sécurisés (aucun référentiel trouvé) ; réseau
  ferroviaire (aucun graphe trouvé).

## 2. Secret de session et stockage des quotas

- `GLOBE_SESSION_SECRET` : ≥ 32 caractères aléatoires. **Obligatoire** avec une
  source réelle.
- `RATE_LIMIT_REDIS_URL`, `RATE_LIMIT_REDIS_TOKEN` : stockage partagé (API REST
  Upstash ou compatible). Sans eux : mémoire d'instance.
- Règle de limitation et détection de bots côté hébergeur / pare-feu (voir
  PROTECTION.md).

## 3. Exploration détaillée authentifiée

Aucun mécanisme d'autorisation par organisation n'est exploitable depuis un site
public : les API du portail exigent un JWT de compte et le contexte d'une
organisation. À définir : un `Authorizer` (`src/server/projection/explore.ts`) et un
backend d'exploration bornés par organisation. La route répond 401 / 501.

## 4. Formulaire de contact

`RESEND_API_KEY`, `CONTACT_EMAIL_TO` (à défaut `DIAGNOSTIC_EMAIL_TO`),
`CONTACT_EMAIL_FROM` (à défaut `DIAGNOSTIC_EMAIL_FROM`, domaine vérifié chez
Resend). Sans eux, la route répond 503 et le formulaire dit qu'il n'est pas
raccordé — il n'annonce jamais « envoyé ». Cinq envois par dix minutes et par
adresse ; champ piège anti-robot.

## 5. Adresses et environnement

- `NEXT_PUBLIC_SITE_URL` : racine des URL absolues (canoniques, Open Graph, sitemap).
- `NEXT_PUBLIC_SITE_ENV=production` : **seul** ce réglage (ou `CONTEXT=production`
  chez Netlify) rend le site indexable ; sinon `noindex` et `robots.txt`
  `Disallow: /`.
- `NEXT_PUBLIC_PORTAL_URL` : URL du portail. **À confirmer** : le dépôt ne la
  contient pas, la valeur par défaut `https://app.pool4ward.com` est une hypothèse.

## 6. Contenus à fournir

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

## 7. Cookies et traceurs

Le site ne pose qu'un cookie, fonctionnel : `p4w_gs` (session du globe, 30 min,
HttpOnly), uniquement quand le globe est ouvert. Aucun outil de mesure d'audience.
À faire valider par le responsable de la protection des données avant publication.

## 8. Prévisualisation séparée

Voir DEPLOY.md : activer les déploiements de branche `version2` chez l'hébergeur.

## 9. Identification du client pour les quotas

Les quotas par adresse ne lisent qu'un en-tête que l'hébergeur garantit :
`CLIENT_IP_HEADER` (par exemple `cf-connecting-ip`), à défaut
`x-nf-client-connection-ip` sur Netlify, à défaut le dernier maillon de
`X-Forwarded-For`. Si aucun n'est fiable, tout le monde partage un compteur
(« inconnue ») : plus strict, jamais plus faible. **À régler selon l'hébergement
réel**, sans quoi les quotas par adresse sont soit trop larges, soit communs.
