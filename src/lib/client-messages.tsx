import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

type Tree = Record<string, unknown>;

/** Retient les seuls chemins demandés (« Home.cover », « Journey »…) d'un arbre de messages. */
export function pickMessages(all: Tree, paths: readonly string[]): Tree {
  const out: Tree = {};
  for (const path of paths) {
    const keys = path.split(".");
    let src: unknown = all;
    let dst: Tree = out;
    keys.forEach((k, i) => {
      src = (src as Tree | undefined)?.[k];
      if (i === keys.length - 1) dst[k] = src;
      else dst = (dst[k] ??= {}) as Tree;
    });
  }
  return out;
}

/**
 * Fournit aux composants client d'un sous-arbre les messages dont ils ont
 * besoin, et eux seuls. Sans cela, tout le fichier de messages est sérialisé
 * dans le HTML de chaque page, utile ou non : c'était la moitié du poids du
 * document de l'accueil.
 */
export async function ClientMessages({
  namespaces,
  children,
}: {
  namespaces: readonly string[];
  children: ReactNode;
}) {
  const all = (await getMessages()) as Tree;
  return <NextIntlClientProvider messages={pickMessages(all, namespaces)}>{children}</NextIntlClientProvider>;
}
