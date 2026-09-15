# Articles du blog

Un article = un fichier `.md` dans `fr/` ou `en/`. Déposer le fichier suffit à
le publier : aucune liste n'est tenue ailleurs dans le code.

## Front-matter

```yaml
---
title: "Qui a décidé d'externaliser votre transport ?"
kicker: "Make or buy à l'heure de l'électrification"   # facultatif
slug: "make-or-buy-transport"
description: "Une phrase, reprise sur la carte d'index et en meta description."
date: 2026-09-15          # YYYY-MM-DD, sert au tri et à datePublished
readingTime: 3            # en minutes, jamais calculé — on l'écrit
category: "Stratégie transport"
tags: ["make or buy", "électrification"]
order: 1                  # croissant, départage deux articles de même date
---
```

Tout est obligatoire sauf `kicker` : un champ manquant arrête le build plutôt
que de publier un article amputé. Le `slug` fait l'URL, `/fr/blog/<slug>`, et
doit être **identique dans les deux langues** — le sélecteur de langue rejoue
le même chemin, un slug traduit ferait un 404.

Le blog est masqué tant que `BLOG_MASQUE` vaut `true` dans
`src/lib/blog/config.ts` : les pages répondent, mais ne sont ni indexées ni
liées depuis la navigation.

## Blocs éditoriaux

| Dans le `.md` | Rendu |
|---|---|
| `<figure class="p4w-figure">…</figure>` | Figure : titre, sous-titre mono, SVG qui défile, légende |
| `<!-- COMPONENT: liste numérotée … -->` puis des `**01 — Titre**` | Liste numérotée |
| `<!-- COMPONENT: trois colonnes … -->` puis des `**01 — Titre**` | Grille de trois colonnes |
| `::: note` … `:::` | Encadré discret, filet gris |
| citation `>` contenant une liste `1.` | Encadré « questions », filet accent |
| `::: cta` … `:::` | Bloc d'appel à l'action |

Les marqueurs `COMPONENT` sont reconnus en français comme en anglais
(`numbered list`, `three columns`). Dans un bloc `::: cta`, écrire le lien
`[…](/contact)` : il est réécrit vers la vraie page de contact du site.

Les SVG sont passés au navigateur tels quels et doivent n'utiliser que les
variables de thème — `--accent`, `--ink`, `--ink-2`, `--muted`, `--rule`,
`--rule-soft`, `--surface`, `--accent-band`, `--font-mono` — jamais une
couleur en dur : c'est ce qui les rend lisibles en clair comme en sombre.

La typographie française (insécables) est appliquée au rendu, pas dans les
fichiers : écrire `mot :` normalement, au clavier.
