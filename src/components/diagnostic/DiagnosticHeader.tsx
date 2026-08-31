"use client";

import Image from "next/image";

import { Link } from "@/i18n/routing";

/**
 * En-tête du diagnostic : le logo, et rien d'autre.
 *
 * Une page de campagne n'a pas de navigation — chaque entrée de menu serait une
 * sortie du questionnaire. Le logo reste cliquable pour revenir au site.
 */
export function DiagnosticHeader({ homeLabel }: { homeLabel: string }) {
  return (
    <header className="flex justify-center pb-8">
      <Link
        href="/"
        aria-label={homeLabel}
        className="rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
      >
        <Image
          src="/images/brand/logo-full-dark.svg"
          alt="Pool4ward"
          width={180}
          height={36}
          className="h-7 w-auto"
          priority
        />
      </Link>
    </header>
  );
}
