"use client";

import type { CSSProperties } from "react";
import { useTranslations } from "next-intl";

/** La forme d'un marché de prix : la distribution des prix de flux comparables (illustration, sans valeur). */
const PRICE_BARS = [2, 4, 7, 11, 15, 17, 16, 13, 10, 7, 5, 3, 2, 1] as const;
/** Trois estimations face au marché : au-dessus, dans la fourchette, en dessous. */
const PRICE_DOTS = [[270, "#f59e0b"], [150, "#16a34a"], [62, "#0891b2"]] as const;

/**
 * Le graphique « prix de marché » : la distribution du marché, son premier quartile et sa médiane, et trois
 * estimations positionnées face à lui. Une illustration : aucune valeur, aucune donnée.
 */
export function PriceChart() {
  const t = useTranslations("Home.referentials.tiles.prices");
  return (
    <svg className="rt-chart" viewBox="0 0 320 150" role="img" aria-label={t("chart")} focusable="false">
      {PRICE_BARS.map((h, i) => (
        <rect key={i} className="rt-bar-i" x={10 + i * 21} y={116 - h * 5.2} width={18} height={h * 5.2} rx={3} fill={i >= 4 && i <= 8 ? "#86efac" : "#cbd5e1"} style={{ ["--k" as string]: i } as CSSProperties} />
      ))}
      <line x1={93} x2={93} y1={26} y2={116} stroke="#16a34a" strokeWidth={1.5} strokeDasharray="4 3" />
      <line x1={145} x2={145} y1={14} y2={116} stroke="#0f172a" strokeWidth={2} />
      <text x={89} y={22} textAnchor="end" fontSize={10} fontWeight={600} fill="#15803d">
        P25
      </text>
      <text x={151} y={14} fontSize={10} fontWeight={700} fill="#0f172a">
        {t("median")}
      </text>
      <line x1={10} x2={304} y1={116} y2={116} stroke="#94a3b8" />
      {PRICE_DOTS.map(([x, c], i) => (
        <circle key={c} className="rt-est" cx={x} cy={134} r={7} fill={c} stroke="#fff" strokeWidth={2} style={{ ["--k" as string]: i } as CSSProperties} />
      ))}
    </svg>
  );
}
