import { NextResponse } from "next/server";
import { json, withGuard } from "@/server/projection/http";
import { getSource } from "@/server/projection/source";
import { getTile, isDeep, parseTile, tileKey } from "@/server/projection/tiles";

export const runtime = "nodejs";

/**
 * Tuile raster d'une couche agrégée. Validation, puis session et quotas, puis
 * rendu : le navigateur ne reçoit qu'une image.
 *
 * Cache-Control est `private` et la réponse varie avec le cookie : un CDN ne
 * doit jamais resservir une tuile à quelqu'un qui n'a pas passé la garde, sans
 * quoi les quotas seraient contournés par le cache.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ layer: string; z: string; x: string; y: string }> },
) {
  const { layer, z, x, y } = await params;
  const parsed = parseTile(layer, z, x, y);
  if (!parsed.ok) return json({ error: parsed.error }, parsed.status);
  const tile = parsed.tile;

  return withGuard(req, { type: "tile", key: tileKey(tile), deep: isDeep(tile) }, async () => {
    const result = await getTile(getSource(), tile);
    if (!result) return json({ error: "layer_unavailable" }, 404);

    if (req.headers.get("if-none-match") === result.etag) {
      return new NextResponse(null, { status: 304, headers: { ETag: result.etag, "Cache-Control": "private, max-age=1800", Vary: "Cookie" } });
    }
    return new NextResponse(new Uint8Array(result.body), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "private, max-age=1800",
        Vary: "Cookie",
        ETag: result.etag,
        "X-Robots-Tag": "noindex",
        "Cross-Origin-Resource-Policy": "same-origin",
        "X-Content-Type-Options": "nosniff",
      },
    });
  });
}
