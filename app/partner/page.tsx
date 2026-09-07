import { buildMetadata } from "@/lib/seo";
import { PartnerPortalClient } from "@/components/PartnerPortalClient";

export const metadata = buildMetadata({
  title: "Partner portal",
  description: "Verified partner workspace for companies, campaigns, advertising and tracking.",
  path: "/partner",
  noIndex: true,
});

export default function Page() {
  return (
    <main>
      <section className="shell page-hero">
        <span>PARTNER PORTAL</span>
        <h1>Company control, without the 25-item menu.</h1>
        <p>Overview, company, campaigns, advertising, performance, affiliate, billing and settings — after you have partner access.</p>
      </section>
      <section className="shell content-shell">
        <PartnerPortalClient />
      </section>
    </main>
  );
}
