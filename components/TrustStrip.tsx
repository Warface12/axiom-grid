import { Fingerprint, ShieldCheck, Clock3, Globe2 } from "lucide-react";

export function TrustStrip() {
  return (
    <section className="tp-trust-strip" aria-label="How TopPick stays honest">
      <div><Fingerprint /><span><b>Source-linked</b><small>Evidence rides with each review</small></span></div>
      <div><Clock3 /><span><b>Kept current</b><small>Stale records get flagged</small></span></div>
      <div><Globe2 /><span><b>Market-aware</b><small>Access is never assumed</small></span></div>
      <div><ShieldCheck /><span><b>Promotion gated</b><small>Unknown markets stay off</small></span></div>
    </section>
  );
}
