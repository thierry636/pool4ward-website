"use client";

import { useTranslations } from "next-intl";

export function PlatformArchitecture({ className = "" }: { className?: string }) {
  const t = useTranslations("Diagrams");

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      <div className="relative space-y-4">
        {/* Layer 1: Ecosystem Collaboration */}
        <div className="relative">
          <div className="bg-gradient-to-r from-brand-600 to-teal-500 rounded-2xl p-6 lg:p-8 text-white shadow-glow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold">{t("ecosystemCollaboration")}</h3>
                <p className="text-sm text-white/80">{t("heartOfPlatform")}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {[t("opportunityDiscovery"), t("initiativeDesign"), t("multiActorCoordination"), t("operationalAlignment")].map((item) => (
                <div key={item} className="bg-white/15 rounded-lg px-3 py-2 text-xs font-medium text-white/90 text-center backdrop-blur-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>
          {/* Connector */}
          <div className="flex justify-center py-2">
            <div className="flex flex-col items-center">
              <svg className="w-4 h-8 text-navy-300" viewBox="0 0 16 32" fill="none">
                <path d="M8 0v28M4 24l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[10px] font-medium text-navy-400 -mt-1">{t("enabledBy")}</span>
            </div>
          </div>
        </div>

        {/* Layer 2: Operational Applications */}
        <div className="relative">
          <div className="bg-white border-2 border-brand-200 rounded-2xl p-6 lg:p-8 shadow-premium">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-navy-900">{t("operationalApplications")}</h3>
                <p className="text-sm text-navy-500">{t("appsHelpAct")}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { name: "Design4ward", desc: t("design4wardDesc") },
                { name: "Modal4ward", desc: t("modal4wardDesc") },
                { name: "Cobuild4ward", desc: t("cobuild4wardDesc") },
              ].map((app) => (
                <div key={app.name} className="bg-brand-50/50 border border-brand-100 rounded-xl px-4 py-3">
                  <span className="text-sm font-semibold text-brand-700">{app.name}</span>
                  <p className="text-xs text-navy-500 mt-1">{app.desc}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Connector */}
          <div className="flex justify-center py-2">
            <div className="flex flex-col items-center">
              <svg className="w-4 h-8 text-navy-300" viewBox="0 0 16 32" fill="none">
                <path d="M8 0v28M4 24l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[10px] font-medium text-navy-400 -mt-1">{t("poweredBy")}</span>
            </div>
          </div>
        </div>

        {/* Layer 3: Expert Applications */}
        <div className="bg-navy-50 border border-navy-200 rounded-2xl p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-navy-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-navy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-navy-900">{t("expertApplications")}</h3>
              <p className="text-sm text-navy-500">{t("enablingCapabilities")}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { name: "Compute4ward", desc: t("compute4wardDesc") },
              { name: "Connect4ward", desc: t("connect4wardDesc") },
            ].map((app) => (
              <div key={app.name} className="bg-white border border-navy-200 rounded-xl px-4 py-3">
                <span className="text-sm font-semibold text-navy-700">{app.name}</span>
                <p className="text-xs text-navy-500 mt-1">{app.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
