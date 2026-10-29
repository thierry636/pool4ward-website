"use client";

import { usePathname } from "@/i18n/routing";
import { Header } from "./Header";
import { Footer } from "./Footer";

/**
 * Chrome du site — en-tête et pied de page.
 *
 * Le diagnostic est une page de campagne autonome : elle porte sa propre
 * en-tête réduite au logo, y laisser la navigation donnerait autant de portes
 * de sortie que d'entrées de menu.
 */
const BARE_ROUTES = ["/diagnostic"];

/** Routes qui s'ouvrent sur un fond clair : l'en-tête y est opaque d'emblée. */
const LIGHT_TOP_ROUTES = ["/blog"];

const correspond = (pathname: string, routes: string[]) =>
  routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (correspond(pathname, BARE_ROUTES)) {
    return <main id="contenu">{children}</main>;
  }

  const enBlog = correspond(pathname, LIGHT_TOP_ROUTES);

  return (
    <>
      <div data-section={enBlog ? "blog" : undefined}>
        <Header solid={enBlog} />
        <main id="contenu">{children}</main>
      </div>
      <Footer />
    </>
  );
}
