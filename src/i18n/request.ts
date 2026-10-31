import { getRequestConfig } from "next-intl/server";
import { typographieMessages } from "@/lib/typo-fr";
import { routing } from "./routing";

/** Un fichier par grand ensemble de textes : messages/<locale>/<ensemble>.json. */
const ENSEMBLES = ["common", "home", "journey", "pages", "datasets", "blog"] as const;

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as "en" | "fr")) {
    locale = routing.defaultLocale;
  }

  const parts = await Promise.all(
    ENSEMBLES.map(async (nom) => (await import(`../../messages/${locale}/${nom}.json`)).default),
  );
  const messages = Object.assign({}, ...parts);

  return {
    locale,
    // La typographie française (insécables) est posée ici, une fois, plutôt
    // que recopiée dans chaque libellé du fichier de messages.
    messages: locale === "fr" ? typographieMessages(messages) : messages,
  };
});
