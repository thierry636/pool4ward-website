import { env, guardSessionOpen } from "@/server/projection/guard";
import { denied, json } from "@/server/projection/http";
import { SESSION_COOKIE, SESSION_TTL_SEC, issueSession, sessionSecret } from "@/server/projection/session";
import { getSource } from "@/server/projection/source";

export const runtime = "nodejs";

/**
 * Ouvre une session anonyme (cookie signé, 30 minutes). La session sert à
 * compter les requêtes, pas à autoriser : l'ouverture est donc limitée par
 * adresse.
 */
export async function POST(req: Request) {
  const secret = sessionSecret(getSource().mode);
  if (!secret) return json({ error: "not_configured" }, 503);

  const refusal = await guardSessionOpen(req, env(secret));
  if (refusal) return denied(refusal);

  const s = issueSession(secret);
  const https =
    new URL(req.url).protocol === "https:" || req.headers.get("x-forwarded-proto") === "https";
  const cookie = [
    `${SESSION_COOKIE}=${s.value}`,
    "Path=/api/globe",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${SESSION_TTL_SEC}`,
    https ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");

  return json({ ok: true, expiresAt: s.expiresAt }, 200, { "Set-Cookie": cookie });
}
