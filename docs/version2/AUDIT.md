# Audit du dépôt et des accès

Réalisé au début de la mission, avant toute modification.

## Le dépôt `thierry636/pool4ward-website`

- Next.js 14.2.35 (App Router), React 18, TypeScript, Tailwind 3.4, `next-intl`
  4.8 (locales `fr`/`en`, défaut `en`), vitest. Pas de CI utile (le workflow
  `.github/workflows/blank.yml` est le gabarit GitHub).
- Hébergement : Netlify (le code l'évoque dans
  `src/app/api/diagnostic/contact/route.ts`, et une branche `deploy-netlify`
  existe) ; aucun `netlify.toml` n'existait. Confirmé ensuite par les contrôles de
  déploiement de la pull request (Netlify, sites `p4wname` et `pool4wardv2`).
- Contenu existant conservé : le diagnostic de campagne (`/diagnostic`, 7 questions,
  envoi via Resend), le moteur de blog markdown (`src/lib/blog`) et ses deux
  articles (FR/EN), le sigma de la marque.
- Constats sur la version 1, non repris :
  - le formulaire de la page Entreprise n'avait **aucun gestionnaire d'envoi** ;
  - la page Ressources présentait des « études de cas » et des chiffres
    (10–25 %, 15–25 %, 25–40 %, 2–3×) sans source ni client identifié ;
  - Cobuild4ward y était présenté comme un produit.
- Aucun fichier `CLAUDE.md`, `AGENTS.md` ni consigne de contribution dans ce dépôt.

## Accès

| Ressource | Résultat |
|---|---|
| Push `thierry636/pool4ward-website` | **OK** : la branche `version2` a été créée depuis `main` (1673069) et poussée avec `git`. Elle n'existait pas auparavant. |
| Connecteur GitHub (écriture) | Non utilisé pour écrire : la création de branche s'est faite par `git`. Le 403 « Resource not accessible by integration » d'une tentative précédente n'a donc pas été rejoué ni diagnostiqué. |
| `Roadbridge-co/pool4ward`, `pool4ward---portal`, `P4W---Connect4ward` | Lecture seule, **OK** (clones superficiels, aucun fichier modifié). |
| Autres dépôts de l'organisation (`carrier-bridge`, `pricing`, `modal4ward`, `pool4ward-algo`…) | Visibles dans la liste des dépôts, **non consultés** : hors du périmètre demandé. Ils pourraient contenir la comparaison des offres et la suite du suivi des contrats (voir CAPABILITIES.md). |
| Hébergeur (Netlify), Resend, DNS | Aucun accès : rien n'a été déployé ni configuré. |

## Constats de sécurité hors périmètre du site

Relevés dans les dépôts consultés ; aucune valeur n'est reproduite ici.

- Identifiants de démonstration avec mot de passe dans le `README.md` du portail.
- URL de connexion Postgres d'exemple ou de test dans des `.env.example`, specs,
  `docker-compose.yml` et workflows CI des trois dépôts.
- URL d'infrastructure Modal4ward codée en dur dans le code du portail et dans un
  README du dépôt `pool4ward`.

À examiner côté équipe produit ; le site public n'en dépend en rien.
