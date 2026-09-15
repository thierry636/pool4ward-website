import type {
  Root,
  RootContent,
  BlockContent,
  Paragraph,
  Heading,
  List,
  ListItem,
  Blockquote,
  PhrasingContent,
  Strong,
} from "mdast";

/**
 * Les blocs éditoriaux des articles. Trois mécanismes de repérage, selon la
 * façon dont le marqueur est écrit dans le markdown :
 *
 * | Dans le `.md`                          | Sortie                    |
 * |---|---|
 * | `<!-- COMPONENT: liste numérotée … -->`| `<ol class="p4w-numbered">`|
 * | `<!-- COMPONENT: trois colonnes … -->` | `<ul class="p4w-cols">`    |
 * | citation `>` contenant une liste `1.`  | `<aside class="p4w-questions">` |
 * | `::: note`                             | `<aside class="p4w-note">` |
 * | `::: cta`                              | `<aside class="p4w-cta">`  |
 *
 * Les figures, elles, ne passent pas par ici : voir `figures.ts`.
 */

/** Un item : `**01 — Titre**` puis le texte, séparés par un saut de ligne. */
const ITEM = /^(\d{1,2})\s*[—–-]\s*(.+)$/;

/** Le marqueur accepte les deux langues — les articles existent en FR et EN. */
const NUMEROTEE = /liste\s+numérot|numbered\s+list/i;
const COLONNES = /trois\s+colonnes|three\s+.*columns/i;

export function remarkComposants() {
  return (tree: Root) => {
    tree.children = transformerBlocs(tree.children);
  };
}

function transformerBlocs(noeuds: RootContent[]): RootContent[] {
  const sortie: RootContent[] = [];

  for (let i = 0; i < noeuds.length; i += 1) {
    const noeud = noeuds[i];

    // Les commentaires de marquage ne doivent pas se retrouver dans la page.
    if (noeud.type === "html" && estCommentaire(noeud.value)) {
      const variante = varianteDe(noeud.value);
      if (!variante) continue;

      const { bloc, consommes } = rassemblerItems(noeuds, i + 1, variante);
      if (bloc) {
        sortie.push(bloc);
        i += consommes;
      }
      continue;
    }

    if (noeud.type === "blockquote" && contientListeOrdonnee(noeud)) {
      sortie.push(enQuestions(noeud));
      continue;
    }

    if (noeud.type === "containerDirective") {
      const directive = noeud as unknown as {
        name: string;
        children: BlockContent[];
      };
      if (directive.name === "note" || directive.name === "cta") {
        sortie.push(enEncadre(directive.name, directive.children));
        continue;
      }
    }

    sortie.push(noeud);
  }

  return sortie;
}

const estCommentaire = (valeur: string) => valeur.trimStart().startsWith("<!--");

function varianteDe(commentaire: string): "numbered" | "cols" | null {
  if (!/COMPONENT/i.test(commentaire)) return null;
  if (NUMEROTEE.test(commentaire)) return "numbered";
  if (COLONNES.test(commentaire)) return "cols";
  return null;
}

/**
 * Avale les paragraphes `**01 — Titre**` qui suivent le marqueur, et s'arrête
 * au premier nœud qui n'en est pas un — un titre de section, ou le paragraphe
 * de conclusion qui suit la liste.
 */
function rassemblerItems(
  noeuds: RootContent[],
  depart: number,
  variante: "numbered" | "cols",
): { bloc: List | null; consommes: number } {
  const items: ListItem[] = [];
  let curseur = depart;

  while (curseur < noeuds.length) {
    const candidat = noeuds[curseur];
    if (candidat.type !== "paragraph") break;

    const item = enItem(candidat, variante);
    if (!item) break;

    items.push(item);
    curseur += 1;
  }

  if (items.length === 0) return { bloc: null, consommes: 0 };

  const bloc: List = {
    type: "list",
    ordered: variante === "numbered",
    spread: false,
    children: items,
    data: {
      hName: variante === "numbered" ? "ol" : "ul",
      hProperties: {
        className: [variante === "numbered" ? "p4w-numbered" : "p4w-cols"],
      },
    },
  };

  return { bloc, consommes: curseur - depart };
}

function enItem(
  paragraphe: Paragraph,
  variante: "numbered" | "cols",
): ListItem | null {
  const premier = paragraphe.children[0];
  if (!premier || premier.type !== "strong") return null;

  const entete = texteBrut(premier as Strong).trim();
  const correspondance = ITEM.exec(entete);
  if (!correspondance) return null;

  const [, numero, titre] = correspondance;
  const prefixe = variante === "numbered" ? "p4w-numbered" : "p4w-col";

  // Le numéro est déjà porté par le texte du titre pour un lecteur d'écran :
  // l'afficher une seconde fois n'apporte rien à l'oral.
  const badge: Paragraph = {
    type: "paragraph",
    children: [{ type: "text", value: numero }],
    data: {
      hName: "span",
      hProperties: { className: [`${prefixe}-num`], "aria-hidden": "true" },
    },
  };

  const titreNoeud: Heading = {
    type: "heading",
    depth: 3,
    children: [{ type: "text", value: titre }],
    data: { hProperties: { className: [`${prefixe}-title`] } },
  };

  const corps: Blockquote = {
    type: "blockquote",
    children: [
      titreNoeud,
      ...lignes(paragraphe.children.slice(1)).map(enParagraphe),
    ],
    data: { hName: "div", hProperties: { className: [`${prefixe}-body`] } },
  };

  return {
    type: "listItem",
    spread: false,
    children: [badge, corps],
    data: { hProperties: { className: [`${prefixe}-item`] } },
  };
}

/**
 * Redécoupe le corps d'un item sur ses sauts de ligne. Les paires
 * « Hier / Aujourd'hui » de l'article 1 sont écrites sur deux lignes d'un même
 * paragraphe : sans ce découpage, elles se retrouveraient collées.
 *
 * Attention aux deux sortes de sauts. Un retour à la ligne simple — celui que
 * les articles utilisent — est un saut *doux* : markdown ne crée pas de nœud
 * `break`, il laisse un `\n` à l'intérieur du nœud texte. Il faut donc
 * découper les deux : les nœuds `break` et les `\n` du texte.
 */
function lignes(enfants: PhrasingContent[]): PhrasingContent[][] {
  const groupes: PhrasingContent[][] = [];
  let courant: PhrasingContent[] = [];

  const clore = () => {
    if (courant.length > 0) groupes.push(courant);
    courant = [];
  };

  for (const enfant of enfants) {
    if (enfant.type === "break") {
      clore();
      continue;
    }

    if (enfant.type === "text" && enfant.value.includes("\n")) {
      enfant.value.split("\n").forEach((morceau, index) => {
        if (index > 0) clore();
        if (morceau !== "") courant.push({ type: "text", value: morceau });
      });
      continue;
    }

    courant.push(enfant);
  }
  clore();

  return groupes.filter((groupe) => !estVide(groupe));
}

const estVide = (groupe: PhrasingContent[]) =>
  groupe.every((n) => n.type === "text" && n.value.trim() === "");

const enParagraphe = (children: PhrasingContent[]): Paragraph => ({
  type: "paragraph",
  children,
});

function contientListeOrdonnee(citation: Blockquote): boolean {
  return citation.children.some(
    (enfant) => enfant.type === "list" && enfant.ordered === true,
  );
}

/** Citation portant une liste ordonnée → encadré « questions ». */
function enQuestions(citation: Blockquote): Blockquote {
  const enfants = citation.children.map((enfant) => {
    if (enfant.type !== "list") return enfant;
    return {
      ...enfant,
      data: {
        ...enfant.data,
        hProperties: { className: ["p4w-questions-list"] },
      },
    };
  });

  // Le paragraphe d'introduction précède les questions : il porte le ton du
  // bloc, pas une question. Il est distingué pour pouvoir le composer à part.
  const marques = enfants.map((enfant, index) =>
    index === 0 && enfant.type === "paragraph"
      ? marquerParagraphe(enfant, "p4w-questions-intro")
      : enfant,
  );

  return {
    type: "blockquote",
    children: marques as BlockContent[],
    data: { hName: "aside", hProperties: { className: ["p4w-questions"] } },
  };
}

/** `::: note` et `::: cta`. */
function enEncadre(nom: "note" | "cta", enfants: BlockContent[]): Blockquote {
  const prefixe = `p4w-${nom}`;

  const traites = enfants.map((enfant, index) => {
    if (enfant.type !== "paragraph") return enfant;

    // Premier paragraphe entièrement en gras : c'est le titre du bloc.
    if (index === 0 && estToutEnGras(enfant)) {
      return marquerParagraphe(enfant, `${prefixe}-title`);
    }

    // Paragraphe réduit à un lien : c'est le bouton du CTA.
    const lien = lienSeul(enfant);
    if (lien) {
      lien.data = {
        ...lien.data,
        hProperties: { className: [`${prefixe}-button`] },
      };
      return marquerParagraphe(enfant, `${prefixe}-action`);
    }

    return enfant;
  });

  return {
    type: "blockquote",
    children: traites as BlockContent[],
    data: { hName: "aside", hProperties: { className: [prefixe] } },
  };
}

const marquerParagraphe = (paragraphe: Paragraph, classe: string): Paragraph => ({
  ...paragraphe,
  data: { ...paragraphe.data, hProperties: { className: [classe] } },
});

function estToutEnGras(paragraphe: Paragraph): boolean {
  const utiles = paragraphe.children.filter(
    (n) => !(n.type === "text" && n.value.trim() === ""),
  );
  return utiles.length === 1 && utiles[0].type === "strong";
}

function lienSeul(paragraphe: Paragraph) {
  const utiles = paragraphe.children.filter(
    (n) => !(n.type === "text" && n.value.trim() === ""),
  );
  if (utiles.length !== 1 || utiles[0].type !== "link") return null;
  return utiles[0];
}

function texteBrut(noeud: { children: PhrasingContent[] }): string {
  return noeud.children
    .map((enfant) => {
      if (enfant.type === "text" || enfant.type === "inlineCode") {
        return enfant.value;
      }
      if ("children" in enfant) {
        return texteBrut(enfant as { children: PhrasingContent[] });
      }
      return "";
    })
    .join("");
}
