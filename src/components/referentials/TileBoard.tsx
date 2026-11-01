"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Icon, type IconName } from "@/components/ui/Icon";
import { CARRIERS, POINTS, SERVICES, SHORTSEA } from "@/content/referentials";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { LayerMap } from "./LayerMap";
import { PriceChart } from "./PriceChart";
import "./referentials.css";

/**
 * La planche des référentiels : six tuiles, une par référentiel — un chiffre, une phrase, et l'écran du
 * portail présenté autour (fenêtre, bulles, repère). Sur ordinateur, les six tuiles sont visibles ensemble
 * (grille) ; sur mobile, elles défilent à la main, une par une, la suivante dépassant sur le bord.
 *
 * Chaque tuile se joue une fois, à son entrée à l'écran : texte, nombre qui compte, écrans qui se mettent
 * en place, bulles l'une après l'autre. Sans script, ou sous « mouvement réduit », tout est affiché terminé.
 */

type TileId = "services" | "shortsea" | "networks" | "points" | "carriers" | "prices";
const ORDER: readonly TileId[] = ["services", "shortsea", "networks", "points", "carriers", "prices"];
const ICON: Record<TileId, IconName> = { services: "intermodal", shortsea: "ship", networks: "rails", points: "energy", carriers: "truck", prices: "comparison" };

function useFmt() {
  const locale = useLocale();
  return (n: number) => new Intl.NumberFormat(locale).format(n).replace(/ /g, " ");
}

/** Un nombre qui compte jusqu'à sa valeur dès que sa tuile se joue ; tant que la planche n'est pas armée, il reste à sa valeur. */
function CountUp({ value, armed, play }: { value: number; armed: boolean; play: boolean }) {
  const fmt = useFmt();
  const [v, setV] = useState<number | null>(null);
  useEffect(() => {
    /* Armée : le nombre attend à 0 que sa tuile se joue ; désarmée (mouvement réduit) : il reprend sa valeur. */
    setV(armed ? 0 : null);
  }, [armed]);
  useEffect(() => {
    if (!armed || !play) return;
    let raf = 0;
    const t0 = performance.now() + 250;
    const tick = (now: number) => {
      const k = Math.max(0, Math.min(1, (now - t0) / 1200));
      setV(k >= 1 ? null : Math.round(value * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [armed, play, value]);
  return <>{fmt(v ?? value)}</>;
}

function Win({ title, className, children }: { title: string; className: string; children: ReactNode }) {
  return (
    <div className={`rt-win ${className}`}>
      <div className="rt-bar" aria-hidden="true">
        <i />
        <i />
        <i />
        <span>{title}</span>
      </div>
      {children}
    </div>
  );
}

function Shot({ src, alt, w, h, className }: { src: string; alt: string; w: number; h: number; className?: string }) {
  /* Captures du portail, déjà optimisées en WebP : pas besoin du composant d'image de Next. */
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={`/images/referentials/${src}.webp`} alt={alt} width={w} height={h} loading="lazy" decoding="async" className={className} />
  );
}

function Callout({ k, className, children, sub }: { k: number; className: string; children: ReactNode; sub?: string }) {
  return (
    <div className={`rt-co ${className}`} style={{ ["--k" as string]: k } as CSSProperties}>
      {children}
      {sub && <small>{sub}</small>}
    </div>
  );
}

function Chips({ items }: { items: readonly string[] }) {
  return (
    <ul className="rt-chips">
      {items.map((c) => (
        <li key={c}>{c}</li>
      ))}
    </ul>
  );
}

/** Le contenu de chaque tuile : l'écran (ou l'illustration) présenté autour de son chiffre. */
function TileBody({ id, armed, shown }: { id: TileId; armed: boolean; shown: boolean }) {
  const t = useTranslations("Home.referentials");
  const name = t(`tiles.${id}.name`);
  const head = (figure: ReactNode, unit?: string) => (
    <div className="rt-text">
      <div className="rt-label">
        <Icon name={ICON[id]} size={18} />
        <h3>{name}</h3>
      </div>
      <p className="rt-fig">
        <b>{figure}</b>
        {unit && <span>{unit}</span>}
      </p>
    </div>
  );
  const portal = t("portal");

  switch (id) {
    case "services":
      return (
        <>
          {head(<CountUp value={SERVICES.total} armed={armed} play={shown} />, t("tiles.services.unit"))}
          <p className="rt-line">{t("tiles.services.line", { countries: SERVICES.countries, operators: SERVICES.operators })}</p>
          <span className="rt-live">
            <i aria-hidden="true" />
            {t("live")}
          </span>
          <div className="rt-asset">
            <Win title={portal} className="rt-w-map">
              <Shot src="services-map" alt={t("tiles.services.alt")} w={900} h={564} />
            </Win>
            <Win title={t("tiles.services.routeTitle")} className="rt-w-route">
              <Shot src="services-route" alt={t("tiles.services.altRoute")} w={820} h={192} />
            </Win>
            <i className="rt-ring" aria-hidden="true" />
          </div>
          <Callout k={0} className="rt-co-filter" sub={t("tiles.services.filterSub")}>
            {t("tiles.services.filter")}
          </Callout>
          <Callout k={1} className="rt-co-record">
            {t("tiles.services.record")}
          </Callout>
        </>
      );
    case "shortsea":
      return (
        <>
          {head(<CountUp value={SHORTSEA.total} armed={armed} play={shown} />, t("tiles.shortsea.unit"))}
          <p className="rt-line">{t("tiles.shortsea.line", { continents: SHORTSEA.continents })}</p>
          <div className="rt-asset">
            <Win title={portal} className="rt-w-shortsea">
              <Shot src="shortsea" alt={t("tiles.shortsea.alt")} w={900} h={516} />
            </Win>
          </div>
          <Callout k={0} className="rt-co-shortsea">
            {t("tiles.shortsea.callout")}
          </Callout>
        </>
      );
    case "networks":
      return (
        <>
          {head(t("tiles.networks.figure"))}
          <p className="rt-line">{t("tiles.networks.line")}</p>
          <Chips items={t.raw("tiles.networks.chips") as string[]} />
          <div className="rt-asset">
            <Win title={t("tiles.networks.mapTitle")} className="rt-w-small rt-w-dark">
              <div className="rt-mapbox">
                <LayerMap layer="networks" label={t("tiles.networks.mapLabel")} />
              </div>
            </Win>
          </div>
        </>
      );
    case "points":
      return (
        <>
          {head(
            <>
              + <CountUp value={POINTS} armed={armed} play={shown} />
            </>,
            t("tiles.points.unit"),
          )}
          <p className="rt-line">{t("tiles.points.line")}</p>
          <Chips items={t.raw("tiles.points.chips") as string[]} />
          <div className="rt-asset">
            <Win title={portal} className="rt-w-small">
              <Shot src="chargers" alt={t("tiles.points.alt")} w={817} h={437} className="rt-crop-chargers" />
            </Win>
          </div>
        </>
      );
    case "carriers":
      return (
        <>
          {head(
            <>
              + <CountUp value={CARRIERS} armed={armed} play={shown} />
            </>,
            t("tiles.carriers.unit"),
          )}
          <p className="rt-line">{t("tiles.carriers.line")}</p>
          <Chips items={t.raw("tiles.carriers.chips") as string[]} />
          <div className="rt-asset">
            <Win title={portal} className="rt-w-small">
              <Shot src="carriers" alt={t("tiles.carriers.alt")} w={1040} h={524} className="rt-crop-carriers" />
            </Win>
          </div>
        </>
      );
    default:
      return (
        <>
          {head(t("tiles.prices.figure"))}
          <p className="rt-line">{t("tiles.prices.line")}</p>
          <div className="rt-asset">
            <Win title={t("tiles.prices.chartTitle")} className="rt-w-chart">
              <PriceChart />
            </Win>
          </div>
        </>
      );
  }
}

/** Une tuile : elle se joue une fois, quand elle est assez visible (y compris en défilant de côté sur mobile). */
function Tile({ id, index, armed }: { id: TileId; index: number; armed: boolean }) {
  const ref = useRef<HTMLLIElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !armed) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting && e.intersectionRatio >= 0.35)) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: [0, 0.35, 0.6] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [armed]);
  return (
    <li ref={ref} className={`rt-tile is-${id}`} data-shown={shown ? "true" : undefined} style={{ ["--d" as string]: `${(index % 4) * 0.12}s` } as CSSProperties}>
      <TileBody id={id} armed={armed} shown={shown} />
    </li>
  );
}

function useNarrow() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 799px)");
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return narrow;
}

export function TileBoard() {
  const t = useTranslations("Home.referentials");
  const reduced = usePrefersReducedMotion();
  const narrow = useNarrow();
  const track = useRef<HTMLUListElement>(null);
  const [armed, setArmed] = useState(false);
  const [active, setActive] = useState(0);
  const n = ORDER.length;

  /* Armée : avant l'hydratation (et sans mouvement) tout est affiché terminé ; ensuite chaque tuile attend son entrée à l'écran. */
  useEffect(() => {
    setArmed(!reduced);
  }, [reduced]);

  /* Mobile : la tuile la plus proche du centre est la tuile courante (points de repère, flèches). */
  const sync = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const mid = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let gap = Infinity;
    Array.from(el.children).forEach((c, i) => {
      const li = c as HTMLElement;
      const d = Math.abs(li.offsetLeft + li.offsetWidth / 2 - mid);
      if (d < gap) {
        gap = d;
        best = i;
      }
    });
    setActive(best);
  }, []);
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(sync);
    };
    el.addEventListener("scroll", on, { passive: true });
    return () => {
      el.removeEventListener("scroll", on);
      cancelAnimationFrame(raf);
    };
  }, [sync]);

  const go = (to: number) => {
    const el = track.current;
    const i = Math.max(0, Math.min(n - 1, to));
    const li = el?.children[i] as HTMLElement | undefined;
    if (!el || !li) return;
    el.scrollTo({ left: li.offsetLeft - (el.clientWidth - li.offsetWidth) / 2, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <div className="rt" data-armed={armed ? "true" : undefined}>
      <ul ref={track} className="rt-track" aria-label={t("controls.label")} tabIndex={narrow ? 0 : undefined}>
        {ORDER.map((id, i) => (
          <Tile key={id} id={id} index={i} armed={armed} />
        ))}
      </ul>
      <div className="rt-nav">
        <div className="rt-dots">
          {ORDER.map((id, i) => (
            <button key={id} type="button" className="rt-dot" aria-label={t("controls.goTo", { n: i + 1, total: n })} aria-current={i === active ? "true" : undefined} onClick={() => go(i)}>
              <i />
            </button>
          ))}
        </div>
        <div className="rt-arrows">
          <button type="button" className="rt-arrow" aria-label={t("controls.prev")} disabled={active === 0} onClick={() => go(active - 1)}>
            <Icon name="arrow" size={18} className="rt-flip" />
          </button>
          <button type="button" className="rt-arrow" aria-label={t("controls.next")} disabled={active === n - 1} onClick={() => go(active + 1)}>
            <Icon name="arrow" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
