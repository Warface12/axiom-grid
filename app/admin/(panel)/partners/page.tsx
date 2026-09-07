import { AdminTitle } from "@/components/AdminShell";
import { AdminPartnersClient } from "@/components/admin/AdminPartnersClient";

export default function Page() {
  return (
    <main className="ax-admin-page">
      <AdminTitle title="Partners & commercial" subtitle="Applications, claims, advertising vs affiliate vs tracking — kept as independent states. No invented pipeline counts." />
      <AdminPartnersClient />
    </main>
  );
}
