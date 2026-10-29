import type { Showcase } from "./types";

export interface ShowcaseSource {
  sites: { key: string; name: string; kind: string; country: string; lon: number; lat: number }[];
  services: { chapter: string; mode: string; from: string; via?: string[]; to: string; operator?: string }[];
}
export interface BuildReport {
  sites: number;
  droppedSites: number;
  services: number;
  perChapter: Record<string, number>;
  operators: number;
}
export function slug(s: string): string;
export function buildShowcase(
  source: ShowcaseSource,
  meta: { mode: "demo" | "curated"; publishedAt?: string | null },
): { snapshot: Showcase; report: BuildReport };
export function serializeShowcase(snapshot: Showcase): string;
