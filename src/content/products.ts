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
    tagline: "Manage and distribute multimodal transport services.",
    category: "operational",
    description:
      "Manage and distribute multimodal transport services through a structured operator platform and partner API.",
    heroDescription:
      "Modal4ward helps operators structure, publish and distribute rail, river and shortsea transport services through a unified product experience and partner API.",
    problemTitle: "Multimodal services are hard to structure, maintain and access",
    problemDescription:
      "Multimodal transport offers are often fragmented, inconsistently formatted and difficult to distribute across the ecosystem. Modal4ward gives operators a structured way to manage their services and makes those services easier to access through a partner API.",
    solutionTitle: "A single platform to manage and expose multimodal services",
    solutionDescription:
      "Modal4ward gives operators a practical way to manage their transport services, improve the quality of their offer data and increase market visibility — with a partner API for service distribution.",
    capabilities: [
      { title: "Service Management", description: "Create and maintain structured rail, river and shortsea services" },
      { title: "Standardized Service Data", description: "Organize key service information such as terminals, lead times, frequencies and equipment" },
      { title: "Partner API Access", description: "Expose services to trusted partners and connected platforms" },
      { title: "Operator Profile", description: "Showcase company information and transport capabilities" },
      { title: "Offer Visibility", description: "Increase the discoverability of your services across the ecosystem" },
    ],
    benefits: [
      { title: "Structured offer", description: "Maintain up-to-date multimodal services in a consistent, structured format" },
      { title: "Broader reach", description: "Distribute services to partners and publishers through a dedicated API" },
      { title: "Market visibility", description: "Present the company and its offer more clearly to the market" },
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
      "Compute4ward provides the expert analytical layer that powers Design4ward and Cobuild4ward — delivering optimization models, simulation engines, and advanced analytics at scale.",
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
    tagline: "The logistics data platform.",
    category: "expert",
    description:
      "Connect, standardize and validate transport data across systems, partners and applications. The reliable data foundation for logistics operations.",
    heroDescription:
      "Connect4ward transforms heterogeneous transport data into a consistent and validated logistics model. It connects systems, normalizes data intelligently and ensures reliability at scale.",
    problemTitle: "Logistics data is fragmented and unreliable",
    problemDescription:
      "Transport data is spread across multiple systems, formats and partners. Inconsistent structures and missing information make it difficult to use data reliably for operations and decision-making.",
    solutionTitle: "From fragmented data to a reliable logistics data model",
    solutionDescription:
      "Connect4ward uses intelligent normalization mechanisms to map, clean and harmonize heterogeneous transport data — ensuring that data from different systems can be consistently structured and reliably used across the platform.",
    capabilities: [
      { title: "Data Ingestion", description: "Ingest data from ERP, TMS, files and external partners into a unified pipeline" },
      { title: "Intelligent Normalization", description: "Automatically harmonize transport data across formats, structures and sources using advanced normalization logic" },
      { title: "Data Validation and Quality", description: "Detect inconsistencies, missing values and structural issues to ensure data reliability" },
      { title: "Unified Logistics Data Model", description: "Structure all data into a consistent model usable across the platform" },
      { title: "Controlled Data Sharing", description: "Securely share standardized data across applications and partners with appropriate governance" },
    ],
    benefits: [
      { title: "Reliable data foundation", description: "Reduce data inconsistencies and improve quality across all connected systems" },
      { title: "Faster integration", description: "Accelerate data onboarding from new systems and partners through intelligent normalization" },
      { title: "Platform consistency", description: "Provide a single source of truth for all applications within Pool4ward" },
    ],
    color: "navy",
    icon: "Link",
  },
];

export const operationalProducts = products.filter((p) => p.category === "operational");
export const expertProducts = products.filter((p) => p.category === "expert");
