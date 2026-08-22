export function TopPickMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`toppick-mark${compact ? " toppick-mark-compact" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 72 54" role="img" focusable="false">
        <defs>
          <linearGradient id="tpGradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#2bd7ff" />
            <stop offset="1" stopColor="#2468ff" />
          </linearGradient>
        </defs>
        <path d="M8 8h27" fill="none" stroke="#f4fbff" strokeWidth="5" strokeLinecap="round" />
        <path d="M21.5 8v36" fill="none" stroke="#f4fbff" strokeWidth="5" strokeLinecap="round" />
        <path d="M35 8h14c9 0 14 5 14 12s-5 12-14 12H38" fill="none" stroke="url(#tpGradient)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M39 31v13" fill="none" stroke="url(#tpGradient)" strokeWidth="5" strokeLinecap="round" />
        <path d="M45 42l5 5 12-13" fill="none" stroke="url(#tpGradient)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
