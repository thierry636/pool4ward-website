/**
 * Le schéma de Move2Rail, en petit : la route (gris) qui devient une voie ferrée (couleur) où
 * roule un convoi. Même tracé que la tuile du portail (« une route qui devient une voie »),
 * resserré et épaissi à la taille d'un sigle pour la légende de la couverture. Décoratif.
 */
export function Move2RailGlyph({ width = 92, color = "#818cf8", grid = "#94a3b8" }: { width?: number; color?: string; grid?: string }) {
  return (
    <svg width={width} height={(width * 64) / 300} viewBox="10 28 300 64" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M24 60H140" stroke={grid} strokeWidth="9" />
      <path d="M140 60C170 60 170 48 200 48" stroke={grid} strokeWidth="9" />
      <path d="M140 60C170 60 170 72 200 72" stroke={grid} strokeWidth="9" />
      <path d="M200 48H298M200 72H298" stroke={color} strokeWidth="9" />
      <path d="M222 40v40M250 40v40M278 40v40" stroke={color} strokeOpacity=".5" strokeWidth="6" />
      <circle cx="64" cy="60" r="14" fill={grid} />
      <rect x="226" y="46" width="42" height="28" rx="6" fill={color} />
    </svg>
  );
}
