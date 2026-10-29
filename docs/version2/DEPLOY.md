# Prévisualisation et mise en ligne

## Prévisualisation (séparée de la production)

La production reste sur `main`. La version 2 se prévisualise à part :

- **Netlify** (hébergement probable, non vérifié) : activer les *branch deploys*
  pour `version2` dans les réglages du site (Site configuration → Build & deploy →
  Branches). L'URL de prévisualisation est alors `https://version2--<site>.netlify.app`.
  `netlify.toml` fixe la commande de build et Node 20 ; le plugin Next.js de Netlify
  est détecté automatiquement.
- Variables (voir INTEGRATIONS.md) : aucune n'est requise pour que la
  prévisualisation fonctionne — le globe tourne sur la démonstration, le formulaire
  répond « non raccordé » tant que Resend n'est pas configuré.
- **Indexation** : une prévisualisation ne porte jamais `NEXT_PUBLIC_SITE_ENV=production` ;
  elle émet `noindex` et un `robots.txt` qui interdit tout.
- Sur ce poste, `npm run build && npm start` sert exactement le même rendu.

> Je n'ai ni accès à l'hébergeur ni de jeton : **aucune prévisualisation en ligne
> n'a été créée** par cette livraison. Le build de production est vérifié ; voir
> VERIFICATION.md.

## Passage sur le domaine public (décision distincte)

À faire dans cet ordre, une fois la décision prise :

1. Raccordements nécessaires (INTEGRATIONS.md) : au minimum formulaire de contact,
   URL du portail, pages légales, validation du partenariat CERMICS.
2. `NEXT_PUBLIC_SITE_URL=https://pool4ward.com`, `NEXT_PUBLIC_SITE_ENV=production`.
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
revenir au commit précédent de la branche de production.
