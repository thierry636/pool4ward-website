"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { CARRIERS, CHARGERS, SAMPLE_CARRIER, SAMPLE_ROTATION, SAMPLE_ROUTE, SAMPLE_SITE, SERVICES, SHORTSEA, rotations } from "@/content/referentials";
import { AMBER, INDIGO, SKY, TEAL } from "@/lib/levers/data";
import { ROSE, VIOLET, type LayerId } from "@/lib/levers/layers";
import { Card, Contains, Kpis, Pill, Points, ShapesCard, StatusCard, Stops, useFmt, type KpiDef } from "./blocks";
import { LayerMap } from "./LayerMap";

interface Chip {
  label: string;
  color: string;
  count?: number;
}
interface LegendItem {
  label: string;
  color: string;
  kind?: "line" | "pt" | "sq";
}

/** La structure commune des six panneaux : en-tête, chiffres, carte animée et colonne de fiches. */
function Frame({ id, live, kpis, chips, legend, animate, side, detail, solo }: { id: LayerId; live?: boolean; kpis: KpiDef[]; chips: Chip[]; legend: LegendItem[]; animate: boolean; side: ReactNode; detail?: ReactNode; solo?: boolean }) {
  const t = useTranslations("Home.referentials");
  const fmt = useFmt();
  const name = t(`items.${id}.name`);
  return (
    <>
      <div className="rb-head">
        <div>
          <h3>{t(`items.${id}.title`)}</h3>
          <p>{t(`items.${id}.lead`)}</p>
        </div>
        {live && (
          <span className="rb-live">
            <i aria-hidden="true" />
            {t("live")}
          </span>
        )}
      </div>
      <Kpis items={kpis} animate={animate} />
      <div className="rb-body" data-solo={solo || undefined}>
        <div className="rb-map">
          <LayerMap layer={id} label={t("mapLabel", { name })} />
          <div className="rb-chips">
            {chips.map((c) => (
              <span key={c.label} className="rb-chip">
                <i style={{ background: c.color }} aria-hidden="true" />
                {c.label}
                {c.count !== undefined && <em>{fmt(c.count)}</em>}
              </span>
            ))}
          </div>
          <div className="rb-legend" aria-hidden="true">
            {legend.map((l) => (
              <span key={l.label}>
                <i className={l.kind === "pt" ? "pt" : l.kind === "sq" ? "sq" : undefined} style={{ background: l.color }} />
                {l.label}
              </span>
            ))}
          </div>
        </div>
        <div className="rb-side">{side}</div>
      </div>
      {detail}
    </>
  );
}

const list = (t: ReturnType<typeof useTranslations>, key: string) => t.raw(key) as string[];

export function ServicesPanel({ animate }: { animate: boolean }) {
  const t = useTranslations("Home.referentials.items.services");
  const tf = useTranslations("Home.referentials.fiche");
  return (
    <Frame
      id="services"
      live
      animate={animate}
      kpis={[
        { label: t("kpi.services"), value: SERVICES.total },
        { label: t("kpi.links"), value: SERVICES.links },
        { label: t("kpi.countries"), value: SERVICES.countries },
        { label: t("kpi.operators"), value: SERVICES.operators },
      ]}
      chips={[
        { label: t("chips.rail"), count: SERVICES.modes.rail, color: INDIGO },
        { label: t("chips.waterway"), count: SERVICES.modes.waterway, color: SKY },
      ]}
      legend={[
        { label: t("legend.terminal"), color: INDIGO, kind: "sq" },
        { label: t("legend.rail"), color: INDIGO },
        { label: t("legend.waterway"), color: SKY },
      ]}
      side={<ShapesCard shapes={SERVICES.shapes} total={SERVICES.total} />}
      detail={
        <Card title={t("ficheTitle")} delay={0.5} wide>
          <div className="rb-detail-grid">
            <div>
              <div className="rb-pills">
                <Pill color="#6ee7b7" bg="rgb(16 185 129 / 0.16)">
                  {t("route.form")}
                </Pill>
                <Pill color="#fcd34d" bg="rgb(251 191 36 / 0.15)">
                  {t("route.mode")}
                </Pill>
                <span>{t("route.counts", { services: SAMPLE_ROUTE.services, stops: SAMPLE_ROUTE.stops.length })}</span>
              </div>
              <Stops stops={SAMPLE_ROUTE.stops} color="#10b981" />
            </div>
            <Contains label={tf("contains")} items={list(t, "tags")} />
          </div>
        </Card>
      }
    />
  );
}

export function ShortseaPanel({ animate }: { animate: boolean }) {
  const t = useTranslations("Home.referentials.items.shortsea");
  const tf = useTranslations("Home.referentials.fiche");
  return (
    <Frame
      id="shortsea"
      live
      animate={animate}
      kpis={[
        { label: t("kpi.services"), value: SHORTSEA.total },
        { label: t("kpi.continents"), value: SHORTSEA.continents },
        { label: t("kpi.rotation"), value: rotations(SHORTSEA.shapes) },
        { label: t("cargoTitle"), text: t("cargoValue") },
      ]}
      chips={[{ label: t("chips.shortsea"), count: SHORTSEA.total, color: TEAL }]}
      legend={[
        { label: t("legend.port"), color: TEAL, kind: "pt" },
        { label: t("legend.line"), color: TEAL },
        { label: t("legend.loop"), color: VIOLET },
        { label: t("legend.metroLoop"), color: ROSE },
      ]}
      side={<ShapesCard shapes={SHORTSEA.shapes} total={SHORTSEA.total} />}
      detail={
        <Card title={t("ficheTitle")} aside={tf("illustrative")} delay={0.5} wide>
          <div className="rb-detail-grid">
            <div>
              <div className="rb-pills">
                <Pill color="#fda4af" bg="rgb(244 63 94 / 0.16)">
                  {t("route.form")}
                </Pill>
                <Pill color="#5eead4" bg="rgb(45 212 191 / 0.15)">
                  {t("route.mode")}
                </Pill>
                <span>{t("route.counts", { calls: SAMPLE_ROTATION.calls })}</span>
              </div>
              <Stops stops={SAMPLE_ROTATION.stops.map((name) => ({ name }))} color={ROSE} />
            </div>
            <Contains label={tf("contains")} items={list(t, "tags")} />
          </div>
        </Card>
      }
    />
  );
}

export function NetworksPanel({ animate }: { animate: boolean }) {
  const t = useTranslations("Home.referentials.items.networks");
  return (
    <Frame
      id="networks"
      solo
      animate={animate}
      kpis={[]}
      chips={[
        { label: t("chips.rail"), color: INDIGO },
        { label: t("chips.waterway"), color: SKY },
      ]}
      legend={[
        { label: t("legend.rail"), color: INDIGO },
        { label: t("legend.waterway"), color: SKY },
      ]}
      side={
        <Card title={t("ficheTitle")} grow>
          <Points items={list(t, "points")} />
        </Card>
      }
    />
  );
}

export function ChargersPanel({ animate }: { animate: boolean }) {
  const t = useTranslations("Home.referentials.items.chargers");
  const tf = useTranslations("Home.referentials.fiche");
  const ts = useTranslations("Home.referentials.status");
  const fmt = useFmt();
  const f = (k: string) => t(`fields.${k}`);
  return (
    <Frame
      id="chargers"
      animate={animate}
      kpis={[
        { label: t("kpi.sites"), value: CHARGERS.sites },
        { label: t("kpi.chargers"), value: CHARGERS.chargers },
        { label: t("kpi.countries"), value: CHARGERS.countries },
        { label: t("kpi.networks"), value: CHARGERS.networks },
      ]}
      chips={[{ label: t("chips.chargers"), count: CHARGERS.chargers, color: AMBER }]}
      legend={[
        { label: t("legend.corridor"), color: AMBER },
        { label: t("legend.charger"), color: AMBER, kind: "pt" },
      ]}
      side={<StatusCard status={CHARGERS.status} total={CHARGERS.sites} />}
      detail={
        <Card title={t("ficheTitle")} aside={tf("example")} delay={0.5} wide>
          <div className="rb-site">
            <b>
              {SAMPLE_SITE.city} <span>{SAMPLE_SITE.country}</span>
            </b>
            <span className="rb-link">{t("link")}</span>
          </div>
          <dl className="rb-fields">
            <dt>{f("status")}</dt>
            <dd>
              <span className="rb-state">
                <i aria-hidden="true" />
                {ts("inService")}
              </span>
            </dd>
            <dt>{f("access")}</dt>
            <dd>{t("values.access")}</dd>
            <dt>{f("places")}</dt>
            <dd>{fmt(SAMPLE_SITE.places)}</dd>
            <dt>{f("bays")}</dt>
            <dd>
              {SAMPLE_SITE.bays.count} × {SAMPLE_SITE.bays.kw}&nbsp;kW {SAMPLE_SITE.bays.connector}
            </dd>
            <dt>{f("maxPower")}</dt>
            <dd>{SAMPLE_SITE.maxKw}&nbsp;kW</dd>
            <dt>{f("price")}</dt>
            <dd>{t("values.price")}</dd>
            <dt>{f("booking")}</dt>
            <dd>{t("values.booking")}</dd>
            <dt>{f("operator")}</dt>
            <dd>
              <span className="rb-mask">{tf("masked")}</span>
            </dd>
          </dl>
        </Card>
      }
    />
  );
}

export function ParkingsPanel({ animate }: { animate: boolean }) {
  const t = useTranslations("Home.referentials.items.parkings");
  return (
    <Frame
      id="parkings"
      solo
      animate={animate}
      kpis={[]}
      chips={[{ label: t("chips.parkings"), color: "#93c5fd" }]}
      legend={[
        { label: t("legend.axis"), color: "#94a3b8" },
        { label: t("legend.parking"), color: "#93c5fd", kind: "sq" },
      ]}
      side={
        <Card title={t("ficheTitle")} grow>
          <Points items={list(t, "points")} />
        </Card>
      }
    />
  );
}

export function CarriersPanel({ animate }: { animate: boolean }) {
  const t = useTranslations("Home.referentials.items.carriers");
  const tf = useTranslations("Home.referentials.fiche");
  const fmt = useFmt();
  return (
    <Frame
      id="carriers"
      animate={animate}
      kpis={[
        { label: t("kpi.carriers"), value: CARRIERS.carriers },
        { label: t("kpi.sites"), value: CARRIERS.sites },
      ]}
      chips={[{ label: t("chips.carriers"), count: CARRIERS.carriers, color: "#f1f5f9" }]}
      legend={[
        { label: t("legend.site"), color: "#f1f5f9", kind: "pt" },
        { label: t("legend.area"), color: "#f472b6" },
      ]}
      side={
        <Card title={t("pointsTitle")} grow>
          <Points items={list(t, "points")} />
        </Card>
      }
      detail={
        <Card title={t("ficheTitle")} aside={tf("example")} delay={0.5} wide>
          <div className="rb-detail-grid">
            <div>
              <div className="rb-site">
                <span className="rb-mask">{tf("masked")}</span>
                <span>{t("country")}</span>
              </div>
              <div className="rb-pills">
                <span className="rb-stars">★ {fmt(SAMPLE_CARRIER.rating)}</span>
                <span>({t("reviews", { n: SAMPLE_CARRIER.reviews })})</span>
              </div>
              <Contains label={t("capacitiesTitle")} items={list(t, "tags")} extra={t("moreTags")} />
            </div>
            <Contains label={t("contactsTitle")} items={list(t, "contacts")} />
          </div>
        </Card>
      }
    />
  );
}

export const PANELS: Record<LayerId, (p: { animate: boolean }) => ReactNode> = {
  services: ServicesPanel,
  shortsea: ShortseaPanel,
  networks: NetworksPanel,
  chargers: ChargersPanel,
  parkings: ParkingsPanel,
  carriers: CarriersPanel,
};
