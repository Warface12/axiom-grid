import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "About — NivaroBet",
  description: "Learn about NivaroBet, a casino discovery, bonus comparison and verification platform.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <main className="container page legal-page">
      <h1>About NivaroBet</h1>
      <p>NivaroBet is a casino discovery and bonus comparison platform built to help users review monitored partner information, current offers and market availability in one organized experience.</p>
      <p>We prioritize transparency, verification dates and clear comparisons so users can make informed decisions quickly.</p>
      <Link href="/contact" className="text-link">Contact us →</Link>
    </main>
  );
}
