"use client";

/** Barre de progression en segments — un segment par question servie. */
export function ProgressBar({
  step,
  total,
  label,
  ariaLabel,
}: {
  step: number;
  total: number;
  label: string;
  ariaLabel: string;
}) {
  // La barre est posée sur le bandeau sombre, au-dessus de la carte.
  return (
    <div className="w-full">
      <div
        className="flex gap-1.5"
        role="progressbar"
        aria-label={ariaLabel}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={step}
        aria-valuetext={label}
      >
        {Array.from({ length: total }, (_, index) => (
          <span
            key={index}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              index < step ? "bg-brand-400" : "bg-white/20"
            }`}
          />
        ))}
      </div>
      <p className="mt-3 text-xs font-medium tabular-nums text-navy-400">{label}</p>
    </div>
  );
}
