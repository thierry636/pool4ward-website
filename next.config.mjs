import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/**
 * Anciennes URL de la version 1 → pages de la version 2.
 *
 * Cobuild4ward n'existe pas comme application : sa page est retirée, et
 * l'adresse renvoie vers l'approche, où la collaboration est décrite comme un
 * levier. Les redirections valent pour les deux langues (`:locale`).
 */
const LOCALE = ":locale(fr|en)";
const redirectionsV1 = [
  ["/products", "/solutions"],
  ["/products/design4ward", "/solutions/transport-engineering"],
  ["/products/compute4ward", "/solutions/transport-engineering"],
  ["/products/modal4ward", "/solutions/carrier-search"],
  ["/products/connect4ward", "/solutions/contract-management"],
  ["/products/cobuild4ward", "/approach"],
  ["/platform", "/approach"],
  ["/ecosystem", "/datasets"],
  ["/resources", "/blog"],
  ["/solutions/logistics-optimization", "/solutions/transport-engineering"],
  ["/solutions/multimodal-strategy", "/solutions/transport-engineering"],
  ["/solutions/supply-chain-decarbonization", "/solutions/transport-engineering"],
  ["/solutions/collaborative-transport", "/approach"],
].map(([source, destination]) => ({
  source: `/${LOCALE}${source}`,
  destination: `/:locale${destination}`,
  permanent: true,
}));

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // Aucune source map de production dans le navigateur : rien à exposer.
  productionBrowserSourceMaps: false,
  async redirects() {
    return [
      {
        // L'URL de campagne est pool4ward.com/diagnostic. Le diagnostic est en
        // français uniquement en v1 : on l'envoie sur la locale FR plutôt que
        // sur la locale par défaut du site.
        source: "/diagnostic",
        destination: "/fr/diagnostic",
        permanent: false,
      },
      ...redirectionsV1,
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
