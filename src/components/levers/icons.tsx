import type { LeverId } from "@/lib/levers/data";

/** Pictogrammes des leviers : traits de 1,6 px sur 24, hérités de la couleur du texte. */
const PATHS: Record<LeverId, string> = {
  rail: "M7 3h10a2 2 0 0 1 2 2v9a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V5a2 2 0 0 1 2-2zM5 10h14M9 21l2-4m4 4-2-4M9 14h.01M15 14h.01",
  shortsea: "M3 15l1.6 3.6a2 2 0 0 0 1.8 1.2h11.2a2 2 0 0 0 1.8-1.2L21 15H3zM6 15V9h12v6M9 9V5h6v4M12 3v2",
  loops: "M17 2l3 3-3 3M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3M20 13v2a4 4 0 0 1-4 4H4",
  crossdock: "M3 5h4l5 7M3 19h4l5-7M3 12h9m0 0h6m0 0-3-3m3 3-3 3M21 5h-2M21 19h-2",
  electric: "M13 2L4 14h7l-1 8 9-12h-7l1-8z",
  pooling: "M9 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM15 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
};

export function LeverIcon({ id, size = 20 }: { id: LeverId; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={PATHS[id]} />
    </svg>
  );
}
