import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { CTABand } from "@/components/ui/CTABand";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resources — Pool4ward",
  description:
    "Insights, case studies, and platform documentation for collaborative logistics optimization.",
};

const insights = [
  {
    category: "Thought Leadership",
    title: "Why logistics optimization must go beyond company boundaries",
    description:
      "An analysis of why the biggest logistics optimization opportunities exist at ecosystem level — and what it takes to capture them.",
    readTime: "8 min read",
  },
  {
    category: "Platform Guide",
    title: "The Pool4ward platform architecture explained",
    description:
      "A detailed walkthrough of Pool4ward's three-layer platform model: Ecosystem Collaboration, Operational Applications, and Expert Applications.",
    readTime: "12 min read",
  },
  {
    category: "Industry Analysis",
    title: "Collaborative transport in Europe: state of play",
    description:
      "How leading logistics organizations in Europe are structuring cross-company transport initiatives — and what we can learn.",
    readTime: "10 min read",
  },
  {
    category: "Thought Leadership",
    title: "From optimization to collaboration: the next frontier",
    description:
      "Why the shift from internal optimization to ecosystem collaboration is the defining logistics transformation of this decade.",
    readTime: "6 min read",
  },
  {
    category: "Technical Guide",
    title: "Multimodal scenario simulation with Modal4ward",
    description:
      "How organizations use Modal4ward to evaluate and compare transport alternatives across cost, emissions, and operational feasibility.",
    readTime: "9 min read",
  },
  {
    category: "Platform Guide",
    title: "Getting started with ecosystem collaboration",
    description:
      "A practical guide to structuring your first cross-company logistics initiative on Pool4ward.",
    readTime: "7 min read",
  },
];

const caseStudies = [
  {
    title: "European shipper consortium reduces transport costs by 18%",
    description:
      "How a group of European shippers used Pool4ward to identify and implement flow mutualization opportunities across their networks.",
    tags: ["Collaborative Transport", "Cost Reduction"],
  },
  {
    title: "Modal shift initiative saves 12,000 tons of CO₂ annually",
    description:
      "A multimodal logistics initiative designed and coordinated on Pool4ward, shifting freight from road to rail across three countries.",
    tags: ["Multimodal Strategy", "Decarbonization"],
  },
  {
    title: "Logistics cluster structures 5 collaborative initiatives in 6 months",
    description:
      "How a regional logistics cluster used Pool4ward as the coordination platform for identifying and launching collaborative optimization projects.",
    tags: ["Ecosystem", "Coordination"],
  },
];

export default function ResourcesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-navy-950">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950" />
          <div className="absolute top-20 right-1/3 w-[400px] h-[400px] bg-brand-600/6 rounded-full blur-3xl" />
        </div>
        <div className="relative container-xl text-center">
          <span className="badge mb-6">Resources</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6 max-w-3xl mx-auto">
            Insights and resources
          </h1>
          <p className="text-lg text-navy-300 max-w-2xl mx-auto">
            Thought leadership, platform guides, and case studies on
            collaborative logistics optimization.
          </p>
        </div>
      </section>

      {/* Featured Insights */}
      <section className="section-padding bg-white">
        <div className="container-xl">
          <SectionHeader
            badge="Insights"
            title="Latest thinking on collaborative logistics"
            align="left"
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {insights.map((insight, i) => (
              <Card key={i} hover padding="md" className="cursor-pointer">
                <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
                  {insight.category}
                </span>
                <h3 className="text-base font-bold text-navy-900 mt-3 mb-2 leading-snug">
                  {insight.title}
                </h3>
                <p className="text-sm text-navy-500 leading-relaxed mb-4">
                  {insight.description}
                </p>
                <span className="text-xs text-navy-400">{insight.readTime}</span>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="section-padding bg-navy-50">
        <div className="container-xl">
          <SectionHeader
            badge="Case Studies"
            title="Real impact from collaborative logistics"
            align="left"
          />
          <div className="space-y-6">
            {caseStudies.map((study, i) => (
              <Card key={i} hover padding="lg" className="cursor-pointer">
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-navy-900 mb-2">
                      {study.title}
                    </h3>
                    <p className="text-sm text-navy-500 leading-relaxed">
                      {study.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 md:shrink-0">
                    {study.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-medium text-navy-500 bg-navy-100 px-2.5 py-1 rounded-lg whitespace-nowrap"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Documentation */}
      <section className="section-padding bg-white">
        <div className="container-xl">
          <SectionHeader
            badge="Documentation"
            title="Platform overview and guides"
          />
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                title: "Platform Architecture",
                description: "Understand the three-layer model and how Pool4ward components work together.",
                href: "/platform",
              },
              {
                title: "Product Guide",
                description: "Detailed documentation for each Pool4ward application — from Design4ward to Connect4ward.",
                href: "/platform",
              },
              {
                title: "Integration Guide",
                description: "Technical overview of Connect4ward capabilities and supported enterprise systems.",
                href: "/products/connect4ward",
              },
            ].map((doc) => (
              <Card key={doc.title} href={doc.href} padding="md">
                <h3 className="text-base font-semibold text-navy-900 mb-2">
                  {doc.title}
                </h3>
                <p className="text-sm text-navy-500 leading-relaxed mb-3">
                  {doc.description}
                </p>
                <span className="text-sm font-semibold text-brand-600">
                  Read more →
                </span>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTABand
        title="Want to see collaborative logistics in practice?"
        description="Request a demo to see how Pool4ward helps organizations optimize beyond company boundaries."
      />
    </>
  );
}
