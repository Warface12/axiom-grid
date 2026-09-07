import Link from "next/link";

export default function NotFound() {
  return (
    <main className="shell content-shell">
      <div className="tp-state-card">
        <span>404</span>
        <h1>Page not found</h1>
        <p>That URL is not part of the public research site. It may have been moved, unpublished, or never existed.</p>
        <Link href="/">Back to home</Link>
        <Link href="/search">Search profiles</Link>
      </div>
    </main>
  );
}
