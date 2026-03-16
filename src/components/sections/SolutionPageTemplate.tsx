import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { CTABand } from "@/components/ui/CTABand";
import type { Solution } from "@/content/solutions";

interface SolutionPageTemplateProps {
  solution: Solution;
}

export function SolutionPageTemplate({ solution }: SolutionPageTemplateProps) {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pb-28 overflow-hidden bg-navy-950">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950" />
          <div className="absolute top-20 left-1/3 w-[500px] h-[500px] bg-teal-500/8 rounded-full blur-3xl" />
        </div>
        <div className="relative container-xl">
          <div className="max-w-3xl">
            <span className="badge-teal mb-6">Solution</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-4">
              {solution.title}
            </h1>
            <p className="text-xl text-navy-300 font-medium mb-4">
              {solution.tagline}
            </p>
            <p className="text-lg text-navy-400 leading-relaxed mb-8 max-w-2xl">
              {solution.description}
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
          </div>
        </div>
      </section>

      {/* Business Problem */}
      <section className="section-padding bg-white">
        <div className="container-xl">
          <div className="max-w-3xl mx-auto">
            <span className="badge mb-4">The Challenge</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 tracking-tight mb-6">
              {solution.problemTitle}
            </h2>
            <p className="text-lg text-navy-500 leading-relaxed mb-8">
              {solution.problemDescription}
            </p>
            <div className="bg-navy-50 rounded-2xl border border-navy-100 p-6 lg:p-8">
              <h3 className="text-base font-semibold text-navy-900 mb-3">
                Why this is hard today
              </h3>
              <p className="text-sm text-navy-600 leading-relaxed">
                {solution.whyHard}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How Pool4ward helps */}
      <section className="section-padding bg-navy-50">
        <div className="container-xl">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="badge mb-4">The Solution</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 tracking-tight mb-6">
              How Pool4ward helps
            </h2>
            <p className="text-lg text-navy-500 leading-relaxed">
              {solution.howPool4ward}
            </p>
          </div>

          {/* Related Products */}
          <div className="max-w-3xl mx-auto">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-navy-500 mb-4">
              Powered by
            </h3>
            <div className="flex flex-wrap gap-3">
              {solution.relatedProducts.map((product) => (
                <span
                  key={product}
                  className="inline-flex items-center px-4 py-2 bg-white border border-navy-200 rounded-lg text-sm font-semibold text-navy-700"
                >
                  {product}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Expected Outcomes */}
      <section className="section-padding bg-white">
        <div className="container-xl">
          <SectionHeader
            badge="Outcomes"
            title="Expected impact"
          />
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {solution.outcomes.map((outcome, i) => (
              <Card key={i} hover={false} padding="lg">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-teal-500 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-navy-900 mb-2">
                  {outcome.title}
                </h3>
                <p className="text-sm text-navy-500 leading-relaxed">
                  {outcome.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTABand
        title={`Ready to tackle ${solution.title.toLowerCase()}?`}
        description="See how Pool4ward helps organizations collaborate on logistics optimization at ecosystem scale."
      />
    </>
  );
}
