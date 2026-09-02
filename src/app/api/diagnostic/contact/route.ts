/**
 * Envoi de la demande de contact du diagnostic, par Resend.
 *
 * Déployée en fonction serverless (Netlify détecte les Route Handlers Next).
 * Trois variables d'environnement sont nécessaires — sans elles la route
 * répond 503 et le formulaire le dit au répondant plutôt que de faire semblant
 * d'avoir envoyé :
 *
 *   RESEND_API_KEY         clé d'API Resend
 *   DIAGNOSTIC_EMAIL_TO    destinataire interne (plusieurs, séparés par une virgule)
 *   DIAGNOSTIC_EMAIL_FROM  expéditeur, sur un domaine vérifié chez Resend
 */

import { NextResponse } from "next/server";

import {
  isValid,
  validateContact,
  type ContactRequest,
} from "@/lib/diagnostic/contact";
import { QUESTION_BANK } from "@/content/diagnostic/questions";
import { getDiagnosticCopy } from "@/content/diagnostic/copy";
import { formatSlotDate } from "@/lib/diagnostic/slots";

export const runtime = "nodejs";

/** Surchargeable pour les tests d'intégration ; vaut l'API Resend en production. */
const RESEND_ENDPOINT =
  process.env.RESEND_API_URL ?? "https://api.resend.com/emails";

/**
 * La notification interne est toujours rédigée en français : c'est la langue de
 * l'équipe qui la lit, et une structure stable se dépouille plus vite qu'une
 * langue qui change d'un email à l'autre. La langue du répondant y est indiquée,
 * et son accusé de réception part, lui, dans sa langue.
 */
const INTERNAL_LOCALE = "fr";

/** Messages de validation côté serveur : techniques, jamais affichés tels quels. */
const SERVER_MESSAGES = {
  required: "champ obligatoire",
  email: "email invalide",
  filesTooMany: "trop de fichiers",
  filesTooLarge: "fichiers trop volumineux",
  fileType: "type de fichier refusé",
};

/**
 * Une adresse d'expéditeur ou de destinataire — `nom@domaine.fr` ou
 * `Pool4ward <nom@domaine.fr>`. Le domaine seul est l'erreur de configuration
 * la plus facile à faire : c'est lui qu'on vérifie chez Resend, mais ce n'est
 * pas lui qu'on envoie.
 */
function isMailbox(valeur: string): boolean {
  const adresse = valeur.includes("<")
    ? (valeur.match(/<([^>]+)>/)?.[1] ?? "")
    : valeur;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(adresse.trim());
}

function config() {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.DIAGNOSTIC_EMAIL_TO;
  const from = process.env.DIAGNOSTIC_EMAIL_FROM;
  if (!apiKey || !to || !from) return null;

  const destinataires = to
    .split(",")
    .map((adresse) => adresse.trim())
    .filter(Boolean);

  const invalides = [from, ...destinataires].filter(
    (adresse) => !isMailbox(adresse),
  );
  if (invalides.length > 0 || destinataires.length === 0) {
    console.error(
      "[diagnostic] adresses mal formées — attendu « nom@domaine.fr » ou " +
        "« Nom <nom@domaine.fr> », reçu :",
      invalides.join(", ") || "(aucun destinataire)",
    );
    return null;
  }

  return { apiKey, to: destinataires, from };
}

function echapper(valeur: string): string {
  return valeur
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Rejoue les réponses en clair : l'email doit se lire sans ouvrir le code. */
function reponsesLisibles(demande: ContactRequest, locale: string): string[] {
  const copy = getDiagnosticCopy(locale);
  const lignes: string[] = [];

  for (const [id, valeur] of Object.entries(demande.record.answers)) {
    const question = QUESTION_BANK[id];
    const libelles = copy.questions[id];
    if (!question || !libelles) continue;
    const points = question.options.find((o) => o.value === valeur)?.points;
    const marqueur = points === question.max ? "OK" : "à améliorer";
    lignes.push(
      `${libelles.label} — ${libelles.options[valeur] ?? valeur} (${marqueur})`,
    );
  }

  return lignes;
}

function corpsHtml(demande: ContactRequest, locale: string): string {
  // `locale` est celle de l'email, pas celle du répondant : le corps interne se
  // lit en français même quand le questionnaire a été rempli en anglais.
  const copy = getDiagnosticCopy(locale);
  const r = demande.record;
  const branche = copy.flows[r.branch].indexLabel;

  const creneau =
    r.lead.creneau_date && r.lead.creneau_heure
      ? `${formatSlotDate(r.lead.creneau_date, locale)} — ${
          copy.contact.creneauHeure.options.find(
            (o) => o.value === r.lead.creneau_heure,
          )?.label ?? r.lead.creneau_heure
        }`
      : "aucune préférence";

  const roleLabel =
    copy.contact.role.options.find((o) => o.value === demande.role)?.label ??
    demande.role;
  const perimetreLabel =
    copy.contact.perimetre.options.find((o) => o.value === demande.perimetre)
      ?.label ?? demande.perimetre;
  const budgetLabel = demande.budget
    ? (copy.contact.budget.options.find((o) => o.value === demande.budget)
        ?.label ?? demande.budget)
    : "non renseigné";

  const leviers = r.levers
    .map((id) => `<li>${echapper(copy.levers[id as "part_stable"].title)}</li>`)
    .join("");

  const reponses = reponsesLisibles(demande, locale)
    .map((ligne) => `<li>${echapper(ligne)}</li>`)
    .join("");

  const fichiers = demande.attachments.length
    ? demande.attachments
        .map((f) => `<li>${echapper(f.filename)} (${Math.round(f.size / 1024)} ko)</li>`)
        .join("")
    : "<li>aucun</li>";

  return `
    <h2>Diagnostic IPT — ${echapper(demande.societe)}</h2>
    <p>
      <strong>${echapper(demande.email)}</strong><br>
      ${echapper(roleLabel)} · ${echapper(perimetreLabel)} · budget ${echapper(budgetLabel)}
    </p>
    <p><strong>Créneau souhaité :</strong> ${echapper(creneau)}</p>
    <h3>Résultat</h3>
    <p>
      Flux ${echapper(branche)} — indice ${r.indice}/100
      (${r.points}/${r.max_servi}), niveau ${echapper(copy.levels[r.level])}.
      Sortie : ${r.outcome}.
    </p>
    <h3>Leviers retenus</h3>
    <ul>${leviers || "<li>aucun</li>"}</ul>
    <h3>Réponses</h3>
    <ul>${reponses}</ul>
    <h3>Pièces jointes</h3>
    <ul>${fichiers}</ul>
    ${
      demande.message
        ? `<h3>Message</h3><p>${echapper(demande.message).replace(/\n/g, "<br>")}</p>`
        : ""
    }
    <hr>
    <p style="color:#64748b;font-size:12px">
      Langue du répondant : ${echapper(r.locale.toUpperCase())} ·
      Diagnostic ${echapper(r.id)} · ${echapper(r.created_at)} ·
      ${r.duration_seconds} s ·
      utm ${echapper(
        [r.utm.source, r.utm.medium, r.utm.campaign, r.utm.content]
          .filter(Boolean)
          .join(" / ") || "aucun",
      )}
    </p>
  `;
}

async function envoyer(
  cfg: NonNullable<ReturnType<typeof config>>,
  payload: Record<string, unknown>,
): Promise<{ ok: boolean; detail?: string }> {
  const reponse = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (reponse.ok) return { ok: true };
  return { ok: false, detail: await reponse.text().catch(() => "") };
}

export async function POST(request: Request) {
  const cfg = config();
  if (!cfg) {
    // Ne jamais répondre « envoyé » quand rien ne part.
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  let demande: ContactRequest;
  try {
    demande = (await request.json()) as ContactRequest;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const erreurs = validateContact(demande, SERVER_MESSAGES);
  if (!isValid(erreurs) || !demande.record) {
    return NextResponse.json({ error: "invalid", fields: erreurs }, { status: 400 });
  }

  // Langue du répondant, pour son accusé de réception uniquement.
  const locale = demande.record.locale ?? INTERNAL_LOCALE;
  const copy = getDiagnosticCopy(locale);

  const envoi = await envoyer(cfg, {
    from: cfg.from,
    to: cfg.to,
    reply_to: demande.email,
    subject: `Diagnostic IPT — ${demande.societe} — ${demande.record.indice}/100 (${demande.record.branch})`,
    html: corpsHtml(demande, INTERNAL_LOCALE),
    attachments: demande.attachments.map((f) => ({
      filename: f.filename,
      content: f.content,
    })),
  });

  if (!envoi.ok) {
    console.error("[diagnostic] envoi Resend refusé", envoi.detail);
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }

  // Accusé de réception au répondant. Son échec ne doit pas faire échouer la
  // demande : l'essentiel — la notification interne — est déjà parti.
  const accuse = await envoyer(cfg, {
    from: cfg.from,
    to: [demande.email],
    subject: copy.contact.confirmation.subject,
    html: `<p>${echapper(copy.contact.confirmation.body)}</p>`,
  });
  if (!accuse.ok) {
    console.error("[diagnostic] accusé de réception refusé", accuse.detail);
  }

  return NextResponse.json({ ok: true });
}
