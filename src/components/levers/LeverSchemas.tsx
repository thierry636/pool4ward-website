import type { CSSProperties, ReactNode } from "react";
import { useTranslations } from "next-intl";
import { LEVER_COLOR, LEVER_ORDER, type LeverId } from "@/lib/levers/data";
import { LeverIcon } from "./icons";
import "./schemas.css";

/**
 * Les six leviers en schéma : pour chacun, la situation de départ (gris, pointillé) et ce que
 * le levier change (couleur, tracé animé). Illustrations sans échelle ni chiffre. Les tracés se
 * dessinent quand la carte entre à l'écran (`reveal-in`, posée par RevealObserver) ; sans
 * script ou en mouvement réduit, le schéma s'affiche terminé.
 */

type P = readonly [number, number];
const M = ([x, y]: P) => `${x},${y}`;
const line = (...pts: P[]) => `M${pts.map(M).join("L")}`;
const GHOST = "#64748b";
const WHITE = "#f1f5f9";
const delay = (s: number): CSSProperties => ({ ["--d" as string]: `${s}s` });

function Ghost({ d, at = 0, w = 2 }: { d: string; at?: number; w?: number }) {
  return <path d={d} className="sch-ghost" strokeWidth={w} style={delay(at)} />;
}

function Draw({ d, color, w = 3.4, at, dur = 1.1, halo }: { d: string; color: string; w?: number; at: number; dur?: number; halo?: string }) {
  const st = { ["--d" as string]: `${at}s`, ["--t" as string]: `${dur}s` } as CSSProperties;
  return (
    <>
      {halo && <path d={d} pathLength={1} className="sch-draw" stroke={halo} strokeOpacity="0.45" strokeWidth={w * 2.8} style={st} />}
      <path d={d} pathLength={1} className="sch-draw" stroke={color} strokeWidth={w} style={st} />
    </>
  );
}

function Run({ d, at, dur = 3.6, n = 2, color = WHITE }: { d: string; at: number; dur?: number; n?: number; color?: string }) {
  return (
    <>
      {Array.from({ length: n }, (_, k) => (
        <circle key={k} r="3.2" fill={color} className="sch-run" style={{ offsetPath: `path("${d}")`, animationDuration: `${dur}s`, animationDelay: `${at + (k * dur) / n}s` }} />
      ))}
    </>
  );
}

function Dot({ at, p, r = 4.6, fill = WHITE, stroke = "#0b1224", sw = 1.6, color }: { at: number; p: P; r?: number; fill?: string; stroke?: string; sw?: number; color?: string }) {
  return <circle cx={p[0]} cy={p[1]} r={r} fill={fill} stroke={color ?? stroke} strokeWidth={sw} className="sch-pop" style={delay(at)} />;
}

function Square({ at, p, color }: { at: number; p: P; color: string }) {
  return <rect x={p[0] - 6} y={p[1] - 6} width="12" height="12" rx="3" fill="#0b1224" stroke={color} strokeWidth="2" className="sch-pop" style={delay(at)} />;
}

const bez = (p: readonly P[], t: number): P => {
  const u = 1 - t;
  return [u * u * u * p[0][0] + 3 * u * u * t * p[1][0] + 3 * u * t * t * p[2][0] + t * t * t * p[3][0], u * u * u * p[0][1] + 3 * u * u * t * p[1][1] + 3 * u * t * t * p[2][1] + t * t * t * p[3][1]];
};

/* ------------------------------------------------------------------ les six schémas */

function Rail() {
  const c = LEVER_COLOR.rail;
  const O: P[] = [[34, 104], [34, 134], [34, 164]];
  const D: P[] = [[288, 20], [288, 50], [288, 80]];
  const T1: P = [100, 122], T2: P = [222, 62];
  const rail = `M${M(T1)}C146,100 184,88 ${M(T2)}`;
  const river = `M${M(T1)}C140,142 196,112 ${M(T2)}`;
  return (
    <>
      {O.map((o, i) => (
        <Ghost key={i} d={line(o, D[i])} at={0.1 + i * 0.1} w={1.7} />
      ))}
      <path d={river} className="sch-fadein" fill="none" stroke="#38bdf8" strokeWidth="2.4" strokeDasharray="6 5" strokeLinecap="round" style={delay(0.9)} />
      {O.map((o, i) => (
        <Draw key={i} d={line(o, T1)} color="#94a3b8" w={2.2} at={1.2 + i * 0.1} dur={0.5} />
      ))}
      <Draw d={rail} color={c} w={4.6} at={1.9} dur={0.9} halo={c} />
      <Run d={rail} at={3.0} n={2} />
      {D.map((d, i) => (
        <Draw key={i} d={line(T2, d)} color="#94a3b8" w={2.2} at={2.9 + i * 0.1} dur={0.5} />
      ))}
      {O.map((o, i) => (
        <Dot key={i} at={0.1 + i * 0.1} p={o} r={4} />
      ))}
      {D.map((d, i) => (
        <Dot key={i} at={0.2 + i * 0.1} p={d} r={4} />
      ))}
      <Square at={1.1} p={T1} color={c} />
      <Square at={2.7} p={T2} color={c} />
    </>
  );
}

function Shortsea() {
  const c = LEVER_COLOR.shortsea;
  const O: P = [34, 40], D: P = [288, 40], A: P = [86, 90], B: P = [234, 90];
  const coast = "M0,100 L40,96 L86,90 L112,93 L150,97 L200,93 L234,90 L270,98 L320,96";
  const sea = `M${M(A)}C104,152 216,152 ${M(B)}`;
  const ports: P[] = [[18, 98], [52, 94], [130, 95], [176, 95], [208, 92], [258, 95], [300, 97]];
  return (
    <>
      <path d={`${coast} L320,0 L0,0 Z`} fill="#0f2147" className="sch-fadein" style={delay(0)} />
      <path d={coast} fill="none" stroke="#2f56b8" strokeWidth="1.6" strokeLinejoin="round" className="sch-fadein" style={delay(0)} />
      <Ghost d={line(O, D)} at={0.2} />
      {ports.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="2.6" fill="#94a3b8" className="sch-pop" style={delay(0.6 + i * 0.07)} />
      ))}
      <Draw d={line(O, A)} color="#94a3b8" w={2.2} at={1.5} dur={0.6} />
      <Draw d={sea} color={c} w={4.2} at={2.1} dur={1.3} halo={c} />
      <Draw d={line(B, D)} color="#94a3b8" w={2.2} at={3.4} dur={0.6} />
      <Run d={sea} at={3.4} n={2} dur={3.2} />
      <Dot at={0.1} p={O} r={4.4} />
      <Dot at={0.3} p={D} r={4.4} />
      <Square at={1.4} p={A} color={c} />
      <Square at={3.2} p={B} color={c} />
    </>
  );
}

function Loops() {
  const c = LEVER_COLOR.loops;
  const A: P = [62, 124], B: P = [258, 110], C: P = [166, 36];
  const flows: [P, P][] = [[[24, 40], [118, 150]], [[300, 30], [196, 160]], [[24, 150], [300, 90]], [[40, 20], [290, 150]], [[150, 10], [170, 168]]];
  return (
    <>
      {flows.map(([a, b], i) => (
        <Ghost key={i} d={line(a, b)} at={0.05 + i * 0.08} w={1.5} />
      ))}
      <Draw d={line(A, B)} color={c} w={3.6} at={1.1} dur={0.8} halo={c} />
      <Draw d={line(B, C)} color={c} w={3.6} at={1.7} dur={0.8} halo={c} />
      <path d={line(C, A)} className="sch-fadein" fill="none" stroke="#94a3b8" strokeWidth="2.6" strokeDasharray="6 5" strokeLinecap="round" style={delay(2.3)} />
      <Run d={`${line(A, B, C)}L${M(A)}`} at={3.2} n={3} dur={4.2} />
      {[A, B, C].map((p, i) => (
        <Dot key={i} at={1.1 + i * 0.5} p={p} r={5.2} />
      ))}
    </>
  );
}

function Crossdock() {
  const S: P[] = [[34, 16], [34, 46], [34, 76], [34, 106], [34, 136], [34, 166]];
  const F: P = [290, 90];
  const H: P = [162, 90];
  return (
    <>
      {S.map((s, i) => (
        <Ghost key={i} d={line(s, F)} at={0.1 + i * 0.07} w={1.4} />
      ))}
      {S.map((s, i) => (
        <Draw key={i} d={line(s, H)} color="#cbd5e1" w={1.8} at={1.0 + i * 0.1} dur={0.7} />
      ))}
      <Draw d={line(H, F)} color={WHITE} w={7} at={2.1} dur={0.9} halo="#4263eb" />
      <Run d={line(H, F)} at={3.2} n={3} dur={2.6} />
      {S.map((s, i) => (
        <Dot key={i} at={0.1 + i * 0.07} p={s} r={3.8} />
      ))}
      <Dot at={2.6} p={F} r={5.6} color="#4263eb" sw={2.2} />
      <circle cx={H[0]} cy={H[1]} r="10" fill="none" stroke={WHITE} strokeWidth="1.6" className="sch-ping" style={delay(1.8)} />
      <Dot at={1.7} p={H} r={7} color={WHITE} fill="#4263eb" sw={2} />
    </>
  );
}

function Electric() {
  const c = LEVER_COLOR.electric;
  const net: P[] = [[22, 40], [64, 18], [110, 30], [152, 14], [196, 34], [240, 16], [292, 36], [38, 82], [86, 70], [130, 84], [176, 70], [224, 86], [270, 74], [304, 96], [24, 128], [70, 150], [118, 134], [158, 160], [206, 140], [252, 158], [296, 138], [44, 170], [284, 172]];
  const loop: P[] = [[62, 126], [118, 52], [212, 46], [270, 118]];
  const d = `M${M(loop[0])}C${M(loop[1])} ${M(loop[2])} ${M(loop[3])}`;
  const back = `M${M(loop[3])}C226,172 120,176 ${M(loop[0])}`;
  const stops = [0.28, 0.72].map((t) => bez(loop, t));
  return (
    <>
      {net.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="2.8" fill="#64748b" className="sch-pop" style={delay(0.1 + i * 0.05)} />
      ))}
      <Draw d={d} color={c} w={3.6} at={1.5} dur={1.3} halo="#b45309" />
      <Draw d={back} color={c} w={3.6} at={2.6} dur={1.1} halo="#b45309" />
      {stops.map((p, i) => (
        <g key={i} className="sch-pop" style={delay(2.2 + i * 0.3)}>
          <circle cx={p[0]} cy={p[1]} r="14" fill={c} fillOpacity="0.1" stroke={c} strokeOpacity="0.4" strokeWidth="1.2" />
          <circle cx={p[0]} cy={p[1]} r="5" fill={c} stroke="#fff7d6" strokeWidth="1.6" />
        </g>
      ))}
      <Run d={`${d}${back.replace("M", "L")}`} at={3.6} n={2} dur={4} color="#fff7d6" />
    </>
  );
}

function Pooling() {
  const cols = [LEVER_COLOR.rail, LEVER_COLOR.shortsea, "#fbbf24"] as const;
  const S: P[] = [[26, 30], [26, 90], [26, 150]];
  const T: P[] = [[294, 30], [294, 90], [294, 150]];
  const Mp: P = [100, 90];
  const D: P = [220, 90];
  const bundle = line(Mp, D);
  return (
    <>
      {S.map((s, i) => (
        <Ghost key={i} d={line(s, T[i])} at={0.1 + i * 0.12} w={1.6} />
      ))}
      {S.map((s, i) => (
        <Draw key={i} d={line(s, Mp)} color={cols[i]} w={2.6} at={0.9 + i * 0.12} dur={0.8} />
      ))}
      <Draw d={bundle} color="#e2e8f0" w={15} at={1.9} dur={0.9} />
      {cols.map((col, i) => (
        <g key={i} transform={`translate(0 ${(i - 1) * 4.6})`}>
          <Draw d={bundle} color={col} w={2.6} at={2.0 + i * 0.05} dur={0.9} />
          <Run d={bundle} at={3.0 + i * 0.4} n={1} dur={2.4} color={col} />
        </g>
      ))}
      {T.map((tt, i) => (
        <Draw key={i} d={line(D, tt)} color={cols[i]} w={2.6} at={3.0 + i * 0.12} dur={0.8} />
      ))}
      {S.map((s, i) => (
        <Dot key={i} at={0.1 + i * 0.12} p={s} r={5} color={cols[i]} sw={2.4} />
      ))}
      {T.map((tt, i) => (
        <Dot key={i} at={0.2 + i * 0.12} p={tt} r={5} color={cols[i]} sw={2.4} />
      ))}
      <Square at={1.7} p={Mp} color={LEVER_COLOR.pooling} />
      <Square at={2.0} p={D} color={LEVER_COLOR.pooling} />
    </>
  );
}

const SCHEMAS: Record<LeverId, () => ReactNode> = { rail: Rail, shortsea: Shortsea, loops: Loops, crossdock: Crossdock, electric: Electric, pooling: Pooling };

export function LeverSchemas() {
  const t = useTranslations("Home.leverSchemas");
  const tl = useTranslations("Home.levers.items");

  return (
    <section id="leviers" className="tone-light tone-light-2 section-y scroll-mt-16" aria-labelledby="schemas-title">
      <div className="wrap">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">{t("eyebrow")}</p>
            <h2 id="schemas-title" className="h2 mt-4">
              {t.rich("title", { em: (chunks) => <em>{chunks}</em> })}
            </h2>
            <p className="lede mt-5">{t("lede")}</p>
          </div>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.85rem] font-medium" style={{ color: "var(--fg-2)" }} aria-label={t("legendLabel")}>
            <li className="flex items-center gap-2">
              <svg width="34" height="8" viewBox="0 0 34 8" aria-hidden="true"><line x1="2" y1="4" x2="32" y2="4" stroke={GHOST} strokeWidth="2" strokeDasharray="5 4" strokeLinecap="round" /></svg>
              {t("legendBefore")}
            </li>
            <li className="flex items-center gap-2">
              <svg width="34" height="8" viewBox="0 0 34 8" aria-hidden="true"><line x1="2" y1="4" x2="32" y2="4" stroke="#4263eb" strokeWidth="3.4" strokeLinecap="round" /></svg>
              {t("legendAfter")}
            </li>
          </ul>
        </div>

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {LEVER_ORDER.map((id, i) => {
            const Schema = SCHEMAS[id];
            return (
              <li key={id} data-reveal className="card card-lift overflow-hidden" style={{ ["--i" as string]: i % 3 }}>
                <div className="sch-panel">
                  <svg role="img" aria-label={tl(`${id}.schema`)} viewBox="0 0 320 180" className="sch" preserveAspectRatio="xMidYMid meet">
                    <Schema />
                  </svg>
                </div>
                <div className="p-5 sm:p-6">
                  <h3 className="flex items-center gap-3 text-[1.12rem] font-bold tracking-tight">
                    <span className="tile-icon !h-9 !w-9 !rounded-[0.65rem]" style={{ color: id === "crossdock" ? "#4263eb" : undefined }}>
                      <LeverIcon id={id} size={19} />
                    </span>
                    {tl(`${id}.name`)}
                  </h3>
                  <p className="mt-3 text-[0.95rem] leading-relaxed" style={{ color: "var(--fg-2)" }}>
                    {tl(`${id}.text`)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-8 text-[0.85rem]" style={{ color: "var(--fg-2)" }}>
          {t("note")}
        </p>
      </div>
    </section>
  );
}
