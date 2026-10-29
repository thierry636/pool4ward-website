import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

/**
 * Carte de contenu : pictogramme (ou filet de couleur quand rien ne s'illustre), titre, texte.
 * Elle remplace les listes « filet + numéro + texte » : un bloc, une idée, un repère visuel.
 */
export function FeatureCard({
  icon,
  title,
  body,
  index = 0,
  pill,
  children,
  as: Tag = "li",
}: {
  icon?: IconName;
  title: string;
  body?: string;
  index?: number;
  pill?: string;
  children?: ReactNode;
  as?: "li" | "div" | "article";
}) {
  return (
    <Tag data-reveal className="card card-lift relative overflow-hidden p-5 sm:p-6" style={{ ["--i" as string]: index % 3 }}>
      {icon ? (
        <span className="tile-icon">
          <Icon name={icon} />
        </span>
      ) : (
        <span aria-hidden="true" className="block h-1 w-10 rounded-full" style={{ background: "linear-gradient(90deg, #4263eb, #2dd4bf)" }} />
      )}
      {pill && <p className="pill mt-4">{pill}</p>}
      <h3 className={`${icon ? "mt-4" : "mt-5"} text-[1.1rem] font-bold leading-snug tracking-tight`}>{title}</h3>
      {body && (
        <p className="mt-2 text-[0.94rem] leading-relaxed" style={{ color: "var(--fg-2)" }}>
          {body}
        </p>
      )}
      {children}
    </Tag>
  );
}
