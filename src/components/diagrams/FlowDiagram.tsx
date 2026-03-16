"use client";

const steps = [
  {
    number: "01",
    title: "Analyze",
    description: "Map and analyze logistics flows across your network",
    color: "from-brand-500 to-brand-600",
  },
  {
    number: "02",
    title: "Identify",
    description: "Discover synergies and optimization opportunities",
    color: "from-brand-600 to-brand-700",
  },
  {
    number: "03",
    title: "Design",
    description: "Design collaborative scenarios and initiatives",
    color: "from-brand-700 to-teal-600",
  },
  {
    number: "04",
    title: "Simulate",
    description: "Simulate alternatives and compare outcomes",
    color: "from-teal-600 to-teal-500",
  },
  {
    number: "05",
    title: "Coordinate",
    description: "Align stakeholders and coordinate across actors",
    color: "from-teal-500 to-teal-400",
  },
  {
    number: "06",
    title: "Implement",
    description: "Connect to operations and implement changes",
    color: "from-teal-400 to-teal-300",
  },
];

export function FlowDiagram({ className = "" }: { className?: string }) {
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
