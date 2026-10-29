"use client";

import { useEffect, useState } from "react";

/**
 * `prefers-reduced-motion`, lu côté client. Vaut `false` au premier rendu
 * (serveur compris) puis se corrige : on préfère un premier rendu sans
 * animation déclenchée à un rendu qui joue une animation qu'on vient de
 * refuser. Aucun composant ne démarre de lecture automatique avant d'avoir la
 * vraie valeur — voir `Journey`.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}
