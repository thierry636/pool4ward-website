"use client";

import { useState, type CSSProperties } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Icon, type IconName } from "@/components/ui/Icon";
import { CARRIERS, POINTS, SERVICES, SHORTSEA } from "@/content/referentials";
import { REF_ACTS, REF_ART, REF_IDS, REF_LEGEND_COLORS, type RefId } from "@/content/referentialExplorer";
import { PriceChart } from "@/components/referentials/PriceChart";
import "./capability-visuals.css";

const ICON: Record<RefId, IconName> = { services: "intermodal", networks: "rails", points: "energy", carriers: "truck", prices: "comparison" };

/**
 * Les référentiels, un par entrée : à gauche la liste, à droite le référentiel ouvert (une carte illustrative,
 * ses chiffres, ce qu'il décrit, et l'agent IA qui le collecte et le normalise). Sur téléphone, chaque
 * référentiel s'ouvre sous son titre.
 */
export function ReferentialExplorer() {
  const t = useTranslations("Home.referentialExplorer");
  const locale = useLocale();
  const [active, setActive] = useState(0);

  const figures = (id: RefId): { value: string; label: string }[] => {
    const fmt = (n: number) => new Intl.NumberFormat(locale).format(n).replace(/[\u202f\u00a0 ]/g, "\u00a0");
    if (id === "services") return [{ value: fmt(SERVICES.total), label: t("figures.services") }, { value: fmt(SHORTSEA.total), label: t("figures.shortsea") }];
    if (id === "points") return [{ value: `+ ${fmt(POINTS)}`, label: t("figures.points") }];
    if (id === "carriers") return [{ value: `+ ${fmt(CARRIERS)}`, label: t("figures.carriers") }];
    return [];
  };

  const detail = (id: RefId) => {
    const art = REF_ART[id];
    const tags = t.raw(`items.${id}.tags`) as string[];
    const covers = t.raw(`items.${id}.covers`) as string[];
    const legend = t.raw(`items.${id}.legend`) as string[];
    const figs = figures(id);
    return (
      <div>
        <p className="eyebrow">{t("eyebrow")}</p>
        <p className="display mt-4 text-[clamp(1.5rem,2.6vw,2.2rem)]">{t(`items.${id}.question`)}</p>
        <p className="lede mt-4 !text-[1.02rem]">{t(`items.${id}.summary`)}</p>

        {figs.length > 0 && (
          <p className="cv-figs">
            {figs.map((f) => (
              <span key={f.label}>
                <b>{f.value}</b>
                <small>{f.label}</small>
              </span>
            ))}
          </p>
        )}

        <ul className="mt-5 flex flex-wrap gap-2">
          {tags.map((v) => (
            <li key={v} className="pill">
              {v}
            </li>
          ))}
        </ul>

        <div className="cv-stage cv-ref" data-art={art ? "map" : "chart"} role={art ? "img" : "group"} aria-label={art ? t(`items.${id}.mapAlt`) : undefined}>
          <div className="cv-win cv-main">
            <div className="cv-bar" aria-hidden="true">
              <i />
              <i />
              <i />
              <span>{t(`items.${id}.mapTitle`)}</span>
            </div>
            {art ? (
              // Carte illustrative déjà en WebP, sans texte : le composant d'image de Next n'apporte rien.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/images/referentials-art/${art.file}.webp`} alt="" width={art.width} height={art.height} loading="lazy" decoding="async" />
            ) : (
              <div className="cv-chart">
                <PriceChart />
              </div>
            )}
          </div>
          {legend.length > 0 && (
            <ul className="cv-legend" aria-hidden="true">
              {legend.map((l, k) => (
                <li key={l}>
                  <i style={{ background: REF_LEGEND_COLORS[id][k] }} />
                  {l}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="cv-agent">
          <div className="cv-agent-id">
            <span className="cv-orb" aria-hidden="true">
              <Icon name="ai" size={18} />
            </span>
            <p>
              <b>{t("agent.label")}</b>
              <span>{t("agent.sub")}</span>
            </p>
          </div>
          <ol className="cv-acts">
            {REF_ACTS.map((k, n) => (
              <li key={k} style={{ ["--i" as string]: n } as CSSProperties}>
                <b>{t(`agent.${k}`)}</b>
                <span>{t(`items.${id}.agent.${k}`)}</span>
              </li>
            ))}
          </ol>
        </div>

        <ul className="mt-6 space-y-3 text-[0.96rem] leading-relaxed" style={{ color: "var(--fg-2)" }}>
          {covers.map((line) => (
            <li key={line} className="flex gap-3">
              <span aria-hidden="true" className="mt-1 shrink-0" style={{ color: "var(--warm)" }}>
                <Icon name="check" size={16} />
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-12">
      <ol className="relative space-y-2 lg:sticky lg:top-24 lg:self-start" aria-label={t("listLabel")}>
        <span aria-hidden="true" className="absolute bottom-8 left-[1.9rem] top-8 w-px" style={{ background: "var(--rule-strong)" }} />
        {REF_IDS.map((id, i) => {
          const open = i === active;
          return (
            <li key={id} className="relative">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-expanded={open}
                aria-controls={`ref-panel-${id}`}
                className="relative flex min-h-[4.25rem] w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left transition"
                style={{
                  color: open ? "var(--fg)" : "var(--fg-2)",
                  borderColor: open ? "rgb(116 143 252 / 0.55)" : "transparent",
                  background: open ? "rgb(66 99 235 / 0.14)" : "transparent",
                }}
              >
                <span className="tile-icon relative z-10" style={open ? { background: "#4263eb", color: "#fff" } : { background: "#0b1224", boxShadow: "inset 0 0 0 1px var(--rule-strong)" }}>
                  <Icon name={ICON[id]} />
                </span>
                <span className="text-[1.12rem] font-semibold tracking-tight sm:text-[1.25rem]">{t(`items.${id}.name`)}</span>
              </button>
              <div id={`ref-panel-${id}`} hidden={!open} className="px-2 pb-6 pt-4 lg:hidden">
                {open && detail(id)}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="hidden rounded-3xl border p-8 lg:block xl:p-10" style={{ borderColor: "var(--rule)", background: "var(--card)", boxShadow: "var(--shadow)" }} role="region" aria-live="polite" aria-label={t(`items.${REF_IDS[active]}.name`)}>
        <div key={REF_IDS[active]} className="cap-fade">
          {detail(REF_IDS[active])}
        </div>
      </div>
    </div>
  );
}
