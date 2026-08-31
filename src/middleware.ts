import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // `/diagnostic` est redirigé vers `/fr/diagnostic` par next.config.mjs :
  // le middleware n'a donc pas à couvrir la racine du chemin.
  matcher: ["/", "/(fr|en)/:path*"],
};
