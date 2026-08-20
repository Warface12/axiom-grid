import type { Metadata } from "next";
import Link from "next/link";
import { ShieldX } from "lucide-react";

export const metadata: Metadata = { title: "Region unavailable — NivaroBet", robots: { index: false, follow: false } };

export default function UnavailablePage() {
  return <main className="region-block-page"><section className="region-block-card"><ShieldX size={42}/><span className="eyebrow">REGION RESTRICTION</span><h1>NivaroBet is not available in your region.</h1><p>This service does not target or serve users in this location. Casino listings, promotions and affiliate links are unavailable.</p><small>Site owner? <Link href="/admin/login">Sign in securely</Link> to access the private owner workspace.</small></section></main>;
}
