"use client";

import { useTranslations } from "next-intl";

export function FlowDiagram({ className = "" }: { className?: string }) {
  const t = useTranslations("Diagrams");

  const steps = [
    {
      number: "01",
      title: t("analyze"),
      description: t("analyzeDesc"),
      color: "from-brand-500 to-brand-600",
    },
    {
      number: "02",
      title: t("identify"),
      description: t("identifyDesc"),
      color: "from-brand-600 to-brand-700",
    },
    {
      number: "03",
      title: t("design"),
      description: t("designDesc"),
      color: "from-brand-700 to-teal-600",
    },
    {
      number: "04",
      title: t("simulate"),
      description: t("simulateDesc"),
      color: "from-teal-600 to-teal-500",
    },
    {
      number: "05",
      title: t("coordinate"),
      description: t("coordinateDesc"),
      color: "from-teal-500 to-teal-400",
    },
    {
      number: "06",
      title: t("implement"),
      description: t("implementDesc"),
      color: "from-teal-400 to-teal-300",
    },
  ];

  return (
    <div className={`w-full ${className}`}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {steps.map((step, i) => (
          <div key={step.number} className="relative group">
            <div className="bg-white rounded-2xl border border-navy-100 p-5 shadow-premium hover:shadow-premium-lg transition-all duration-300 hover:-translate-y-1 h-full">
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4`}
              >
                <span className="text-white text-xs font-bold">{step.number}</span>
              </div>
              <h4 className="text-sm font-bold text-navy-900 mb-2">{step.title}</h4>
              <p className="text-xs text-navy-500 leading-relaxed">{step.description}</p>
            </div>
            {/* Arrow connector (hidden on last item and on mobile) */}
            {i < steps.length - 1 && (
              <div className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                <svg className="w-5 h-5 text-navy-300" viewBox="0 0 20 20" fill="none">
                  <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
