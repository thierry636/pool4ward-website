export interface Product {
  slug: string;
  name: string;
  tagline: string;
  category: "operational" | "expert";
  description: string;
  heroDescription: string;
  problemTitle: string;
  problemDescription: string;
  solutionTitle: string;
  solutionDescription: string;
  capabilities: { title: string; description: string }[];
  benefits: { title: string; description: string }[];
  color: string;
  icon: string;
}

export const products: Product[] = [
  {
    slug: "design4ward",
    name: "Design4ward",
    tagline: "Analyze flows. Discover opportunities.",
    category: "operational",
    description:
      "Analyze logistics flows across your network to identify optimization opportunities, including mutualization potential across organizations.",
    heroDescription:
      "Design4ward gives organizations a clear, analytical view of their logistics flows — and reveals where collaborative optimization can create the most value.",
    problemTitle: "Fragmented visibility across logistics networks",
    problemDescription:
      "Most organizations understand their own logistics flows, but lack the tools to see where cross-company synergies exist. Optimization stops at company boundaries, leaving significant value on the table.",
    solutionTitle: "Structured flow analysis with ecosystem intelligence",
    solutionDescription:
      "Design4ward maps logistics flows across networks, identifies overlapping routes, underutilized capacity, and mutualization opportunities — giving decision-makers the analytical foundation to pursue collaborative initiatives.",
    capabilities: [
      { title: "Flow Mapping", description: "Visualize logistics flows across your network with multi-dimensional analysis" },
      { title: "Opportunity Discovery", description: "Automatically identify optimization potential, including cross-company synergies" },
      { title: "Network Analytics", description: "Understand flow patterns, densities, and structural inefficiencies" },
      { title: "Mutualization Analysis", description: "Detect where organizations can share capacity, routes, or logistics resources" },
      { title: "Scenario Framing", description: "Frame optimization scenarios based on discovered opportunities" },
    ],
    benefits: [
      { title: "Reveal hidden value", description: "Discover optimization opportunities invisible from a single-company perspective" },
      { title: "Data-driven decisions", description: "Move from intuition to structured analysis for logistics network optimization" },
      { title: "Accelerate collaboration", description: "Give stakeholders a shared analytical foundation to start working together" },
    ],
    color: "brand",
    icon: "Search",
  },
  {
    slug: "modal4ward",
    name: "Modal4ward",
    tagline: "Simulate scenarios. Compare alternatives.",
    category: "operational",
    description:
      "Simulate and compare multimodal logistics scenarios — evaluate cost, CO₂, service level, and feasibility across transport mode alternatives.",
    heroDescription:
      "Modal4ward enables logistics teams to model, simulate, and compare multimodal transport scenarios before committing to operational changes.",
    problemTitle: "Transport decisions based on assumptions, not analysis",
    problemDescription:
      "Evaluating alternative transport modes or routes is complex. Without simulation capabilities, organizations rely on spreadsheets and assumptions — often missing significant cost and emissions reduction opportunities.",
    solutionTitle: "Scenario-based multimodal simulation",
    solutionDescription:
      "Modal4ward provides a structured environment for simulating transport scenarios. Compare road, rail, inland waterway, and combined solutions across cost, time, emissions, and operational feasibility.",
    capabilities: [
      { title: "Scenario Modeling", description: "Build and configure transport scenarios with multiple modes and routes" },
      { title: "Cost Analysis", description: "Compare total logistics costs across scenarios including handling and transit" },
      { title: "CO₂ Estimation", description: "Calculate and compare carbon emissions for each transport alternative" },
      { title: "Feasibility Assessment", description: "Evaluate operational constraints, infrastructure, and service requirements" },
      { title: "Comparison Dashboard", description: "Side-by-side comparison of scenarios with key performance indicators" },
    ],
    benefits: [
      { title: "Informed modal shift", description: "Make transport mode decisions backed by comprehensive scenario analysis" },
      { title: "Quantified sustainability", description: "Understand the real emissions impact of logistics decisions" },
      { title: "Reduced risk", description: "Test alternatives before implementation through detailed simulation" },
    ],
    color: "teal",
    icon: "GitBranch",
  },
  {
    slug: "cobuild4ward",
    name: "Cobuild4ward",
    tagline: "Coordinate initiatives. Align stakeholders.",
    category: "operational",
    description:
      "Structure and coordinate collaborative logistics initiatives across multiple organizations — from opportunity identification to operational alignment.",
    heroDescription:
      "Cobuild4ward is where collaboration becomes operational. Structure multi-actor logistics initiatives, align stakeholders, and move from shared opportunities to coordinated action.",
    problemTitle: "Collaboration that never moves beyond conversation",
    problemDescription:
      "Logistics collaboration between organizations often stalls because there is no structured environment to design initiatives, share information, align on scenarios, and coordinate implementation. Good ideas stay ideas.",
    solutionTitle: "A structured environment for cross-company collaboration",
    solutionDescription:
      "Cobuild4ward provides the workspace where multiple organizations can jointly design logistics initiatives, share relevant data, align on scenarios, track progress, and coordinate operational implementation.",
    capabilities: [
      { title: "Initiative Design", description: "Structure collaborative logistics initiatives with clear scope and objectives" },
      { title: "Multi-Actor Coordination", description: "Manage roles, contributions, and responsibilities across organizations" },
      { title: "Information Sharing", description: "Share relevant logistics data securely within the context of initiatives" },
      { title: "Scenario Alignment", description: "Build consensus around scenarios and implementation approaches" },
      { title: "Progress Tracking", description: "Track initiative milestones and coordinate operational readiness" },
    ],
    benefits: [
      { title: "Ideas become action", description: "Move collaborative opportunities from discussion to structured implementation" },
      { title: "Faster alignment", description: "Reduce the time from opportunity identification to coordinated action" },
      { title: "Scalable collaboration", description: "Manage multiple cross-company initiatives with clear structure and governance" },
    ],
    color: "brand",
    icon: "Users",
  },
  {
    slug: "compute4ward",
    name: "Compute4ward",
    tagline: "Powering optimization behind the scenes.",
    category: "expert",
    description:
      "Expert application providing advanced computation, optimization engines, and analytical models that power the operational capabilities of the platform.",
    heroDescription:
      "Compute4ward is the analytical engine of the Pool4ward platform — providing the optimization models, simulation capabilities, and computational power that enable operational applications.",
    problemTitle: "Optimization requires deep analytical capabilities",
    problemDescription:
      "Logistics optimization at ecosystem scale requires sophisticated computation — optimization engines, simulation models, scenario analysis, and analytical capabilities that go far beyond standard business tools.",
    solutionTitle: "Enterprise-grade computation for logistics optimization",
    solutionDescription:
      "Compute4ward provides the expert analytical layer that powers Design4ward, Modal4ward, and Cobuild4ward — delivering optimization models, simulation engines, and advanced analytics at scale.",
    capabilities: [
      { title: "Optimization Engines", description: "Mathematical optimization models for logistics network and flow problems" },
      { title: "Simulation Models", description: "Discrete-event and scenario simulation for logistics operations" },
      { title: "Scenario Computation", description: "Large-scale scenario computation with multi-criteria evaluation" },
      { title: "Analytical Models", description: "Specialized logistics analytics including cost, emissions, and utilization models" },
      { title: "Model Execution", description: "Scalable computation infrastructure for complex optimization workloads" },
    ],
    benefits: [
      { title: "Analytical depth", description: "Expert-grade optimization that goes beyond standard business analytics" },
      { title: "Scalable computation", description: "Handle complex, multi-variable logistics optimization at ecosystem scale" },
      { title: "Continuous improvement", description: "Models that evolve with new data and expanding network scope" },
    ],
    color: "navy",
    icon: "Cpu",
  },
  {
    slug: "connect4ward",
    name: "Connect4ward",
    tagline: "Connecting systems. Enabling interoperability.",
    category: "expert",
    description:
      "Expert application for enterprise connectivity and interoperability — connecting ERP, TMS, WMS, and partner systems to enable platform use and implementation.",
    heroDescription:
      "Connect4ward ensures the Pool4ward platform integrates seamlessly with enterprise and logistics systems — making data exchange, implementation, and operational connectivity possible.",
    problemTitle: "Disconnected systems block collaboration",
    problemDescription:
      "Collaborative logistics requires data from multiple systems across multiple organizations. Without robust connectivity, platform adoption stalls and operational implementation remains manual.",
    solutionTitle: "Enterprise-grade connectivity for logistics ecosystems",
    solutionDescription:
      "Connect4ward provides the connectors, APIs, and integration capabilities that link the Pool4ward platform to the enterprise systems where logistics operations actually run.",
    capabilities: [
      { title: "ERP Connectors", description: "Pre-built integrations with major ERP systems for logistics data exchange" },
      { title: "TMS Integration", description: "Connect transport management systems for operational data flow" },
      { title: "WMS Connectivity", description: "Link warehouse management systems for inventory and flow visibility" },
      { title: "API Framework", description: "Extensible API layer for custom integrations and partner systems" },
      { title: "Data Exchange", description: "Secure, structured data exchange protocols across organizational boundaries" },
    ],
    benefits: [
      { title: "Faster implementation", description: "Pre-built connectors reduce time to operational platform use" },
      { title: "System interoperability", description: "Connect the systems that matter without replacing existing infrastructure" },
      { title: "Ecosystem readiness", description: "Enable multi-party data exchange with appropriate security and governance" },
    ],
    color: "navy",
    icon: "Link",
  },
];

export const operationalProducts = products.filter((p) => p.category === "operational");
export const expertProducts = products.filter((p) => p.category === "expert");
