/**
 * Créneaux de rendez-vous proposés dans le formulaire.
 *
 * Pas d'agenda connecté : on demande une préférence, qui part dans l'email et
 * que l'équipe confirme. Le jour où un outil de réservation sera branché,
 * `NEXT_PUBLIC_DIAGNOSTIC_BOOKING_URL` prendra le relais et ce module ne
 * servira plus qu'au repli.
 */

/** Nombre de jours ouvrés proposés à partir de demain. */
export const SLOT_DAYS = 10;

/** Tranches horaires proposées, identifiants stables pour la copy. */
export const SLOT_TIMES = ["matin", "apres_midi", "fin_journee"] as const;

export type SlotTime = (typeof SLOT_TIMES)[number];

/** Date au format `AAAA-MM-JJ`, en heure locale — pas de décalage UTC. */
export function toIsoDate(date: Date): string {
  const mois = String(date.getMonth() + 1).padStart(2, "0");
  const jour = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${mois}-${jour}`;
}

/**
 * Les `count` prochains jours ouvrés à partir du lendemain de `from`.
 * Les jours fériés ne sont pas exclus : une préférence mal placée se
 * rattrape à la confirmation, une dépendance de calendrier ne se rattrape pas.
 */
export function nextWorkingDays(from: Date, count: number = SLOT_DAYS): string[] {
  const jours: string[] = [];
  const curseur = new Date(from.getFullYear(), from.getMonth(), from.getDate());

  while (jours.length < count) {
    curseur.setDate(curseur.getDate() + 1);
    const jourSemaine = curseur.getDay();
    if (jourSemaine === 0 || jourSemaine === 6) continue;
    jours.push(toIsoDate(curseur));
  }

  return jours;
}

/** Libellé d'une date, formaté par le navigateur dans la langue du diagnostic. */
export function formatSlotDate(isoDate: string, locale: string): string {
  const [annee, mois, jour] = isoDate.split("-").map(Number);
  const date = new Date(annee, mois - 1, jour);
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

export function isWorkingDay(isoDate: string): boolean {
  const [annee, mois, jour] = isoDate.split("-").map(Number);
  const jourSemaine = new Date(annee, mois - 1, jour).getDay();
  return jourSemaine !== 0 && jourSemaine !== 6;
}
