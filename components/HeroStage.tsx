"use client";

import dynamic from "next/dynamic";
import { detectVisualTier } from "@/lib/visualQuality";
import { useEffect, useState } from "react";

const Lattice = dynamic(() => import("@/components/ResearchLattice").then((m) => m.ResearchLattice), {
  ssr: false,
  loading: () => null,
});

export function HeroStage({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const next = detectVisualTier();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setShow(next !== "lite" && !reduce);
  }, []);
  return (
    <section className="tp-hero-stage">
      {show ? <Lattice /> : <div className="tp-hero-static" aria-hidden="true" />}
      <div className="tp-hero-copy">{children}</div>
    </section>
  );
}
