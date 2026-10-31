import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ContactForm } from "@/components/forms/ContactForm";

export function ContactSection() {
  const t = useTranslations("Home.contact");

  return (
    <section id="echange" className="tone-dark section-y" aria-labelledby="contact-title">
      <div className="wrap grid gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-24">
        <div>
          <p className="eyebrow">{t("eyebrow")}</p>
          <h2 id="contact-title" className="h2 mt-4">{t("title")}</h2>
          <p className="lede mt-6">{t("lede")}</p>
          <p className="mt-8 text-[0.95rem]" style={{ color: "var(--fg-2)" }}>
            {t("diagnostic")}{" "}
            <Link href="/diagnostic" className="underline underline-offset-4" style={{ color: "var(--fg)" }}>
              {t("diagnosticLink")} →
            </Link>
          </p>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}
