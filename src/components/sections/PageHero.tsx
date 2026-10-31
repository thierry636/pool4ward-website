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
      <div aria-hidden="true" className="glow-blue pointer-events-none absolute -right-32 -top-24 -z-20 h-[40rem] w-[40rem] opacity-80" />
      <div aria-hidden="true" className="glow-teal pointer-events-none absolute -left-40 bottom-[-18rem] -z-20 h-[34rem] w-[34rem] opacity-60" />
      <div aria-hidden="true" className="hero-terrain pointer-events-none absolute inset-y-0 right-0 -z-10 w-full lg:w-3/5" />
      <div className="wrap pb-16 pt-14 sm:pb-20 sm:pt-20 lg:pb-28 lg:pt-28">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="display mt-5 max-w-4xl text-[clamp(2.3rem,4.8vw,4.2rem)]">{title}</h1>
        {lede && <p className="lede mt-7 max-w-3xl">{lede}</p>}
        {children}
      </div>
    </section>
  );
}
