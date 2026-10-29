"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import {
  FLOWS,
  FLOW_IDS,
  LOOP_PATH,
  MODAL_F2,
  RAIL_PATH,
  RIVER_PATH,
  SITES,
  TERMINALS,
  emptyReturnPath,
  flowCurve,
  flowMid,
  flowPath,
  cubicAt,
  flowTag,
  tangentAngle,
  type FlowId,
  type Pt,
  type SiteId,
} from "@/content/journey/geometry";
import {
  SLOT_E_EARLY,
  SLOT_WINDOWS,
  flowLook,
  loopIsClosed,
  lotOf,
  lotsOf,
  type JourneyState,
} from "@/content/journey/state";
import { PARTNERS, PARTNER_BOX, lotTagPos } from "@/content/journey/partners";
import "./board.css";

/* ------------------------------------------------------------------------
 * Plateau SVG du parcours. Un seul jeu d'éléments traverse les trois étapes :
 * ce qui change, c'est l'opacité, le trait et la couleur de chaque élément,
 * par transition CSS. Aucune animation par image : le plateau est inerte tant
 * que l'état ne change pas, et fixe sous « mouvement réduit ».
 * ---------------------------------------------------------------------- */

interface BoardProps {
  state: JourneyState;
  tone: "light" | "dark";
  /** Couverture : fait glisser les flux séparés vers la boucle (0 → 1). */
  cover?: number;
  label: string;
  className?: string;
}

const SITE_IDS = ["N", "C", "E", "S"] as const satisfies readonly SiteId[];

const SITE_LABEL: Record<SiteId, { x: number; y: number; anchor: "start" | "middle" | "end" }> = {
  N: { x: 150, y: 118, anchor: "middle" },
  C: { x: 462, y: 366, anchor: "start" },
  E: { x: 760, y: 186, anchor: "middle" },
  S: { x: 246, y: 654, anchor: "end" },
};

/**
 * Ancre des annotations d'un site (créneau, moyens). Une seule couche
 * d'annotations est affichée à la fois : les ancres n'ont donc pas à cohabiter,
 * seulement à rester hors des tracés.
 */
const ANN: Record<SiteId, Pt> = {
  N: [300, 130],
  C: [572, 318],
  E: [800, 272],
  S: [344, 640],
};

/** Côté et distance des étiquettes de flux : toujours vers le vide du plateau. */
const FLOW_TAG: Record<FlowId, { t: number; d: number }> = {
  F1: { t: 0.5, d: -40 },
  F2: { t: 0.5, d: -40 },
  F3: { t: 0.55, d: -42 },
  F4: { t: 0.5, d: -48 },
  F5: { t: 0.5, d: -50 },
  F6: { t: 0.5, d: 50 },
};

const EQUIPMENT: Record<FlowId, "pallets" | "bulk" | "container"> = {
  F1: "pallets",
  F2: "pallets",
  F3: "bulk",
  F4: "container",
  F5: "pallets",
  F6: "pallets",
};
const EQUIP_LETTER = { pallets: "P", bulk: "V", container: "C" } as const;

const DRIVERS: Record<SiteId, number> = { N: 2, C: 3, E: 1, S: 2 };
/** Recharge électrique sur site : oui, à confirmer, non. */
const CHARGER: Record<SiteId, "yes" | "tbc" | "no"> = { N: "tbc", C: "yes", E: "yes", S: "no" };

const CONTRACT_END: Record<FlowId, string> = {
  F1: "03/2027",
  F2: "03/2027",
  F3: "spot",
  F4: "spot",
  F5: "12/2026",
  F6: "12/2026",
};

const TONE_VAR: Record<string, string> = {
  muted: "var(--c-muted)",
  group: "var(--c-group)",
  electric: "var(--c-electric)",
  lot1: "var(--c-lot1)",
  lot2: "var(--c-lot2)",
};

function Arrow({ id, t, color, opacity }: { id: FlowId; t: number; color: string; opacity: number }) {
  const c = flowCurve(id);
  const [x, y] = cubicAt(c, t);
  return (
    <path
      className="t"
      d="M-9,-8 L8,0 L-9,8 Z"
      fill={color}
      style={{ opacity }}
      transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${tangentAngle(c, t).toFixed(1)})`}
    />
  );
}

export function Board({ state, tone, cover, label, className = "" }: BoardProps) {
  const t = useTranslations("Journey");
  const uid = useId().replace(/:/g, "");
  const isCover = cover !== undefined;
  const { stage, layer, scenario, slotE, contractStep } = state;

  /* ---- ce que montre chaque couche ---- */
  const showFlows = isCover || stage > 1 || layer >= 1;
  const showVolumes = isCover || stage > 1 || layer >= 2;
  const showSlots = !isCover && stage === 1 && layer === 3;
  const showAssets = !isCover && stage === 1 && layer === 4;
  const showContracts = !isCover && stage === 1 && layer === 5;
  const showScenarioTags = !isCover && stage === 2;

  const closed = loopIsClosed(state);
  const loopOn = isCover ? true : scenario === "loop" && stage >= 2;
  const loopDraw = isCover ? (cover as number) : loopOn ? (closed || stage === 3 ? 1 : 0) : 0;
  const loopDraft = !isCover && loopOn && !closed && stage >= 2;
  const returnsOn = (id: FlowId): number => {
    if (id === "F5" || id === "F6") return 0;
    if (isCover) return 1 - (cover as number);
    if (stage === 1) return layer === 2 ? 0.55 : 0;
    if (scenario === "loop") return closed ? 0 : 0.3;
    return stage === 2 ? 0.4 : 0;
  };

  const modalOn = !isCover && scenario === "modal" && stage >= 2;
  const electricOn = !isCover && scenario === "electric" && stage >= 2;
  const freqOn = !isCover && scenario === "frequency" && stage >= 2;
  const poolOn = !isCover && scenario === "pooling" && stage >= 2;

  const lots = stage === 3 ? lotsOf(scenario) : [];
  const partners = stage === 3 ? PARTNERS[scenario as keyof typeof PARTNERS] ?? [] : [];

  const slotText = (s: SiteId) => (s === "E" && slotE === "early" ? SLOT_E_EARLY : SLOT_WINDOWS[s]);

  return (
    <div className={`board board-${tone} ${className}`}>
      <div className="board-terrain" aria-hidden="true" />
      <svg viewBox="0 0 900 760" role="img" aria-label={label}>
        <defs>
          <pattern id={`${uid}-ties`} width="14" height="14" patternUnits="userSpaceOnUse">
            <path d="M7,-3 V17" stroke="currentColor" strokeWidth="3" />
          </pattern>
        </defs>

        {/* ---- fleuve et voie ferrée : décor d'infrastructure ---- */}
        <g aria-hidden="true">
          <path d={RIVER_PATH} fill="none" stroke="var(--c-river)" strokeWidth="16" strokeLinecap="round" opacity="0.28" />
          <path d={RIVER_PATH} fill="none" stroke="var(--c-river)" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
          {(["west", "main", "east"] as const).map((seg) => (
            <g key={seg} className="t" style={{ opacity: seg === "main" && modalOn ? 1 : 0.5, color: "var(--c-rail)" }}>
              <path d={RAIL_PATH[seg]} fill="none" stroke="var(--c-rail)" strokeWidth="9" strokeLinecap="butt" strokeDasharray="3 11" opacity="0.9" />
              <path d={RAIL_PATH[seg]} fill="none" stroke="var(--c-rail)" strokeWidth="2.4" />
            </g>
          ))}
        </g>

        {/* ---- retours à vide : la liaison parcourue dans l'autre sens ---- */}
        <g aria-hidden="true" fill="none" stroke="var(--c-ghost)" strokeWidth="2.6" strokeDasharray="5 9" strokeLinecap="round">
          {FLOW_IDS.filter((id) => id !== "F5" && id !== "F6").map((id) => (
            <path key={id} className="t" d={emptyReturnPath(id)} style={{ opacity: returnsOn(id) }} />
          ))}
        </g>

        {!isCover && (
          <>
        {/* ---- lots (étape 3) : bandes sous les flux ---- */}
        <g aria-hidden="true" fill="none" strokeLinecap="round">
          {FLOW_IDS.map((id) => {
            const lot = stage === 3 ? lotOf(id, scenario) : 0;
            const replaced = scenario === "loop" || scenario === "modal";
            return (
              <path
                key={id}
                className="t"
                d={flowPath(id)}
                stroke={lot === 2 ? "var(--c-lot2)" : "var(--c-lot1)"}
                strokeWidth="30"
                style={{ opacity: lot > 0 && !(replaced && id === "F2" && scenario === "modal") ? 0.14 : 0 }}
              />
            );
          })}
        </g>
          </>
        )}

        {/* ---- flux de base ---- */}
        <g fill="none" strokeLinecap="round">
          {FLOW_IDS.map((id) => {
            const look = flowLook(id, FLOWS[id].volume, state);
            const visible = showFlows && look.opacity > 0;
            const color = isCover ? "var(--c-muted)" : TONE_VAR[look.tone];
            const coverFade = isCover ? 1 - 0.8 * (cover as number) : 1;
            return (
              <path
                key={id}
                className="t"
                d={flowPath(id)}
                pathLength={1}
                stroke={color}
                strokeWidth={isCover ? (showVolumes ? [0, 3, 5.5, 8][FLOWS[id].volume] : 3) : look.width}
                strokeDasharray="1 1"
                style={{
                  strokeDashoffset: visible ? 0 : 1,
                  opacity: visible ? look.opacity * coverFade : 0,
                }}
              />
            );
          })}
        </g>

        {/* ---- repères de sens, une flèche par liaison ---- */}
        <g aria-hidden="true">
          {FLOW_IDS.filter((id) => id !== "F6").map((id) => {
            const look = flowLook(id, FLOWS[id].volume, state);
            const op = showFlows ? Math.min(look.opacity, 0.9) * (isCover ? 1 - 0.85 * (cover as number) : 1) : 0;
            return (
              <Arrow
                key={id}
                id={id}
                t={0.55}
                color={isCover ? "var(--c-muted)" : TONE_VAR[look.tone]}
                opacity={op}
              />
            );
          })}
        </g>

        {!isCover && (
          <>
        {/* ---- récurrence : un point par départ hebdomadaire ---- */}
        <g aria-hidden="true" fill="none" strokeLinecap="round">
          {FLOW_IDS.map((id) => {
            const n = freqOn && id === "F1" ? 3 : FLOWS[id].perWeek;
            const look = flowLook(id, FLOWS[id].volume, state);
            const on = !isCover && showVolumes && (stage > 1 || layer >= 2) && look.opacity > 0.2 && !(id === "F6");
            return (
              <path
                key={id}
                className="t"
                d={flowPath(id)}
                pathLength={100}
                stroke="var(--halo)"
                strokeWidth={freqOn && id === "F1" ? 6 : 3.6}
                strokeDasharray={`0.01 ${(100 / n - 0.01).toFixed(2)}`}
                strokeDashoffset={-(100 / n) / 2}
                style={{ opacity: on ? 1 : 0 }}
              />
            );
          })}
        </g>
          </>
        )}

        {/* ---- boucle : les quatre liaisons mises bout à bout ---- */}
        <g aria-hidden="true" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path
            className="t"
            d={LOOP_PATH}
            stroke="var(--c-loop)"
            strokeWidth="5"
            strokeDasharray="12 12"
            style={{ opacity: loopDraft ? 0.95 : 0 }}
          />
          <path
            className="t"
            d={LOOP_PATH}
            pathLength={1}
            stroke={stage === 3 ? "var(--c-lot1)" : "var(--c-loop)"}
            strokeWidth={isCover ? 8 : 9}
            strokeDasharray="1 1"
            style={{
              strokeDashoffset: 1 - loopDraw,
              opacity: loopDraw > 0 ? 1 : 0,
            }}
          />
          {(["F1", "F2", "F3", "F4"] as const).map((id) => (
            <Arrow
              key={id}
              id={id}
              t={0.55}
              color={stage === 3 ? "var(--c-lot1)" : "var(--c-loop)"}
              opacity={loopDraw > 0.95 ? 1 : 0}
            />
          ))}
        </g>

        {!isCover && (
          <>
        {/* ---- électrique : traction électrique sur les liaisons à recharge aux deux bouts ---- */}
        <g aria-hidden="true" fill="none" strokeLinecap="round">
          {(["F1", "F2"] as const).map((id) => (
            <path
              key={id}
              className="t"
              d={flowPath(id)}
              stroke="var(--c-electric)"
              strokeWidth="14"
              style={{ opacity: electricOn && stage === 2 ? 0.2 : 0 }}
            />
          ))}
        </g>

        {/* ---- modal : route jusqu'au terminal, rail, route depuis le terminal ---- */}
        <g aria-hidden="true" fill="none" strokeLinecap="round">
          <path className="t" d={MODAL_F2.pre} stroke={stage === 3 ? "var(--c-lot1)" : "var(--c-group)"} strokeWidth="8" pathLength={1} strokeDasharray="1 1" style={{ strokeDashoffset: modalOn ? 0 : 1, opacity: modalOn ? 1 : 0 }} />
          <path className="t" d={MODAL_F2.rail} stroke={stage === 3 ? "var(--c-lot1)" : "var(--c-group)"} strokeWidth="9" pathLength={1} strokeDasharray="1 1" style={{ strokeDashoffset: modalOn ? 0 : 1, opacity: modalOn ? 1 : 0 }} />
          <path className="t" d={MODAL_F2.post} stroke={stage === 3 ? "var(--c-lot1)" : "var(--c-group)"} strokeWidth="8" pathLength={1} strokeDasharray="1 1" style={{ strokeDashoffset: modalOn ? 0 : 1, opacity: modalOn ? 1 : 0 }} />
        </g>

        {/* ---- terminaux rail-route ---- */}
        <g>
          {(["T1", "T2"] as const).map((id) => {
            const p = TERMINALS[id];
            const on = modalOn;
            return (
              <g key={id} className="t" style={{ opacity: on ? 1 : 0.0 }} transform={`translate(${p.x} ${p.y})`}>
                <rect x="-11" y="-11" width="22" height="22" transform="rotate(45)" fill="var(--c-node)" stroke="var(--halo)" strokeWidth="3" />
              </g>
            );
          })}
          <text className="lbl-2 t" x={TERMINALS.T1.x + 4} y={TERMINALS.T1.y + 38} textAnchor="middle" style={{ opacity: modalOn ? 1 : 0 }}>
            {t("board.terminal")}
          </text>
          <text className="lbl-2 t" x={TERMINALS.T2.x + 16} y={TERMINALS.T2.y + 40} textAnchor="middle" style={{ opacity: modalOn ? 1 : 0 }}>
            {t("board.terminal")}
          </text>
        </g>

        {/* ---- étiquettes de flux : récurrence, mutualisation ---- */}
        <g aria-hidden="true">
          {showScenarioTags && poolOn && (
            <ChipLabel x={flowTag("F5", 0.5, -78)[0]} y={flowTag("F5", 0.5, -78)[1]} text={t("board.pooled")} />
          )}
          {showScenarioTags && freqOn && (
            <ChipLabel x={flowTag("F1", 0.5, -46)[0]} y={flowTag("F1", 0.5, -46)[1]} text={t("board.perWeek", { n: 3 })} strong />
          )}
          {!isCover && stage === 1 && layer === 2 &&
            (["F1", "F2", "F3", "F4"] as const).map((id) => {
              const { t: tt, d } = FLOW_TAG[id];
              const [x, y] = flowTag(id, tt, d);
              return <ChipLabel key={id} x={x} y={y} text={t("board.perWeek", { n: FLOWS[id].perWeek })} />;
            })}
        </g>

        {/* ---- étape 1 · couche « moyens » : équipements ---- */}
        <g aria-hidden="true">
          {FLOW_IDS.filter((id) => id !== "F6").map((id) => {
            const [x, y] = flowMid(id, id === "F5" ? 0.25 : 0.72);
            return (
              <g key={id} className="t" style={{ opacity: showAssets ? 1 : 0 }} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
                <circle r="17" className="chip-bg" />
                <text className="chip-text" textAnchor="middle" y="7">
                  {EQUIP_LETTER[EQUIPMENT[id]]}
                </text>
              </g>
            );
          })}
        </g>

        {/* ---- étape 1 · couche « contrats » : échéances ---- */}
        <g aria-hidden="true">
          {(["F1", "F2", "F3", "F4", "F5"] as const).map((id) => {
            const { t: tt, d } = FLOW_TAG[id];
            const [x, y] = flowTag(id, tt, d);
            return (
              <g key={id} className="t" style={{ opacity: showContracts ? 1 : 0 }}>
                <ChipLabel x={x} y={y} text={CONTRACT_END[id] === "spot" ? t("board.spot") : `→ ${CONTRACT_END[id]}`} />
              </g>
            );
          })}
        </g>

        {/* ---- lots (étape 3) : étiquettes ---- */}
        <g aria-hidden="true">
          {lots.map((lot) => {
            const [x, y] = lotTagPos(scenario, lot);
            return (
              <g key={lot} className="t" style={{ opacity: 1 }}>
                <LotTag x={x} y={y} lot={lot} text={t("board.lot", { n: lot })} sealed={contractStep >= 3} sealText={t("board.contract")} />
              </g>
            );
          })}
          {/* point ouvert à l'entrepôt Est tant que le créneau n'est pas validé */}
          {stage === 3 && scenario === "loop" && slotE === "late" && (
            <ChipLabel x={SITES.E.x - 8} y={SITES.E.y + 72} text={t("board.slotOpen")} warn />
          )}
        </g>

        {/* ---- partenaires à interroger (étape 3) ---- */}
        <g>
          {partners.map((slot, i) => {
            const box = PARTNER_BOX[slot.id];
            const on = contractStep >= 1;
            const lotColor = slot.lot === 2 ? "var(--c-lot2)" : "var(--c-lot1)";
            const [tx, ty] = lotTagPos(scenario, slot.lot);
            const offer = i === 0 ? "A" : "B";
            return (
              <g key={slot.id} className="t" style={{ opacity: on ? 1 : 0 }} aria-hidden={!on}>
                <line x1={box.x + box.w / 2} y1={box.y + 2} x2={tx} y2={ty} stroke={lotColor} strokeWidth="2.4" strokeDasharray={contractStep >= 2 ? "none" : "6 7"} opacity="0.85" />
                <rect x={box.x} y={box.y - 22} width={box.w} height="44" rx="3" className="chip-bg" style={{ stroke: lotColor, strokeWidth: 2 }} />
                <text x={box.x + 14} y={box.y + 7} className="chip-text">
                  {t(`board.partners.${slot.id}`)}
                </text>
                {contractStep >= 2 && (
                  <g transform={`translate(${box.x + box.w - 6} ${box.y - 22})`}>
                    <circle r="15" fill={lotColor} />
                    <text className="chip-text" textAnchor="middle" y="7" style={{ fill: "var(--c-node-ink)", fontWeight: 700 }}>
                      {offer}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>

        {/* ---- bornes de recharge, conducteurs : une pastille par site ---- */}
        <g aria-hidden="true">
          {SITE_IDS.map((sid) => {
            const [ax, ay] = ANN[sid];
            const kind = CHARGER[sid];
            const withBolt = kind !== "no";
            const w = withBolt ? 124 : 78;
            return (
              <g key={sid} className="t" style={{ opacity: showAssets ? 1 : 0 }} transform={`translate(${ax} ${ay})`}>
                <rect x={-w / 2} y="-19" width={w} height="38" rx="3" className="chip-bg" />
                {withBolt && (
                  <g transform="translate(-34 0)">
                    <Bolt filled={kind === "yes"} />
                  </g>
                )}
                <g transform={`translate(${withBolt ? 8 : -22} 0)`}>
                  <Person />
                  <text className="chip-text" x="24" y="7">
                    ×{DRIVERS[sid]}
                  </text>
                </g>
              </g>
            );
          })}
          {/* électrique (étape 2) : bornes présentes ou à confirmer sur les trois sites reliés */}
          {(["N", "C", "E"] as const).map((sid) => {
            const p = SITES[sid];
            const off = sid === "E" ? [38, 0] : sid === "N" ? [-38, 0] : [0, -38];
            return (
              <g key={sid} className="t" style={{ opacity: electricOn ? 1 : 0 }} transform={`translate(${p.x + off[0]} ${p.y + off[1]})`}>
                <circle r="19" className="chip-bg" />
                <Bolt filled={CHARGER[sid] === "yes"} />
              </g>
            );
          })}
        </g>

        {/* ---- créneaux ---- */}
        <g aria-hidden="true">
          {SITE_IDS.map((sid) => {
            const [x, y] = ANN[sid];
            const flagged = sid === "E" && slotE === "late" && stage >= 2 && scenario === "loop";
            const on = showSlots || (sid === "E" && stage === 2 && scenario === "loop") || (sid === "E" && stage === 3 && scenario === "loop");
            return (
              <g key={sid} className="t" style={{ opacity: on ? 1 : 0 }}>
                <ChipLabel x={x} y={y} text={slotText(sid)} warn={flagged} clock />
              </g>
            );
          })}
        </g>
          </>
        )}

        {/* ---- sites du groupe ---- */}
        <g>
          {SITE_IDS.map((s) => {
            const p = SITES[s];
            const lab = SITE_LABEL[s];
            const flagged = s === "E" && stage >= 2 && scenario === "loop" && slotE === "late";
            return (
              <g key={s}>
                <circle className="t" cx={p.x} cy={p.y} r="30" fill="var(--c-node)" opacity="0.1" />
                {flagged && <circle className="pulse" cx={p.x} cy={p.y} r="26" fill="none" stroke="var(--c-warn)" strokeWidth="3" />}
                <circle cx={p.x} cy={p.y} r="15" fill="var(--c-node)" stroke="var(--halo)" strokeWidth="4" />
                <circle cx={p.x} cy={p.y} r="5" fill="var(--c-node-ink)" />
                <text className="lbl site-name" x={lab.x} y={lab.y} textAnchor={lab.anchor}>
                  {t(`sites.${s}`)}
                </text>
              </g>
            );
          })}
        </g>

        {/* ---- mention permanente ---- */}
        <text className="lbl-2" x="20" y="742" opacity="0.9">
          {t("board.demo")}
        </text>
      </svg>
    </div>
  );
}

/* ----------------------------------------------------------------- pièces */

function ChipLabel({
  x,
  y,
  text,
  warn,
  strong,
  clock,
}: {
  x: number;
  y: number;
  text: string;
  warn?: boolean;
  strong?: boolean;
  clock?: boolean;
}) {
  const w = text.length * 12.6 + (clock ? 44 : 26);
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
      <rect x={-w / 2} y="-17" width={w} height="34" rx="3" className="chip-bg" style={warn ? { stroke: "var(--c-warn)", strokeWidth: 2.4 } : strong ? { stroke: "var(--c-group)", strokeWidth: 2.4 } : undefined} />
      {clock && (
        <g transform={`translate(${-w / 2 + 16} 0)`}>
          <circle r="7.5" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--c-label-2)" }} />
          <path d="M0,-4 V0 L3.5,2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: "var(--c-label-2)" }} />
        </g>
      )}
      <text className="chip-text" textAnchor="middle" x={clock ? 10 : 0} y="7" style={warn ? { fill: "var(--c-warn)" } : undefined}>
        {text}
      </text>
    </g>
  );
}

function LotTag({ x, y, lot, text, sealed, sealText }: { x: number; y: number; lot: 1 | 2; text: string; sealed: boolean; sealText: string }) {
  const color = lot === 1 ? "var(--c-lot1)" : "var(--c-lot2)";
  const label = sealed ? `${text} · ${sealText}` : text;
  const w = label.length * 13 + 30;
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
      <rect x={-w / 2} y="-19" width={w} height="38" rx="3" fill={color} />
      <text className="chip-text" textAnchor="middle" y="7.5" style={{ fill: "var(--c-node-ink)", fontWeight: 700 }}>
        {label}
      </text>
    </g>
  );
}

function Bolt({ filled }: { filled: boolean }) {
  return (
    <g transform="translate(-9 -12)">
      <path
        d="M10,0 L0,14 H7 L5,24 L16,9 H9 Z"
        fill={filled ? "var(--c-electric)" : "none"}
        stroke="var(--c-electric)"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
    </g>
  );
}

function Person() {
  return (
    <g transform="translate(0 -1)" fill="var(--c-label-2)">
      <circle cx="8" cy="-8" r="5.2" />
      <path d="M-1,13 C-1,2 17,2 17,13 Z" />
    </g>
  );
}
