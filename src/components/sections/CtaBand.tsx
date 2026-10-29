import { Link } from "@/i18n/routing";

export function CtaBand({ title, body, button, href = "/contact" }: { title: string; body: string; button: string; href?: string }) {
  return (
    <section className="tone-dark section-y">
      <div className="wrap flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <h2 className="h2">{title}</h2>
          <p className="lede mt-5">{body}</p>
        </div>
        <Link href={href} className="btn btn-solid shrink-0 self-start lg:self-auto">
          {button} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
