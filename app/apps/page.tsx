import { buildMetadata } from "@/lib/seo";
import { InstallHub } from "@/components/InstallHub";

export const metadata = buildMetadata({
  title: "Install TopPick",
  description: "Install TopPick as a web app on Windows, Android, iPhone and tablet. Native store packages are listed only when signed releases exist.",
  path: "/apps",
});

export default function Page() {
  return (
    <main>
      <section className="shell page-hero">
        <span>TOPPICK APPS</span>
        <h1>Install TopPick on your devices</h1>
        <p>TopPick is installable as a progressive web app where your browser supports it. We do not offer unsigned APK, IPA or Windows installer downloads.</p>
      </section>
      <section className="shell content-shell">
        <InstallHub />
      </section>
    </main>
  );
}
