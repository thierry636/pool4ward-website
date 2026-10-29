import type { ReactNode } from "react";

/**
 * Ouverture de page : bande sombre, courbes de niveau en filigrane — le même
 * motif que la couverture, pour que chaque page se reconnaisse d'un coup d'œil.
 */
export function PageHero({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  children?: ReactNode;
}) {
  return (
    <section className="tone-dark relative isolate overflow-hidden pt-[4.25rem]">
      <div aria-hidden="true" className="hero-terrain pointer-events-none absolute inset-y-0 right-0 -z-10 w-full lg:w-3/5" />
      <div className="wrap pb-16 pt-14 sm:pb-20 sm:pt-20 lg:pb-28 lg:pt-28">
        <p className="eyebrow" style={{ color: "var(--warm)" }}>{eyebrow}</p>
        <h1 className="display mt-5 max-w-4xl text-[clamp(2.4rem,5.4vw,4.8rem)]">{title}</h1>
        {lede && <p className="lede mt-7 max-w-3xl">{lede}</p>}
        {children}
      </div>
    </section>
  );
}
