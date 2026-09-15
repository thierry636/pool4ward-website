import { appliquerTypographieFrancaise } from "./plugins/typographie-fr";

/**
 * Les blocs `<figure class="p4w-figure">` ne peuvent pas traverser le parseur
 * markdown : ils contiennent des lignes vides — qui referment un bloc HTML en
 * CommonMark — et une indentation à quatre espaces, que le parseur relirait
 * ensuite comme un bloc de code. Le SVG en ressortirait affiché en clair.
 *
 * On les met donc de côté avant le parsing et on les réinjecte tels quels
 * après le rendu. C'est aussi la garantie que les SVG écrits à la main
 * arrivent au navigateur au caractère près.
 */
const FIGURE = /<figure class="p4w-figure">[\s\S]*?<\/figure>/g;

const jeton = (index: number) => `P4WFIGURE${index}JETON`;

export interface FiguresExtraites {
  markdown: string;
  figures: string[];
}

/**
 * Les articles écrivent les encadrés à la façon Pandoc, `::: note`, avec une
 * espace. `remark-directive` attend `:::note`, collé. On recolle ici plutôt
 * que dans les fichiers : la forme aérée est celle que les rédacteurs
 * connaissent, et elle reste plus lisible dans un éditeur de texte.
 */
const OUVERTURE_DIRECTIVE = /^(:{3,})[ \t]+([a-zA-Z][\w-]*)[ \t]*$/gm;

export function preparerMarkdown(markdown: string): string {
  return markdown.replace(OUVERTURE_DIRECTIVE, "$1$2");
}

export function extraireFigures(markdown: string): FiguresExtraites {
  const figures: string[] = [];
  const restant = preparerMarkdown(markdown).replace(FIGURE, (bloc) => {
    figures.push(bloc);
    return jeton(figures.length - 1);
  });
  return { markdown: restant, figures };
}

/**
 * Remet les figures à leur place. Le jeton a traversé le pipeline comme un
 * paragraphe à lui seul : c'est ce paragraphe entier qu'on remplace, sinon la
 * figure — un élément de bloc — se retrouverait imbriquée dans un `<p>`.
 */
export function reinjecterFigures(
  html: string,
  figures: string[],
  locale: string,
): string {
  return figures.reduce((sortie, figure, index) => {
    const contenu = locale === "fr" ? typographierHtml(figure) : figure;
    return sortie
      .replace(`<p>${jeton(index)}</p>`, contenu)
      .replace(jeton(index), contenu);
  }, html);
}

/**
 * Typographie française sur une figure déjà rendue : uniquement sur le texte
 * hors balises, et jamais dans le `<svg>` — ses étiquettes sont positionnées
 * au pixel, une espace ajoutée les décalerait.
 */
function typographierHtml(html: string): string {
  const morceaux = html.split(/(<svg[\s\S]*?<\/svg>)/);
  return morceaux
    .map((morceau) => {
      if (morceau.startsWith("<svg")) return morceau;
      return morceau
        .split(/(<[^>]*>)/)
        .map((segment) =>
          segment.startsWith("<")
            ? segment
            : appliquerTypographieFrancaise(segment),
        )
        .join("");
    })
    .join("");
}
