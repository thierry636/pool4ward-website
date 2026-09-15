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

/**
 * Le blog ouvre sur un fond clair, là où le reste du site ouvre sur un héros
 * sombre : l'en-tête transparente y afficherait son logo clair sur du blanc.
 * Ces routes la reçoivent donc opaque, et `data-section` permet à `blog.css`
 * de la repeindre en thème sombre — l'en-tête est hors de l'arbre du contenu,
 * il faut un ancêtre commun pour l'atteindre.
 */
const BLOG_ROUTES = ["/blog"];

const correspond = (pathname: string, routes: string[]) =>
  routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (correspond(pathname, BARE_ROUTES)) return <main>{children}</main>;

  const enBlog = correspond(pathname, BLOG_ROUTES);

  return (
    <>
      <div data-section={enBlog ? "blog" : undefined}>
        <Header solid={enBlog} />
        <main>{children}</main>
      </div>
      <Footer />
    </>
  );
}
