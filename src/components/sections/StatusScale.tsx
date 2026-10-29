import { useTranslations } from "next-intl";
import { STATUSES } from "@/content/journey/state";

/** Les cinq niveaux de connaissance, décrits un à un. */
export function StatusScale() {
  const t = useTranslations("Journey");

  return (
    <ol className="grid gap-x-8 gap-y-0 lg:grid-cols-5">
      {STATUSES.map((s, i) => (
        <li key={s} className="rule-top py-6">
          <span aria-hidden="true" className="block h-[3px] w-10" style={{ background: "var(--warm)", opacity: 0.35 + i * 0.16 }} />
          <p className="mono mt-4 text-[0.72rem]" style={{ color: "var(--warm)" }}>0{i + 1}</p>
          <p className="h3 mt-1 !text-[1.35rem]">{t(`status.${s}.name`)}</p>
          <p className="mt-2 text-[0.95rem] leading-relaxed" style={{ color: "var(--fg-2)" }}>{t(`status.${s}.body`)}</p>
        </li>
      ))}
    </ol>
  );
}
