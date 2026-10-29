import { CHAPTERS } from "./chapters.mjs";
import type { ChapterDef, Showcase } from "./types";

/** Les chapitres qui ont au moins une liaison dans la vitrine, dans l'ordre éditorial. */
export function chaptersOf(data: Showcase): ChapterDef[] {
  return CHAPTERS.filter((c) => data.services.some((v) => v.chapter === c.id));
}
