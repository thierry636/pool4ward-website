import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { CTABand } from "@/components/ui/CTABand";
import { EcosystemDiagram } from "@/components/diagrams/EcosystemDiagram";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ecosystem — Pool4ward",
  description:
    "Pool4ward connects shippers, carriers, logistics operators, and ecosystem partners in a structured collaboration environment.",
};

export default function EcosystemPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pb-28 overflow-hidden bg-navy-950">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950" />
          <div className="absolute top-20 left-1/3 w-[500px] h-[500px] bg-teal-500/8 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/3 w-[400px] h-[400px] bg-brand-600/6 rounded-full blur-3xl" />
        </div>
        <div className="relative container-xl text-center">
          <span className="badge mb-6">Ecosystem</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6 text-balance max-w-4xl mx-auto">
            A structured environment for{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-teal-400">
              ecosystem collaboration
            </span>
          </h1>
          <p className="text-lg lg:text-xl text-navy-300 max-w-2xl mx-auto mb-8">
            Pool4ward connects shippers, carriers, logistics operators, and
            ecosystem partners in a shared platform for discovering and
            implementing collaborative optimization.
          </p>
          <Button variant="primary" size="lg" href="/company#contact">
            Request a demo
          </Button>
        </div>
      </section>

      {/* Why collaboration is hard */}
      <section className="section-padding bg-white">
        <div className="container-xl">
          <SectionHeader
            badge="The Challenge"
            title="Why cross-organizational collaboration is hard"
            description="Logistics collaboration between companies is valuable in theory and difficult in practice.
              The barriers are structural, not just relational."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "No shared visibility",
                description: "Organizations operate on separate systems with no unified view of flows, capacities, or opportunities.",
              },
              {
                title: "No structured process",
                description: "Collaboration attempts happen through emails and meetings, with no clear framework for initiative design.",
              },
              {
                title: "Competing interests",
                description: "Actors need to see mutual benefit clearly before committing to shared logistics initiatives.",
              },
              {
                title: "Data sensitivity",
                description: "Sharing logistics data between organizations requires secure, governed, purpose-specific exchange.",
              },
              {
                title: "Complexity at scale",
                description: "Multi-actor coordination with interdependent flows is too complex for spreadsheets and slide decks.",
              },
              {
                title: "Implementation gap",
                description: "Even good collaborative ideas often fail to reach operational implementation without the right tools.",
              },
            ].map((item) => (
              <Card key={item.title} hover={false} padding="md">
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

      {/* How Pool4ward structures collaboration */}
      <section className="section-padding bg-navy-50">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <span className="badge mb-4">The Solution</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 tracking-tight mb-6">
                How Pool4ward structures ecosystem collaboration
              </h2>
              <p className="text-lg text-navy-500 leading-relaxed mb-6">
                Pool4ward provides the shared analytical and coordination
                environment that makes cross-company logistics collaboration
                operational — not just conversational.
              </p>
              <div className="space-y-4">
                {[
                  "Shared analytical workspace for ecosystem-level flow analysis",
                  "Structured initiative design with roles and objectives",
                  "Secure, purpose-specific information sharing between actors",
                  "Scenario alignment across multiple organizations",
                  "Progress tracking and operational coordination",
                ].map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-brand-500 to-teal-500 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm text-navy-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <EcosystemDiagram />
          </div>
        </div>
      </section>

      {/* Information sharing */}
      <section className="section-padding bg-white">
        <div className="container-xl">
          <SectionHeader
            badge="Information Sharing"
            title="Secure, governed data exchange"
            description="Pool4ward enables organizations to share relevant logistics data within the context
              of specific initiatives — with appropriate security, governance, and purpose limitation."
          />
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                title: "Purpose-specific sharing",
                description: "Data is shared within the context of defined initiatives, not as open access.",
              },
              {
                title: "Role-based visibility",
                description: "Each actor sees only what is relevant to their role in the collaboration.",
              },
              {
                title: "Audit and governance",
                description: "Full traceability of data exchange with enterprise-grade security controls.",
              },
            ].map((item) => (
              <Card key={item.title} hover={false} padding="md">
                <h3 className="text-base font-semibold text-navy-900 mb-2">{item.title}</h3>
                <p className="text-sm text-navy-500 leading-relaxed">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="section-padding bg-navy-50">
        <div className="container-xl">
          <SectionHeader
            badge="Integrations"
            title="Connects to the systems that matter"
            description="Through Connect4ward, the platform integrates with enterprise and logistics systems
              to ensure data flows and collaborative decisions connect to operations."
          />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {[
              "SAP",
              "Oracle",
              "Microsoft Dynamics",
              "TMS Systems",
              "WMS Systems",
              "Carrier Platforms",
              "EDI Networks",
              "Custom APIs",
              "Data Warehouses",
              "BI Platforms",
              "IoT Systems",
              "Partner Portals",
            ].map((system) => (
              <div
                key={system}
                className="bg-white border border-navy-200/60 rounded-xl p-4 flex items-center justify-center text-center shadow-premium"
              >
                <span className="text-xs font-semibold text-navy-600">{system}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Actor types */}
      <section className="section-padding bg-white">
        <div className="container-xl">
          <SectionHeader
            badge="Ecosystem Actors"
            title="Who participates in the ecosystem"
            description="Pool4ward serves the full range of actors involved in logistics collaboration —
              from shippers to carriers to ecosystem coordinators."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Shippers",
                description: "Organizations that need to move goods and want to optimize their logistics networks through collaboration.",
              },
              {
                title: "Carriers",
                description: "Transport companies that can optimize capacity utilization and service by coordinating with other actors.",
              },
              {
                title: "Logistics Operators",
                description: "3PL and logistics service providers orchestrating flows across multiple clients and modes.",
              },
              {
                title: "Multimodal Actors",
                description: "Rail operators, inland waterway companies, and intermodal terminals enabling modal shift.",
              },
              {
                title: "Ecosystem Coordinators",
                description: "Industry organizations, clusters, and platforms that facilitate collaboration across actors.",
              },
              {
                title: "Technology Partners",
                description: "System providers and integrators that connect the ecosystem through data and technology.",
              },
            ].map((actor) => (
              <Card key={actor.title} hover={false} padding="md">
                <h3 className="text-base font-semibold text-navy-900 mb-2">{actor.title}</h3>
                <p className="text-sm text-navy-500 leading-relaxed">{actor.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTABand
        title="Build your logistics ecosystem on Pool4ward"
        description="See how organizations are using Pool4ward to structure and implement collaborative logistics initiatives."
      />
    </>
  );
}
