import { buildMetadata } from "@/lib/seo";
export const metadata = buildMetadata({
  title: "Cookies — TopPick.pro",
  description: "How TopPick.pro uses essential cookies for market selection, admin sessions and site operation.",
  path: "/legal/cookies",
});
export default function Page() {
  return (
    <main className="shell legal-page">
      <span>LEGAL / COOKIES</span>
      <h1>Cookies</h1>
      <p>TopPick.pro uses a small number of cookies and similar storage items to operate the site. We do not use them to fabricate personalised investment recommendations.</p>
      <h2>Essential operation</h2>
      <p>The market selector stores <code>toppick_market</code> when you explicitly choose a country. This preference is used to show the right research visibility and to keep partner buttons off until a market is approved. Clearing the cookie returns the site to automatic country detection where available.</p>
      <h2>Administration</h2>
      <p>Signed-in operators receive an HTTP-only admin session cookie. It is not used on public pages and is not an analytics identifier.</p>
      <h2>Theme</h2>
      <p>A local theme preference may be stored in the browser so the interface can stay in light or dark mode. That value stays on your device.</p>
      <h2>Third parties</h2>
      <p>Following a partner link may cause the destination operator or affiliate network to set its own cookies under its policy. TopPick.pro does not control those cookies.</p>
    </main>
  );
}
