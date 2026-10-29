import { Link } from "@/i18n/routing";
import { Icon } from "@/components/ui/Icon";

/** Bandeau d'appel à l'action : un panneau sombre arrondi, comme celui de la version 1. */
export function CtaBand({ title, body, button, href = "/contact" }: { title: string; body: string; button: string; href?: string }) {
  return (
    <section className="tone-light pb-20 pt-4 sm:pb-24">
      <div className="wrap">
        <div data-reveal className="tone-dark relative isolate overflow-hidden rounded-[2rem] px-6 py-12 sm:px-12 sm:py-16" style={{ background: "linear-gradient(135deg, #0b1224 0%, #0f1f4d 100%)" }}>
          <div aria-hidden="true" className="glow-blue pointer-events-none absolute -right-24 -top-32 -z-10 h-[32rem] w-[32rem]" />
          <div aria-hidden="true" className="glow-teal pointer-events-none absolute -bottom-40 -left-24 -z-10 h-[28rem] w-[28rem] opacity-70" />
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="h2">{title}</h2>
              <p className="lede mt-5">{body}</p>
            </div>
            <Link href={href} className="btn btn-solid shrink-0 self-start lg:self-auto">
              {button} <Icon name="arrow" size={17} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
