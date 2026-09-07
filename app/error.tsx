"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="shell content-shell">
      <div className="tp-state-card">
        <span>ERROR</span>
        <h1>This page could not be rendered.</h1>
        <p>The failure is shown instead of substituting invented platform data.</p>
        <button className="primary-btn" type="button" onClick={() => reset()}>Try again</button>
        <Link href="/">Home</Link>
      </div>
    </main>
  );
}
