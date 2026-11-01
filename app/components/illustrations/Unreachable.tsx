/** The API cannot be reached: a plug pulled from its socket; decorative. */
export function Unreachable({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 220 150" fill="none" aria-hidden>
      <circle cx="110" cy="76" r="66" className="fill-destructive-soft" />
      {/* The cable and the plug, on the left. */}
      <path d="M10 96 C40 96 44 76 70 76" className="stroke-foreground/30" strokeWidth="4" strokeLinecap="round" />
      <rect x="68" y="60" width="30" height="32" rx="6" className="fill-card stroke-foreground/40" strokeWidth="2" />
      <g className="stroke-foreground/50" strokeWidth="4" strokeLinecap="round">
        <line x1="98" y1="68" x2="108" y2="68" />
        <line x1="98" y1="84" x2="108" y2="84" />
      </g>
      {/* The socket, on the right. */}
      <rect x="132" y="56" width="34" height="40" rx="7" className="fill-card stroke-primary" strokeWidth="2" />
      <g className="fill-primary">
        <rect x="132" y="65" width="6" height="6" rx="1.5" />
        <rect x="132" y="81" width="6" height="6" rx="1.5" />
      </g>
      <path d="M166 76 C186 76 190 54 214 54" className="stroke-primary/60" strokeWidth="4" strokeLinecap="round" />
      {/* The spark between them. */}
      <path d="M118 52 l-6 12 h8 l-6 12" className="stroke-destructive" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="120" cy="104" r="3" className="fill-destructive" opacity="0.6" />
    </svg>
  );
}
