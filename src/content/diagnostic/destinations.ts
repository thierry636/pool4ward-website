/**
 * Destinations des CTA — CONFIGURATION.
 *
 * ⚠️ À CÂBLER AVANT MISE EN LIGNE.
 * Le repo ne contient ni outil de prise de rendez-vous ni boîte dédiée aux
 * fichiers de flux. Par défaut, les deux sorties retombent sur le formulaire de
 * contact existant du site plutôt que sur une adresse inventée.
 *
 * En v1, l'envoi de flux passe par un simple lien mailto : l'upload dans la page
 * viendra quand le volume le justifiera.
 */

import type { OutcomeId } from "@/lib/diagnostic/types";

/** Lien de prise de rendez-vous. Remplacer par l'agenda réel de l'équipe. */
const BOOKING_URL =
  process.env.NEXT_PUBLIC_DIAGNOSTIC_BOOKING_URL ?? "/company#contact";

/** Adresse dédiée à la réception des fichiers de flux. */
const FLOWS_MAILTO = process.env.NEXT_PUBLIC_DIAGNOSTIC_FLOWS_EMAIL
  ? `mailto:${process.env.NEXT_PUBLIC_DIAGNOSTIC_FLOWS_EMAIL}?subject=${encodeURIComponent(
      "Diagnostic IPT — envoi de flux",
    )}`
  : "/company#contact";

export const OUTCOME_HREF: Readonly<Record<OutcomeId, string>> = {
  rdv: BOOKING_URL,
  flux: FLOWS_MAILTO,
};

/** Un lien externe ou mailto ne passe pas par le routeur localisé. */
export function isExternalHref(href: string): boolean {
  return /^(https?:|mailto:|tel:)/.test(href);
}
