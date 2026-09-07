import { Fingerprint, ShieldCheck, Globe2, Compass } from "lucide-react";

export function TrustStrip() {
  return (
    <ul className="tp-value-row" aria-label="What you can do here">
      <li><Compass /><span>Find the right product type</span></li>
      <li><Fingerprint /><span>Compare with sourced facts</span></li>
      <li><Globe2 /><span>See what your market changes</span></li>
      <li><ShieldCheck /><span>Understand custody and risk</span></li>
    </ul>
  );
}
