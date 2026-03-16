import { Card } from "@/components/ui/Card";
import { CTABand } from "@/components/ui/CTABand";
import { solutions } from "@/content/solutions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Solutions — Pool4ward",
  description:
    "Logistics optimization, collaborative transport, multimodal strategy, and supply chain decarbonization — powered by Pool4ward.",
};

export default function SolutionsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pb-28 overflow-hidden bg-navy-950">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950" />
          <div className="absolute top-20 left-1/3 w-[500px] h-[500px] bg-teal-500/8 rounded-full blur-3xl" />
        </div>
        <div className="relative container-xl text-center">
          <span className="badge-teal mb-6">Solutions</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6 text-balance max-w-4xl mx-auto">
            Logistics challenges that demand{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-brand-400">
              collaboration
            </span>
          </h1>
          <p className="text-lg lg:text-xl text-navy-300 max-w-2xl mx-auto">
            Pool4ward addresses the optimization opportunities that exist beyond
            company boundaries — where collaboration creates the most value.
          </p>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="section-padding bg-white">
        <div className="container-xl">
          <div className="space-y-8">
            {solutions.map((solution) => (
              <Card
                key={solution.slug}
                href={`/solutions/${solution.slug}`}
                padding="lg"
              >
                <div className="grid md:grid-cols-3 gap-6 items-start">
                  <div className="md:col-span-2">
                    <h3 className="text-xl font-bold text-navy-900 mb-2">
                      {solution.title}
                    </h3>
                    <p className="text-sm text-teal-600 font-medium mb-3">
                      {solution.tagline}
                    </p>
                    <p className="text-sm text-navy-500 leading-relaxed">
                      {solution.description}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-navy-400 mb-3">
                      Expected Outcomes
                    </h4>
                    <div className="space-y-2">
                      {solution.outcomes.map((outcome) => (
                        <div key={outcome.title} className="flex gap-2">
                          <svg className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-xs text-navy-600 font-medium">
                            {outcome.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTABand
        title="Which logistics challenge are you facing?"
        description="Let us show you how Pool4ward helps organizations tackle complex logistics optimization through collaboration."
      />
    </>
  );
}
