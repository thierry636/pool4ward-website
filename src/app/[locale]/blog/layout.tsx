import type { ReactNode } from "react";
import "./blog.css";

/**
 * Ce layout n'existe que pour charger `blog.css` : Next ne l'inclut alors que
 * dans le bundle des routes du blog. Le serif de lecture et les tokens de
 * thème ne pèsent sur aucune autre page du site.
 */
export default function BlogLayout({ children }: { children: ReactNode }) {
  return children;
}
