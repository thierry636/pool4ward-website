import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Image from "next/image";

export function Footer() {
  const t = useTranslations("Footer");
  const tc = useTranslations("Common");

  const footerSections = [
    {
      title: t("platform"),
      links: [
        { label: t("overview"), href: "/platform" },
        { label: t("architecture"), href: "/platform#architecture" },
        { label: t("collaboration"), href: "/platform#collaboration" },
        { label: t("security"), href: "/platform#security" },
      ],
    },
    {
      title: t("products"),
      links: [
        { label: "Design4ward", href: "/products/design4ward" },
        { label: "Modal4ward", href: "/products/modal4ward" },
        { label: "Cobuild4ward", href: "/products/cobuild4ward" },
        { label: "Compute4ward", href: "/products/compute4ward" },
        { label: "Connect4ward", href: "/products/connect4ward" },
      ],
    },
    {
      title: t("solutions"),
      links: [
        { label: t("logisticsOptimization"), href: "/solutions/logistics-optimization" },
        { label: t("collaborativeTransport"), href: "/solutions/collaborative-transport" },
        { label: t("multimodalStrategy"), href: "/solutions/multimodal-strategy" },
        { label: t("decarbonization"), href: "/solutions/supply-chain-decarbonization" },
      ],
    },
    {
      title: t("company"),
      links: [
        { label: t("vision"), href: "/company" },
        { label: t("contact"), href: "/company#contact" },
        { label: t("privacyPolicy"), href: "#" },
        { label: t("termsOfService"), href: "#" },
      ],
    },
  ];

  return (
    <footer className="bg-navy-900 text-white">
      <div className="container-xl py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/images/brand/logo-full-dark.svg"
                alt="Pool4ward"
                width={180}
                height={36}
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-sm text-navy-400 leading-relaxed max-w-xs">
              {tc("footerDescription")}
            </p>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href as "/"}
                      className="text-sm text-navy-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-navy-500">
            {tc("allRightsReserved", { year: new Date().getFullYear() })}
          </p>
          <div className="flex gap-6">
            <Link
              href={"#" as "/"}
              className="text-sm text-navy-500 hover:text-white transition-colors"
            >
              {tc("privacy")}
            </Link>
            <Link
              href={"#" as "/"}
              className="text-sm text-navy-500 hover:text-white transition-colors"
            >
              {tc("terms")}
            </Link>
            <Link
              href={"#" as "/"}
              className="text-sm text-navy-500 hover:text-white transition-colors"
            >
              {tc("security")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
