"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";

export function EcosystemDiagram({ className = "" }: { className?: string }) {
  const t = useTranslations("Diagrams");

  const actors = [
    { label: t("shippers"), angle: 0 },
    { label: t("carriers"), angle: 60 },
    { label: t("logisticsOperators"), angle: 120 },
    { label: t("multimodalActors"), angle: 180 },
    { label: t("coordinators"), angle: 240 },
    { label: t("partners"), angle: 300 },
  ];

  return (
    <div className={`w-full max-w-lg mx-auto ${className}`}>
      <div className="relative aspect-square">
        {/* Background circles */}
        <div className="absolute inset-[10%] rounded-full border border-navy-100 opacity-40" />
        <div className="absolute inset-[25%] rounded-full border border-brand-100 opacity-60" />

        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400" fill="none">
          {actors.map((actor, i) => {
            const x1 = 200 + 150 * Math.cos((actor.angle * Math.PI) / 180);
            const y1 = 200 + 150 * Math.sin((actor.angle * Math.PI) / 180);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2="200"
                y2="200"
                stroke="url(#line-gradient)"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.4"
              />
            );
          })}
          {/* Cross-connections */}
          {actors.map((actor, i) => {
            const nextActor = actors[(i + 1) % actors.length];
            const x1 = 200 + 150 * Math.cos((actor.angle * Math.PI) / 180);
            const y1 = 200 + 150 * Math.sin((actor.angle * Math.PI) / 180);
            const x2 = 200 + 150 * Math.cos((nextActor.angle * Math.PI) / 180);
            const y2 = 200 + 150 * Math.sin((nextActor.angle * Math.PI) / 180);
            return (
              <line
                key={`cross-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="url(#line-gradient)"
                strokeWidth="0.5"
                strokeDasharray="2 4"
                opacity="0.25"
              />
            );
          })}
          <defs>
            <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4263eb" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center - Pool4ward */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-brand-600 to-teal-500 flex flex-col items-center justify-center shadow-glow">
            <Image
              src="/images/brand/logo-icon-light.svg"
              alt="Pool4ward"
              width={48}
              height={48}
              className="w-10 h-10 rounded-lg"
            />
            <p className="text-white/70 text-[8px] mt-1">{t("collaborationPlatform")}</p>
          </div>
        </div>

        {/* Actor nodes */}
        {actors.map((actor) => {
          const x = 50 + 37.5 * Math.cos((actor.angle * Math.PI) / 180);
          const y = 50 + 37.5 * Math.sin((actor.angle * Math.PI) / 180);
          return (
            <div
              key={actor.label}
              className="absolute z-10"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="bg-white border border-navy-200 rounded-xl px-3 py-2 shadow-premium text-center whitespace-nowrap">
                <span className="text-xs font-semibold text-navy-700">{actor.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
