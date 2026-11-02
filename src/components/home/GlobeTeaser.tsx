import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

/**
 * Aperçu des services sur l'accueil : la carte à plat de l'Europe avec les liaisons de la vitrine
 * (image générée par `scripts/build-flat-poster.mjs`) et un appel à l'action. Le globe animé vit
 * sur la page Référentiels ; l'accueil ne télécharge rien de lourd pour le présenter.
 */
export function GlobeTeaser() {
  const t = useTranslations("Home.datasets");

  return (
    <div className="tone-dark relative overflow-hidden border" style={{ borderColor: "var(--rule)" }}>
      <div aria-hidden="true" className="hero-terrain pointer-events-none absolute inset-0" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/services-flat-poster.svg"
        alt={t("posterLabel")}
        width={600}
        height={520}
        loading="lazy"
        decoding="async"
        className="relative block h-auto w-full"
      />
      <div className="relative flex flex-wrap items-center justify-center gap-3 px-4 pb-6">
        <Link href="/datasets#monde" className="btn btn-solid">
          {t("explore")} →
        </Link>
      </div>
    </div>
  );
}
