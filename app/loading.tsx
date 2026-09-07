export default function Loading() {
  return (
    <main className="shell content-shell">
      <div className="tp-state-card" aria-busy="true">
        <span>LOADING</span>
        <h1>Loading TopPick…</h1>
        <p>Published pages only. This pause does not insert sample platforms.</p>
      </div>
    </main>
  );
}
