import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Cookies — TopPick.pro",
  description: "How TopPick.pro uses essential cookies for market selection, admin sessions and site operation.",
  path: "/legal/cookies",
});

export default function Page() {
  return (
    <main className="tp-start-page">
      <section className="shell page-hero">
        <span>Legal</span>
        <h1>Cookies</h1>
        <p>TopPick uses a small number of cookies and similar storage items to operate the site. We do not use them to fabricate personalised investment recommendations.</p>
      </section>
      <div className="tp-start-grid">
        <article className="tp-start-card"><b>Essential operation</b><p>The market selector stores toppick_market when you explicitly choose a country. Clearing the cookie returns the site to automatic country detection where available.</p></article>
        <article className="tp-start-card"><b>Administration</b><p>Signed-in operators receive an HTTP-only admin session cookie. It is not used on public pages and is not an analytics identifier.</p></article>
        <article className="tp-start-card"><b>Theme</b><p>A local theme preference may be stored in the browser so the interface can stay in light or dark mode. That value stays on your device.</p></article>
        <article className="tp-start-card"><b>Third parties</b><p>Following a partner link may cause the destination operator or affiliate network to set its own cookies. TopPick does not control those cookies.</p></article>
      </div>
      <p className="tp-chapter-links shell">
        <Link href="/legal/privacy">Privacy</Link>
        <Link href="/legal/terms">Terms</Link>
      </p>
    </main>
  );
}
