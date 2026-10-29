import { NextResponse } from "next/server";
import { env, guard, sleep, type Denial, type GuardEnv } from "./guard";
import { getSource } from "./source";
import { sessionSecret, type Session } from "./session";

/** Réponse JSON qui ne se met jamais en cache partagé. */
export function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex", ...headers },
  });
}

export function denied(d: Denial) {
  return json(d.body, d.status, d.headers);
}

/**
 * Point d'entrée commun des routes à session : source, secret, garde.
 * Sans secret utilisable (source réelle non configurée), la projection est
 * déclarée non raccordée plutôt que servie sans contrôle.
 */
export async function withGuard(
  req: Request,
  kind: Parameters<typeof guard>[2],
  run: (session: Session, ge: GuardEnv) => Promise<Response>,
  guardEnv?: GuardEnv,
): Promise<Response> {
  const source = getSource();
  const secret = sessionSecret(source.mode);
  if (!secret) return json({ error: "not_configured" }, 503);

  const ge = guardEnv ?? env(secret);
  const verdict = await guard(req, ge, kind);
  if (!verdict.ok) return denied(verdict);
  if (verdict.delayMs) await (ge.sleep ?? sleep)(verdict.delayMs);
  return run(verdict.session, ge);
}
