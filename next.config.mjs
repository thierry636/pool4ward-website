import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
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
    ];
  },
};

export default withNextIntl(nextConfig);
