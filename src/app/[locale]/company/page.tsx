import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/sections/PageHero";
import { ContactForm } from "@/components/forms/ContactForm";
import { pageMetadata } from "@/lib/seo";
import { ClientMessages } from "@/lib/client-messages";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Company.meta" });
  return pageMetadata({ locale, path: "/company", title: t("title"), description: t("description") });
}

export default async function CompanyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Company");
  const beliefs = t.raw("beliefs.items") as { name: string; body: string }[];
  const how = t.raw("how.body") as string[];

  return (
    <>
      <PageHero eyebrow={t("hero.eyebrow")} title={t("hero.title")} lede={t("hero.lede")} />

      <section className="tone-light section-y" aria-labelledby="beliefs">
        <div className="wrap">
          <p className="eyebrow">{t("beliefs.eyebrow")}</p>
          <h2 id="beliefs" className="h2 mt-4">{t("beliefs.title")}</h2>
          <ol className="mt-12 grid gap-x-12 md:grid-cols-2">
            {beliefs.map((b, i) => (
              <li key={b.name} className="rule-top py-7">
                <span className="mono text-[0.72rem]" style={{ color: "var(--warm)" }}>0{i + 1}</span>
                <p className="h3 mt-2">{b.name}</p>
                <p className="mt-3 text-[1rem] leading-relaxed" style={{ color: "var(--fg-2)" }}>{b.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="tone-light tone-light-2 section-y" aria-labelledby="how">
        <div className="wrap grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
          <div>
            <p className="eyebrow">{t("how.eyebrow")}</p>
            <h2 id="how" className="h2 mt-4">{t("how.title")}</h2>
          </div>
          <div className="space-y-6">
            {how.map((p) => (
              <p key={p} className="text-[1.1rem] leading-relaxed" style={{ color: "var(--fg-2)" }}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="tone-dark section-y scroll-mt-16" aria-labelledby="contact-title">
        <div className="wrap grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-24">
          <div>
            <p className="eyebrow" style={{ color: "var(--warm)" }}>{t("contact.eyebrow")}</p>
            <h2 id="contact-title" className="h2 mt-4">{t("contact.title")}</h2>
          </div>
          <ClientMessages namespaces={["Contact.form"]}>
            <ContactForm />
          </ClientMessages>
        </div>
      </section>
    </>
  );
}
