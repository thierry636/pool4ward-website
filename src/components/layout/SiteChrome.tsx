"use client";

import { usePathname } from "@/i18n/routing";
import { Header } from "./Header";
import { Footer } from "./Footer";

/**
 * Chrome du site — en-tête et pied de page.
 *
 * Le diagnostic est une page de campagne autonome : elle occupe l'écran entier
 * et porte sa propre en-tête réduite au logo. Y laisser la navigation du site
 * donnerait autant de portes de sortie que d'entrées de menu.
 */
const BARE_ROUTES = ["/diagnostic"];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bare = BARE_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (bare) return <main>{children}</main>;

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
