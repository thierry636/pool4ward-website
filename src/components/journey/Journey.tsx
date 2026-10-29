"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Board } from "./Board";
import { StatusLadder } from "./StatusLadder";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import {
  INITIAL_STATE,
  SCENARIOS,
  TERRAIN_LAYERS,
  CONTRACT_STEPS,
  focusStatus,
  lotsOf,
  retained,
  type JourneyState,
  type ScenarioId,
  type Stage,
} from "@/content/journey/state";

const STAGES: Stage[] = [1, 2, 3];
const LAYER_COUNT = TERRAIN_LAYERS.length; // 5 couches après les sites
const AUTOPLAY_MS = 3400;

export function Journey() {
  const t = useTranslations("Journey");
  const reduced = usePrefersReducedMotion();
  const [state, setState] = useState<JourneyState>(INITIAL_STATE);
  const [auto, setAuto] = useState(false);
  const touched = useRef(false);
  const root = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const patch = useCallback((p: Partial<JourneyState>) => setState((s) => ({ ...s, ...p })), []);

  /* Lecture automatique : seulement à l'étape 1, seulement tant que le
     visiteur n'a rien touché, jamais sous « mouvement réduit », et jamais
     avant que la section soit réellement à l'écran. Elle s'arrête d'elle-même
     à la dernière couche. */
  useEffect(() => {
    if (reduced || !root.current) return;
    const el = root.current;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !touched.current) {
          setAuto(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  useEffect(() => {
    if (!auto) return;
    const id = window.setInterval(() => {
      setState((s) => {
        if (s.stage !== 1 || s.layer >= LAYER_COUNT) {
          setAuto(false);
          return s;
        }
        return { ...s, layer: s.layer + 1 };
      });
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [auto]);

  const act = (p: Partial<JourneyState>) => {
    touched.current = true;
    setAuto(false);
    patch(p);
  };

  const goStage = (stage: Stage) => {
    const next: Partial<JourneyState> = { stage };
    if (stage === 3) {
      next.scenario = retained(state.scenario);
      next.contractStep = 0;
    }
    act(next);
  };

  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    let j = i;
    if (e.key === "ArrowRight") j = (i + 1) % STAGES.length;
    else if (e.key === "ArrowLeft") j = (i + STAGES.length - 1) % STAGES.length;
    else if (e.key === "Home") j = 0;
    else if (e.key === "End") j = STAGES.length - 1;
    else return;
    e.preventDefault();
    goStage(STAGES[j]);
    tabRefs.current[j]?.focus();
  };

  const status = focusStatus(state);
  const label = t("board.aria", { stage: t(`stages.${state.stage}.name`), status: t(`status.${status}.name`) });

  return (
    <div ref={root}>
      <div role="tablist" aria-label={t("stagesLabel")} className="grid grid-cols-3 border-b" style={{ borderColor: "var(--rule)" }}>
        {STAGES.map((st, i) => {
          const active = state.stage === st;
          return (
            <button
              key={st}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              role="tab"
              id={`journey-tab-${st}`}
              aria-selected={active}
              aria-controls={`journey-panel-${st}`}
              tabIndex={active ? 0 : -1}
              onClick={() => goStage(st)}
              onKeyDown={(e) => onTabKey(e, i)}
              className="relative flex min-h-[4.25rem] flex-col items-start gap-1 px-1 pb-3 pt-4 text-left transition-opacity sm:flex-row sm:items-baseline sm:gap-3 sm:px-2"
              style={{ opacity: active ? 1 : 0.62 }}
            >
              <span className="mono text-[0.78rem] tracking-[0.12em]" style={{ color: "var(--warm)" }}>
                0{st}
              </span>
              <span className="h3 !text-[1.05rem] sm:!text-[1.4rem]">
                <span className="sm:hidden">{t(`stages.${st}.short`)}</span>
                <span className="hidden sm:inline">{t(`stages.${st}.name`)}</span>
              </span>
              <span
                aria-hidden="true"
                className="absolute inset-x-0 -bottom-px h-[2px] transition-transform duration-300"
                style={{
                  background: "var(--warm)",
                  transform: active ? "scaleX(1)" : "scaleX(0)",
                  transformOrigin: "left",
                }}
              />
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid items-start gap-8 lg:mt-12 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:gap-14">
        <div className="lg:sticky lg:top-24">
          <Board state={state} tone="light" label={label} />
          <div className="mt-5">
            <StatusLadder current={status} />
          </div>
        </div>

        <div>
          {state.stage === 1 && (
            <Stage1 state={state} auto={auto} onLayer={(layer) => act({ layer })} onToggleAuto={() => {
              touched.current = true;
              if (auto) setAuto(false);
              else {
                if (state.layer >= LAYER_COUNT) patch({ layer: 0 });
                setAuto(true);
              }
            }} onNext={() => goStage(2)} />
          )}
          {state.stage === 2 && (
            <Stage2 state={state} onScenario={(scenario) => act({ scenario, slotE: "late" })} onSlot={(slotE) => act({ slotE })} onBack={() => goStage(1)} onNext={() => goStage(3)} />
          )}
          {state.stage === 3 && (
            <Stage3 state={state} onStep={(contractStep) => act({ contractStep })} onBack={() => goStage(2)} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- étape 1 */

function Stage1({
  state,
  auto,
  onLayer,
  onToggleAuto,
  onNext,
}: {
  state: JourneyState;
  auto: boolean;
  onLayer: (layer: number) => void;
  onToggleAuto: () => void;
  onNext: () => void;
}) {
  const t = useTranslations("Journey");
  const names = ["sites", ...TERRAIN_LAYERS] as const;
  const key = names[state.layer];

  return (
    <div role="tabpanel" id="journey-panel-1" aria-labelledby="journey-tab-1" tabIndex={0}>
      <p className="lede !max-w-none">{t("stages.1.lede")}</p>

      <div className="mt-7 flex items-center justify-between gap-4">
        <p className="eyebrow">{t("stages.1.layersLabel")}</p>
        <button type="button" onClick={onToggleAuto} className="mono inline-flex min-h-[2.75rem] items-center gap-2 text-[0.78rem] uppercase tracking-[0.12em] underline-offset-4 hover:underline" aria-pressed={auto}>
          <span aria-hidden="true">{auto ? "❚❚" : "▶"}</span>
          {auto ? t("pause") : t("play")}
        </button>
      </div>

      <ol className="mt-2 border-t" style={{ borderColor: "var(--rule)" }}>
        {names.map((n, i) => {
          const done = i < state.layer;
          const active = i === state.layer;
          return (
            <li key={n} className="border-b" style={{ borderColor: "var(--rule)" }}>
              <button
                type="button"
                onClick={() => onLayer(i)}
                aria-current={active ? "step" : undefined}
                className="flex min-h-[3rem] w-full items-center gap-4 py-3 text-left transition-opacity"
                style={{ opacity: active ? 1 : done ? 0.75 : 0.5 }}
              >
                <span
                  aria-hidden="true"
                  className="mono grid h-6 w-6 shrink-0 place-items-center rounded-full text-[0.7rem]"
                  style={{
                    border: "1px solid var(--rule-strong)",
                    background: active ? "var(--accent)" : "transparent",
                    color: active ? "var(--accent-ink)" : "inherit",
                  }}
                >
                  {done ? "✓" : i}
                </span>
                <span className="text-[1.02rem] font-medium">{t(`layers.${n}.name`)}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 min-h-[9.5rem]" aria-live="polite">
        <p className="text-[1.02rem] leading-relaxed">{t(`layers.${key}.body`)}</p>
        <p className="mt-3 border-l-2 pl-4 text-[0.97rem] leading-relaxed" style={{ borderColor: "var(--warm)", color: "var(--fg-2)" }}>
          {t(`layers.${key}.change`)}
        </p>
      </div>

      <p className="mt-4 text-[0.9rem] leading-relaxed" style={{ color: "var(--fg-2)" }}>
        {t("stages.1.note")}
      </p>

      <div className="mt-8">
        <button type="button" className="btn btn-solid" onClick={onNext}>
          {t("stages.1.next")} <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- étape 2 */

const COMPARE_ROWS = ["cost", "service", "resources", "conditions"] as const;

function Stage2({
  state,
  onScenario,
  onSlot,
  onBack,
  onNext,
}: {
  state: JourneyState;
  onScenario: (s: ScenarioId) => void;
  onSlot: (s: "late" | "early") => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const t = useTranslations("Journey");
  const sc = state.scenario;
  const reserves = t.raw(`scenarios.${sc}.reserves`) as string[];

  return (
    <div role="tabpanel" id="journey-panel-2" aria-labelledby="journey-tab-2" tabIndex={0}>
      <p className="lede !max-w-none">{t("stages.2.lede")}</p>

      <fieldset className="mt-7">
        <legend className="eyebrow mb-2">{t("stages.2.scenariosLabel")}</legend>
        <div className="border-t" style={{ borderColor: "var(--rule)" }}>
          {SCENARIOS.map((id) => {
            const active = sc === id;
            return (
              <label
                key={id}
                className="flex min-h-[3rem] cursor-pointer items-center gap-4 border-b py-2.5 transition-opacity has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2"
                style={{ borderColor: "var(--rule)", opacity: active ? 1 : 0.62, outlineColor: "var(--focus)" }}
              >
                <input
                  type="radio"
                  name="scenario"
                  value={id}
                  checked={active}
                  onChange={() => onScenario(id)}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className="grid h-5 w-5 shrink-0 place-items-center rounded-full"
                  style={{ border: "1px solid var(--rule-strong)" }}
                >
                  {active && <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--warm)" }} />}
                </span>
                <span className="text-[1.02rem] font-medium">{t(`scenarios.${id}.name`)}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6" aria-live="polite">
        <p className="text-[1.02rem] leading-relaxed">{t(`scenarios.${sc}.summary`)}</p>

        {sc === "loop" && (
          <div className="mt-5 border p-4 sm:p-5" style={{ borderColor: "var(--rule-strong)", background: "var(--card)" }}>
            <p className="eyebrow" style={{ color: "var(--warm)" }}>{t("arbitration.eyebrow")}</p>
            <p className="mt-2 text-[0.98rem] leading-relaxed">{t("arbitration.body")}</p>
            <div role="radiogroup" aria-label={t("arbitration.label")} className="mt-4 grid gap-2 sm:grid-cols-2">
              {(["late", "early"] as const).map((v) => (
                <label
                  key={v}
                  className="flex min-h-[2.75rem] cursor-pointer items-center justify-center gap-2 border px-3 text-center text-[0.93rem] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2"
                  style={{
                    borderColor: state.slotE === v ? "var(--warm)" : "var(--rule-strong)",
                    background: state.slotE === v ? "color-mix(in srgb, var(--warm) 14%, transparent)" : "transparent",
                    outlineColor: "var(--focus)",
                  }}
                >
                  <input type="radio" name="slotE" value={v} checked={state.slotE === v} onChange={() => onSlot(v)} className="sr-only" />
                  {t(`arbitration.${v}`)}
                </label>
              ))}
            </div>
            <p className="mono mt-3 text-[0.8rem] leading-relaxed" style={{ color: "var(--fg-2)" }}>
              {t(`arbitration.result.${state.slotE}`)}
            </p>
          </div>
        )}

        {sc !== "baseline" && (
          <ul className="mt-5 space-y-2 text-[0.95rem] leading-relaxed" style={{ color: "var(--fg-2)" }}>
            <li className="eyebrow !text-[0.7rem]" style={{ color: "var(--fg)" }}>{t("stages.2.conditionsLabel")}</li>
            {reserves.map((c) => (
              <li key={c} className="flex gap-3">
                <span aria-hidden="true" style={{ color: "var(--warm)" }}>—</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[20rem] border-collapse text-left text-[0.92rem]">
          <caption className="eyebrow pb-2 text-left">{t("stages.2.compareCaption")}</caption>
          <tbody>
            {COMPARE_ROWS.map((r) => {
              const documented = (t.raw(`scenarios.${sc}.documented`) as string[]).includes(r);
              return (
                <tr key={r} className="border-t align-top" style={{ borderColor: "var(--rule)" }}>
                  <th scope="row" className="w-[26%] py-3 pr-3 text-[0.9rem] font-semibold">{t(`compare.${r}`)}</th>
                  <td className="py-3 pr-3 leading-relaxed">{t(`scenarios.${sc}.${r}`)}</td>
                  <td className="w-[7.5rem] py-3 text-right">
                    <span
                      className="mono inline-block whitespace-nowrap border px-2 py-0.5 text-[0.68rem] uppercase tracking-[0.08em]"
                      style={{
                        borderColor: documented ? "var(--accent)" : "var(--rule-strong)",
                        color: documented ? "var(--accent)" : "var(--fg-2)",
                        background: documented ? "color-mix(in srgb, var(--accent) 10%, transparent)" : "transparent",
                      }}
                    >
                      {documented ? t("compare.documented") : t("compare.todo")}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="mt-3 text-[0.85rem] leading-relaxed" style={{ color: "var(--fg-2)" }}>
          {t("stages.2.noGain")}
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" className="btn btn-line" onClick={onBack}>
          <span aria-hidden="true">←</span> {t("stages.2.back")}
        </button>
        <button type="button" className="btn btn-solid" onClick={onNext}>
          {sc === "baseline" ? t("stages.2.nextDefault") : t("stages.2.next")} <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- étape 3 */

const OFFER_ROWS = ["scope", "volume", "price", "capacity", "adjust"] as const;
/** Lecture type d'une grille : conforme, hypothèse différente, à clarifier. */
const OFFER_CELLS: Record<(typeof OFFER_ROWS)[number], ["ok" | "diff" | "ask", "ok" | "diff" | "ask"]> = {
  scope: ["ok", "ok"],
  volume: ["ok", "diff"],
  price: ["ask", "ok"],
  capacity: ["ok", "ask"],
  adjust: ["diff", "ask"],
};
const COMMIT_FIELDS = ["capacity", "service", "duration", "adjust", "milestones"] as const;

function Stage3({
  state,
  onStep,
  onBack,
}: {
  state: JourneyState;
  onStep: (i: number) => void;
  onBack: () => void;
}) {
  const t = useTranslations("Journey");
  const sc = state.scenario === "baseline" ? "loop" : state.scenario;
  const step = CONTRACT_STEPS[state.contractStep];
  const lots = lotsOf(sc);

  return (
    <div role="tabpanel" id="journey-panel-3" aria-labelledby="journey-tab-3" tabIndex={0}>
      <p className="lede !max-w-none">{t("stages.3.lede")}</p>
      <p className="mono mt-4 text-[0.82rem]" style={{ color: "var(--fg-2)" }}>
        {t("stages.3.retained", { scenario: t(`scenarios.${sc}.name`) })}
      </p>

      <ol className="mt-5 grid grid-cols-4 border-y" style={{ borderColor: "var(--rule)" }}>
        {CONTRACT_STEPS.map((n, i) => {
          const active = i === state.contractStep;
          return (
            <li key={n}>
              <button
                type="button"
                onClick={() => onStep(i)}
                aria-current={active ? "step" : undefined}
                className="flex min-h-[3.5rem] w-full flex-col items-start gap-0.5 px-1 py-2 text-left transition-opacity sm:px-2"
                style={{ opacity: active ? 1 : 0.55, boxShadow: active ? "inset 0 -2px 0 var(--warm)" : undefined }}
              >
                <span className="mono text-[0.68rem]" style={{ color: "var(--warm)" }}>0{i + 1}</span>
                <span className="text-[0.82rem] font-medium leading-tight sm:text-[0.9rem]">{t(`contract.${n}.short`)}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-6" aria-live="polite">
        <h3 className="h3">{t(`contract.${step}.name`)}</h3>
        <p className="mt-2 text-[1.02rem] leading-relaxed">{t(`contract.${step}.body`)}</p>

        {step === "lots" && (
          <ul className="mt-5 space-y-3">
            {lots.map((lot) => (
              <li key={lot} className="border-l-2 pl-4" style={{ borderColor: lot === 1 ? "var(--accent)" : "var(--warm)" }}>
                <p className="font-semibold">{t(`lots.${sc}.${lot}.name`)}</p>
                <p className="mt-0.5 text-[0.95rem] leading-relaxed" style={{ color: "var(--fg-2)" }}>
                  {t(`lots.${sc}.${lot}.scope`)}
                </p>
              </li>
            ))}
          </ul>
        )}

        {step === "partners" && (
          <ul className="mt-5 space-y-3 text-[0.97rem] leading-relaxed">
            {(t.raw(`lots.${sc}.partners`) as string[]).map((p) => (
              <li key={p} className="flex gap-3">
                <span aria-hidden="true" style={{ color: "var(--warm)" }}>◇</span>
                <span>{p}</span>
              </li>
            ))}
            <li className="mono pt-1 text-[0.8rem]" style={{ color: "var(--fg-2)" }}>{t("contract.partners.caveat")}</li>
          </ul>
        )}

        {step === "offers" && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[22rem] border-collapse text-left text-[0.88rem]">
              <caption className="sr-only">{t("contract.offers.caption")}</caption>
              <thead>
                <tr className="eyebrow">
                  <th scope="col" className="pb-2 font-normal">{t("contract.offers.criterion")}</th>
                  <th scope="col" className="pb-2 font-normal">{t("board.offer", { x: "A" })}</th>
                  <th scope="col" className="pb-2 font-normal">{t("board.offer", { x: "B" })}</th>
                </tr>
              </thead>
              <tbody>
                {OFFER_ROWS.map((r) => (
                  <tr key={r} className="border-t" style={{ borderColor: "var(--rule)" }}>
                    <th scope="row" className="py-2.5 pr-3 text-[0.88rem] font-semibold">{t(`contract.offers.rows.${r}`)}</th>
                    {OFFER_CELLS[r].map((c, i) => (
                      <td key={i} className="py-2.5 pr-3">
                        <span className="mono whitespace-nowrap text-[0.74rem]" style={{ color: c === "ok" ? "var(--accent)" : c === "diff" ? "var(--warm)" : "var(--fg-2)" }}>
                          {c === "ok" ? "● " : c === "diff" ? "◐ " : "○ "}
                          {t(`contract.offers.cell.${c}`)}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-[0.88rem] leading-relaxed" style={{ color: "var(--fg-2)" }}>{t(`lots.${sc}.offerReading`)}</p>
            <p className="mono mt-2 text-[0.78rem]" style={{ color: "var(--fg-2)" }}>{t("contract.offers.noReal")}</p>
          </div>
        )}

        {step === "commitments" && (
          <div className="mt-5 border p-4 sm:p-5" style={{ borderColor: "var(--rule-strong)", background: "var(--card)" }}>
            <p className="eyebrow" style={{ color: "var(--warm)" }}>{t("contract.commitments.template")}</p>
            <dl className="mt-3 divide-y" style={{ borderColor: "var(--rule)" }}>
              {COMMIT_FIELDS.map((f) => (
                <div key={f} className="grid gap-1 py-3 sm:grid-cols-[9rem_1fr] sm:gap-4" style={{ borderColor: "var(--rule)" }}>
                  <dt className="text-[0.9rem] font-semibold">{t(`contract.commitments.fields.${f}.name`)}</dt>
                  <dd className="text-[0.93rem] leading-relaxed" style={{ color: "var(--fg-2)" }}>
                    {t(`contract.commitments.fields.${f}.body`)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" className="btn btn-line" onClick={onBack}>
          <span aria-hidden="true">←</span> {t("stages.3.back")}
        </button>
        {state.contractStep < CONTRACT_STEPS.length - 1 ? (
          <button type="button" className="btn btn-solid" onClick={() => onStep(state.contractStep + 1)}>
            {t(`contract.${CONTRACT_STEPS[state.contractStep + 1]}.short`)} <span aria-hidden="true">→</span>
          </button>
        ) : (
          <Link href="/contact" className="btn btn-solid">
            {t("stages.3.cta")} <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>

      {state.contractStep === CONTRACT_STEPS.length - 1 && (
        <p className="mt-6 border-t pt-5 text-[0.98rem] leading-relaxed" style={{ borderColor: "var(--rule)" }}>
          {t("stages.3.closing")}
        </p>
      )}
    </div>
  );
}
