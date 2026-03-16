import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { CTABand } from "@/components/ui/CTABand";
import { PlatformArchitecture } from "@/components/diagrams/PlatformArchitecture";
import { EcosystemDiagram } from "@/components/diagrams/EcosystemDiagram";
import { FlowDiagram } from "@/components/diagrams/FlowDiagram";
import { HeroVisual } from "@/components/diagrams/HeroVisual";
import { operationalProducts, expertProducts } from "@/content/products";

export default function Home() {
  return (
    <>
      {/* ============================================================
          A. HERO
          ============================================================ */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-navy-950">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950" />
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-600/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-500/6 rounded-full blur-3xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative container-xl pt-32 pb-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <span className="badge mb-6">Collaborative Logistics Platform</span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-display-xl font-bold text-white tracking-tight mb-6 text-balance">
                Optimize logistics{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-teal-400">
                  beyond company boundaries
                </span>
              </h1>
              <p className="text-lg lg:text-xl text-navy-300 leading-relaxed mb-8 max-w-xl">
                Pool4ward helps organizations discover, design, and implement
                collaborative logistics initiatives across networks of actors.
                The biggest optimization opportunities exist where companies connect.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="primary" size="lg" href="/company#contact">
                  Request a demo
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  href="/platform"
                  className="text-white hover:text-white hover:bg-white/10"
                >
                  Explore the platform →
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="mt-12 pt-8 border-t border-white/10">
                <p className="text-xs text-navy-500 uppercase tracking-wider mb-4">
                  Trusted by logistics leaders
                </p>
                <div className="flex gap-8 items-center">
                  {["Enterprise Ready", "ISO 27001", "GDPR Compliant", "SOC 2"].map(
                    (badge) => (
                      <span
                        key={badge}
                        className="text-xs font-medium text-navy-400"
                      >
                        {badge}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <HeroVisual />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          B. PROBLEM SECTION
          ============================================================ */}
      <section className="section-padding bg-white">
        <div className="container-xl">
          <SectionHeader
            badge="The Challenge"
            title="Logistics optimization stops at company boundaries"
            description="Most organizations optimize their own logistics flows. But the biggest
              opportunities — consolidation, mutualization, modal shift — exist across
              organizations. Without shared visibility and coordination, they remain invisible."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Fragmented flows",
                description:
                  "Overlapping transport routes, duplicated shipments, and uncoordinated logistics across the ecosystem.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                ),
              },
              {
                title: "Unused capacity",
                description:
                  "Trucks running partially loaded, empty return legs, and warehousing capacity wasted across networks.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                ),
              },
              {
                title: "Duplicated transport",
                description:
                  "Multiple companies shipping similar flows on the same corridors without awareness of each other.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                ),
              },
              {
                title: "No shared visibility",
                description:
                  "Lack of cross-organizational flow data makes it impossible to identify ecosystem-level opportunities.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ),
              },
              {
                title: "Hard-to-structure collaboration",
                description:
                  "Multi-actor logistics coordination is complex. Without the right tools, good ideas stay on whiteboards.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
              },
              {
                title: "Avoidable cost and CO₂",
                description:
                  "The cumulative impact: billions in unnecessary logistics costs and millions of tons of avoidable emissions.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
            ].map((pain) => (
              <Card key={pain.title} hover={false} padding="md">
                <div className="w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center text-navy-500 mb-4">
                  {pain.icon}
                </div>
                <h3 className="text-base font-semibold text-navy-900 mb-2">
                  {pain.title}
                </h3>
                <p className="text-sm text-navy-500 leading-relaxed">
                  {pain.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          C. VISION SECTION
          ============================================================ */}
      <section className="section-padding bg-navy-50">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <span className="badge mb-4">The Vision</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-navy-900 tracking-tight mb-6 text-balance">
                The future of logistics optimization is{" "}
                <span className="gradient-text">collaborative</span>
              </h2>
              <p className="text-lg text-navy-500 leading-relaxed mb-6">
                Organizations need a shared environment where they can identify
                synergies, align actors, test scenarios, structure initiatives,
                and turn ideas into real operational improvements.
              </p>
              <p className="text-lg text-navy-500 leading-relaxed mb-8">
                Pool4ward is that environment — a platform where logistics
                ecosystems come together to optimize beyond company boundaries.
              </p>
              <Button variant="primary" href="/platform">
                Learn about the platform
              </Button>
            </div>
            <div className="bg-white rounded-2xl border border-navy-200/60 p-8 shadow-premium">
              <div className="space-y-6">
                {[
                  { label: "Identify synergies", desc: "Discover cross-company optimization opportunities hidden in fragmented data" },
                  { label: "Align actors", desc: "Bring multiple organizations around shared scenarios and initiatives" },
                  { label: "Test scenarios", desc: "Simulate alternatives before committing operational resources" },
                  { label: "Structure initiatives", desc: "Design clear, coordinated logistics initiatives with defined roles" },
                  { label: "Implement changes", desc: "Move from analysis to operations with connected systems and workflows" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-teal-500 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-navy-900">{item.label}</h4>
                      <p className="text-sm text-navy-500 mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          D. PLATFORM SECTION
          ============================================================ */}
      <section className="section-padding bg-white">
        <div className="container-xl">
          <SectionHeader
            badge="Platform Architecture"
            title="A layered platform centered on collaboration"
            description="Pool4ward combines ecosystem collaboration, operational applications, and
              expert capabilities in one integrated platform. Collaboration is at the top —
              where the value lives."
          />
          <PlatformArchitecture />
          <div className="text-center mt-10">
            <Button variant="secondary" href="/platform">
              Deep dive into the platform →
            </Button>
          </div>
        </div>
      </section>

      {/* ============================================================
          E. PRODUCTS OVERVIEW
          ============================================================ */}
      <section className="section-padding bg-navy-50">
        <div className="container-xl">
          <SectionHeader
            badge="Products"
            title="Applications that make collaboration actionable"
            description="Operational applications help organizations analyze, simulate, and coordinate.
              Expert applications provide the analytical power and connectivity underneath."
          />

          {/* Operational Applications */}
          <div className="mb-12">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-6">
              Operational Applications
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {operationalProducts.map((product) => (
                <Card key={product.slug} href={`/products/${product.slug}`} padding="lg">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 mb-5">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {product.icon === "Search" && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      )}
                      {product.icon === "GitBranch" && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 3v12m0 0a3 3 0 103 3M6 15a3 3 0 01-3 3m9-15a3 3 0 013 3v6a3 3 0 01-3 3M18 6a3 3 0 00-3-3" />
                      )}
                      {product.icon === "Users" && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      )}
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-navy-900 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-brand-600 font-medium mb-3">
                    {product.tagline}
                  </p>
                  <p className="text-sm text-navy-500 leading-relaxed">
                    {product.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          {/* Expert Applications */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-navy-500 mb-6">
              Expert Applications — Enabling Capabilities
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {expertProducts.map((product) => (
                <Card key={product.slug} href={`/products/${product.slug}`} padding="md">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-navy-100 flex items-center justify-center text-navy-500 shrink-0">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {product.icon === "Cpu" && (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        )}
                        {product.icon === "Link" && (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        )}
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-navy-900 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-sm text-navy-500 leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          F. HOW IT WORKS
          ============================================================ */}
      <section className="section-padding bg-white">
        <div className="container-xl">
          <SectionHeader
            badge="How It Works"
            title="From flow analysis to operational implementation"
            description="Pool4ward provides a clear path from understanding your logistics network to
              implementing collaborative optimization across organizations."
          />
          <FlowDiagram />
        </div>
      </section>

      {/* ============================================================
          G. COLLABORATION SECTION
          ============================================================ */}
      <section className="section-padding bg-navy-900 text-white">
        <div className="container-xl">
          <SectionHeader
            badge="Collaboration"
            title="Where logistics ecosystems align"
            description="Pool4ward is the shared environment where organizations come together to discover
              opportunities, design initiatives, and coordinate action across company boundaries."
            dark
          />

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <EcosystemDiagram />
            </div>
            <div className="space-y-8">
              {[
                {
                  title: "Discover shared opportunities",
                  description:
                    "Reveal mutualization potential, overlapping flows, and consolidation opportunities that exist between organizations in your ecosystem.",
                },
                {
                  title: "Design common initiatives",
                  description:
                    "Structure collaborative logistics initiatives with clear scope, defined roles, and shared objectives — not just informal conversations.",
                },
                {
                  title: "Coordinate across actors",
                  description:
                    "Align multiple stakeholders around scenarios, timelines, and implementation plans. Move from alignment to coordinated action.",
                },
                {
                  title: "Implement with confidence",
                  description:
                    "Connect collaborative decisions to operational systems. Turn shared scenarios into real logistics operations.",
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-teal-500 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">{i + 1}</span>
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-white mb-1">{item.title}</h4>
                    <p className="text-sm text-navy-300 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          H. USE CASES / SOLUTIONS
          ============================================================ */}
      <section className="section-padding bg-white">
        <div className="container-xl">
          <SectionHeader
            badge="Solutions"
            title="Logistics challenges that demand collaboration"
            description="Pool4ward addresses the optimization opportunities that exist beyond company
              boundaries — where collaboration creates the most value."
          />
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Collaborative Transport",
                description: "Pool flows, share capacity, and reduce waste across shippers and carriers.",
                href: "/solutions/collaborative-transport",
              },
              {
                title: "Multimodal Optimization",
                description: "Evaluate and implement modal shift strategies backed by scenario analysis.",
                href: "/solutions/multimodal-strategy",
              },
              {
                title: "Network Redesign",
                description: "Optimize logistics networks across organizations for cost and performance.",
                href: "/solutions/logistics-optimization",
              },
              {
                title: "Decarbonization",
                description: "Achieve meaningful emission reductions through structural collaboration, not just reporting.",
                href: "/solutions/supply-chain-decarbonization",
              },
            ].map((useCase) => (
              <Card key={useCase.title} href={useCase.href} padding="lg">
                <h3 className="text-lg font-bold text-navy-900 mb-2">
                  {useCase.title}
                </h3>
                <p className="text-sm text-navy-500 leading-relaxed mb-4">
                  {useCase.description}
                </p>
                <span className="text-sm font-semibold text-brand-600">
                  Learn more →
                </span>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          I. BENEFITS
          ============================================================ */}
      <section className="section-padding bg-navy-50">
        <div className="container-xl">
          <SectionHeader
            badge="Impact"
            title="Measurable outcomes for your logistics ecosystem"
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                metric: "10-25%",
                label: "Cost reduction",
                description: "Through flow mutualization and network optimization across actors",
              },
              {
                metric: "↑",
                label: "Capacity utilization",
                description: "Better load factors and fewer empty kilometers through shared visibility",
              },
              {
                metric: "↓",
                label: "CO₂ emissions",
                description: "Structural emissions reduction through consolidation and modal shift",
              },
              {
                metric: "2-3×",
                label: "Faster coordination",
                description: "From opportunity identification to coordinated implementation",
              },
            ].map((benefit) => (
              <Card key={benefit.label} hover={false} padding="lg">
                <div className="text-3xl font-bold gradient-text mb-2">
                  {benefit.metric}
                </div>
                <h3 className="text-base font-semibold text-navy-900 mb-2">
                  {benefit.label}
                </h3>
                <p className="text-sm text-navy-500 leading-relaxed">
                  {benefit.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          J. ECOSYSTEM / INTEROPERABILITY
          ============================================================ */}
      <section className="section-padding bg-white">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <span className="badge mb-4">Integrations</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 tracking-tight mb-6">
                Connects to the systems that run your logistics
              </h2>
              <p className="text-lg text-navy-500 leading-relaxed mb-8">
                Pool4ward integrates with ERP, TMS, WMS, and partner systems to
                ensure data flows seamlessly and collaborative decisions connect
                to operational reality.
              </p>
              <Button variant="secondary" href="/ecosystem">
                Explore integrations →
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                "ERP Systems",
                "TMS",
                "WMS",
                "Partner APIs",
                "EDI / B2B",
                "Custom Connectors",
                "Data Lakes",
                "BI Tools",
                "IoT Platforms",
              ].map((system) => (
                <div
                  key={system}
                  className="bg-navy-50 border border-navy-100 rounded-xl p-4 flex items-center justify-center text-center"
                >
                  <span className="text-xs font-semibold text-navy-600">
                    {system}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          K. CLOSING CTA
          ============================================================ */}
      <CTABand
        title="The biggest logistics opportunities exist between companies"
        description="Pool4ward helps you find them, design them, and implement them. See it in action."
      />
    </>
  );
}
