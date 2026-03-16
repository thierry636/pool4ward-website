export interface Solution {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  problemTitle: string;
  problemDescription: string;
  whyHard: string;
  howPool4ward: string;
  relatedProducts: string[];
  outcomes: { title: string; description: string }[];
  icon: string;
}

export const solutions: Solution[] = [
  {
    slug: "logistics-optimization",
    title: "Logistics Optimization",
    tagline: "Optimize logistics beyond the boundaries of one organization",
    description:
      "Discover and implement logistics optimization opportunities that span across companies, networks, and operational boundaries.",
    problemTitle: "Optimization that stops too early",
    problemDescription:
      "Most logistics optimization happens within the boundaries of a single company. Route optimization, load consolidation, and network design are applied internally — while the largest opportunities often exist between organizations.",
    whyHard:
      "Cross-company optimization requires shared visibility into flows, the ability to simulate joint scenarios, and structured coordination between actors who traditionally operate independently. No single company can do this alone.",
    howPool4ward:
      "Pool4ward provides the analytical, simulation, and coordination environment where multiple organizations can jointly identify, evaluate, and implement logistics optimization at ecosystem scale — from flow analysis to operational implementation.",
    relatedProducts: ["Design4ward", "Modal4ward", "Cobuild4ward", "Compute4ward"],
    outcomes: [
      { title: "10-25% cost reduction", description: "Through mutualization, consolidation, and network optimization across actors" },
      { title: "Higher asset utilization", description: "Reduce empty runs and unused capacity by coordinating across organizations" },
      { title: "Faster implementation", description: "Structured process from opportunity discovery to operational change" },
    ],
    icon: "TrendingUp",
  },
  {
    slug: "collaborative-transport",
    title: "Collaborative Transport",
    tagline: "Pool flows. Share capacity. Reduce waste.",
    description:
      "Enable shippers, carriers, and logistics operators to pool transport flows, share capacity, and reduce logistics waste through structured collaboration.",
    problemTitle: "Transport capacity wasted at scale",
    problemDescription:
      "Across logistics networks, trucks run partially loaded, routes overlap between shippers, and return legs go empty. Individual companies cannot solve this — the solution requires coordination across organizational boundaries.",
    whyHard:
      "Transport collaboration requires identifying compatible flows, aligning operational requirements, building trust between parties, and managing the complexity of multi-actor coordination. Without the right tools, it rarely scales.",
    howPool4ward:
      "Pool4ward helps organizations discover overlapping flows, model pooling scenarios, and coordinate shared transport initiatives — turning fragmented capacity into collaborative efficiency.",
    relatedProducts: ["Design4ward", "Cobuild4ward", "Modal4ward"],
    outcomes: [
      { title: "Reduced empty kilometers", description: "Pool flows to fill trucks and eliminate unnecessary transport legs" },
      { title: "Lower per-unit costs", description: "Share transport costs across organizations through flow mutualization" },
      { title: "Measurable CO₂ reduction", description: "Fewer trucks on the road means fewer emissions per unit shipped" },
    ],
    icon: "Truck",
  },
  {
    slug: "multimodal-strategy",
    title: "Multimodal Strategy",
    tagline: "Evaluate alternatives. Shift smartly.",
    description:
      "Analyze, simulate, and implement multimodal transport strategies — moving from road to rail, waterway, or combined solutions where it makes operational and economic sense.",
    problemTitle: "Modal shift without analysis is a gamble",
    problemDescription:
      "Organizations know they should explore alternatives to road-only transport, but evaluating multimodal options is complex. Cost structures, service requirements, infrastructure availability, and emission impacts must be compared rigorously.",
    whyHard:
      "Multimodal decisions involve trade-offs between cost, speed, reliability, emissions, and infrastructure constraints. Without proper simulation tools, organizations either avoid modal shift or make decisions based on incomplete analysis.",
    howPool4ward:
      "Pool4ward enables organizations to model their current logistics flows, simulate multimodal alternatives, compare scenarios across all relevant dimensions, and make confident decisions backed by data.",
    relatedProducts: ["Modal4ward", "Design4ward", "Compute4ward"],
    outcomes: [
      { title: "Informed modal shift", description: "Data-backed decisions on when and where to shift transport modes" },
      { title: "Balanced trade-offs", description: "Clear understanding of cost, service, and emissions impact for each scenario" },
      { title: "Operational readiness", description: "From scenario analysis to implementation planning in one environment" },
    ],
    icon: "Train",
  },
  {
    slug: "supply-chain-decarbonization",
    title: "Supply Chain Decarbonization",
    tagline: "Reduce emissions through operational collaboration",
    description:
      "Achieve meaningful logistics emissions reduction through collaborative optimization, modal shift, and network efficiency — not just reporting.",
    problemTitle: "Decarbonization targets without operational levers",
    problemDescription:
      "Many organizations have ambitious decarbonization targets for their logistics operations, but struggle to find operational levers beyond incremental efficiency improvements. Reporting is not the same as reduction.",
    whyHard:
      "Significant logistics emission reductions require structural changes — modal shift, flow consolidation, network redesign, and cross-company coordination. These go beyond what any single organization can implement alone.",
    howPool4ward:
      "Pool4ward enables organizations to quantify the emissions impact of logistics decisions, identify collaborative reduction opportunities, simulate alternative scenarios, and implement structural changes that deliver measurable results.",
    relatedProducts: ["Modal4ward", "Design4ward", "Cobuild4ward", "Compute4ward"],
    outcomes: [
      { title: "Quantified impact", description: "Measure emissions reduction for every optimization scenario" },
      { title: "Structural reduction", description: "Go beyond incremental gains with modal shift and flow mutualization" },
      { title: "Collaborative scale", description: "Achieve reduction targets through ecosystem-level optimization" },
    ],
    icon: "Leaf",
  },
];
