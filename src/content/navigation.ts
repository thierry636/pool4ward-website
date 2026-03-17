export const navigation = {
  main: [
    { label: "Platform", href: "/platform" },
    {
      label: "Products",
      href: "/products",
      children: [
        {
          label: "Design4ward",
          href: "/products/design4ward",
          description: "Analyze flows and discover opportunities",
          category: "Operational",
        },
        {
          label: "Modal4ward",
          href: "/products/modal4ward",
          description: "Manage and distribute multimodal services",
          category: "Operational",
        },
        {
          label: "Cobuild4ward",
          href: "/products/cobuild4ward",
          description: "Coordinate cross-company initiatives",
          category: "Operational",
        },
        {
          label: "Compute4ward",
          href: "/products/compute4ward",
          description: "Advanced optimization and analytics",
          category: "Expert",
        },
        {
          label: "Connect4ward",
          href: "/products/connect4ward",
          description: "Enterprise system connectivity",
          category: "Expert",
        },
      ],
    },
    {
      label: "Solutions",
      href: "/solutions",
      children: [
        {
          label: "Logistics Optimization",
          href: "/solutions/logistics-optimization",
          description: "Optimize logistics across networks",
        },
        {
          label: "Collaborative Transport",
          href: "/solutions/collaborative-transport",
          description: "Pool and coordinate transport flows",
        },
        {
          label: "Multimodal Strategy",
          href: "/solutions/multimodal-strategy",
          description: "Evaluate and shift transport modes",
        },
        {
          label: "Supply Chain Decarbonization",
          href: "/solutions/supply-chain-decarbonization",
          description: "Reduce emissions through collaboration",
        },
      ],
    },
    { label: "Ecosystem", href: "/ecosystem" },
    { label: "Resources", href: "/resources" },
    { label: "Company", href: "/company" },
  ],
  footer: {
    platform: [
      { label: "Overview", href: "/platform" },
      { label: "Architecture", href: "/platform#architecture" },
      { label: "Collaboration", href: "/platform#collaboration" },
      { label: "Security", href: "/platform#security" },
    ],
    products: [
      { label: "Design4ward", href: "/products/design4ward" },
      { label: "Modal4ward", href: "/products/modal4ward" },
      { label: "Cobuild4ward", href: "/products/cobuild4ward" },
      { label: "Compute4ward", href: "/products/compute4ward" },
      { label: "Connect4ward", href: "/products/connect4ward" },
    ],
    solutions: [
      { label: "Logistics Optimization", href: "/solutions/logistics-optimization" },
      { label: "Collaborative Transport", href: "/solutions/collaborative-transport" },
      { label: "Multimodal Strategy", href: "/solutions/multimodal-strategy" },
      { label: "Decarbonization", href: "/solutions/supply-chain-decarbonization" },
    ],
    company: [
      { label: "Vision", href: "/company" },
      { label: "Contact", href: "/company#contact" },
      { label: "Resources", href: "/resources" },
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
    ],
  },
};
