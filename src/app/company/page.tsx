import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Company — Pool4ward",
  description:
    "Pool4ward exists because the biggest logistics optimization opportunities are collaborative. Learn about our vision.",
};

export default function CompanyPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pb-28 overflow-hidden bg-navy-950">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950" />
          <div className="absolute top-20 left-1/2 w-[500px] h-[500px] bg-brand-600/6 rounded-full blur-3xl -translate-x-1/2" />
        </div>
        <div className="relative container-xl text-center">
          <span className="badge mb-6">Company</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6 text-balance max-w-4xl mx-auto">
            We believe the future of logistics is{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-teal-400">
              collaborative
            </span>
          </h1>
          <p className="text-lg lg:text-xl text-navy-300 max-w-2xl mx-auto">
            Pool4ward exists because the biggest logistics optimization
            opportunities are not inside one company — they are between companies.
          </p>
        </div>
      </section>

      {/* Vision */}
      <section className="section-padding bg-white">
        <div className="container-xl">
          <div className="max-w-3xl mx-auto">
            <span className="badge mb-4">Our Vision</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 tracking-tight mb-8">
              Logistics ecosystems that optimize together
            </h2>
            <div className="space-y-6 text-lg text-navy-500 leading-relaxed">
              <p>
                For decades, logistics optimization has been an internal exercise.
                Companies optimize their own routes, their own warehouses, their
                own supply chains. And they do it well.
              </p>
              <p>
                But the largest untapped opportunities — flow mutualization,
                cross-company consolidation, ecosystem-level modal shift — remain
                invisible and unactionable because they require coordination
                across organizational boundaries.
              </p>
              <p>
                Pool4ward was built to change that. We provide the platform where
                logistics ecosystems can discover shared opportunities, design
                collaborative initiatives, and implement optimization that no
                single company could achieve alone.
              </p>
              <p className="font-semibold text-navy-900">
                We believe collaborative logistics is not a nice-to-have — it is
                the next frontier of logistics performance, sustainability, and
                resilience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Pool4ward exists */}
      <section className="section-padding bg-navy-50">
        <div className="container-xl">
          <SectionHeader
            badge="Why We Exist"
            title="The beliefs behind Pool4ward"
          />
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                title: "Optimization has a collaboration problem",
                description:
                  "The tools exist to optimize within one company. But no tool existed to optimize across companies. Pool4ward fills that gap.",
              },
              {
                title: "Collaboration needs more than communication",
                description:
                  "Emails and meetings are not enough. Collaborative logistics requires shared analysis, shared scenarios, and structured coordination.",
              },
              {
                title: "Ecosystems create outsized value",
                description:
                  "When organizations align around shared logistics opportunities, the value created exceeds what any individual optimization can achieve.",
              },
              {
                title: "Implementation matters most",
                description:
                  "Insights without action are just reports. Pool4ward is built to move from opportunity discovery to operational implementation.",
              },
            ].map((belief) => (
              <Card key={belief.title} hover={false} padding="lg">
                <h3 className="text-base font-semibold text-navy-900 mb-3">
                  {belief.title}
                </h3>
                <p className="text-sm text-navy-500 leading-relaxed">
                  {belief.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="section-padding bg-white">
        <div className="container-xl">
          <div className="max-w-2xl mx-auto text-center">
            <SectionHeader
              badge="Contact"
              title="Get in touch"
              description="Ready to explore how Pool4ward can help your organization optimize logistics
                through collaboration? Request a demo or reach out to our team."
            />

            <div className="bg-navy-50 rounded-2xl border border-navy-100 p-8 lg:p-10">
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-navy-700 mb-2 text-left"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-3 rounded-lg border border-navy-200 bg-white text-navy-900 text-sm
                               focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                               placeholder:text-navy-400"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-navy-700 mb-2 text-left"
                  >
                    Work email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 rounded-lg border border-navy-200 bg-white text-navy-900 text-sm
                               focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                               placeholder:text-navy-400"
                    placeholder="you@company.com"
                  />
                </div>
                <div>
                  <label
                    htmlFor="company"
                    className="block text-sm font-medium text-navy-700 mb-2 text-left"
                  >
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    className="w-full px-4 py-3 rounded-lg border border-navy-200 bg-white text-navy-900 text-sm
                               focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                               placeholder:text-navy-400"
                    placeholder="Your organization"
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-navy-700 mb-2 text-left"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-navy-200 bg-white text-navy-900 text-sm
                               focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                               placeholder:text-navy-400 resize-none"
                    placeholder="Tell us about your logistics collaboration objectives"
                  />
                </div>
                <Button variant="primary" size="lg" className="w-full">
                  Request a demo
                </Button>
                <p className="text-xs text-navy-400">
                  We typically respond within one business day.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
