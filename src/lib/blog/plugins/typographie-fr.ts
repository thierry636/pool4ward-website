import type { Root, RootContent, Element } from "hast";

/**
 * Typographie française : espaces insécables avant `; ! ? :` et à l'intérieur
 * des guillemets. Appliquée au rendu, jamais dans les fichiers markdown — un
 * fichier source doit rester éditable au clavier, sans caractères invisibles.
 *
 * Fine insécable (U+202F) avant `; ! ?` et contre les guillemets, insécable
 * pleine (U+00A0) avant `:` — c'est l'usage de l'Imprimerie nationale.
 */
const FINE = " ";
const NBSP = " ";

/**
 * Sous-arbres qu'on ne touche pas, eux et toute leur descendance : le code
 * doit rester copiable tel quel, et un SVG mesure ses textes au pixel —
 * y injecter une espace décalerait les étiquettes du graphique.
 */
const PROTEGES = new Set(["code", "pre", "kbd", "samp", "svg", "script", "style"]);

const ESPACES = "[ \\u00A0\\u202F]*";

export function appliquerTypographieFrancaise(texte: string): string {
  return (
    texte
      // Devant `; ! ?` : fine insécable, qu'il y ait déjà une espace ou non.
      .replace(new RegExp(`${ESPACES}([;!?])`, "g"), `${FINE}$1`)
      // Devant `:` : insécable pleine, sauf entre deux chiffres (heures,
      // rapports) et sauf après un `/` ou un mot collé au `:` d'une URL.
      .replace(new RegExp(`([^\\d/\\s])${ESPACES}:(?!//)`, "g"), `$1${NBSP}:`)
      // Le `:` qui suit une balise ouvre le nœud texte suivant — il n'a pas de
      // caractère qui le précède dans ce nœud. `<strong>Seul</strong> : …`
      // doit pourtant recevoir son insécable comme les autres. L'espace de
      // tête est exigée : elle distingue ce cas d'un `://` d'URL.
      .replace(/^[ \u00A0\u202F]+:/, `${NBSP}:`)
      .replace(new RegExp(`«${ESPACES}`, "g"), `«${FINE}`)
      .replace(new RegExp(`${ESPACES}»`, "g"), `${FINE}»`)
  );
}

/**
 * Plugin rehype. Descend l'arbre à la main plutôt qu'avec `visit` : il faut
 * pouvoir couper une branche entière (un `<svg>` et tout ce qu'il contient),
 * ce que `visit` ne permet pas — il ne connaît que le parent immédiat.
 */
export function rehypeTypographieFrancaise() {
  return (tree: Root) => {
    descendre(tree.children);
  };
}

function descendre(enfants: RootContent[]) {
  for (const noeud of enfants) {
    if (noeud.type === "text") {
      noeud.value = appliquerTypographieFrancaise(noeud.value);
      continue;
    }
    if (noeud.type !== "element") continue;

    const element = noeud as Element;
    if (PROTEGES.has(element.tagName)) continue;
    descendre(element.children as RootContent[]);
  }
}
