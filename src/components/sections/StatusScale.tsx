import { useTranslations } from "next-intl";
import { STATUSES } from "@/content/journey/state";

/** Les cinq niveaux de connaissance, décrits un à un : la barre de chaque carte monte d'un cran. */
export function StatusScale() {
  const t = useTranslations("Journey");

  return (
    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {STATUSES.map((s, i) => (
        <li key={s} data-reveal className="card p-5" style={{ ["--i" as string]: i }}>
          <span aria-hidden="true" className="block h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--rule)" }}>
            <span className="block h-full rounded-full" style={{ width: `${(i + 1) * 20}%`, background: "linear-gradient(90deg, #4263eb, #2dd4bf)" }} />
          </span>
          <p className="mt-4 text-[1.05rem] font-bold tracking-tight">{t(`status.${s}.name`)}</p>
          <p className="mt-2 text-[0.9rem] leading-relaxed" style={{ color: "var(--fg-2)" }}>
            {t(`status.${s}.body`)}
          </p>
        </li>
      ))}
    </ol>
  );
}
