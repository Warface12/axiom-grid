import Link from "next/link";
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
    <main className="tp-start-page">
      <section className="shell page-hero">
        <span>Contact</span>
        <h1>A publisher, not a venue.</h1>
        <p>{SITE_NAME} does not open trading accounts or hold customer funds. Use the paths below.</p>
      </section>
      <div className="tp-start-grid">
        <article className="tp-start-card">
          <b>Editorial</b>
          <p>Sourced corrections only. Include the TopPick URL and the official document that supports the change.</p>
          <p className="tp-chapter-links"><Link href="/corrections">Corrections</Link></p>
        </article>
        <article className="tp-start-card">
          <b>Partnerships</b>
          <p>Companies apply for a workspace. A consumer account cannot become an admin from a toggle.</p>
          <p className="tp-chapter-links"><Link href="/partners/apply">Partner application</Link></p>
        </article>
        <article className="tp-start-card">
          <b>Mailbox</b>
          <p>{email ? email : "A public mailbox is shown here only after it is configured for this deployment."}</p>
        </article>
      </div>
    </main>
  );
}
