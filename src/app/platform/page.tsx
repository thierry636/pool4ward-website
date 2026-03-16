import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { CTABand } from "@/components/ui/CTABand";
import { PlatformArchitecture } from "@/components/diagrams/PlatformArchitecture";
import { FlowDiagram } from "@/components/diagrams/FlowDiagram";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Platform — Pool4ward",
  description:
    "Explore the Pool4ward platform architecture: ecosystem collaboration, operational applications, and expert capabilities in one integrated environment.",
};

export default function PlatformPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pb-28 overflow-hidden bg-navy-950">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950" />
          <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-brand-600/8 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-1/4 w-[400px] h-[400px] bg-teal-500/6 rounded-full blur-3xl" />
        </div>
        <div className="relative container-xl text-center">
          <span className="badge mb-6">Platform</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6 text-balance max-w-4xl mx-auto">
            A collaborative platform for{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-teal-400">
              logistics ecosystems
            </span>
          </h1>
          <p className="text-lg lg:text-xl text-navy-300 max-w-2xl mx-auto mb-8">
            Pool4ward brings together collaboration, operational applications,
            and expert capabilities in one integrated environment — designed for
            the way logistics ecosystems actually work.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" size="lg" href="/company#contact">
              Request a demo
            </Button>
            <Button
              variant="ghost"
              size="lg"
              href="#architecture"
              className="text-white hover:text-white hover:bg-white/10"
            >
              See the architecture →
            </Button>
          </div>
        </div>
      </section>

      {/* Why current optimization stops too early */}
      <section className="section-padding bg-white">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <span className="badge mb-4">The Problem</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 tracking-tight mb-6">
                Why logistics optimization stops too early
              </h2>
              <p className="text-lg text-navy-500 leading-relaxed mb-6">
                Most companies optimize internally — their own routes, their own
                warehouses, their own loads. This captures real value, but misses
                the largest opportunities.
              </p>
              <p className="text-lg text-navy-500 leading-relaxed">
                The most impactful optimization — flow mutualization, cross-company
                consolidation, ecosystem-level modal shift — requires visibility,
                simulation, and coordination across organizations. That is what
                Pool4ward makes possible.
              </p>
            </div>
            <div className="space-y-4">
              {[
                {
                  label: "Internal optimization",
                  value: "5-10%",
                  desc: "Typical cost improvement from internal route and load optimization",
                  barWidth: "w-1/3",
                },
                {
                  label: "Cross-company optimization",
                  value: "15-25%",
                  desc: "Additional potential from mutualization and ecosystem coordination",
                  barWidth: "w-2/3",
                },
                {
                  label: "Ecosystem optimization",
                  value: "25-40%",
                  desc: "Total potential with structural changes and modal shift across actors",
                  barWidth: "w-full",
                },
              ].map((item) => (
                <Card key={item.label} hover={false} padding="md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-navy-900">
                      {item.label}
                    </span>
                    <span className="text-lg font-bold gradient-text">
                      {item.value}
                    </span>
                  </div>
                  <div className="w-full bg-navy-100 rounded-full h-2 mb-2">
                    <div
                      className={`bg-gradient-to-r from-brand-500 to-teal-500 h-2 rounded-full ${item.barWidth}`}
                    />
                  </div>
                  <p className="text-xs text-navy-500">{item.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Platform Architecture */}
      <section id="architecture" className="section-padding bg-navy-50">
        <div className="container-xl">
          <SectionHeader
            badge="Architecture"
            title="Three layers, one platform"
            description="Pool4ward is built as a layered platform. Collaboration sits at the top,
              powered by operational applications, which are themselves powered by expert capabilities."
          />
          <PlatformArchitecture />
        </div>
      </section>

      {/* Ecosystem Collaboration */}
      <section id="collaboration" className="section-padding bg-white">
        <div className="container-xl">
          <SectionHeader
            badge="Ecosystem Collaboration"
            title="The heart of the platform"
            description="The Ecosystem Collaboration layer is where organizations discover opportunities,
              structure initiatives, and coordinate across company boundaries."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Opportunity Discovery",
                description:
                  "Identify shared optimization opportunities — mutualization, consolidation, modal shift — visible only at ecosystem level.",
              },
              {
                title: "Initiative Design",
                description:
                  "Structure collaborative logistics initiatives with clear scope, defined roles, and shared objectives.",
              },
              {
                title: "Multi-Actor Coordination",
                description:
                  "Align multiple organizations around scenarios, timelines, and implementation plans.",
              },
              {
                title: "Operational Alignment",
                description:
                  "Connect collaborative decisions to operational reality — systems, processes, and implementation.",
              },
            ].map((item) => (
              <Card key={item.title} hover={false}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-teal-500 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-navy-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-navy-500 leading-relaxed">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Operational Applications */}
      <section className="section-padding bg-navy-50">
        <div className="container-xl">
          <SectionHeader
            badge="Operational Applications"
            title="Applications that help organizations act"
            description="Operational applications serve users directly — enabling analysis, simulation,
              and coordination that drive collaborative logistics initiatives."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Design4ward",
                tagline: "Flow analysis & opportunity discovery",
                description:
                  "Analyze logistics flows across networks and identify where collaborative optimization can create the most value.",
                href: "/products/design4ward",
              },
              {
                name: "Modal4ward",
                tagline: "Multimodal scenario simulation",
                description:
                  "Simulate and compare transport alternatives across cost, time, emissions, and operational feasibility.",
                href: "/products/modal4ward",
              },
              {
                name: "Cobuild4ward",
                tagline: "Cross-company coordination",
                description:
                  "Structure and coordinate collaborative logistics initiatives from opportunity to operational implementation.",
                href: "/products/cobuild4ward",
              },
            ].map((app) => (
              <Card key={app.name} href={app.href} padding="lg">
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 mb-4">
                  <span className="text-sm font-bold">
                    {app.name.charAt(0)}4
                  </span>
                </div>
                <h3 className="text-lg font-bold text-navy-900 mb-1">
                  {app.name}
                </h3>
                <p className="text-sm text-brand-600 font-medium mb-3">
                  {app.tagline}
                </p>
                <p className="text-sm text-navy-500 leading-relaxed">
                  {app.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Expert Applications */}
      <section className="section-padding bg-white">
        <div className="container-xl">
          <SectionHeader
            badge="Expert Applications"
            title="Enabling capabilities that power the platform"
            description="Expert applications provide the advanced analytical computation and
              system connectivity that operational applications rely on."
          />
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                name: "Compute4ward",
                description:
                  "Optimization engines, simulation models, scenario computation, and advanced analytical capabilities that power Design4ward, Modal4ward, and Cobuild4ward.",
                capabilities: [
                  "Mathematical optimization",
                  "Simulation models",
                  "Scenario computation",
                  "Analytics at scale",
                ],
                href: "/products/compute4ward",
              },
              {
                name: "Connect4ward",
                description:
                  "Enterprise connectors, API framework, and data exchange protocols that link the platform to ERP, TMS, WMS, and partner systems.",
                capabilities: [
                  "ERP / TMS / WMS integration",
                  "API framework",
                  "Secure data exchange",
                  "Partner connectivity",
                ],
                href: "/products/connect4ward",
              },
            ].map((app) => (
              <Card key={app.name} href={app.href} padding="lg">
                <div className="w-12 h-12 rounded-xl bg-navy-100 flex items-center justify-center text-navy-600 mb-4">
                  <span className="text-sm font-bold">
                    {app.name.charAt(0)}4
                  </span>
                </div>
                <h3 className="text-lg font-bold text-navy-900 mb-3">
                  {app.name}
                </h3>
                <p className="text-sm text-navy-500 leading-relaxed mb-4">
                  {app.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {app.capabilities.map((cap) => (
                    <span
                      key={cap}
                      className="text-xs font-medium text-navy-500 bg-navy-50 px-2.5 py-1 rounded-lg"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* From opportunity to implementation */}
      <section className="section-padding bg-navy-50">
        <div className="container-xl">
          <SectionHeader
            badge="Process"
            title="From opportunity to implementation"
            description="Pool4ward provides a clear, structured path from understanding your logistics
              landscape to implementing collaborative optimization."
          />
          <FlowDiagram />
        </div>
      </section>

      {/* CTA */}
      <CTABand />
    </>
  );
}
