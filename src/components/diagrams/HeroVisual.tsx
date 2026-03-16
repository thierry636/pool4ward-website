"use client";

import { useTranslations } from "next-intl";

export function HeroVisual({ className = "" }: { className?: string }) {
  const t = useTranslations("Diagrams");

  return (
    <div className={`relative w-full max-w-2xl mx-auto ${className}`}>
      <div className="relative aspect-[4/3]">
        {/* Background gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-brand-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />

        <svg className="w-full h-full" viewBox="0 0 600 450" fill="none">
          <defs>
            <linearGradient id="hero-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4263eb" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
            <linearGradient id="hero-gradient-2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#4263eb" stopOpacity="0.6" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Network grid lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={`h-${i}`}
              x1="50"
              y1={90 + i * 70}
              x2="550"
              y2={90 + i * 70}
              stroke="#e2e8f0"
              strokeWidth="0.5"
              strokeDasharray="4 8"
            />
          ))}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line
              key={`v-${i}`}
              x1={100 + i * 80}
              y1="50"
              x2={100 + i * 80}
              y2="400"
              stroke="#e2e8f0"
              strokeWidth="0.5"
              strokeDasharray="4 8"
            />
          ))}

          {/* Flow paths */}
          <path
            d="M100 160 Q200 120 300 180 Q400 240 500 160"
            stroke="url(#hero-gradient-1)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="6 3"
            opacity="0.6"
          />
          <path
            d="M120 280 Q220 240 320 300 Q420 340 520 260"
            stroke="url(#hero-gradient-2)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="6 3"
            opacity="0.6"
          />
          <path
            d="M140 200 Q260 160 380 220 Q460 260 520 200"
            stroke="url(#hero-gradient-1)"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="4 4"
            opacity="0.4"
          />

          {/* Organization nodes */}
          {[
            { x: 100, y: 160, label: "Org A", primary: true },
            { x: 200, y: 120, label: "Org B", primary: false },
            { x: 340, y: 200, label: "Org C", primary: true },
            { x: 460, y: 160, label: "Org D", primary: false },
            { x: 140, y: 280, label: "Org E", primary: false },
            { x: 300, y: 300, label: "Org F", primary: true },
            { x: 480, y: 260, label: "Org G", primary: false },
          ].map((node, i) => (
            <g key={i}>
              <circle
                cx={node.x}
                cy={node.y}
                r={node.primary ? 24 : 18}
                fill={node.primary ? "url(#hero-gradient-1)" : "white"}
                stroke={node.primary ? "none" : "#e2e8f0"}
                strokeWidth="1.5"
                filter={node.primary ? "url(#glow)" : undefined}
              />
              <text
                x={node.x}
                y={node.y + 4}
                textAnchor="middle"
                fontSize="9"
                fontWeight="600"
                fill={node.primary ? "white" : "#64748b"}
              >
                {node.label}
              </text>
            </g>
          ))}

          {/* Central collaboration zone */}
          <rect
            x="220"
            y="150"
            width="160"
            height="100"
            rx="16"
            fill="url(#hero-gradient-1)"
            opacity="0.08"
            stroke="url(#hero-gradient-1)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <text x="300" y="210" textAnchor="middle" fontSize="10" fontWeight="600" fill="#4263eb" opacity="0.7">
            {t("collaborationZone")}
          </text>

          {/* Opportunity indicators */}
          {[
            { x: 250, y: 170 },
            { x: 330, y: 190 },
            { x: 280, y: 230 },
          ].map((pos, i) => (
            <g key={`opp-${i}`}>
              <circle cx={pos.x} cy={pos.y} r="6" fill="#14b8a6" opacity="0.3" />
              <circle cx={pos.x} cy={pos.y} r="3" fill="#14b8a6" opacity="0.8" />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
