import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // `/diagnostic` est redirigé vers `/fr/diagnostic` par next.config.mjs :
  // le middleware n'a donc pas à couvrir la racine du chemin.
  //
  // `/blog` est en revanche bilingue : on le laisse au middleware, qui
  // négocie la langue et renvoie sur `/fr/blog` ou `/en/blog`. Sans cette
  // entrée, une URL sans préfixe ne correspondrait à aucune route.
  matcher: ["/", "/blog", "/blog/:path*", "/(fr|en)/:path*"],
};
