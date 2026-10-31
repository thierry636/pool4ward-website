# Les cinq capacités : ce qui est vérifié

La direction a confirmé que les cinq capacités sont disponibles. Le site les
présente toutes, mais **ne promet de fonction précise que si elle a été lue dans
le code**. Source : lecture des dépôts `Roadbridge-co/pool4ward`
(`8a9332d`), `pool4ward---portal` (`da02347`) et `P4W---Connect4ward`
(`701e513`), à la date du 27/10/2026. Les dépôts `carrier-bridge`, `pricing`,
`modal4ward` et `pool4ward-algo` n'ont pas été lus.

| Capacité | Statut dans le code lu | Ce que le site affirme |
|---|---|---|
| **Ingénierie transport** | Présente (Design4ward) | Études de flux entre sites : cross-dock, report vers rail/fluvial/maritime, boucles, tournées, consolidation longue distance, électrification ; prise en compte des équipements, des temps de conduite (CE 561/2006), de l'énergie et des contrats en cours ; scénarios comparés à une référence établie sur les flux du client. |
| **Préparation des appels d'offres** | Présente (Move to Tender) | Assistant en plusieurs étapes (flux, lignes par maille postale/zone/région, grilles à tranches, clause carburant, prestations annexes, test de scénario) ; dossier tableur protégé avec aperçu ; publication de zones et de modèles de grille dans CarrierBridge. |
| **Recherche de transporteurs** | **Partielle** | Sélection d'opérateurs intermodaux classés par corridor (catalogue Modal4ward) ; rapprochement avec les transporteurs actuels du chargeur. **Pas** de recherche de transporteurs routiers, pas de chiffres de transporteurs. |
| **Comparaison des offres** | **Non vérifiable dans ces dépôts** | Seule la **méthode** est décrite (même périmètre, mêmes hypothèses, avant tout prix). Aucune application n'est citée sur la page. |
| **Gestion des contrats** | **Minimale** | Registre (code, dates, transporteur, pièces jointes, affectation en masse aux liaisons) ; lecture dans l'outil d'ingénierie (liaisons couvertes signalées, fins de contrat d'une consultation relevées). **Pas** de prix contractuels, de suivi de service, d'indexation ni d'alertes d'échéance. |

## Preuves (chemins dans les dépôts)

- **Ingénierie** : `pool4ward/apps/backend/src/engineering`, `flux-loop/`
  (Move2Rail, Barge, ShortSea, Multimodal, Loop, Launch ; moteurs A*/Yen,
  bouclage MIP HiGHS-WASM), `regional-milkrun/`, `dynamic-milkrun/`,
  `longhaul-consolidation/`, `platform-network/`, `mutualisation-cascade/`.
  Squelettes : groupage PlanBuild/Conception réseau, Bouclage/Groupage Allocate
  (`flux-loop/ALGOS.md`) ; Dynamic Milk Run éprouvé sur jeux synthétiques seulement.
- **Appels d'offres** : `achat-performance/tender/`,
  `frontend/src/pages/achat/tender/`, `move2rail/sourcing/bid*.ts`. Absent :
  envoi aux transporteurs, portail de réponse.
- **Transporteurs** : `move2rail/sourcing/operator-search.ts` ; agent `carriers`
  du portail (interface archivée, non routée) dans `agents/sourcing/*`.
- **Comparaison** : aucun modèle ne stocke un prix reçu
  (`AchatTenderPricingGrid`/`Bracket` = structure ; `ProjectBidder.statut` = suivi
  manuel). `rfq-answer.md` : « rien n'est construit ». Le rangement des offres se
  ferait dans CarrierBridge — **non lu**.
- **Contrats** : `p4w---connect4ward/apps/backend/src/design4ward/tables/contracts/`
  (5 champs), `contract_leg`, miroir en lecture seule dans Design4ward, relevé des
  fins de contrat d'un bid (`pack-contracts.ts`). Le CRUD natif `api/contrats` n'a
  aucun appelant frontend.

## À ne pas écrire tant que ce n'est pas vérifié

Comparaison/dépouillement des offres comme fonction logicielle ; gestion complète
des contrats ; recherche de transporteurs « partout en Europe » ou chiffres de
transporteurs ; euros ou CO₂ garantis ; « optimal » ; « temps réel » ; couverture
européenne complète ; parkings sécurisés ; essai anonyme ; promesses de
confidentialité de l'IA ; **modules fermés par défaut présentés comme inclus**
(22 droits de module, 4 ouverts par défaut : Cartographie, Flux, Mes optimisations
intermodales, agent expert — le reste est vendu à part).

## Deux points qui engagent une décision

1. **Comparaison des offres et suite du suivi des contrats** : si ces fonctions
   existent (par exemple dans CarrierBridge), fournir l'accès au dépôt ou la liste
   des fonctions, pour que les pages `offer-comparison` et `contract-management`
   les décrivent précisément et citent l'application.
2. **Périmètre commercial par module** : confirmer ce qui est inclus ou vendu à
   part avant de laisser les pages d'ingénierie lister, par exemple,
   l'électrification ou le bouclage.

## Les créneaux de quai

Le produit ne modélise pas de créneaux de quai ni de rendez-vous (la table
`booking` n'existe que dans Connect4ward, sans moteur qui l'utilise). L'exemple
d'arbitrage du parcours (changer le créneau de l'entrepôt Est) est un **cas
d'étude** : le site dit que les fenêtres « se relèvent avec vous » et entrent dans
l'analyse de faisabilité ; il ne prétend pas qu'un logiciel les calcule.

## Noms d'applications

Design4ward (cockpit du chargeur), Compute4ward (modèle de coût et d'émissions),
Modal4ward (catalogue multimodal et assistant), Connect4ward (ingestion, jeux
partagés, registre de contrats), CarrierBridge (grilles tarifaires, indices
d'énergie). « Buy4ward » est un ancien nom ; « Cobuild4ward » n'est pas une
application (le portail la supprime même à chaque déploiement) : **aucun des deux
n'apparaît** sur le site.
