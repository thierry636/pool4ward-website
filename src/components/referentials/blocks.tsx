"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { SHAPE_IDS, type ShapeId, type Shapes } from "@/content/referentials";

/** Un nombre avec ses milliers séparés par une espace insécable (jamais coupé en fin de ligne). */
export function useFmt() {
  const locale = useLocale();
  return (n: number) => new Intl.NumberFormat(locale).format(n).replace(/ /g, " ");
}

/** Un nombre qui compte jusqu'à sa valeur ; sans animation, il s'affiche d'emblée à sa valeur. */
export function CountUp({ value, animate }: { value: number; animate: boolean }) {
  const fmt = useFmt();
  const [v, setV] = useState(animate ? 0 : value);
  useEffect(() => {
    if (!animate) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / 1300);
      setV(Math.round(value * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animate, value]);
  return <>{fmt(v)}</>;
}

export interface KpiDef {
  label: string;
  value?: number;
  text?: string;
}

export function Kpis({ items, animate }: { items: KpiDef[]; animate: boolean }) {
  if (items.length === 0) return null;
  return (
    <div className="rb-kpis" style={{ ["--n" as string]: items.length }}>
      {items.map((k, i) => (
        <div key={k.label} className="rb-kpi" style={{ ["--d" as string]: `${0.08 * i}s` }}>
          {k.text !== undefined ? (
            <b className="txt">{k.text}</b>
          ) : (
            <b>
              <CountUp value={k.value ?? 0} animate={animate} />
            </b>
          )}
          <span>{k.label}</span>
        </div>
      ))}
    </div>
  );
}

export function Card({ title, aside, delay, wide, grow, children }: { title: string; aside?: string; delay?: number; wide?: boolean; grow?: boolean; children: ReactNode }) {
  return (
    <div className="rb-card" data-wide={wide || undefined} data-grow={grow || undefined} style={{ ["--d" as string]: `${delay ?? 0.2}s` }}>
      <h4>
        {title}
        {aside && <small>{aside}</small>}
      </h4>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ formes de services */

const SHAPE_COLOR: Record<ShapeId, string> = { oneWay: "#60a5fa", roundTrip: "#2dd4bf", loop: "#a78bfa", metro: "#34d399", metroLoop: "#f43f5e", free: "#94a3b8" };

function Glyph({ id }: { id: ShapeId }) {
  const c = SHAPE_COLOR[id];
  const common = { width: 30, height: 14, viewBox: "0 0 30 14", fill: "none", "aria-hidden": true as const };
  switch (id) {
    case "oneWay":
      return (
        <svg {...common}>
          <path d="M2 7h22m0 0-5-4.5M24 7l-5 4.5" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "roundTrip":
      return (
        <svg {...common}>
          <path d="M5 7h20M5 7l4.5-4M5 7l4.5 4M25 7l-4.5-4M25 7l-4.5 4" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "loop":
      return (
        <svg {...common}>
          <path d="M8 2h14a5 5 0 0 1 0 10H8a5 5 0 0 1 0-10z" stroke={c} strokeWidth="2" />
          <path d="M13 .5l3 1.5-3 1.5" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "metro":
      return (
        <svg {...common}>
          <path d="M3 7h24" stroke={c} strokeWidth="2" />
          <circle cx="4" cy="7" r="3" fill={c} />
          <circle cx="12" cy="7" r="2.6" fill="#0b1224" stroke={c} strokeWidth="1.8" />
          <circle cx="20" cy="7" r="2.6" fill="#0b1224" stroke={c} strokeWidth="1.8" />
          <circle cx="27" cy="7" r="3" fill={c} />
        </svg>
      );
    case "metroLoop":
      return (
        <svg {...common}>
          <path d="M8 2h14a5 5 0 0 1 0 10H8a5 5 0 0 1 0-10z" stroke={c} strokeWidth="1.8" />
          {[
            [8, 2],
            [22, 2],
            [22, 12],
            [8, 12],
          ].map(([x, y]) => (
            <circle key={`${x}${y}`} cx={x} cy={y} r="2.4" fill={c} />
          ))}
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M3 7h24" stroke={c} strokeWidth="1.6" strokeDasharray="3 3" />
          <circle cx="4" cy="7" r="2.4" stroke={c} strokeWidth="1.6" />
          <circle cx="26" cy="7" r="2.4" stroke={c} strokeWidth="1.6" />
        </svg>
      );
  }
}

/** La répartition des services par forme : l'organisation des dessertes, pas seulement leur nombre. */
export function ShapesCard({ shapes, total }: { shapes: Shapes; total: number }) {
  const t = useTranslations("Home.referentials.shapes");
  const fmt = useFmt();
  return (
    <Card title={t("title")} aside={`${fmt(total)} ${t("unit")}`} grow>
      <div className="rb-rows">
      {SHAPE_IDS.map((id, i) => (
        <div key={id} className="rb-row">
          <Glyph id={id} />
          <span>{t(id)}</span>
          <span className="rb-track">
            <i style={{ width: `${Math.max((shapes[id] / total) * 100, shapes[id] > 0 ? 1 : 0)}%`, background: SHAPE_COLOR[id], ["--d" as string]: `${0.35 + i * 0.08}s` }} />
          </span>
          <span className="rb-num">{fmt(shapes[id])}</span>
        </div>
      ))}
      </div>
    </Card>
  );
}

const STATUS_COLOR = { inService: "#34d399", construction: "#fb923c", planned: "#94a3b8" } as const;
const STATUS_IDS = ["inService", "construction", "planned"] as const;

/** L'état des sites : un anneau (la part de chacun) et, dessous, le nombre de sites par état. */
export function StatusCard({ status, total }: { status: Record<keyof typeof STATUS_COLOR, number>; total: number }) {
  const t = useTranslations("Home.referentials.status");
  const fmt = useFmt();
  let offset = 0;
  const arcs = STATUS_IDS.map((id) => {
    const share = (status[id] / total) * 100;
    const arc = { id, share, offset };
    offset += share;
    return arc;
  });
  return (
    <Card title={t("title")} grow>
      <div className="rb-donut-wrap">
        <svg className="rb-donut" viewBox="0 0 42 42" aria-hidden="true" focusable="false">
          <circle className="rb-donut-bg" cx="21" cy="21" r="15.9155" />
          {arcs.map(({ id, share, offset: o }, i) => (
            <circle
              key={id}
              className="rb-donut-arc"
              cx="21"
              cy="21"
              r="15.9155"
              pathLength={100}
              transform="rotate(-90 21 21)"
              stroke={STATUS_COLOR[id]}
              strokeDasharray={`${Math.max(share - 1, 0)} ${100 - Math.max(share - 1, 0)}`}
              strokeDashoffset={-o}
              style={{ ["--d" as string]: `${0.35 + i * 0.18}s` }}
            />
          ))}
        </svg>
        <div className="rb-donut-c">
          <b>{fmt(total)}</b>
          <span>{t("sites")}</span>
        </div>
      </div>
      <div className="rb-rows">
        {STATUS_IDS.map((id) => (
          <div key={id} className="rb-row" style={{ gridTemplateColumns: "1.2rem minmax(0,1fr) 3.2rem" }}>
            <i className="rb-dot" style={{ background: STATUS_COLOR[id] }} />
            <span>{t(id)}</span>
            <span className="rb-num">{fmt(status[id])}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ fiches */

export function Pill({ children, color, bg }: { children: ReactNode; color: string; bg: string }) {
  return (
    <span className="rb-pill" style={{ color, background: bg }}>
      {children}
    </span>
  );
}

/** Une ligne de dessertes : des arrêts reliés, un terminus à chaque bout. */
export function Stops({ stops, color }: { stops: readonly { name: string; code?: string }[]; color: string }) {
  return (
    <div className="rb-stops" style={{ ["--line" as string]: color }}>
      {stops.map((s, i) => (
        <div key={s.name} className="rb-stop" data-end={i === 0 || i === stops.length - 1} style={{ ["--d" as string]: `${0.5 + i * 0.22}s` }}>
          <u />
          <b>{s.name}</b>
          {s.code && <small>{s.code}</small>}
        </div>
      ))}
    </div>
  );
}

export function Tags({ items, extra }: { items: readonly string[]; extra?: string }) {
  return (
    <div className="rb-tags">
      {items.map((x) => (
        <span key={x} className="rb-tag">
          {x}
        </span>
      ))}
      {extra && <span className="rb-tag">{extra}</span>}
    </div>
  );
}

export function Points({ items }: { items: readonly string[] }) {
  return (
    <ul className="rb-list-pts">
      {items.map((x) => (
        <li key={x}>{x}</li>
      ))}
    </ul>
  );
}

/** Ce que contient une fiche : les champs que le référentiel porte pour chaque enregistrement. */
export function Contains({ label, items, extra }: { label: string; items: readonly string[]; extra?: string }) {
  return (
    <div className="rb-contains">
      <p>{label}</p>
      <Tags items={items} extra={extra} />
    </div>
  );
}
