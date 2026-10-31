/**
 * Envoi de la demande de contact du site, par Resend.
 *
 * Variables d'environnement (les mêmes que le diagnostic, qu'elles prolongent) :
 *   RESEND_API_KEY      clé d'API Resend
 *   CONTACT_EMAIL_TO    destinataires internes, séparés par une virgule
 *                       (à défaut : DIAGNOSTIC_EMAIL_TO)
 *   CONTACT_EMAIL_FROM  expéditeur sur un domaine vérifié chez Resend
 *                       (à défaut : DIAGNOSTIC_EMAIL_FROM)
 *
 * Sans elles la route répond 503 et le formulaire le dit : elle ne répond
 * jamais « envoyé » quand rien ne part.
 */

import { NextResponse } from "next/server";
import {
  CONTACT_TOPICS,
  MAX_MESSAGE,
  isValid,
  singleLine,
  validateContact,
  type ContactPayload,
} from "@/lib/contact";
import { clientKey, defaultStore, limit } from "@/server/ratelimit";

export const runtime = "nodejs";

const RESEND_ENDPOINT = process.env.RESEND_API_URL ?? "https://api.resend.com/emails";

const esc = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function config() {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_EMAIL_TO ?? process.env.DIAGNOSTIC_EMAIL_TO;
  const from = process.env.CONTACT_EMAIL_FROM ?? process.env.DIAGNOSTIC_EMAIL_FROM;
  if (!apiKey || !to || !from) return null;
  const destinataires = to.split(",").map((a) => a.trim()).filter(Boolean);
  return destinataires.length ? { apiKey, to: destinataires, from } : null;
}

export async function POST(request: Request) {
  const cfg = config();
  if (!cfg) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  // Cinq demandes par dix minutes et par adresse : assez pour un humain qui se
  // corrige, trop peu pour un envoi en rafale.
  const rate = await limit(defaultStore(), `contact:${clientKey(request.headers)}`, {
    max: 5,
    windowMs: 10 * 60_000,
  });
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "too_many" },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } },
    );
  }

  let body: Partial<ContactPayload>;
  try {
    body = (await request.json()) as Partial<ContactPayload>;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // Champ piège rempli : on répond comme si tout allait bien, sans rien envoyer.
  if (body.website) return NextResponse.json({ ok: true });

  const errors = validateContact(body);
  if (!isValid(errors) || !CONTACT_TOPICS.includes(body.topic as never)) {
    return NextResponse.json({ error: "invalid", fields: errors }, { status: 400 });
  }
  const p = body as ContactPayload;
  const message = p.message.trim().slice(0, MAX_MESSAGE);

  const reponse = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: cfg.from,
      to: cfg.to,
      reply_to: p.email.trim(),
      subject: `Contact site v2 — ${singleLine(p.company)} — ${p.topic}`,
      html: `
        <h2>Demande de contact — ${esc(singleLine(p.company))}</h2>
        <p><strong>${esc(singleLine(p.name))}</strong> · ${esc(p.email.trim())}<br>
        Sujet : ${esc(p.topic)} · Langue : ${p.locale === "en" ? "EN" : "FR"}</p>
        <p>${esc(message).replace(/\n/g, "<br>")}</p>`,
    }),
  });

  if (!reponse.ok) {
    console.error("[contact] envoi Resend refusé", await reponse.text().catch(() => ""));
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
