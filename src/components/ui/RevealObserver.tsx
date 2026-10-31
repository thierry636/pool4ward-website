"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/routing";

/**
 * Apparition douce des blocs `[data-reveal]` quand ils entrent à l'écran. Sans script, ou avec
 * « réduire les animations », tout est visible tel quel : on ne cache jamais ce qu'on ne sait
 * pas révéler. Seuls les blocs sous la ligne de flottaison sont masqués puis révélés ; les
 * autres reçoivent directement `reveal-in` (qui déclenche aussi les schémas animés).
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (els.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      for (const el of els) el.classList.add("reveal-in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue;
          const el = en.target as HTMLElement;
          // Le prochain rendu pose la transition ; le retrait de « pending » la déclenche.
          requestAnimationFrame(() => {
            el.classList.remove("reveal-pending");
            el.classList.add("reveal-in");
          });
          io.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    for (const el of els) {
      if (el.getBoundingClientRect().top > window.innerHeight * 0.92) el.classList.add("reveal-pending");
      io.observe(el);
    }
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
