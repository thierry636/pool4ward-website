import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";

import { remarkComposants } from "./plugins/composants";
import { rehypeLiens } from "./plugins/liens";
import { rehypeTableaux } from "./plugins/tableaux";
import { rehypeTypographieFrancaise } from "./plugins/typographie-fr";
import { extraireFigures, reinjecterFigures } from "./figures";
import type { BlogLocale } from "./types";

/**
 * Markdown → HTML. Tout se joue au build : aucune de ces dépendances
 * n'atteint le bundle client, et une page d'article n'embarque pas une ligne
 * de JavaScript pour s'afficher.
 */
export async function rendreMarkdown(
  markdown: string,
  locale: BlogLocale,
): Promise<string> {
  const { markdown: sansFigures, figures } = extraireFigures(markdown);

  const processeur = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDirective)
    .use(remarkComposants)
    // `allowDangerousHtml` + `rehype-raw` : le HTML écrit à la main dans les
    // articles est du contenu qu'on maîtrise, pas une saisie d'utilisateur.
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeTableaux)
    .use(rehypeLiens, locale);

  if (locale === "fr") {
    processeur.use(rehypeTypographieFrancaise);
  }

  const fichier = await processeur
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(sansFigures);

  return reinjecterFigures(String(fichier), figures, locale);
}
