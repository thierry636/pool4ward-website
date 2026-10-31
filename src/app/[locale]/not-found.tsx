import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { PageHero } from "@/components/sections/PageHero";

/** 404 dans la langue du visiteur : les anciennes adresses ont été regroupées, on le dit. */
export default function NotFound() {
  const t = useTranslations("NotFound");
  return (
    <>
      <PageHero eyebrow="404" title={t("title")} lede={t("body")} />
      <section className="tone-light section-y">
        <div className="wrap">
          <Link href="/" className="btn btn-solid">
            {t("home")} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
