"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { GlobeExplorer } from "./GlobeExplorer";

/**
 * Ouverture immersive du globe : plein écran, focus capturé, Échap et bouton
 * « Retour au parcours » pour sortir, bouton Précédent du navigateur compris.
 * Rien n'est chargé avant l'ouverture.
 */
export function GlobeLauncher({ children }: { children: (open: () => void) => React.ReactNode }) {
  const t = useTranslations("Globe");
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  const show = useCallback(() => {
    opener.current = document.activeElement as HTMLElement | null;
    history.pushState({ p4wGlobe: true }, "", "#globe");
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    if (history.state?.p4wGlobe) history.back();
    else setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPop = () => setOpen(false);
    window.addEventListener("popstate", onPop);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const el = dialog.current;
    const focusables = () =>
      Array.from(el?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select, [tabindex]:not([tabindex="-1"])') ?? []).filter(
        (n) => n.offsetParent !== null,
      );
    (el?.querySelector<HTMLElement>("[data-autofocus]") ?? focusables()[0])?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "Tab") {
        const f = focusables();
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("popstate", onPop);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
      opener.current?.focus?.();
    };
  }, [open, close]);

  return (
    <>
      {children(show)}
      {open && (
        <div ref={dialog} role="dialog" aria-modal="true" aria-label={t("label")} className="tone-dark fixed inset-0 z-[60]">
          <GlobeExplorer variant="immersive" autoLoad onClose={close} />
        </div>
      )}
    </>
  );
}
