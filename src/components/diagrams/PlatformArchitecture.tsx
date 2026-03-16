"use client";

import { useTranslations } from "next-intl";

export function PlatformArchitecture({ className = "" }: { className?: string }) {
  const t = useTranslations("Diagrams");

  const operationalApps = [
    { name: "Design4ward", desc: t("design4wardDesc") },
    { name: "Modal4ward", desc: t("modal4wardDesc") },
    { name: "Cobuild4ward", desc: t("cobuild4wardDesc") },
  ];

  const partnerApps = [
    t("partnerApp1"),
    t("partnerApp2"),
    t("partnerApp3"),
  ];

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>

      {/* ▲ Upper: Pool4ward operational apps (prominent) */}
      <div className="mb-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {operationalApps.map((app) => (
            <div key={app.name} className="relative bg-white border-2 border-brand-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <span className="text-sm font-bold text-brand-700">{app.name}</span>
              <p className="text-xs text-navy-500 mt-1 leading-relaxed">{app.desc}</p>
            </div>
          ))}
        </div>
        {/* Vertical connectors */}
        <div className="flex justify-around px-[16%] py-0">
          {operationalApps.map((app) => (
            <div key={app.name} className="flex flex-col items-center">
              <div className="w-px h-6 bg-navy-200" />
            </div>
          ))}
        </div>
      </div>

      {/* ═══ Center: Socle plateforme (bridge bar) ═══ */}
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-brand-500/20 via-navy-500/20 to-brand-500/20 rounded-2xl blur-lg" />
        <div className="relative bg-gradient-to-r from-navy-800 via-navy-900 to-navy-800 rounded-2xl p-5 lg:p-6 shadow-xl border border-navy-700">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            <span className="text-xs font-bold uppercase tracking-widest text-navy-400">
              {t("socle")}
            </span>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
              {[
                { name: "Compute4ward", desc: t("compute4wardDesc") },
                { name: "Connect4ward", desc: t("connect4wardDesc") },
              ].map((app) => (
                <div key={app.name} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-brand-400 shrink-0" />
                  <div>
                    <span className="text-sm font-bold text-white">{app.name}</span>
                    <p className="text-[11px] text-navy-400 leading-tight">{app.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ▼ Lower: Partner apps (subtle, not MVP focus) */}
      <div className="mt-2">
        {/* Vertical connectors */}
        <div className="flex justify-around px-[16%] py-0">
          {partnerApps.map((name, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-px h-5 bg-navy-150" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {partnerApps.map((name, i) => (
            <div key={i} className="bg-navy-50/40 border border-dashed border-navy-200 rounded-xl px-3 py-2.5 text-center">
              <span className="text-[11px] font-medium text-navy-400">{name}</span>
            </div>
          ))}
        </div>
        <p className="text-center text-[10px] text-navy-300 mt-2">{t("ecosystemApps")}</p>
      </div>

    </div>
  );
}
