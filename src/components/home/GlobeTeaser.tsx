import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

/**
 * Aperçu du globe des services sur l'accueil : une image et un appel à l'action.
 * L'animation vit sur la page Référentiels ; l'accueil ne télécharge rien de
 * lourd pour la présenter.
 */
export function GlobeTeaser() {
  const t = useTranslations("Home.datasets");

  return (
    <div className="tone-dark relative overflow-hidden border" style={{ borderColor: "var(--rule)" }}>
      <div aria-hidden="true" className="hero-terrain pointer-events-none absolute inset-0" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/globe-poster.svg"
        alt={t("posterLabel")}
        width={600}
        height={600}
        loading="lazy"
        decoding="async"
        className="relative mx-auto block aspect-square w-full max-w-[34rem]"
      />
      <div className="relative flex flex-wrap items-center justify-center gap-3 px-4 pb-6">
        <Link href="/datasets#monde" className="btn btn-solid">
          {t("explore")} →
        </Link>
      </div>
    </div>
  );
}
