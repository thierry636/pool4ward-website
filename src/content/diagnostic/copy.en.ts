/**
 * i18n object — English.
 *
 * Mirrors `copy.fr.ts` key for key; the `DiagnosticCopy` type refuses a partial
 * translation. Neither the engine nor the interface changes for a new language.
 *
 * Writing rule for verdicts: none blames the respondent, none shows a savings
 * percentage. A made-up figure gets paid for at the first meeting.
 */

import type { DiagnosticCopy } from "./copy-types";

export const copyEn: DiagnosticCopy = {
  locale: "en",

  meta: {
    title: "Diagnostic — Transport Productivity Index | Pool4ward",
    description:
      "Five questions, two minutes: find out where your transport plan stands and leave with concrete levers. No flow data required.",
  },

  intro: {
    eyebrow: "Diagnostic",
    title: "How productive is your transport plan?",
    subtitle:
      "The questionnaire adapts to your flows: you only answer what applies to you. Your index and your levers appear straight away, no email required.",
    reassurance: [
      "5 questions, two minutes",
      "No flow data required",
      "Instant result, no email",
    ],
    cta: "Start the diagnostic",
  },

  progress: {
    label: "Question {current} of {total}",
    ariaLabel: "Diagnostic progress",
  },

  nav: {
    back: "Back",
    next: "Continue",
    seeResult: "See my result",
    restart: "Start over",
    home: "Pool4ward — back to home",
  },

  ranking: {
    title: "Which of your flows weighs most in your transport budget?",
    help: "The questionnaire adapts to your answer: you will only be asked what applies to you.",
  },

  flows: {
    complets: {
      label: "Full truckloads",
      hint: "One load, one destination",
      indexLabel: "full truckloads",
      alsoLabel: "full truckloads",
    },
    messagerie: {
      // Parcel and part loads are grouped: same sales conversation, same
      // outcome. Only full truckloads stand apart.
      label: "Parcel and part loads",
      hint: "Parcels, pallets, groupage shipments",
      indexLabel: "parcel and part loads",
      alsoLabel: "parcel or part-load shipments",
    },
  },

  questions: {
    /* ---------------------------------------------------------------- */
    /* Parcel and part loads                                            */
    /* ---------------------------------------------------------------- */
    M1: {
      label: "How many parcel carriers work for you?",
      options: {
        un_seul: "Just one",
        deux_plus: "Two or more",
      },
    },
    M2: {
      label: "Do you put them in competition on every shipment?",
      help: "Comparing prices shipment by shipment, rather than allocating by habit or by zone.",
      options: {
        oui: "Yes, systematically",
        non: "No",
      },
    },
    M3: {
      label: "When did you last run a parcel tender?",
      options: {
        moins_1an: "Less than a year ago",
        plus_1an: "More than a year ago, or never",
      },
    },
    M4: {
      label: "In your tenders, do you compare rate cards in detail?",
      help: "Weight breaks, actual or volumetric weight, zone mapping, fuel surcharge, ad valorem, delivery surcharges.",
      options: {
        oui: "Yes",
        non: "No",
      },
    },
    M5: {
      label: "Do you invite carriers you had never consulted before?",
      options: {
        oui: "Yes",
        non: "No",
      },
    },

    /* ---------------------------------------------------------------- */
    /* Full truckloads                                                  */
    /* ---------------------------------------------------------------- */
    C1: {
      label: "Do your trucks travel back loaded?",
      options: {
        boucles: "Yes, return legs are organized",
        partiellement: "Partly",
        aller_simple: "One way — the return is the carrier's problem",
        inconnu: "I don't know",
      },
    },
    C2: {
      label:
        "Have you ever built a loop with another shipper — your return leg being their outbound?",
      options: {
        en_place: "Yes, one is running",
        envisage: "Considered, never completed",
        jamais: "Never looked into it",
      },
    },
    C3: {
      label: "Are your truckload flows regular?",
      options: {
        stable: "Steady volumes, fixed frequency",
        saisonnier: "Seasonal, but predictable",
        aleatoire: "Irregular",
      },
    },
    C4: {
      label:
        "On your corridors over 500 km, when did you last assess rail or inland waterway?",
      options: {
        moins24mois: "Less than 24 months ago",
        plus3ans: "More than 3 years ago",
        ecarte_sans_etude: "Ruled out without a costed study",
        jamais: "Never",
      },
    },

    /* ---------------------------------------------------------------- */
    /* Closing question                                                 */
    /* ---------------------------------------------------------------- */
    E1: {
      label:
        "Do you work out your flows' eligibility for electrification with your carriers?",
      help: "Identifying eligible segments — distances, rotations, standing time, charging points — and building the case together.",
      options: {
        oui: "Yes, we identify eligible segments with them",
        non: "No, we leave it to our carriers",
      },
    },
    G1: {
      label: "How was your current transport plan built?",
      options: {
        redesign: "Redesigned with an optimization tool in the last 24 months",
        "4pl": "Run by a 4PL or a freight forwarder",
        ao_periodique: "Tendered every 2–3 years, on the existing scope",
        reconduit: "Rolled over year after year",
      },
    },
  },

  result: {
    eyebrow: "Your result",
    indexLabel: "Productivity index — {flow}",
    outOf: "out of 100",
    levelsTitle: "Level",
    leversTitle: "Your levers",
    // The number of levers depends on the answers: announcing "three" when only
    // one shows up undermines the whole result screen.
    leversTitleByCount: {
      "0": "Where to look next",
      "1": "Your lever",
      "2": "Your two levers",
      "3": "Your three levers",
    },
    leversIntro: "In order of what pays off most, in your case.",
    leversEmpty:
      "No blind spot stands out from your answers. What is left to open cannot be read from a questionnaire — it has to be looked at on your actual flows.",
    // These three keys are no longer reachable: screen 1 became a single choice,
    // so there is no second ranked flow. They stay for the day multi-select returns.
    secondaryTitle: "You also handle {flow}.",
    secondaryEmpty: "We will look at it during the call.",
    otherFlows:
      "You also told us you handle {flows} — we will look at it during the call.",
    benchmarkPlaceholder:
      "The comparison with other shippers in your profile will open once the base is large enough.",
  },

  levels: {
    plan_subi: "Inherited plan",
    plan_pilote: "Managed plan, potential untapped",
    plan_optimise: "Optimized in-house",
  },

  verdicts: {
    messagerie: {
      plan_subi:
        "Your rate cards are rolled over and nobody has matched them against your actual shipments. This is the most common case, and the most expensive one: the negotiation is about headline rates that do not describe what you actually pay.",
      plan_pilote:
        "You do put carriers in competition, but on rate cards that nothing makes comparable. The gap sits in the rate structure, not in the discount percentage.",
      plan_optimise:
        "You have your parcel buying under control. What is left to gain is no longer in the negotiation, but in the way your shipments are prepared upstream.",
    },
    complets: {
      plan_subi:
        "Your trucks run back empty and the return leg is treated as the carrier's problem. It is billed inside your prices, simply not on a visible line.",
      plan_pilote:
        "You close the loop on part of your flows. What has not been opened plays out beyond your own organization: one company's empty returns are another's loaded outbound.",
      plan_optimise:
        "You have covered what can be optimized on your own. What remains — shipper-to-shipper triangulation, modal shift on your long corridors — is no longer inside your perimeter.",
    },
  },

  // Each lever reads on its own: a title that states the action, a body that
  // says why, in concrete terms. The respondent should understand what is being
  // proposed without going back to the question that triggered it.
  levers: {
    grilles_comparables: {
      title: "Compare rate cards in detail before deciding",
      body: "A headline price says nothing until the rate cards are brought onto the same basis: weight breaks, actual or volumetric weight, zone mapping, fuel surcharge, ad valorem, delivery surcharges. Without that work, the offer you pick is not the cheapest one — it is the one that presented best.",
    },
    cherry_picking: {
      title: "Put carriers in competition shipment by shipment",
      body: "No rate card is best everywhere: every carrier has weight breaks and zones where it is strong, and others where it is not. Comparing on each shipment means taking from each carrier only what it sells cheapest.",
    },
    remise_en_competition: {
      title: "Run your tender again",
      body: "Beyond a year, the gap between your rate card and the market is no longer measurable from the inside: capacity, fuel surcharges and networks have all moved. Only a fresh tender brings it out.",
    },
    ouvrir_nouveaux_entrants: {
      title: "Invite carriers you never consult",
      body: "Your usual carriers know your price level and pitch just below it. There are hundreds of parcel carriers out there, and many are strong precisely where you pay the most: that is where the gap is.",
    },
    prestataire_unique: {
      title: "Open your plan to a second carrier",
      body: "With a single carrier, nothing tells you whether your rate card is good: you have no point of comparison, and no leverage the day you need to renegotiate. A second carrier, even on part of the flow, creates the benchmark you are missing.",
    },
    retours_vide: {
      title: "Put a figure on what empty returns cost you",
      body: "A truck coming back empty is paid for by you, but on no visible line: the carrier builds it into the outbound price. Putting a figure on those return legs is the starting point of any conversation about closing the loop.",
    },
    appariement_flux: {
      title: "Find the shipper whose outbound is your return",
      body: "On your regular corridors there is almost always a company shipping the other way. Putting the two transport plans end to end removes one empty leg for each: that is flow matching work, not rate negotiation.",
    },
    eligibilite_modale: {
      title: "Cost out rail or inland waterway on your long corridors",
      body: "Your flows are regular, and it is regularity — far more than distance — that makes modal shift viable. The assessment, on the other hand, has not been redone recently: today's conditions are no longer those of your last calculation.",
    },
    decision_modale_reprise: {
      title: "Reopen the modal decision, with figures this time",
      body: "Rail or inland waterway were ruled out without a costed study. Road prices, capacity and combined offers have changed since: a decision taken without a calculation can be reopened without going back on anything.",
    },
    part_stable: {
      title: "Start with the steady share of your flows",
      body: "A flow described as irregular almost always contains a regular core: the same origin-destination pairs coming back every month. Loops are built on that core, not on the whole volume.",
    },
    electrification_eligibilite: {
      title: "Work out electrification eligibility yourself, with your carriers",
      body: "Asking a carrier for an electric vehicle means asking them to absorb the investment, the range and the charging on their own: the answer is a surcharge, or a polite refusal. Eligibility is built segment by segment — distances, rotations, standing time, charging points — and it is that joint work that makes electrification viable for them and affordable for you.",
    },
    reouverture_conception: {
      title: "Reopen the design of the plan, not just the rates",
      body: "A plan rolled over year after year was designed for an organization that has changed since: sites, volumes, customers, lead times. Renegotiating prices on an outdated design locks that design in for three more years.",
    },
  },

  outcomes: {
    // The meeting outcome promises no deliverable: it offers a conversation
    // about what the diagnostic brought out and how to deal with it.
    rdv: {
      title: "We go through your levers with you.",
      body: "A transport expert takes the points your diagnostic brought out and tells you how each one is dealt with: what can be fixed in-house, what goes through a tender, what calls for redesigning the plan. Forty-five minutes, not a software demo.",
    },
    flux: {
      title: "Closing the loop cannot be discussed in the abstract.",
      body: "Loops, triangulation and modal shift can only be assessed on an origin-destination matrix. Send us a twelve-month extract: we come back with figures, and we go through them together in forty-five minutes.",
      details: [
        "origin",
        "destination",
        "shipments over 12 months",
        "tonnage or pallet count",
        "regularity",
      ],
      note: "A flat file, no access to your systems. We will sign a non-disclosure agreement before any exchange if you prefer.",
    },
  },

  outcomeByBranch: {},

  outcomeNotes: {
    irregular_flows:
      "Even on irregular flows, the matrix brings out the steady share: that is where we start.",
  },

  contact: {
    title: "Let's take forty-five minutes",
    subtitle:
      "Leave us a way to reach you and pick a slot. A transport expert reviews your answers beforehand: you will not have to repeat them.",
    email: {
      label: "Work email",
      placeholder: "first.last@company.com",
    },
    societe: {
      label: "Company",
      placeholder: "Your company name",
    },
    role: {
      label: "Role",
      placeholder: "Select your role",
      options: [
        { value: "achats", label: "Procurement / sourcing" },
        { value: "exploitation", label: "Transport operations" },
        { value: "supply_chain", label: "Supply chain / logistics" },
        { value: "direction", label: "Executive" },
        { value: "autre", label: "Other" },
      ],
    },
    perimetre: {
      label: "Scope you are responsible for",
      placeholder: "Select your scope",
      options: [
        { value: "site", label: "One site" },
        { value: "multi_sites", label: "Several sites" },
        { value: "region", label: "A region or a country" },
        { value: "groupe", label: "The group" },
      ],
    },
    budget: {
      label: "Annual transport spend",
      placeholder: "Select a range",
      options: [
        { value: "moins_1m", label: "< €1M" },
        { value: "1_5m", label: "€1–5M" },
        { value: "5_20m", label: "€5–20M" },
        { value: "plus_20m", label: "> €20M" },
        { value: "non_communique", label: "I'd rather not say" },
      ],
    },
    creneauTitle: "When suits you?",
    creneauHelp:
      "We confirm the slot by email. If none of these work, leave it blank and we will suggest something else.",
    creneauDate: {
      label: "Preferred day",
      placeholder: "Select a day",
      // Days are generated from the respondent's own date: only the empty value
      // has a fixed label.
      options: [],
    },
    creneauHeure: {
      label: "Time of day",
      placeholder: "Select a time",
      options: [
        { value: "matin", label: "Morning (9am – 12pm)" },
        { value: "apres_midi", label: "Afternoon (2pm – 5pm)" },
        { value: "fin_journee", label: "End of day (5pm – 7pm)" },
      ],
    },
    message: {
      label: "Anything specific you want to cover",
      placeholder: "Optional",
    },
    files: {
      title: "Your transport orders",
      label: "Add files",
      help: "CSV, Excel, PDF or text. Three files at most, 3.5 MB in total. A flat file is enough: origin, destination, number of shipments, tonnage or pallets, regularity. No access to your systems is required.",
      button: "Choose files",
      remove: "Remove",
    },
    optional: "optional",
    submit: "Send my request",
    submitting: "Sending…",
    success: {
      title: "Sent.",
      body: "We will get back to you to confirm the slot. A confirmation email has just gone out to your address.",
    },
    confirmation: {
      subject: "Your Pool4ward diagnostic — we'll be in touch",
      body: "Thank you for taking the time to complete this diagnostic. We have received your request and will get back to you to confirm the slot. Talk soon.",
    },
    privacy:
      "Your answers are used to prepare your meeting. No flow data was requested during the questionnaire.",
    errors: {
      required: "We need this to get back to you.",
      email: "Please enter a valid work email address.",
      filesTooMany: "Three files at most.",
      filesTooLarge: "All files together must stay under 3.5 MB.",
      fileType: "Accepted formats: CSV, TSV, TXT, Excel or PDF.",
      network:
        "The request did not go through. Try again in a moment, or write to us directly.",
      notConfigured:
        "Sending is not active on this page yet. Please write to us directly in the meantime.",
    },
  },
};
