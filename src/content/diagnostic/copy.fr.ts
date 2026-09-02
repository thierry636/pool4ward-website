/**
 * Objet i18n — français. Version v1 du diagnostic.
 *
 * TOUTE la copy du parcours est ici. Aucun composant ne contient de chaîne
 * affichable : une version EN se fait en dupliquant ce fichier, sans toucher ni
 * au moteur ni à l'interface.
 *
 * Règle d'écriture des verdicts : aucun n'accuse le répondant, aucun n'affiche
 * de pourcentage d'économie. Un chiffre inventé se paie au premier rendez-vous.
 */

import type { DiagnosticCopy } from "./copy-types";

export const copyFr: DiagnosticCopy = {
  locale: "fr",

  meta: {
    title: "Diagnostic — Indice de Productivité Transport | Pool4ward",
    description:
      "Sept questions, deux minutes : situez la productivité de votre plan de transport et repartez avec trois leviers concrets. Aucune donnée de flux demandée.",
  },

  intro: {
    eyebrow: "Diagnostic",
    title: "Où en est la productivité de votre plan de transport ?",
    subtitle:
      "Le questionnaire s'adapte à vos flux : vous ne répondez qu'à ce qui vous concerne. Votre indice et vos trois leviers s'affichent immédiatement, sans email.",
    reassurance: [
      "7 questions, deux minutes",
      "Aucune donnée de flux demandée",
      "Résultat immédiat, sans email",
    ],
    cta: "Commencer le diagnostic",
  },

  progress: {
    label: "Question {current} sur {total}",
    ariaLabel: "Progression du diagnostic",
  },

  nav: {
    back: "Retour",
    next: "Continuer",
    seeResult: "Voir mon résultat",
    restart: "Recommencer le diagnostic",
    home: "Pool4ward — retour à l'accueil",
  },

  ranking: {
    title:
      "Vos envois, dans l'ordre : lequel pèse le plus dans votre budget transport ?",
    help: "Cliquez dans l'ordre d'importance. Laissez de côté ce qui ne vous concerne pas.",
    positionAria: "Classé n°{position}. Cliquez pour retirer du classement.",
    unselectedAria: "Non classé. Cliquez pour ajouter au classement.",
    hint: "Un seul type de flux suffit pour continuer.",
    concerned: "Concerné",
    notConcerned: "Pas concerné",
  },

  flows: {
    complets: {
      label: "Camions complets",
      hint: "Un chargement, une destination",
      indexLabel: "camions complets",
      alsoLabel: "du camion complet",
    },
    messagerie: {
      // Messagerie et lots partiels sont regroupés : même discours de vente,
      // même sortie. Seuls les camions complets font bande à part.
      label: "Messagerie et lots partiels",
      hint: "Colis, palettes, envois groupés",
      indexLabel: "messagerie et lots partiels",
      alsoLabel: "de la messagerie ou du lot partiel",
    },
  },

  questions: {
    /* ---------------------------------------------------------------- */
    /* Branche messagerie                                               */
    /* ---------------------------------------------------------------- */
    M1: {
      label: "Combien de prestataires messagerie travaillent pour vous ?",
      options: {
        unique: "Un seul, national",
        deux_cinq: "2 à 5",
        six_dix: "6 à 10",
        plus_dix: "Plus de 10",
        inconnu: "Je ne sais pas exactement",
      },
    },
    M2: {
      label: "Comment vos envois leur sont-ils attribués ?",
      options: {
        comparaison: "Comparaison systématique à chaque envoi",
        zone: "Un prestataire attitré par zone",
      },
    },
    M3: {
      label:
        "Quand vos grilles ont-elles été remises en compétition pour la dernière fois ?",
      options: {
        moins12mois: "Moins de 12 mois",
        un_trois_ans: "1 à 3 ans",
        plus3ans: "Plus de 3 ans",
        jamais: "Jamais, elles sont reconduites",
      },
    },
    M4: {
      label: "Êtes-vous en mesure de comparer deux grilles messagerie entre elles ?",
      help: "Tranches de poids, taxation réelle ou volumétrique, découpage de zones, ad valorem, surcharges.",
      options: {
        oui: "Oui",
        parfois: "Parfois",
        non: "Non",
      },
    },

    // ⚠️ Copy hors spécification : les deux questions sur les appels d'offres.
    M5: {
      label:
        "Combien de transporteurs invitez-vous à chaque appel d'offres messagerie ?",
      options: {
        plus_dix: "Plus de 10",
        six_dix: "6 à 10",
        trois_cinq: "3 à 5",
        moins_trois: "Moins de 3",
      },
    },
    M6: {
      label:
        "Parmi eux, combien n'avaient jamais été consultés jusque-là ?",
      help: "Un panel qui ne se renouvelle pas finit par négocier contre lui-même.",
      options: {
        plusieurs: "Plusieurs à chaque consultation",
        un_deux: "Un ou deux",
        rarement: "Rarement, le panel bouge peu",
        aucun: "Aucun, toujours les mêmes",
      },
    },

    /* ---------------------------------------------------------------- */
    /* Branche lots partiels                                            */
    /* ---------------------------------------------------------------- */

    /* ---------------------------------------------------------------- */
    /* Branche camions complets                                         */
    /* ---------------------------------------------------------------- */
    C1: {
      label: "Vos camions repartent-ils chargés ?",
      options: {
        boucles: "Bouclés, retour organisé",
        partiellement: "Partiellement",
        aller_simple: "Aller simple, le retour est le problème du transporteur",
        inconnu: "Je ne sais pas",
      },
    },
    C2: {
      label:
        "Avez-vous déjà construit une boucle avec un autre chargeur — votre retour étant son aller ?",
      options: {
        en_place: "Oui, en place",
        envisage: "Envisagé, jamais abouti",
        jamais: "Jamais regardé",
      },
    },
    C3: {
      label: "Vos flux complets sont-ils réguliers ?",
      options: {
        stable: "Volumes stables, fréquence fixe",
        saisonnier: "Saisonniers, mais prévisibles",
        aleatoire: "Aléatoires",
      },
    },
    C4: {
      label:
        "Sur vos corridors de plus de 500 km, quand avez-vous évalué le ferroviaire ou le fluvial ?",
      options: {
        moins24mois: "Moins de 24 mois",
        plus3ans: "Plus de 3 ans",
        ecarte_sans_etude: "Écarté sans étude chiffrée",
        jamais: "Jamais",
      },
    },

    /* ---------------------------------------------------------------- */
    /* Clôture                                                          */
    /* ---------------------------------------------------------------- */
    G1: {
      label: "Comment votre plan de transport actuel a-t-il été construit ?",
      options: {
        redesign:
          "Redesigné avec un outil d'optimisation depuis moins de 24 mois",
        "4pl": "Piloté par un 4PL ou un commissionnaire",
        ao_periodique: "Appel d'offres tous les 2–3 ans, sur le périmètre existant",
        reconduit: "Reconduit d'année en année",
      },
    },
  },

  result: {
    eyebrow: "Votre résultat",
    indexLabel: "Indice de productivité — flux {flow}",
    outOf: "sur 100",
    levelsTitle: "Niveau",
    leversTitle: "Vos leviers",
    // Le nombre de leviers dépend des réponses : annoncer « trois » quand un
    // seul s'affiche décrédibilise la restitution.
    leversTitleByCount: {
      "0": "Ce qu'il reste à ouvrir",
      "1": "Votre levier",
      "2": "Vos deux leviers",
      "3": "Vos trois leviers",
    },
    leversIntro: "Dans l'ordre de ce qui rapporte le plus, chez vous.",
    // ⚠️ Copy hors spécification : cas d'un répondant qui ne déclenche aucune
    // condition de levier. Rare, mais l'écran ne peut pas rester vide.
    leversEmpty:
      "Aucun angle mort ne ressort de vos réponses. Ce qu'il reste à ouvrir ne se lit pas dans un questionnaire — cela se regarde sur vos flux.",
    secondaryTitle: "Vous faites aussi {flow}.",
    secondaryEmpty: "On le regardera en rendez-vous.",
    otherFlows:
      "Vous nous avez indiqué faire aussi {flows} — on le regardera en rendez-vous.",
    benchmarkPlaceholder:
      "Le comparatif avec les autres chargeurs de votre profil s'ouvrira dès que la base sera suffisante.",
  },

  levels: {
    plan_subi: "Plan subi",
    plan_pilote: "Plan piloté, gisement non ouvert",
    plan_optimise: "Plan optimisé en interne",
  },

  verdicts: {
    messagerie: {
      plan_subi:
        "Vos grilles sont reconduites et personne ne les a rapprochées de vos flux réels. C'est le cas le plus fréquent, et le plus coûteux : la négociation porte sur des tarifs affichés qui ne décrivent pas ce que vous payez.",
      plan_pilote:
        "Vous mettez en compétition, mais sur des grilles que rien ne rend comparables. L'écart se trouve dans la structure tarifaire, pas dans le pourcentage de remise.",
      plan_optimise:
        "Vous maîtrisez votre achat messagerie. Ce qu'il reste à gagner ne se trouve plus dans la négociation, mais dans la façon dont vos envois sont préparés en amont.",
    },
    complets: {
      plan_subi:
        "Vos camions repartent à vide et le retour est traité comme le problème du transporteur. Il est facturé dans vos prix, simplement pas sur une ligne visible.",
      plan_pilote:
        "Vous bouclez une partie de vos flux. Ce qui n'a pas été ouvert se joue à l'extérieur de votre organisation : les retours à vide des uns sont les allers pleins des autres.",
      plan_optimise:
        "Vous avez fait le tour de ce qui s'optimise seul. Ce qui reste — triangulaires inter-chargeurs, report modal sur vos corridors longs — ne se trouve plus à l'intérieur de votre périmètre.",
    },
  },

  // Chaque levier se lit seul : un titre qui dit l'action, un corps qui dit
  // pourquoi, en termes concrets. Le répondant doit comprendre ce qu'on lui
  // propose sans avoir à relire la question qui l'a déclenché.
  levers: {
    grilles_comparables: {
      title: "Rendre vos grilles comparables avant de renégocier",
      body: "Deux grilles messagerie ne se comparent pas en l'état : tranches de poids, taxation réelle ou volumétrique, découpage de zones, ad valorem et surcharges diffèrent d'un transporteur à l'autre. Tant qu'elles ne sont pas ramenées sur vos envois réels, une remise annoncée ne se vérifie sur rien.",
    },
    remise_en_competition: {
      title: "Remettre vos grilles en compétition dans l'année",
      body: "Le marché messagerie bouge vite : capacités, surcharges gazole, réorganisation des réseaux. Au-delà de douze mois, l'écart entre votre grille et le marché n'est plus mesurable de l'intérieur — il faut rouvrir la consultation pour le voir.",
    },
    ouvrir_nouveaux_entrants: {
      title: "Faire entrer au moins un transporteur neuf à chaque consultation",
      body: "Vos prestataires actuels vous répondent depuis des années : ils connaissent votre niveau de prix et calibrent leur offre juste en dessous. Un transporteur qui ne l'a jamais vu chiffre sur ses propres coûts — c'est lui qui fait apparaître l'écart réel.",
    },
    elargir_panel: {
      title: "Consulter au moins cinq transporteurs",
      body: "En dessous de trois offres, le résultat dépend entièrement de qui vous avez invité. Élargir le panel ne coûte que l'envoi du dossier, et c'est la seule façon de savoir si votre prix actuel est bon ou seulement habituel.",
    },
    comparaison_systematique: {
      title: "Comparer à l'envoi plutôt qu'attribuer par zone",
      body: "Un prestataire attitré par zone prend tous les envois de sa zone, quels que soient le poids et la destination exacte. Or les grilles se croisent : le moins cher sur une zone ne l'est pas sur toutes les tranches de poids.",
    },
    prestataire_unique: {
      title: "Ouvrir votre plan à un deuxième transporteur",
      body: "Avec un prestataire unique, rien ne vous dit si votre grille est bonne : vous n'avez aucun point de comparaison. Un second transporteur, même sur une partie du flux, crée la référence qui manque.",
    },
    panel_inconnu: {
      title: "Commencer par recenser vos transporteurs",
      body: "Ne pas connaître le nombre de prestataires signifie généralement que les envois sont commandés site par site, ou service par service. Le premier gain est le recensement : il fait apparaître les doublons et les volumes qu'on peut regrouper.",
    },
    retours_vide: {
      title: "Chiffrer ce que vous coûtent les retours à vide",
      body: "Un camion qui rentre vide est payé par vous, mais sur aucune ligne visible : le transporteur l'intègre à son prix aller. Mettre un chiffre sur ces retours est le point de départ de toute discussion sur le bouclage.",
    },
    appariement_flux: {
      title: "Chercher le chargeur dont l'aller est votre retour",
      body: "Sur vos axes réguliers, il existe presque toujours une entreprise qui expédie dans le sens inverse. Mettre les deux plans de transport bout à bout supprime un trajet à vide pour chacun : c'est un travail d'appariement de flux, pas de négociation tarifaire.",
    },
    eligibilite_modale: {
      title: "Chiffrer le ferroviaire ou le fluvial sur vos corridors longs",
      body: "Vos flux sont réguliers, et c'est la régularité — bien plus que la distance — qui rend le report modal viable. L'évaluation, elle, n'a pas été refaite récemment : les conditions actuelles ne sont plus celles de votre dernier calcul.",
    },
    decision_modale_reprise: {
      title: "Reprendre la décision modale, chiffres à l'appui",
      body: "Le ferroviaire ou le fluvial ont été écartés sans étude chiffrée. Les prix routiers, les capacités et les offres combinées ont changé depuis : une décision prise sans calcul se rouvre sans avoir à se dédire.",
    },
    part_stable: {
      title: "Commencer par la part stable de vos flux",
      body: "Un flux décrit comme aléatoire contient presque toujours un socle régulier : les mêmes origines-destinations qui reviennent chaque mois. C'est sur ce socle que se construisent les boucles, pas sur la totalité du volume.",
    },
    reouverture_conception: {
      title: "Rouvrir la conception du plan, pas seulement les tarifs",
      body: "Un plan reconduit d'année en année a été conçu pour une organisation qui a changé depuis : sites, volumes, clients, délais. Renégocier les prix sur un schéma périmé fige ce schéma pour trois ans de plus.",
    },
  },

  outcomes: {
    rdv: {
      title: "On rapproche vos grilles sur vos flux réels.",
      body: "Un expert transport reprend vos grilles et vos volumes, les remet sur une base comparable, et vous montre l'écart. Quarante-cinq minutes, pas une démonstration d'outil.",
      cta: "Réserver un créneau",
      alternate: "Vous préférez qu'on parte de vos données ? Envoyez-nous vos flux →",
    },
    flux: {
      title: "Le bouclage ne se discute pas à vide.",
      body: "Boucles, triangulaires et report modal ne s'évaluent que sur une matrice origine-destination. Envoyez-nous un extrait de douze mois : on revient avec un chiffrage, et on le déroule ensemble en quarante-cinq minutes.",
      details: [
        "origine",
        "destination",
        "nombre d'envois sur 12 mois",
        "tonnage ou nombre de palettes",
        "régularité",
      ],
      note: "Un fichier plat, aucun accès à vos systèmes. Nous signons un accord de confidentialité avant tout échange si vous le souhaitez.",
      cta: "Envoyer mes flux",
      alternate: "Vous préférez commencer par en parler ? Réserver 30 minutes →",
    },
  },

  // ⚠️ La variante cross-dock de la sortie A' disparaît avec la branche lots
  // partiels : les deux typologies partagent désormais le discours messagerie.
  // Le mécanisme reste en place pour une future variante par branche.
  outcomeByBranch: {},

  outcomeNotes: {
    irregular_flows:
      "Même sur des flux irréguliers, la matrice fait apparaître la part stable : c'est par là qu'on commence.",
  },

  lead: {
    title: "Recevez votre diagnostic détaillé",
    subtitle:
      "Votre indice question par question, vos leviers développés, et le comparatif avec les autres chargeurs de votre profil.",
    email: {
      label: "Email professionnel",
      placeholder: "prenom.nom@societe.com",
    },
    societe: {
      label: "Société",
      placeholder: "Nom de votre société",
    },
    role: {
      label: "Rôle",
      placeholder: "Sélectionnez votre rôle",
      options: [
        { value: "achats", label: "Achats / approvisionnement" },
        { value: "exploitation", label: "Exploitation transport" },
        { value: "supply_chain", label: "Supply chain / logistique" },
        { value: "direction", label: "Direction" },
        { value: "autre", label: "Autre" },
      ],
    },
    perimetre: {
      label: "Périmètre dont vous avez la charge",
      placeholder: "Sélectionnez votre périmètre",
      options: [
        { value: "site", label: "Un site" },
        { value: "multi_sites", label: "Plusieurs sites" },
        { value: "region", label: "Une région ou un pays" },
        { value: "groupe", label: "Le groupe" },
      ],
    },
    budget: {
      label: "Budget transport annuel",
      placeholder: "Sélectionnez une tranche",
      options: [
        { value: "moins_1m", label: "< 1 M€" },
        { value: "1_5m", label: "1–5 M€" },
        { value: "5_20m", label: "5–20 M€" },
        { value: "plus_20m", label: "> 20 M€" },
        { value: "non_communique", label: "Je préfère ne pas répondre" },
      ],
    },
    optional: "facultatif",
    submit: "Recevoir mon diagnostic",
    submitting: "Envoi en cours…",
    success:
      "C'est noté. Votre diagnostic détaillé part par email dans les prochaines minutes.",
    privacy:
      "Vos réponses servent à préparer votre rendez-vous. Aucune donnée de flux ne vous a été demandée.",
    errors: {
      required: "Ce champ est nécessaire pour vous envoyer le rapport.",
      email: "Merci d'indiquer une adresse email professionnelle valide.",
    },
  },
};
