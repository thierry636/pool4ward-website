/** Pictogrammes du site : traits de 1,6 px sur une grille de 24, couleur héritée du texte. */
const PATHS = {
  flows: "M4 7h13m0 0-3-3m3 3-3 3M20 17H7m0 0 3-3m-3 3 3 3",
  slots: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7.5V12l3 2",
  drivers: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM12 3v6.5M4.2 15.5l5.4-1.8M19.8 15.5l-5.4-1.8",
  equipment: "M3 8l9-5 9 5v8l-9 5-9-5V8zM3 8l9 5 9-5M12 13v8",
  energy: "M13 2L4 14h7l-1 8 9-12h-7l1-8z",
  commitments: "M5 6h14v14H5V6zM5 10h14M9 3v4M15 3v4M9.5 15l2 2 3.5-3.5",
  engineering: "M6 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM18 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM12 16a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM8 6h8M7.2 7.6l3.8 8.4M16.8 7.6 13 16",
  tenders: "M7 3h7l5 5v13H7V3zM14 3v5h5M10 12h6M10 16h6",
  carriers: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5",
  comparison: "M5 20V10M12 20V4M19 20v-7",
  contracts: "M5 4h11l3 3v13H5V4zM9 12l2 2 4-4M9 17h6",
  check: "M4 12.5l5 5L20 6.5",
  cross: "M6 6l12 12M18 6 6 18",
  arrow: "M5 12h14m0 0-5-5m5 5-5 5",
  book: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5zM4 19V5M9 8h6",
  map: "M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14",
  ai: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z",
  database: "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
  collaboration: "M9 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 21v-1a6 6 0 0 1 12 0v1M17 9a2.5 2.5 0 1 0 0-5M21 21v-1a5 5 0 0 0-4-4.9",
  intermodal: "M7 3h10a2 2 0 0 1 2 2v9a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V5a2 2 0 0 1 2-2zM5 10h14M9 21l2-4m4 4-2-4M9 14h.01M15 14h.01",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 22, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className={className}>
      <path d={PATHS[name]} />
    </svg>
  );
}
