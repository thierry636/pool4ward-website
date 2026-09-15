import { visit } from "unist-util-visit";
import type { Root, Element } from "hast";
import { CHEMIN_CONTACT } from "../config";

/**
 * Le corps des articles est rendu en HTML, pas en composants React : les liens
 * n'ont donc pas le préfixe de locale que `next-intl` ajoute à `<Link>`. On le
 * pose ici, et on redirige au passage le `/contact` des CTA vers l'adresse
 * réelle du formulaire.
 */
export function rehypeLiens(locale: string) {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "a") return;

      const href = node.properties?.href;
      if (typeof href !== "string") return;

      if (href.startsWith("http://") || href.startsWith("https://")) {
        node.properties.target = "_blank";
        // `rel` est une propriété à valeurs multiples côté hast : un tableau,
        // pas une chaîne.
        node.properties.rel = ["noopener", "noreferrer"];
        return;
      }

      if (!href.startsWith("/")) return;

      const cible = href === "/contact" ? CHEMIN_CONTACT : href;

      // Un chemin déjà préfixé par une locale est laissé tel quel.
      if (/^\/(fr|en)(\/|$|#)/.test(cible)) {
        node.properties.href = cible;
        return;
      }

      node.properties.href = `/${locale}${cible}`;
    });
  };
}
