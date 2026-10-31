import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { PageHero } from "@/components/sections/PageHero";
import { ContactForm } from "@/components/forms/ContactForm";
import { pageMetadata } from "@/lib/seo";
import { ClientMessages } from "@/lib/client-messages";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Contact.meta" });
  return pageMetadata({ locale, path: "/contact", title: t("title"), description: t("description") });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Contact");
  const items = t.raw("side.items") as string[];

  return (
    <>
      <PageHero eyebrow={t("hero.eyebrow")} title={t("hero.title")} lede={t("hero.lede")} />
      <section className="tone-light section-y">
        <div className="wrap grid gap-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-24">
          <ClientMessages namespaces={["Contact.form"]}>
            <ContactForm />
          </ClientMessages>
          <aside aria-labelledby="side">
            <h2 id="side" className="eyebrow">{t("side.title")}</h2>
            <ul className="mt-5 space-y-4 text-[1rem] leading-relaxed" style={{ color: "var(--fg-2)" }}>
              {items.map((it) => (
                <li key={it} className="flex gap-3">
                  <span aria-hidden="true" style={{ color: "var(--warm)" }}>—</span>
                  <span>{it}</span>
                </li>
              ))}
            </ul>
            <Link href="/diagnostic" className="btn btn-line mt-8">{t("side.diagnostic")} →</Link>
          </aside>
        </div>
      </section>
    </>
  );
}
