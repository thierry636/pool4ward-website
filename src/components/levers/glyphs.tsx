import type { CSSProperties, ReactNode } from "react";
import { LEVER_COLOR, type LeverId } from "@/lib/levers/data";

/**
 * Les sigles des filigranes : un schéma par levier, repris du langage des tuiles du portail
 * (un trait gris pour le réseau tel qu'il est, la couleur du levier pour ce qu'il change).
 * Chaque élément se dessine à son tour (`--d`), classes pilotées par levers.css.
 */
const GRID = "#94a3b8";
const d = (s: number): CSSProperties => ({ ["--d" as string]: `${s}s` });

function Draw({ path, stroke, w = 3, at, op }: { path: string; stroke: string; w?: number; at: number; op?: number }) {
  return <path className="wm-draw" pathLength={1} d={path} stroke={stroke} strokeWidth={w} strokeOpacity={op} style={d(at)} />;
}

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg className="wm-logo" viewBox="8 12 304 96" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

function Rail({ c }: { c: string }) {
  return (
    <Svg>
      <Draw path="M24 60H140" stroke={GRID} at={0} />
      <Draw path="M140 60C170 60 170 48 200 48" stroke={GRID} at={0.5} />
      <Draw path="M140 60C170 60 170 72 200 72" stroke={GRID} at={0.5} />
      <Draw path="M200 48H298" stroke={c} at={0.9} />
      <Draw path="M200 72H298" stroke={c} at={0.9} />
      <path className="wm-fade" stroke={c} strokeOpacity=".55" strokeWidth="2.2" d="M214 42v36M232 42v36M250 42v36M268 42v36M286 42v36" style={d(1.3)} />
      <circle className="wm-fade" cx="64" cy="60" r="6" fill={GRID} style={d(0)} />
      <g className="wm-train" style={d(1.5)}>
        <rect x="228" y="51" width="40" height="18" rx="5" fill={c} />
        <path d="M236 56h8M250 56h8" stroke="#0b1224" strokeOpacity=".45" strokeWidth="2.4" />
      </g>
    </Svg>
  );
}

function Shortsea({ c }: { c: string }) {
  return (
    <Svg>
      <Draw path="M24 60H104" stroke={GRID} at={0} />
      <Draw path="M232 60H296" stroke={GRID} at={1.4} />
      <Draw path="M112 44v32" stroke={GRID} at={0.4} />
      <Draw path="M224 44v32" stroke={GRID} at={1.1} />
      <Draw path="M120 40q13-7 26 0t26 0t26 0t26 0" stroke={c} at={0.7} op={0.45} />
      <Draw path="M120 82q13-7 26 0t26 0t26 0t26 0" stroke={c} at={0.8} />
      <circle className="wm-fade" cx="64" cy="60" r="6" fill={GRID} style={d(0)} />
      <g className="wm-train" style={d(1.3)}>
        <path d="M144 62h60l-8 12h-46z" fill={c} />
        <path d="M156 62v-8h18v8" fill={c} />
      </g>
    </Svg>
  );
}

function Loops({ c }: { c: string }) {
  return (
    <Svg>
      <Draw path="M52 88.9L147.9 33.1" stroke={GRID} at={0.2} />
      <path className="wm-dashed" d="M172.1 33.1L267.9 88.9" stroke={GRID} strokeWidth="3" style={d(0.9)} />
      <Draw path="M54 96H266" stroke={c} at={0} w={4} />
      <g className="wm-fade" fill="#0b1224" stroke={c} strokeWidth="3" style={d(0.3)}>
        <circle cx="40" cy="96" r="7" />
        <circle cx="280" cy="96" r="7" />
        <circle cx="160" cy="26" r="7" />
      </g>
      <g className="wm-train" style={d(1.2)}>
        <rect x="147" y="89" width="30" height="14" rx="4" fill={c} />
      </g>
    </Svg>
  );
}

function Crossdock({ c }: { c: string }) {
  return (
    <Svg>
      <Draw path="M20 24L100 60" stroke={GRID} at={0} w={2.4} />
      <Draw path="M24 44L100 60" stroke={GRID} at={0.1} w={2.4} />
      <Draw path="M14 60H100" stroke={GRID} at={0.2} w={2.4} />
      <Draw path="M24 76L100 60" stroke={GRID} at={0.3} w={2.4} />
      <Draw path="M20 96L100 60" stroke={GRID} at={0.4} w={2.4} />
      <circle className="wm-fade" cx="104" cy="60" r="10" fill="#0b1224" stroke={c} strokeWidth="3" style={d(0.8)} />
      <Draw path="M118 60H266" stroke={c} at={1.0} w={9} />
      <g className="wm-train" style={d(1.7)}>
        <rect x="268" y="44" width="30" height="32" rx="4" fill={c} />
        <path d="M274 44v-10h8v10" fill="none" stroke={c} strokeWidth="3" />
      </g>
    </Svg>
  );
}

function Electric({ c }: { c: string }) {
  const bolt = "M0 -8l-6 9h5l-3 7 8-10h-5l3-6z";
  return (
    <Svg>
      <Draw path="M24 60H110" stroke={GRID} at={0} />
      <Draw path="M110 60H296" stroke={c} at={0.5} w={3.4} />
      <circle className="wm-fade" cx="24" cy="60" r="6" fill={GRID} style={d(0)} />
      {[150, 250].map((x, i) => (
        <g key={x} className="wm-fade" style={d(1.1 + i * 0.3)}>
          <circle cx={x} cy="60" r="13" fill="#0b1224" stroke={c} strokeWidth="3" />
          <path transform={`translate(${x + 1} 63)`} d={bolt} fill={c} />
        </g>
      ))}
      <g className="wm-train" style={d(1.8)}>
        <rect x="187" y="53" width="30" height="14" rx="4" fill={c} />
      </g>
    </Svg>
  );
}

function Pooling({ c }: { c: string }) {
  const cols = [LEVER_COLOR.rail, LEVER_COLOR.shortsea, "#fbbf24"] as const;
  return (
    <Svg>
      <Draw path="M24 28C84 28 104 60 150 60" stroke={cols[0]} at={0} w={2.6} />
      <Draw path="M24 60H150" stroke={cols[1]} at={0.15} w={2.6} />
      <Draw path="M24 92C84 92 104 60 150 60" stroke={cols[2]} at={0.3} w={2.6} />
      <Draw path="M150 60H284" stroke="#e2e8f0" at={0.9} w={13} op={0.3} />
      {cols.map((col, i) => (
        <Draw key={col} path={`M150 ${57 + i * 3}H284`} stroke={col} at={1 + i * 0.1} w={2.4} />
      ))}
      <g className="wm-fade" fill="#0b1224" stroke={c} strokeWidth="3" style={d(0.8)}>
        <circle cx="150" cy="60" r="8" />
      </g>
      <g className="wm-fade" fill="#0b1224" stroke={c} strokeWidth="3" style={d(1.8)}>
        <circle cx="294" cy="60" r="8" />
      </g>
    </Svg>
  );
}

const GLYPHS: Record<LeverId, (p: { c: string }) => ReactNode> = { rail: Rail, shortsea: Shortsea, loops: Loops, crossdock: Crossdock, electric: Electric, pooling: Pooling };

export function LeverGlyph({ lever }: { lever: LeverId }) {
  const Glyph = GLYPHS[lever];
  return <Glyph c={lever === "crossdock" ? "#e2e8f0" : LEVER_COLOR[lever]} />;
}
