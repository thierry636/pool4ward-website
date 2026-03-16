"use client";

import { useTranslations } from "next-intl";

export function PlatformArchitecture({ className = "" }: { className?: string }) {
  const t = useTranslations("Diagrams");

  return (
    <div className={`w-full max-w-3xl mx-auto ${className}`}>
      {/* Concentric rings */}
      <div className="relative aspect-square max-w-[640px] mx-auto">

        {/* Outer ring — Ecosystem / partner apps */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-navy-200 bg-navy-50/50 flex items-center justify-center">
          {/* Label top */}
          <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[11px] font-semibold uppercase tracking-wider text-navy-400">
            {t("ecosystemApps")}
          </span>

          {/* Partner app placeholders — positioned around the ring */}
          {[
            { label: t("partnerApp1"), pos: "top-[13%] left-[12%]" },
            { label: t("partnerApp2"), pos: "top-[13%] right-[12%]" },
            { label: t("partnerApp3"), pos: "bottom-[13%] left-[12%]" },
            { label: t("partnerApp4"), pos: "bottom-[13%] right-[12%]" },
          ].map((p) => (
            <div
              key={p.label}
              className={`absolute ${p.pos} bg-white/80 border border-dashed border-navy-300 rounded-lg px-3 py-2 text-center`}
            >
              <span className="text-[11px] font-medium text-navy-400">{p.label}</span>
            </div>
          ))}
        </div>

        {/* Middle ring — Pool4ward operational apps */}
        <div className="absolute inset-[16%] rounded-full border-2 border-brand-200 bg-white shadow-premium flex items-center justify-center">
          {/* Label */}
          <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[11px] font-semibold uppercase tracking-wider text-brand-500 whitespace-nowrap">
            {t("operationalApplications")}
          </span>

          {/* Operational apps — positioned in the ring */}
          {[
            { name: "Design4ward", desc: t("design4wardDesc"), pos: "top-[12%] left-1/2 -translate-x-1/2" },
            { name: "Modal4ward", desc: t("modal4wardDesc"), pos: "top-1/2 -translate-y-1/2 left-[5%]" },
            { name: "Cobuild4ward", desc: t("cobuild4wardDesc"), pos: "top-1/2 -translate-y-1/2 right-[5%]" },
          ].map((app) => (
            <div
              key={app.name}
              className={`absolute ${app.pos} bg-brand-50 border border-brand-200 rounded-xl px-3 py-2 text-center max-w-[130px]`}
            >
              <span className="text-xs font-bold text-brand-700 block">{app.name}</span>
              <span className="text-[10px] text-navy-500 leading-tight block mt-0.5">{app.desc}</span>
            </div>
          ))}
        </div>

        {/* Core — Foundation apps (Compute4ward + Connect4ward) */}
        <div className="absolute inset-[33%] rounded-full bg-gradient-to-br from-navy-800 to-navy-900 shadow-lg flex flex-col items-center justify-center text-center p-4 z-10">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-navy-400 mb-2">
            {t("expertApplications")}
          </span>
          <div className="space-y-2 w-full max-w-[180px]">
            <div className="bg-white/10 border border-white/20 rounded-lg px-2 py-1.5">
              <span className="text-xs font-bold text-white block">Compute4ward</span>
              <span className="text-[9px] text-navy-300 leading-tight block">{t("compute4wardDesc")}</span>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-lg px-2 py-1.5">
              <span className="text-xs font-bold text-white block">Connect4ward</span>
              <span className="text-[9px] text-navy-300 leading-tight block">{t("connect4wardDesc")}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Legend below */}
      <div className="flex flex-wrap justify-center gap-6 mt-8 text-xs text-navy-500">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-navy-800" />
          <span>{t("expertApplications")} — {t("enablingCapabilities")}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-brand-50 border-2 border-brand-200" />
          <span>{t("operationalApplications")} Pool4ward</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-navy-50 border-2 border-dashed border-navy-300" />
          <span>{t("ecosystemApps")}</span>
        </div>
      </div>
    </div>
  );
}
