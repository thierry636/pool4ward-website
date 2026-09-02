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
    title: "Lequel de vos flux pèse le plus dans votre budget transport ?",
    help: "Le questionnaire s'adapte à votre réponse : vous ne répondrez qu'à ce qui vous concerne.",
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
        un_seul: "Un seul",
        deux_plus: "Deux ou plus",
      },
    },
    M2: {
      label: "Les mettez-vous en concurrence à chaque envoi ?",
      help: "Comparer les prix envoi par envoi, plutôt que d'attribuer par habitude ou par zone.",
      options: {
        oui: "Oui, systématiquement",
        non: "Non",
      },
    },
    M3: {
      label: "Quand avez-vous lancé votre dernier appel d'offres messagerie ?",
      options: {
        moins_1an: "Il y a moins d'un an",
        plus_1an: "Il y a plus d'un an, ou jamais",
      },
    },
    M4: {
      label:
        "Lors de vos appels d'offres, comparez-vous les grilles dans le détail ?",
      help: "Tranches de poids, taxation réelle ou volumétrique, découpage de zones, surcharge gazole, ad valorem, surcoûts de livraison.",
      options: {
        oui: "Oui",
        non: "Non",
      },
    },
    M5: {
      label:
        "Consultez-vous des transporteurs que vous n'aviez jamais consultés ?",
      options: {
        oui: "Oui",
        non: "Non",
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
    // ⚠️ Ces trois clés ne sont plus atteignables : l'écran 1 est passé en
    // choix unique, il n'y a donc plus de deuxième flux classé. Elles restent
    // en place pour le jour où la sélection multiple reviendrait.
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
      title: "Comparer les grilles dans le détail avant de trancher",
      body: "Un prix affiché ne dit rien tant que les grilles ne sont pas ramenées sur la même base : tranches de poids, taxation réelle ou volumétrique, découpage de zones, surcharge gazole, ad valorem, surcoûts de livraison. Sans ce travail, l'offre retenue n'est pas la moins chère — c'est celle qui affichait le mieux.",
    },
    cherry_picking: {
      title: "Faire jouer la concurrence envoi par envoi",
      body: "Aucune grille n'est la meilleure partout : chaque transporteur a ses tranches de poids et ses zones où il est bon, et d'autres où il ne l'est pas. Comparer à chaque envoi revient à ne prendre chez chacun que ce qu'il vend le moins cher.",
    },
    remise_en_competition: {
      title: "Relancer votre appel d'offres",
      body: "Au-delà d'un an, l'écart entre votre grille et le marché n'est plus mesurable de l'intérieur : capacités, surcharge gazole et réseaux ont bougé. Seule une nouvelle consultation le fait apparaître.",
    },
    ouvrir_nouveaux_entrants: {
      title: "Faire entrer des transporteurs que vous ne consultez jamais",
      body: "Vos prestataires habituels connaissent votre niveau de prix et calibrent leur offre juste en dessous. Il existe des centaines de transporteurs messagerie, dont beaucoup sont forts précisément là où vous payez cher : c'est parmi eux que se trouve l'écart.",
    },
    prestataire_unique: {
      title: "Ouvrir votre plan à un deuxième transporteur",
      body: "Avec un prestataire unique, rien ne vous dit si votre grille est bonne : vous n'avez aucun point de comparaison, et aucun levier le jour où il faut renégocier. Un second transporteur, même sur une partie du flux, crée la référence qui manque.",
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
    // La sortie RDV ne promet aucun livrable : elle propose un échange sur les
    // points que le diagnostic a fait ressortir et sur la façon de les traiter.
    // Rien qui engage un travail sur les grilles ou sur les données.
    rdv: {
      title: "On reprend vos leviers avec vous.",
      body: "Un expert transport reprend les points que votre diagnostic a fait ressortir et vous dit comment chacun se traite : ce qui se règle en interne, ce qui passe par un appel d'offres, ce qui demande de revoir le schéma. Quarante-cinq minutes, pas une démonstration d'outil.",
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

  contact: {
    title: "Parlons-en quarante-cinq minutes",
    subtitle:
      "Laissez-nous de quoi vous rappeler et choisissez un créneau. Un expert transport reprend vos réponses avant l'échange : vous n'aurez pas à les répéter.",
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
    creneauTitle: "Quand vous arrange-t-il ?",
    creneauHelp:
      "Nous confirmons le créneau par retour d'email. Si aucun ne convient, laissez vide et nous vous proposerons autre chose.",
    creneauDate: {
      label: "Jour souhaité",
      placeholder: "Sélectionnez un jour",
      // Les jours sont générés à partir de la date du répondant : seule la
      // valeur vide a un libellé fixe.
      options: [],
    },
    creneauHeure: {
      label: "Moment de la journée",
      placeholder: "Sélectionnez un moment",
      options: [
        { value: "matin", label: "Matin (9 h – 12 h)" },
        { value: "apres_midi", label: "Après-midi (14 h – 17 h)" },
        { value: "fin_journee", label: "Fin de journée (17 h – 19 h)" },
      ],
    },
    message: {
      label: "Un point à aborder en particulier",
      placeholder: "Facultatif",
    },
    files: {
      title: "Vos ordres de transport",
      label: "Ajouter des fichiers",
      help: "CSV, Excel, PDF ou texte. Trois fichiers au plus, 3,5 Mo en tout. Un fichier plat suffit : origine, destination, nombre d'envois, tonnage ou palettes, régularité. Aucun accès à vos systèmes n'est demandé.",
      button: "Choisir des fichiers",
      remove: "Retirer",
    },
    optional: "facultatif",
    submit: "Envoyer ma demande",
    submitting: "Envoi en cours…",
    success: {
      title: "C'est envoyé.",
      body: "Nous revenons vers vous pour confirmer le créneau. Un accusé de réception vient de partir sur votre adresse.",
    },
    confirmation: {
      subject: "Votre diagnostic Pool4ward — nous revenons vers vous",
      body: "Merci d'avoir pris le temps de ce diagnostic. Nous avons bien reçu votre demande et revenons vers vous pour confirmer le créneau. À bientôt.",
    },
    privacy:
      "Vos réponses servent à préparer votre rendez-vous. Aucune donnée de flux ne vous a été demandée pendant le questionnaire.",
    errors: {
      required: "Ce champ est nécessaire pour vous recontacter.",
      email: "Merci d'indiquer une adresse email professionnelle valide.",
      filesTooMany: "Trois fichiers au maximum.",
      filesTooLarge: "L'ensemble des fichiers ne doit pas dépasser 3,5 Mo.",
      fileType: "Formats acceptés : CSV, TSV, TXT, Excel ou PDF.",
      network:
        "L'envoi n'a pas abouti. Réessayez dans un instant, ou écrivez-nous directement.",
      notConfigured:
        "L'envoi n'est pas encore actif sur cette page. Écrivez-nous directement en attendant.",
    },
  },
};
