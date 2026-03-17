import Image from "next/image";

const productLogos: Record<string, string> = {
  design4ward: "/images/products/design4ward.svg",
  modal4ward: "/images/products/modal4ward.svg",
};

interface ProductIconProps {
  slug: string;
  size?: number;
  className?: string;
}

export function ProductIcon({ slug, size = 24, className = "" }: ProductIconProps) {
  const logoSrc = productLogos[slug];

  if (logoSrc) {
    return (
      <Image
        src={logoSrc}
        alt={slug}
        width={size}
        height={size}
        className={className}
      />
    );
  }

  return (
    <svg style={{ width: size, height: size }} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {slug === "cobuild4ward" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />}
      {slug === "compute4ward" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />}
      {slug === "connect4ward" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />}
    </svg>
  );
}
