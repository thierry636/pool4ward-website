import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { CTABand } from "@/components/ui/CTABand";
import { PlatformArchitecture } from "@/components/diagrams/PlatformArchitecture";
import { operationalProducts, expertProducts } from "@/content/products";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products — Pool4ward",
  description:
    "Explore Pool4ward's operational and expert applications: Design4ward, Modal4ward, Cobuild4ward, Compute4ward, and Connect4ward.",
};

export default function ProductsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pb-28 overflow-hidden bg-navy-950">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950" />
          <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-brand-600/8 rounded-full blur-3xl" />
        </div>
        <div className="relative container-xl text-center">
          <span className="badge mb-6">Products</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6 text-balance max-w-4xl mx-auto">
            Applications that make{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-teal-400">
              collaboration actionable
            </span>
          </h1>
          <p className="text-lg lg:text-xl text-navy-300 max-w-2xl mx-auto">
            Operational applications serve users directly. Expert applications
            provide the analytical power and connectivity underneath.
          </p>
        </div>
      </section>

      {/* Operational Applications */}
      <section className="section-padding bg-white">
        <div className="container-xl">
          <SectionHeader
            badge="Operational Applications"
            title="Applications that help organizations act"
            description="These applications serve users directly — enabling analysis, simulation, and
              coordination for collaborative logistics initiatives."
            align="left"
          />
          <div className="space-y-8">
            {operationalProducts.map((product) => (
              <Card key={product.slug} href={`/products/${product.slug}`} padding="lg">
                <div className="grid md:grid-cols-3 gap-6 items-center">
                  <div className="md:col-span-2">
                    <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
                      Operational Application
                    </span>
                    <h3 className="text-xl font-bold text-navy-900 mt-2 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-brand-600 font-medium mb-3">
                      {product.tagline}
                    </p>
                    <p className="text-sm text-navy-500 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.capabilities.slice(0, 3).map((cap) => (
                      <span
                        key={cap.title}
                        className="text-xs font-medium text-navy-500 bg-brand-50 px-2.5 py-1 rounded-lg"
                      >
                        {cap.title}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Expert Applications */}
      <section className="section-padding bg-navy-50">
        <div className="container-xl">
          <SectionHeader
            badge="Expert Applications"
            title="Enabling capabilities that power the platform"
            description="Expert applications provide the advanced analytical computation and system
              connectivity that operational applications rely on."
            align="left"
          />
          <div className="grid md:grid-cols-2 gap-6">
            {expertProducts.map((product) => (
              <Card key={product.slug} href={`/products/${product.slug}`} padding="lg">
                <span className="text-xs font-semibold text-navy-500 uppercase tracking-wider">
                  Expert Application
                </span>
                <h3 className="text-lg font-bold text-navy-900 mt-2 mb-1">
                  {product.name}
                </h3>
                <p className="text-sm text-navy-600 font-medium mb-3">
                  {product.tagline}
                </p>
                <p className="text-sm text-navy-500 leading-relaxed">
                  {product.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Architecture */}
      <section className="section-padding bg-white">
        <div className="container-xl">
          <SectionHeader
            badge="Architecture"
            title="How products fit into the platform"
            description="Every Pool4ward application is part of a layered platform architecture
              centered on ecosystem collaboration."
          />
          <PlatformArchitecture />
          <div className="text-center mt-10">
            <Button variant="secondary" href="/platform">
              Learn more about the platform →
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTABand />
    </>
  );
}
