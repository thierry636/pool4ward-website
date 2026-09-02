/**
 * Contrat de la demande de contact — partagé par le formulaire et la route
 * d'envoi. Les mêmes règles de validation s'appliquent des deux côtés :
 * le client pour afficher les erreurs, le serveur parce qu'on ne fait jamais
 * confiance au client.
 */

import type { DiagnosticRecord } from "./types";
import { SLOT_TIMES, type SlotTime } from "./slots";

/** Pièces jointes : ordres de transport, proposés à la branche complets. */
export const MAX_FILES = 3;
/** Plafond du corps de requête sur une fonction serverless, marge comprise. */
export const MAX_FILES_BYTES = 3.5 * 1024 * 1024;
export const ACCEPTED_FILE_EXTENSIONS = [
  ".csv",
  ".tsv",
  ".txt",
  ".xls",
  ".xlsx",
  ".pdf",
] as const;

export interface ContactAttachment {
  readonly filename: string;
  /** Contenu encodé en base64, sans préfixe `data:`. */
  readonly content: string;
  readonly size: number;
}

export interface ContactRequest {
  readonly email: string;
  readonly societe: string;
  readonly role: string;
  readonly perimetre: string;
  readonly budget: string | null;
  /** Date `AAAA-MM-JJ` du créneau souhaité. */
  readonly creneauDate: string | null;
  readonly creneauHeure: SlotTime | null;
  readonly message: string | null;
  readonly attachments: readonly ContactAttachment[];
  /** L'enregistrement du diagnostic, pour préparer le rendez-vous. */
  readonly record: DiagnosticRecord;
}

export type ContactField =
  | "email"
  | "societe"
  | "role"
  | "perimetre"
  | "creneauDate"
  | "creneauHeure"
  | "attachments";

export type ContactErrors = Partial<Record<ContactField, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function hasAcceptedExtension(filename: string): boolean {
  const nom = filename.toLowerCase();
  return ACCEPTED_FILE_EXTENSIONS.some((ext) => nom.endsWith(ext));
}

export interface ValidationMessages {
  readonly required: string;
  readonly email: string;
  readonly filesTooMany: string;
  readonly filesTooLarge: string;
  readonly fileType: string;
}

/**
 * Valide une demande. Renvoie un objet vide quand tout est bon.
 * Le créneau est facultatif — quelqu'un qui veut envoyer ses flux sans réserver
 * doit pouvoir le faire — mais la date et l'heure vont ensemble.
 */
export function validateContact(
  input: Partial<ContactRequest>,
  messages: ValidationMessages,
): ContactErrors {
  const erreurs: ContactErrors = {};

  if (!input.email?.trim()) erreurs.email = messages.required;
  else if (!EMAIL_PATTERN.test(input.email.trim())) erreurs.email = messages.email;

  if (!input.societe?.trim()) erreurs.societe = messages.required;
  if (!input.role) erreurs.role = messages.required;
  if (!input.perimetre) erreurs.perimetre = messages.required;

  if (input.creneauDate && !input.creneauHeure) {
    erreurs.creneauHeure = messages.required;
  }
  if (input.creneauHeure && !input.creneauDate) {
    erreurs.creneauDate = messages.required;
  }
  if (input.creneauHeure && !SLOT_TIMES.includes(input.creneauHeure)) {
    erreurs.creneauHeure = messages.required;
  }

  const fichiers = input.attachments ?? [];
  if (fichiers.length > MAX_FILES) {
    erreurs.attachments = messages.filesTooMany;
  } else if (fichiers.some((f) => !hasAcceptedExtension(f.filename))) {
    erreurs.attachments = messages.fileType;
  } else {
    const total = fichiers.reduce((somme, f) => somme + f.size, 0);
    if (total > MAX_FILES_BYTES) erreurs.attachments = messages.filesTooLarge;
  }

  return erreurs;
}

export function isValid(erreurs: ContactErrors): boolean {
  return Object.keys(erreurs).length === 0;
}
