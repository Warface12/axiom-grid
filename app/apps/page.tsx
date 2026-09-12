import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { InstallHub } from "@/components/InstallHub";

export const metadata = buildMetadata({
  title: "Install TopPick",
  description: "Install TopPick as a web app on Windows, Android, iPhone and tablet. Native store packages are listed only when signed releases exist.",
  path: "/apps",
});

export default function Page() {
  return (
    <main className="tp-start-page">
      <section className="shell page-hero">
        <span>Apps</span>
        <h1>Install TopPick on your devices</h1>
        <p>TopPick is installable as a progressive web app where your browser supports it. We do not offer unsigned APK, IPA or Windows installer downloads.</p>
      </section>
      <section className="shell content-shell">
        <InstallHub />
        <p className="tp-chapter-links">
          <Link href="/account">Open your account</Link>
          <Link href="/start">Start here</Link>
          <Link href="/jobs">Jobs</Link>
        </p>
      </section>
    </main>
  );
}
