"use client";

import dynamic from "next/dynamic";
import { detectVisualTier } from "@/lib/visualQuality";
import { useEffect, useState } from "react";

const Lattice = dynamic(() => import("@/components/ResearchLattice").then((m) => m.ResearchLattice), {
  ssr: false,
  loading: () => null,
});

export function HeroStage({ children }: { children: React.ReactNode }) {
  const [tier, setTier] = useState<"high" | "balanced" | "lite">("balanced");
  const [show, setShow] = useState(false);
  useEffect(() => {
    const next = detectVisualTier();
    setTier(next);
    setShow(next !== "lite");
  }, []);
  return (
    <section className="tp-hero-stage" data-tier={tier}>
      {show ? <Lattice /> : null}
      <div className="tp-hero-copy">{children}</div>
      <span className="tp-quality-chip">{tier.toUpperCase()} VISUALS</span>
    </section>
  );
}
