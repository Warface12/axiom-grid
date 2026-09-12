import { buildMetadata } from "@/lib/seo";
import { PartnerApplyForm } from "@/components/PartnerApplyForm";

export const metadata = buildMetadata({
  title: "Apply for partner access",
  description: "Short application for company representatives. DNS verification is not required for every applicant.",
  path: "/partners/apply",
  noIndex: true,
});

export default function Page() {
  return (
    <main className="tp-start-page">
      <section className="shell page-hero">
        <span>Partner apply</span>
        <h1>Tell us who you represent.</h1>
        <p>Four short steps. Consumer mailboxes are allowed for agencies but are not automatic verification. Existing TopPick companies are claimed, not duplicated.</p>
      </section>
      <section className="shell content-shell">
        <PartnerApplyForm />
      </section>
    </main>
  );
}
