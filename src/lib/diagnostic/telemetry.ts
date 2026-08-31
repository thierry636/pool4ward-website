/**
 * Télémétrie du diagnostic.
 *
 * Le taux d'abandon par question est la métrique qui pilotera la v2 : elle dira
 * quelle question est mal formulée, et il y en aura une.
 *
 * Transport : les événements sont poussés dans `window.dataLayer` (repris par
 * n'importe quel gestionnaire de tags) et rediffusés en `CustomEvent` pour
 * permettre un branchement local. L'enregistrement complet n'est envoyé à un
 * back-end que si `NEXT_PUBLIC_DIAGNOSTIC_ENDPOINT` est défini — sans quoi il
 * reste en session pour ne rien perdre d'un parcours terminé.
 */

import type { DiagnosticRecord } from "./types";

export type DiagnosticEventName =
  | "diagnostic_started"
  | "ranking_submitted"
  | "question_answered"
  | "result_viewed"
  | "cta_clicked"
  | "lead_submitted"
  | "abandoned";

export type DiagnosticEventPayload = Record<
  string,
  string | number | boolean | readonly string[] | null
>;

const STORAGE_KEY = "p4w:diagnostic:record";
const EVENT_NAME = "p4w:diagnostic";

interface DataLayerWindow extends Window {
  dataLayer?: unknown[];
}

export function trackEvent(
  name: DiagnosticEventName,
  payload: DiagnosticEventPayload = {},
): void {
  if (typeof window === "undefined") return;

  const detail = { event: name, ...payload };
  const target = window as DataLayerWindow;

  target.dataLayer = target.dataLayer ?? [];
  target.dataLayer.push(detail);
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail }));
}

/** Endpoint de collecte, optionnel : absent, on ne tente aucun appel réseau. */
function endpoint(): string | null {
  const value = process.env.NEXT_PUBLIC_DIAGNOSTIC_ENDPOINT;
  return value && value.length > 0 ? value : null;
}

/**
 * Persiste l'enregistrement. Non bloquant : l'écran de résultat s'affiche que
 * la collecte réussisse ou non.
 */
export function persistRecord(record: DiagnosticRecord): void {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Stockage indisponible (navigation privée, quota) : sans conséquence.
  }

  const url = endpoint();
  if (!url) return;

  const body = JSON.stringify(record);

  if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon(url, blob)) return;
  }

  void fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // Une collecte perdue ne doit jamais casser le parcours.
  });
}

export function readPersistedRecord(): DiagnosticRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DiagnosticRecord) : null;
  } catch {
    return null;
  }
}

/** Identifiant d'enregistrement, `crypto.randomUUID` quand il est disponible. */
export function newRecordId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `d-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
