import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Logo } from "@/components/brand/Logo";
import { CAPACITES } from "@/content/capabilities";
import { PORTAL_URL } from "@/lib/site";

export function Footer() {
  const t = useTranslations("Footer");
  const tn = useTranslations("Nav");
  const tc = useTranslations("Capabilities");

  return (
    <footer className="tone-dark">
      <div className="wrap section-y !pb-10">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-6 max-w-sm text-[0.98rem] leading-relaxed" style={{ color: "var(--fg-2)" }}>
              {t("statement")}
            </p>
          </div>

          <FooterColumn title={t("explore")}>
            <li><Link href="/approach">{tn("approach")}</Link></li>
            <li><Link href="/solutions">{tn("solutions")}</Link></li>
            <li><Link href="/datasets">{tn("datasets")}</Link></li>
            <li><Link href="/blog">{tn("insights")}</Link></li>
          </FooterColumn>

          <FooterColumn title={t("capabilities")}>
            {CAPACITES.map((c) => (
              <li key={c.slug}>
                <Link href={`/solutions/${c.slug}`}>{tc(`${c.id}.name`)}</Link>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title={t("company")}>
            <li><Link href="/company">{t("about")}</Link></li>
            <li><Link href="/contact">{tn("cta")}</Link></li>
            <li>
              <a href={PORTAL_URL}>
                {tn("portal")} <span aria-hidden="true">↗</span>
              </a>
            </li>
          </FooterColumn>
        </div>

        <div
          className="mt-16 flex flex-col gap-3 border-t pt-6 text-[0.82rem] sm:flex-row sm:items-start sm:justify-between"
          style={{ borderColor: "var(--rule)", color: "var(--fg-2)" }}
        >
          <p>{t("rights", { year: new Date().getFullYear() })}</p>
          <p className="max-w-xl sm:text-right">{t("demoNote")}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="eyebrow">{title}</h2>
      <ul className="mt-5 space-y-1 text-[0.97rem] [&_a]:inline-flex [&_a]:min-h-[2.25rem] [&_a]:items-center [&_a]:opacity-90 [&_a:hover]:opacity-100 [&_a:hover]:underline [&_a]:underline-offset-4">
        {children}
      </ul>
    </div>
  );
}
