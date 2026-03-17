"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

export function Header() {
  const t = useTranslations("Nav");
  const tc = useTranslations("Common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMouseEnter = (label: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => setActiveDropdown(null), 150);
  };

  const switchLocale = (newLocale: "en" | "fr") => {
    router.replace(pathname, { locale: newLocale });
  };

  const navigation = [
    { label: t("platform"), href: "/platform" as const },
    {
      label: t("products"),
      href: "/products" as const,
      children: [
        {
          label: "Design4ward",
          href: "/products/design4ward" as const,
          description: t("design4wardDesc"),
          category: t("operational"),
        },
        {
          label: "Modal4ward",
          href: "/products/modal4ward" as const,
          description: t("modal4wardDesc"),
          category: t("operational"),
        },
        {
          label: "Cobuild4ward",
          href: "/products/cobuild4ward" as const,
          description: t("cobuild4wardDesc"),
          category: t("operational"),
        },
        {
          label: "Compute4ward",
          href: "/products/compute4ward" as const,
          description: t("compute4wardDesc"),
          category: t("expert"),
        },
        {
          label: "Connect4ward",
          href: "/products/connect4ward" as const,
          description: t("connect4wardDesc"),
          category: t("expert"),
        },
      ],
    },
    {
      label: t("solutions"),
      href: "/solutions" as const,
      children: [
        {
          label: t("logisticsOptimization"),
          href: "/solutions/logistics-optimization" as const,
          description: t("logisticsOptDesc"),
        },
        {
          label: t("collaborativeTransport"),
          href: "/solutions/collaborative-transport" as const,
          description: t("collabTransportDesc"),
        },
        {
          label: t("multimodalStrategy"),
          href: "/solutions/multimodal-strategy" as const,
          description: t("multimodalDesc"),
        },
        {
          label: t("supplyChainDecarb"),
          href: "/solutions/supply-chain-decarbonization" as const,
          description: t("decarbDesc"),
        },
      ],
    },
    { label: t("ecosystem"), href: "/ecosystem" as const },
    { label: t("resources"), href: "/resources" as const },
    { label: t("company"), href: "/company" as const },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-navy-100 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container-xl">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <Image
              src={scrolled ? "/images/brand/logo-full.svg" : "/images/brand/logo-full-dark.svg"}
              alt="Pool4ward"
              width={180}
              height={36}
              className="h-8 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() =>
                  item.children ? handleMouseEnter(item.label) : undefined
                }
                onMouseLeave={item.children ? handleMouseLeave : undefined}
              >
                <Link
                  href={item.href}
                  className="px-3 py-2 text-sm font-medium text-navy-600 hover:text-navy-900 transition-colors rounded-lg hover:bg-navy-50"
                >
                  {item.label}
                  {item.children && (
                    <svg
                      className="inline-block ml-1 w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </Link>

                {/* Dropdown */}
                {item.children && activeDropdown === item.label && (
                  <div className="absolute top-full left-0 pt-2 w-72">
                    <div className="bg-white rounded-xl border border-navy-100 shadow-premium-lg p-2 animate-fade-in">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="flex flex-col px-4 py-3 rounded-lg hover:bg-navy-50 transition-colors"
                          onClick={() => setActiveDropdown(null)}
                        >
                          <span className="text-sm font-semibold text-navy-800">
                            {child.label}
                            {"category" in child && (
                              <span
                                className={`ml-2 text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                  child.category === t("expert")
                                    ? "bg-navy-100 text-navy-500"
                                    : "bg-brand-50 text-brand-600"
                                }`}
                              >
                                {child.category}
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-navy-400 mt-0.5">
                            {child.description}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="hidden sm:flex items-center border border-navy-200 rounded-lg overflow-hidden">
              <button
                onClick={() => switchLocale("en")}
                className={`px-2 py-1 text-xs font-semibold transition-colors ${
                  locale === "en"
                    ? "bg-brand-600 text-white"
                    : "text-navy-500 hover:text-navy-900"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => switchLocale("fr")}
                className={`px-2 py-1 text-xs font-semibold transition-colors ${
                  locale === "fr"
                    ? "bg-brand-600 text-white"
                    : "text-navy-500 hover:text-navy-900"
                }`}
              >
                FR
              </button>
            </div>

            <Button
              variant="primary"
              size="sm"
              href="/company#contact"
              className="hidden sm:inline-flex"
            >
              {tc("requestDemo")}
            </Button>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-navy-50 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <svg
                className="w-5 h-5 text-navy-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-navy-100 animate-fade-in">
            <nav className="py-4 space-y-1">
              {navigation.map((item) => (
                <div key={item.label}>
                  <Link
                    href={item.href}
                    className="block px-4 py-3 text-sm font-medium text-navy-700 hover:bg-navy-50 rounded-lg"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <div className="pl-6 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-navy-500 hover:text-navy-800 hover:bg-navy-50 rounded-lg"
                          onClick={() => setMobileOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Mobile Language Switcher */}
              <div className="px-4 pt-2 flex gap-2">
                <button
                  onClick={() => { switchLocale("en"); setMobileOpen(false); }}
                  className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                    locale === "en"
                      ? "bg-brand-600 text-white"
                      : "text-navy-500 border border-navy-200"
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => { switchLocale("fr"); setMobileOpen(false); }}
                  className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                    locale === "fr"
                      ? "bg-brand-600 text-white"
                      : "text-navy-500 border border-navy-200"
                  }`}
                >
                  FR
                </button>
              </div>

              <div className="px-4 pt-4">
                <Button
                  variant="primary"
                  href="/company#contact"
                  className="w-full"
                >
                  {tc("requestDemo")}
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
