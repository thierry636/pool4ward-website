import { visit } from "unist-util-visit";
import type { Root, Element, RootContent } from "hast";

/** Texte de la `<caption>` d'un tableau, s'il en a une. */
function legende(table: Element): string | undefined {
  const caption = table.children.find((c) => c.type === "element" && c.tagName === "caption") as Element | undefined;
  const texte = caption?.children
    .map((c) => (c.type === "text" ? c.value : ""))
    .join("")
    .trim();
  return texte || undefined;
}

/**
 * Enveloppe les tableaux dans un conteneur qui défile. Un tableau à quatre
 * colonnes ne tient pas dans 390 px : sans cela, c'est le corps de la page qui
 * se mettrait à défiler horizontalement.
 */
export function rehypeTableaux(locale: string = "fr") {
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
        // Une zone qui défile doit être atteignable au clavier, et nommée.
        properties: {
          className: ["p4w-table-scroll"],
          tabIndex: 0,
          role: "region",
          ariaLabel: legende(node) ?? (locale === "fr" ? "Tableau" : "Table"),
        },
        children: [node],
      };

      (parent.children as RootContent[])[index] = enveloppe;
    });
  };
}
