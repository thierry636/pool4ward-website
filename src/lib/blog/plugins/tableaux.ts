import { visit } from "unist-util-visit";
import type { Root, Element, RootContent } from "hast";

/**
 * Enveloppe les tableaux dans un conteneur qui défile. Un tableau à quatre
 * colonnes ne tient pas dans 390 px : sans cela, c'est le corps de la page qui
 * se mettrait à défiler horizontalement.
 */
export function rehypeTableaux() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (node.tagName !== "table") return;
      if (!parent || typeof index !== "number") return;
      if (
        parent.type === "element" &&
        (parent as Element).properties?.className?.toString().includes("p4w-table-scroll")
      ) {
        return;
      }

      const enveloppe: Element = {
        type: "element",
        tagName: "div",
        properties: { className: ["p4w-table-scroll"] },
        children: [node],
      };

      (parent.children as RootContent[])[index] = enveloppe;
    });
  };
}
