import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container page">
      <div className="empty-state">
        <span className="eyebrow">404</span>
        <h1>Page not found</h1>
        <p>The page you are looking for does not exist or has been moved.</p>
        <Link href="/" className="primary-btn">Back to home</Link>
      </div>
    </main>
  );
}
