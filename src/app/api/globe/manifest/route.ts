import { NextResponse } from "next/server";
import { buildManifest } from "@/server/projection/manifest";
import { getSource } from "@/server/projection/source";

export const runtime = "nodejs";
/** Le mode (démonstration ou source réelle) se décide à l'exécution, pas à la construction. */
export const dynamic = "force-dynamic";

/** Public : décrit les couches et les zones, ne contient aucune donnée. */
export async function GET() {
  return NextResponse.json(buildManifest(getSource()), {
    headers: { "Cache-Control": "public, max-age=300", "X-Robots-Tag": "noindex" },
  });
}
