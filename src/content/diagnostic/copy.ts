/**
 * Registre des objets i18n du diagnostic.
 *
 * v1 : FR uniquement. La version EN s'ouvrira sur `/en/diagnostic` une fois le
 * taux de conversion FR mesuré — deux langues au lancement, c'est deux fois
 * moins de données pour itérer. En attendant, toute autre locale retombe sur la
 * copy FR plutôt que d'afficher des clés brutes.
 */

import type { DiagnosticCopy } from "./copy-types";
import { copyFr } from "./copy.fr";

export const DIAGNOSTIC_COPY: Readonly<Record<string, DiagnosticCopy>> = {
  fr: copyFr,
};

export const DEFAULT_DIAGNOSTIC_LOCALE = "fr";

export function getDiagnosticCopy(locale: string): DiagnosticCopy {
  return DIAGNOSTIC_COPY[locale] ?? DIAGNOSTIC_COPY[DEFAULT_DIAGNOSTIC_LOCALE];
}

/** Locales pour lesquelles la copy du diagnostic existe réellement. */
export function hasDiagnosticCopy(locale: string): boolean {
  return locale in DIAGNOSTIC_COPY;
}

/**
 * Interpolation minimale : `format("Question {current} sur {total}", {...})`.
 * Assez pour la copy du diagnostic, et sans dépendance.
 */
export function format(
  template: string,
  values: Readonly<Record<string, string | number>>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

export type { DiagnosticCopy } from "./copy-types";
