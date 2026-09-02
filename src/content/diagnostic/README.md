# Diagnostic « Indice de Productivité Transport »

Implémentation de `spec-diagnostic-ipt.md`, servie sur `/diagnostic`
(redirigé vers `/fr/diagnostic` — v1 française uniquement).

## Découpage

| Rôle | Emplacement |
|---|---|
| Banque de questions et barème | `src/content/diagnostic/questions.ts` |
| Seuils, routage, phrases de sortie | `src/content/diagnostic/scoring.ts` |
| Règles de leviers | `src/content/diagnostic/levers.ts` |
| Destinations des CTA | `src/content/diagnostic/destinations.ts` |
| Copy (objet i18n) | `src/content/diagnostic/copy.fr.ts` |
| Contrat de la copy | `src/content/diagnostic/copy-types.ts` |
| Types | `src/lib/diagnostic/types.ts` |
| Évaluateur de conditions | `src/lib/diagnostic/conditions.ts` |
| Moteur (branchement, indice, leviers) | `src/lib/diagnostic/engine.ts` |
| Enregistrement et télémétrie | `src/lib/diagnostic/record.ts`, `telemetry.ts` |
| Interface | `src/components/diagnostic/` |

Le moteur ne contient ni barème ni libellé ; les composants ne contiennent
aucune chaîne affichable. Les deux règles sont vérifiées par les tests
(`npm test`).

## Deux branches

Le diagnostic ne connaît que deux typologies de flux :

| Flux classé n°1 | Questions servies | Sortie |
|---|---|---|
| `messagerie` — messagerie **et** lots partiels | M1 à M6 (M2 sautée si prestataire unique) | RDV direct |
| `complets` — camions complets | C1 à C4 puis G1 | Demande de flux |

Messagerie et lots partiels partagent une carte, un jeu de questions, un
verdict et une sortie : les deux se vendent de la même façon. L'identifiant
du flux reste `messagerie` parce que ce sont bien les questions M1 à M6 qui
sont servies ; seul le libellé couvre les deux.

## Ajouter une question

1. Ajouter l'entrée dans `BRANCH_QUESTIONS` (ou `GLOBAL_QUESTIONS`), avec ses
   options et leurs points. Une condition de service facultative se déclare
   dans `when`.
2. Ajouter son libellé et ceux de ses options dans `copy.fr.ts`.

Le moteur n'a pas à être touché : le test de couverture de la copy signalera
tout libellé manquant.

## Barème messagerie : binaire

Chaque question vaut **25 si elle est OK**, **10 si elle signale un point
d'amélioration**. Jamais zéro : un chargeur en difficulté sur tout lit 40/100,
pas 10/100.

| Question | OK | Point d'amélioration |
|---|---|---|
| M1 prestataires | 2 et plus | un seul, ou nombre inconnu |
| M2 attribution | comparaison systématique | un prestataire par zone |
| M3 révision tarifaire | moins de 12 mois | au-delà, ou jamais |
| M4 comparaison des grilles | oui, ou parfois | non |
| M5 transporteurs consultés | 3 et plus | moins de 3 |
| M6 nouveaux entrants | au moins un | aucun |

Un point d'amélioration coûte dix points d'indice, et rien d'autre. Les
leviers affichés sont exactement les points d'amélioration, plafonnés à trois
et pris dans l'ordre de priorité de `LEVER_RULES`. Un test vérifie cet
invariant sur les 1 536 parcours possibles.

Les seuils de niveau sont calés sur le NOMBRE de points d'amélioration, pas
sur des bornes rondes : sans quoi trois points donneraient « piloté » à six
questions servies et « subi » à cinq.

| Points d'amélioration | Indice | Niveau |
|---|---|---|
| 0 | 100 | Plan optimisé en interne |
| 1 | 90 ou 88 | Plan optimisé en interne |
| 2 | 80 ou 76 | Plan piloté, gisement non ouvert |
| 3 et plus | 70 et moins | Plan subi |

## Changer le barème

Modifier les points dans `questions.ts` et les seuils dans `scoring.ts`.
`points`, `max_servi` et `indice` sont stockés séparément dans
l'enregistrement : les réponses brutes permettent de recalculer l'historique
après un changement de barème.

## Ouvrir la version anglaise

Dupliquer `copy.fr.ts` en `copy.en.ts` et l'enregistrer dans
`DIAGNOSTIC_COPY` (`copy.ts`). Le type `DiagnosticCopy` refuse une traduction
incomplète. Retirer alors la redirection forcée vers `/fr` dans
`next.config.mjs`.

## Variables d'environnement

Toutes facultatives ; sans elles le parcours fonctionne et retombe sur le
formulaire de contact du site.

| Variable | Effet |
|---|---|
| `NEXT_PUBLIC_DIAGNOSTIC_BOOKING_URL` | Lien « Réserver un créneau » |
| `NEXT_PUBLIC_DIAGNOSTIC_FLOWS_EMAIL` | Adresse de réception des fichiers de flux |
| `NEXT_PUBLIC_DIAGNOSTIC_ENDPOINT` | Collecte des enregistrements (POST JSON) |

## À arbitrer avant mise en ligne

- **Discours cross-dock** : la variante de sortie « on regarde si un schéma
  cross-dock tient chez vous » a disparu avec la branche lots partiels. Les
  deux typologies partagent désormais le discours messagerie — rapprochement
  des grilles. Le mécanisme `outcomeByBranch` reste en place pour la rétablir.
- **Verdicts** : ceux de la branche fusionnée sont écrits pour la messagerie
  (grilles, structure tarifaire). Ils s'appliquent tels quels aux lots
  partiels, ce qui est à relire.
- **Sortie B** : la mention de l'accord de confidentialité engage Pool4ward
  (`copy.fr.ts` → `outcomes.flux.note`). Aucun délai de retour n'est annoncé
  dans la copy livrée ; ne pas en ajouter un que l'équipe ne tient pas.
- **Rapport détaillé** : si le PDF n'est pas prêt, remplacer `lead.title` par
  « Recevez votre indice et vos leviers par email » et envoyer un email
  reprenant l'écran de résultat.
- **Destinations des CTA** : les deux sorties pointent vers `/company#contact`
  tant que les variables ci-dessus ne sont pas définies.
- **Benchmark** : emplacement réservé sur l'écran de résultat,
  `BENCHMARK_ENABLED` à basculer au-delà de cinquante répondants par branche.
