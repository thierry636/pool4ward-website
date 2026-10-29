# Hébergement, prévisualisation et mise en ligne

## Netlify ou Railway ?

**Gardez Netlify pour le site.** Avec une vitrine statique (PROTECTION.md), le site
n'a ni base de données ni secret côté serveur : ce sont des pages statiques servies
par un CDN, plus une seule fonction (le formulaire de contact).

| Brique | Où | Pourquoi |
|---|---|---|
| Site public (ce dépôt) | **Netlify** | déjà branché, déploiements par pull request, CDN ; rien à exploiter |
| Base de données + édition superadmin + export | **application privée séparée**, sur Railway (Postgres) si vos autres applications y sont déjà | la base ne doit jamais être joignable depuis le site |
| Publication | export → pull request → build Netlify | un geste humain, un écart relu |

**Quand déplacer le site sur Railway ?** Seulement si le site devait lire la base
en direct (ce que ce modèle évite exprès : la base serait alors à portée du
site) ou s'il fallait un serveur Node persistant. Le code est un Next.js standard
(`next build` puis `next start`) sans dépendance à Netlify : le déplacement
resterait possible, mais il faudrait remettre un CDN et des en-têtes de cache
devant.

## Prévisualisation (séparée de la production)

La production reste sur `main`. Chaque pull request produit un déploiement de
prévisualisation (`https://deploy-preview-<n>--<site>.netlify.app`) ; les
*branch deploys* (`https://version2--<site>.netlify.app`) s'activent dans Site
configuration → Build & deploy → Branches.

- `netlify.toml` fixe la commande de build, Node 20 et les en-têtes de cache des
  fichiers statiques ; le plugin Next.js de Netlify est détecté automatiquement.
- Variables (voir INTEGRATIONS.md) : aucune n'est requise pour que la
  prévisualisation fonctionne — la vitrine est un exemple signalé comme tel, le
  formulaire répond « non raccordé » tant que Resend n'est pas configuré.
- **Indexation** : une prévisualisation ne porte jamais `NEXT_PUBLIC_SITE_ENV=production` ;
  elle émet `noindex` et un `robots.txt` qui interdit tout.
- Sur un poste, `npm run build && npm start` sert exactement le même rendu.

## Publier la vitrine

```bash
npm run showcase:publish -- --from export.json --mode curated --date 2026-11-02
# affiche : sites, liaisons, opérateurs nommés, liaisons ajoutées / retirées
git add src/content/showcase.json public/images/globe-poster.svg
```

Régénérer le visuel de l'accueil (`node scripts/build-globe-poster.mjs`), ouvrir la
pull request, relire l'écart, fusionner : Netlify reconstruit. `npm run showcase:check`
vérifie le fichier (c'est aussi le `prebuild`).

## Passage sur le domaine public (décision distincte)

À faire dans cet ordre, une fois la décision prise :

1. Raccordements nécessaires (INTEGRATIONS.md) : au minimum la **vitrine publiée**
   (`curated`), le formulaire de contact, l'URL du portail, les pages légales, la
   validation du partenariat CERMICS.
2. `NEXT_PUBLIC_SITE_URL=https://pool4ward.com`, `NEXT_PUBLIC_SITE_ENV=production`.
   Le build **refuse** alors une vitrine `demo`.
3. Redirections : déjà dans `next.config.mjs` (308, permanentes), pour `/fr` et
   `/en` — voir le tableau `redirectionsV1`. `/products` → `/solutions` ;
   `design4ward` et `compute4ward` → `/solutions/transport-engineering` ;
   `modal4ward` → `/solutions/carrier-search` ; `connect4ward` →
   `/solutions/contract-management` ; `cobuild4ward` et `/platform` →
   `/approach` ; `/ecosystem` → `/datasets` ; `/resources` → `/blog` ; les trois
   anciennes pages de solution → `/solutions/transport-engineering`, et
   `collaborative-transport` → `/approach`. En v1, seuls `/`, `/blog` et
   `/diagnostic` répondaient sans préfixe de langue : les autres adresses sans
   préfixe n'ont jamais existé et ne sont pas redirigées. Le résultat est
   rejoué dans VERIFICATION.md.
4. Le diagnostic de campagne (`/diagnostic` → `/fr/diagnostic`) est inchangé.
5. Rejouer VERIFICATION.md sur l'environnement final.

## Retour arrière

Rien n'est modifié sur `main`. Pour revenir : ne pas fusionner `version2`, ou
revenir au commit précédent de la branche de production. Une vitrine publiée par
erreur se retire en revenant au commit précédent de `src/content/showcase.json`.
