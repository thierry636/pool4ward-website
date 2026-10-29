"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { Logo } from "@/components/brand/Logo";
import { PORTAL_URL } from "@/lib/site";

interface HeaderProps {
  /** Page dont le haut est clair (blog) : l'en-tête est alors opaque d'emblée. */
  solid?: boolean;
}

const NAV = [
  { key: "approach", href: "/approach" },
  { key: "solutions", href: "/solutions" },
  { key: "datasets", href: "/datasets" },
  { key: "insights", href: "/blog" },
] as const;

export function Header({ solid = false }: HeaderProps) {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  const opaque = solid || scrolled || open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Le menu mobile se referme à chaque navigation, et à Échap.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const actif = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const switchLocale = (next: "en" | "fr") => router.replace(pathname, { locale: next });

  const toneClass = opaque ? "tone-light" : "tone-dark";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-200 ${
        opaque ? "border-b" : "border-b border-transparent"
      } ${toneClass}`}
      style={{
        background: opaque ? "color-mix(in srgb, var(--bg) 92%, transparent)" : "transparent",
        borderColor: opaque ? "var(--rule)" : undefined,
        backdropFilter: opaque ? "blur(14px)" : undefined,
      }}
    >
      <div className="wrap flex h-[4.25rem] items-center justify-between gap-6">
        <Link href="/" aria-label={t("home")} className="shrink-0 rounded-sm">
          <Logo />
        </Link>

        <nav aria-label={t("primary")} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  aria-current={actif(item.href) ? "page" : undefined}
                  className="relative inline-flex min-h-[2.75rem] items-center px-4 text-[0.95rem] font-medium opacity-90 transition-opacity hover:opacity-100"
                >
                  {t(item.key)}
                  {actif(item.href) && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-4 bottom-2 h-px"
                      style={{ background: "var(--warm)" }}
                    />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <a
            href={PORTAL_URL}
            className="inline-flex min-h-[2.75rem] items-center px-3 text-[0.9rem] font-medium opacity-80 transition-opacity hover:opacity-100"
          >
            {t("portal")}
            <span aria-hidden="true" className="ml-1">↗</span>
          </a>
          <LocaleSwitch locale={locale} onSwitch={switchLocale} label={t("language")} />
          <Link href="/contact" className="btn btn-solid ml-1">
            {t("cta")}
          </Link>
        </div>

        <button
          ref={menuButton}
          type="button"
          className="inline-flex min-h-[2.75rem] min-w-[2.75rem] items-center justify-center lg:hidden"
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? t("closeMenu") : t("openMenu")}
          onClick={() => setOpen((v) => !v)}
        >
          <span aria-hidden="true" className="relative block h-3.5 w-6">
            <span
              className={`absolute left-0 top-0 h-px w-full bg-current transition-transform ${open ? "translate-y-[7px] rotate-45" : ""}`}
            />
            <span
              className={`absolute bottom-0 left-0 h-px w-full bg-current transition-transform ${open ? "-translate-y-[6px] -rotate-45" : ""}`}
            />
          </span>
        </button>
      </div>

      {open && (
        <div
          id="menu-mobile"
          className="tone-light fixed inset-x-0 bottom-0 top-[4.25rem] overflow-y-auto lg:hidden"
        >
          <nav aria-label={t("primary")} className="wrap py-8">
            <ul>
              {NAV.map((item) => (
                <li key={item.key} className="border-b" style={{ borderColor: "var(--rule)" }}>
                  <Link
                    href={item.href}
                    aria-current={actif(item.href) ? "page" : undefined}
                    className="display flex min-h-[3.5rem] items-center py-3 text-[2rem]"
                  >
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3">
              <Link href="/contact" className="btn btn-solid w-full">
                {t("cta")}
              </Link>
              <a href={PORTAL_URL} className="btn btn-line w-full">
                {t("portal")} <span aria-hidden="true">↗</span>
              </a>
              <div className="mt-2 flex justify-center">
                <LocaleSwitch locale={locale} onSwitch={switchLocale} label={t("language")} />
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function LocaleSwitch({
  locale,
  onSwitch,
  label,
}: {
  locale: string;
  onSwitch: (l: "en" | "fr") => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="mono flex items-center text-[0.78rem]">
      {(["fr", "en"] as const).map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 && (
            <span aria-hidden="true" className="opacity-40">
              /
            </span>
          )}
          <button
            type="button"
            lang={l}
            aria-pressed={locale === l}
            onClick={() => onSwitch(l)}
            className={`inline-flex min-h-[2.75rem] min-w-[2.25rem] items-center justify-center uppercase tracking-[0.1em] transition-opacity ${
              locale === l ? "underline underline-offset-4" : "text-[color:var(--fg-2)] hover:text-[color:var(--fg)]"
            }`}
          >
            {l}
          </button>
        </span>
      ))}
    </div>
  );
}
