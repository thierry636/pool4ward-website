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
      "Cross-company optimization requires shared visibility into flows, structured coordination between actors who traditionally operate independently, and access to multimodal service information. No single company can do this alone.",
    howPool4ward:
      "Pool4ward provides the analytical and coordination environment where multiple organizations can jointly identify, evaluate, and implement logistics optimization at ecosystem scale — from flow analysis to operational implementation.",
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
      "Pool4ward helps organizations discover overlapping flows, access structured multimodal service information, and coordinate shared transport initiatives — turning fragmented capacity into collaborative efficiency.",
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
      "Evaluate and implement multimodal transport strategies — leveraging structured service information for rail, waterway, and shortsea to shift from road where it makes operational and economic sense.",
    problemTitle: "Modal shift without structured service information is a gamble",
    problemDescription:
      "Organizations know they should explore alternatives to road-only transport, but accessing reliable multimodal service information is difficult. Service offers, terminals, lead times and frequencies are scattered and hard to compare.",
    whyHard:
      "Multimodal decisions require access to structured, up-to-date service data from rail, river and shortsea operators. Without a reliable source of service information, organizations either avoid modal shift or make decisions based on incomplete data.",
    howPool4ward:
      "Pool4ward gives organizations access to structured multimodal service information through Modal4ward, analytical tools through Design4ward, and coordination capabilities through Cobuild4ward — enabling confident decisions backed by real data.",
    relatedProducts: ["Modal4ward", "Design4ward", "Compute4ward"],
    outcomes: [
      { title: "Informed modal shift", description: "Data-backed decisions on when and where to shift transport modes" },
      { title: "Balanced trade-offs", description: "Clear understanding of cost, service, and emissions impact for each transport alternative" },
      { title: "Operational readiness", description: "From service discovery to implementation planning in one environment" },
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
      "Pool4ward enables organizations to quantify the emissions impact of logistics decisions, identify collaborative reduction opportunities, access structured multimodal service data, and implement structural changes that deliver measurable results.",
    relatedProducts: ["Modal4ward", "Design4ward", "Cobuild4ward", "Compute4ward"],
    outcomes: [
      { title: "Quantified impact", description: "Measure emissions reduction for every optimization scenario" },
      { title: "Structural reduction", description: "Go beyond incremental gains with modal shift and flow mutualization" },
      { title: "Collaborative scale", description: "Achieve reduction targets through ecosystem-level optimization" },
    ],
    icon: "Leaf",
  },
];
