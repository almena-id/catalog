/** Nothing matches: a magnifier over faded credential cards; decorative. */
export function NoResults({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 220 150" fill="none" aria-hidden>
      <circle cx="104" cy="76" r="66" className="fill-brand-soft" />
      <g transform="rotate(-8 90 80)">
        <rect x="34" y="44" width="112" height="70" rx="10" className="fill-primary" opacity="0.18" />
      </g>
      <rect x="44" y="52" width="112" height="70" rx="10" className="fill-card stroke-foreground/15" strokeWidth="2" />
      <rect x="56" y="64" width="16" height="16" rx="5" className="fill-brand-soft" />
      <rect x="56" y="96" width="56" height="7" rx="3.5" className="fill-foreground/10" />
      <rect x="56" y="108" width="34" height="5" rx="2.5" className="fill-foreground/10" />
      {/* The magnifier, with a question in its glass. */}
      <circle cx="150" cy="62" r="26" className="fill-card stroke-primary" strokeWidth="5" />
      <line x1="169" y1="81" x2="190" y2="102" className="stroke-primary" strokeWidth="8" strokeLinecap="round" />
      <path
        d="M143 55 a7 7 0 1 1 10 6 c-2 1 -3 3 -3 5"
        className="stroke-primary" strokeWidth="3.5" strokeLinecap="round"
      />
      <circle cx="150" cy="74" r="2.2" className="fill-primary" />
    </svg>
  );
}
