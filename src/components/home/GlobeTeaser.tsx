"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { GlobeLauncher } from "@/components/globe/GlobeLauncher";

/**
 * Aperçu du globe sur l'accueil : une image, deux appels à l'action. Le globe
 * interactif ne se charge qu'à l'ouverture plein écran (ou sur la page
 * Référentiels) : l'accueil ne télécharge rien de lourd pour l'afficher.
 */
export function GlobeTeaser() {
  const t = useTranslations("Home.datasets");

  return (
    <GlobeLauncher>
      {(open) => (
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
            <button type="button" className="btn btn-solid" onClick={open}>
              {t("open")}
            </button>
            <Link href="/datasets" className="btn btn-line">
              {t("explore")} →
            </Link>
          </div>
        </div>
      )}
    </GlobeLauncher>
  );
}
