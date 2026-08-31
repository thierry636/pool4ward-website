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
    partiels: {
      label: "Lots partiels",
      hint: "Quelques palettes, groupage possible",
      indexLabel: "lots partiels",
      alsoLabel: "du lot partiel",
    },
    messagerie: {
      label: "Messagerie / colis",
      hint: "Envois unitaires, réseau de distribution",
      indexLabel: "messagerie",
      alsoLabel: "de la messagerie",
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
    P1: {
      label:
        "Vos lots partiels partent-ils tels quels, ou sont-ils regroupés avant départ ?",
      options: {
        regroupes: "Regroupés dès que c'est possible",
        opportuniste: "Quand ça tombe bien",
        chacun_seul: "Chacun part seul",
      },
    },
    P2: {
      label:
        "Combien de temps pouvez-vous retenir une expédition pour la regrouper avec une autre ?",
      options: {
        "48h": "48 heures ou plus",
        "24h": "24 heures",
        depend_client: "Ça dépend du client destinataire",
        aucun: "Aucun délai, départ le jour même",
      },
    },
    P3: {
      label: "Disposez-vous d'un point de massification sur vos axes principaux ?",
      options: {
        oui_utilise: "Oui, utilisé pour ça",
        prestataire: "Celui d'un prestataire",
        oui_pas_utilise: "Oui, mais pas utilisé pour ça",
        non: "Non",
      },
    },
    P4: {
      label: "Vos lots partiels sont-ils achetés dans le même cadre que vos complets ?",
      options: {
        meme_ao: "Même appel d'offres, mêmes contrats",
        separes: "Contrats séparés",
        spot: "Au coup par coup, au spot",
      },
    },

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
    leversTitle: "Vos trois leviers",
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
    partiels: {
      plan_subi:
        "Vos lots partiels partent seuls. C'est le poste où le coût à la tonne est le plus élevé de tout votre plan de transport, et c'est aussi celui où un schéma de massification change l'ordre de grandeur, pas le pourcentage.",
      plan_pilote:
        "Vous regroupez quand l'occasion se présente. Passer de l'opportunisme à un schéma organisé — axes, points de massification, fenêtres de départ — est un exercice de conception, pas de négociation.",
      plan_optimise:
        "Votre schéma de massification tient. La question suivante est de savoir avec qui vous pourriez le partager pour en remplir les creux.",
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

  levers: {
    grilles_comparables: {
      title: "Rendre vos grilles comparables avant de renégocier.",
      body: "Une remise sur une grille non normalisée ne se mesure pas.",
    },
    remise_en_competition: {
      title: "Remettre en compétition sur vos flux réels,",
      body: "pas sur un tarif de référence.",
    },
    // ⚠️ Copy hors spécification : leviers des questions M2, M5 et M6.
    ouvrir_nouveaux_entrants: {
      title: "Faire entrer des transporteurs neufs dans la consultation.",
      body: "Un panel qui ne se renouvelle pas connaît vos prix mieux que vous.",
    },
    elargir_panel: {
      title: "Élargir le panel consulté.",
      body: "En dessous de cinq offres, ce n'est plus une mise en concurrence, c'est une confirmation.",
    },
    comparaison_systematique: {
      title: "Comparer à l'envoi plutôt qu'attribuer par zone.",
      body: "Le découpage géographique fige l'attribution sur une carte, pas sur un prix.",
    },
    prestataire_unique: {
      title: "Un prestataire unique n'est pas d'abord un problème de prix,",
      body: "c'est une absence de référence.",
    },
    consolidation_volumes: {
      title: "Consolider les volumes.",
      body: "Éclatés, ils ne pèsent dans aucune négociation.",
    },
    regrouper_avant_negocier: {
      title: "Regrouper avant de négocier.",
      body: "Un appel d'offres lancé sur des envois isolés fige l'isolement pour trois ans.",
    },
    delai_matiere_premiere: {
      title: "Vous avez du délai",
      body: "— c'est la matière première d'un schéma cross-dock.",
    },
    verifier_exigence_client: {
      title:
        "Vérifier si le départ le jour même est une exigence client ou une habitude interne.",
      body: "La réponse diffère souvent selon le destinataire.",
    },
    actif_existant: {
      title: "L'actif existe déjà.",
      body: "Il reste à le placer sur le bon axe.",
    },
    massification_tiers: {
      title: "Évaluer un point de massification tiers",
      body: "avant d'envisager d'en construire un.",
    },
    partiels_dans_ao: {
      title: "Faire entrer les partiels dans le même appel d'offres que les complets.",
      body: "Deux cadres d'achat séparés produisent deux schémas séparés.",
    },
    retours_vide: {
      title: "Mesurer ce que vous payez pour des retours à vide.",
      body: "Ce n'est pas sur la facture, c'est dans le prix.",
    },
    appariement_flux: {
      title: "Chercher le chargeur dont l'aller est votre retour.",
      body: "C'est un travail d'appariement de flux, pas de négociation.",
    },
    eligibilite_modale: {
      title: "Vos flux sont éligibles au report modal ;",
      body: "l'évaluation, elle, ne l'a pas été.",
    },
    decision_modale_reprise: {
      title: "Une décision modale prise sans chiffrage se reprend.",
      body: "Les conditions de 2023 ne sont plus celles d'aujourd'hui.",
    },
    part_stable: {
      title: "Commencer par la part stable de vos flux.",
      body: "Un flux aléatoire dans sa globalité contient presque toujours un socle régulier.",
    },
    reouverture_conception: {
      title: "Rouvrir la conception du plan,",
      body: "pas seulement les tarifs.",
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

  outcomeByBranch: {
    partiels: {
      title: "On regarde si un schéma cross-dock tient chez vous.",
      body: "Vos axes, vos délais, vos points de massification existants. Un expert transport vous dit en quarante-cinq minutes si le schéma tient — et s'il ne tient pas, pourquoi.",
    },
  },

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
