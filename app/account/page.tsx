import { buildMetadata } from "@/lib/seo";
import { AccountClient } from "@/components/AccountClient";

export const metadata = buildMetadata({
  title: "Your TopPick account",
  description: "Save research, follow companies and control notification preferences.",
  path: "/account",
  noIndex: true,
});

export default function Page() {
  return (
    <main>
      <section className="shell page-hero">
        <span>USER ACCOUNT</span>
        <h1>Your research desk</h1>
        <p>Consumer accounts do not control company pages. Google and Apple sign-in appear only when those providers are actually configured.</p>
      </section>
      <section className="shell content-shell">
        <AccountClient />
      </section>
    </main>
  );
}
