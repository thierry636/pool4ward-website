/**
 * Marque Pool4ward — version 2.
 *
 * Le sigma est celui de la marque d'origine, tracé à l'identique
 * (public/images/brand/logo-full.svg) : seule sa couleur change, de l'aplat
 * dégradé bleu à `currentColor`, pour qu'il prenne le ton de la section qui le
 * porte. Le « 4 » du nom reprend l'accent chaud du ton courant.
 */

const SIGMA = "M28 6 L4 6 L4 12 L16 24 L4 36 L4 42 L28 42 L28 36 L14 36 L24 24 L14 12 L28 12 Z";

export function Sigma({ className = "", title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="2 4 28 40"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <path d={SIGMA} fill="currentColor" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Sigma className="h-7 w-auto" />
      <span className="text-[1.3rem] font-semibold leading-none tracking-[-0.03em]">
        pool<span style={{ color: "var(--warm)" }}>4</span>ward
      </span>
    </span>
  );
}
