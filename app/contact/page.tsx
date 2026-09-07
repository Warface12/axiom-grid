import { buildMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Contact — TopPick.pro",
  description: "Contact TopPick for editorial corrections and partnership enquiries.",
  path: "/contact",
});

export default function Page() {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "";
  return (
    <main className="shell legal-page">
      <span>CONTACT</span>
      <h1>Contact</h1>
      <p>{SITE_NAME} is a comparison publisher. We do not open trading accounts or hold customer funds.</p>
      <h2>Editorial</h2>
      <p>Use this page for sourced corrections. Include the URL of the TopPick page and the official document that supports the change.</p>
      <h2>Partnerships</h2>
      <p>Companies should use <a href="/partners/apply">the partner application</a>. Consumer accounts cannot become company administrators from a toggle.</p>
      {email ? <p>Email: <a href={`mailto:${email}`}>{email}</a></p> : <p>A public contact mailbox is shown here only after it is configured for this deployment.</p>}
    </main>
  );
}
