"use client";

import { DIAGNOSTIC_LOCALES } from "@/content/diagnostic/copy";
import { usePathname, useRouter } from "@/i18n/routing";

/**
 * Choix de la langue, à l'entrée du questionnaire.
 *
 * Il navigue vers la même page dans l'autre locale plutôt que de basculer un
 * état interne : l'URL reste vraie, la page se partage, et les métadonnées
 * suivent. Le changement de langue relance la page — c'est sans conséquence
 * ici, l'écran d'accueil ne contient aucune réponse à perdre, et c'est
 * précisément pourquoi le sélecteur ne s'affiche pas au-delà.
 */
export function LanguageChoice({ current }: { current: string }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex justify-end">
      <div
        role="group"
        aria-label="Langue / Language"
        className="inline-flex overflow-hidden rounded-lg border border-navy-200"
      >
        {DIAGNOSTIC_LOCALES.map((locale) => {
          const actif = locale === current;
          return (
            <button
              key={locale}
              type="button"
              lang={locale}
              aria-current={actif ? "true" : undefined}
              onClick={() => {
                if (actif) return;
                router.replace(pathname, { locale });
              }}
              className={`px-3 py-1.5 text-xs font-semibold uppercase transition-colors ${
                actif
                  ? "bg-navy-900 text-white"
                  : "bg-white text-navy-500 hover:bg-navy-50 hover:text-navy-800"
              } focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1`}
            >
              {locale}
            </button>
          );
        })}
      </div>
    </div>
  );
}
