"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const Journey = dynamic(() => import("./Journey").then((m) => m.Journey), { ssr: false });

/**
 * Le parcours est la pièce la plus lourde de l'accueil (plateau SVG complet,
 * trois panneaux) et il est sous la ligne de flottaison : on ne le monte qu'à
 * l'approche de l'écran. Un cadre de hauteur réservée évite tout décalage de
 * mise en page, et le lien « Voir du terrain aux contrats » de la couverture
 * en déclenche le montage en y arrivant.
 */
export function JourneyLazy() {
  const frame = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (mounted || !frame.current) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setMounted(true);
          io.disconnect();
        }
      },
      { rootMargin: "900px 0px" },
    );
    io.observe(frame.current);
    return () => io.disconnect();
  }, [mounted]);

  return (
    <div ref={frame} style={mounted ? undefined : { minHeight: "52rem" }}>
      {mounted && <Journey />}
    </div>
  );
}
