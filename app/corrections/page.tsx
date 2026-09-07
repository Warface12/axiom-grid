import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Corrections — TopPick.pro",
  description: "How TopPick handles factual corrections on published research.",
  path: "/corrections",
});

export default function Page() {
  return (
    <main className="shell legal-page">
      <span>CORRECTIONS</span>
      <h1>Corrections</h1>
      <p>If a public profile, guide or market note is factually wrong, send the official source URL and the field that should change.</p>
      <p>We do not silently rewrite published facts from marketing copy. Partner-submitted changes still require review.</p>
      <p><a href="/contact">Contact TopPick</a></p>
    </main>
  );
}
