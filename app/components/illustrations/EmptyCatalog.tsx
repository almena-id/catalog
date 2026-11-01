/** No offers yet: an empty slot where a credential card will go; decorative. */
export function EmptyCatalog({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 220 150" fill="none" aria-hidden>
      <circle cx="110" cy="78" r="66" className="fill-brand-soft" />
      <rect
        x="46" y="40" width="128" height="81" rx="12"
        className="fill-card stroke-primary/50" strokeWidth="2" strokeDasharray="6 6"
      />
      <rect x="60" y="54" width="18" height="18" rx="5" className="fill-brand-soft" />
      <rect x="60" y="94" width="62" height="7" rx="3.5" className="fill-foreground/10" />
      <rect x="60" y="106" width="40" height="5" rx="2.5" className="fill-foreground/10" />
      <g className="stroke-primary" strokeWidth="3" strokeLinecap="round">
        <line x1="148" y1="24" x2="148" y2="40" />
        <line x1="140" y1="32" x2="156" y2="32" />
      </g>
      <circle cx="38" cy="30" r="3" className="fill-primary" opacity="0.5" />
      <circle cx="186" cy="124" r="4" className="fill-primary" opacity="0.4" />
    </svg>
  );
}
