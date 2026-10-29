import { json, withGuard } from "@/server/projection/http";
import { getSource } from "@/server/projection/source";
import { summarize } from "@/server/projection/summary";
import { findZone } from "@/server/projection/zones";

export const runtime = "nodejs";

/**
 * Synthèse d'une zone éditoriale : paliers d'effectifs par couche, jamais la
 * liste des actifs. Une zone inconnue ou mal formée est rejetée avant tout
 * accès aux données.
 */
export async function GET(req: Request, { params }: { params: Promise<{ zone: string }> }) {
  const { zone: id } = await params;
  const zone = findZone(id);
  if (!zone) return json({ error: "unknown_zone" }, /^z-[0-9a-f]{6}$/.test(id) ? 404 : 400);

  return withGuard(req, { type: "zone", key: zone.id }, async () => json(await summarize(getSource(), zone), 200, { Vary: "Cookie" }));
}
