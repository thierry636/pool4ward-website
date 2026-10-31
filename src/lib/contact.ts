/**
 * Demande de contact du site (page /contact et sections de contact).
 * Mêmes règles des deux côtés : le client les utilise pour afficher les
 * erreurs, le serveur parce qu'il ne fait jamais confiance au client.
 */

export const CONTACT_TOPICS = [
  "engineering",
  "tenders",
  "carriers",
  "comparison",
  "contracts",
  "other",
] as const;
export type ContactTopic = (typeof CONTACT_TOPICS)[number];

export interface ContactPayload {
  name: string;
  email: string;
  company: string;
  topic: ContactTopic;
  message: string;
  locale: "fr" | "en";
  /** Champ piège : un humain ne le voit pas, un robot le remplit. */
  website?: string;
}

export type ContactField = "name" | "email" | "company" | "message";
export type ContactErrors = Partial<Record<ContactField, "required" | "invalidEmail">>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const MAX_MESSAGE = 4000;

export function validateContact(p: Partial<ContactPayload>): ContactErrors {
  const errors: ContactErrors = {};
  if (!p.name?.trim()) errors.name = "required";
  if (!p.company?.trim()) errors.company = "required";
  if (!p.message?.trim()) errors.message = "required";
  if (!p.email?.trim()) errors.email = "required";
  else if (!EMAIL.test(p.email.trim())) errors.email = "invalidEmail";
  return errors;
}

export const isValid = (e: ContactErrors) => Object.keys(e).length === 0;

/** Retire les sauts de ligne d'un champ destiné à un en-tête de message. */
export const singleLine = (v: string) => v.replace(/[\r\n]+/g, " ").trim().slice(0, 200);
