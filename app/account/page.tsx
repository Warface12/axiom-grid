import { buildMetadata } from "@/lib/seo";
import { AccountClient } from "@/components/AccountClient";

export const metadata = buildMetadata({
  title: "Your TopPick account",
  description: "Save products, follow companies, manage notifications and keep your TopPick account in one place.",
  path: "/account",
  noIndex: true,
});

export default function Page() {
  return (
    <main>
      <section className="shell page-hero">
        <span>YOUR ACCOUNT</span>
        <h1>Your TopPick</h1>
        <p>Save products, follow companies, watch opportunities and control alerts. This is a personal account — not Admin and not a company workspace.</p>
      </section>
      <section className="shell content-shell">
        <AccountClient />
      </section>
    </main>
  );
}
