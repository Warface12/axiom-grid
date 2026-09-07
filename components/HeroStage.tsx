import { IntelligenceCore } from "@/components/IntelligenceCore";

export function HeroStage({ children }: { children: React.ReactNode }) {
  return (
    <section className="tp-hero-stage">
      <div className="tp-hero-copy">{children}</div>
      <IntelligenceCore />
    </section>
  );
}
