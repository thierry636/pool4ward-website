import { getAuthorizer, parseExploreQuery } from "@/server/projection/explore";
import { json } from "@/server/projection/http";

export const runtime = "nodejs";

/**
 * Exploration détaillée : réservée à un compte autorisé. Non raccordée dans
 * cette livraison (voir `explore.ts`) : sans justificatif 401, avec un
 * justificatif reconnu 501 — jamais de relais vers le portail.
 */
export async function GET(req: Request) {
  const principal = await getAuthorizer().authorize(req.headers.get("authorization"));
  if (!principal) return json({ error: "authentication_required" }, 401, { "WWW-Authenticate": "Bearer" });

  const parsed = parseExploreQuery(new URL(req.url).searchParams);
  if (!parsed.ok) return json({ error: parsed.error }, 400);

  return json({ error: "not_connected" }, 501);
}
