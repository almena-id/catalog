/**
 * The home hero's picture: credential cards fanning out of a phone with the
 * Almena wallet, a code on its screen. Drawn in the identity's tones and the
 * theme's neutrals, so it follows light and dark; decorative.
 */
export function HeroWallet({ className }: { className?: string }) {
  // The fanned cards, back to front: turn, rise, and how much of the blue.
  const cards = [
    { turn: -22, x: -64, y: -18, opacity: 0.35 },
    { turn: -6, x: -14, y: -44, opacity: 0.6 },
    { turn: 12, x: 40, y: -26, opacity: 1 },
  ];
  // A QR's modules (5×5 beside the three finder squares), set by hand.
  const modules = [
    [3, 0], [4, 1], [3, 2], [0, 3], [2, 3], [4, 3], [1, 4], [3, 4],
    [5, 5], [6, 4], [4, 5], [6, 6], [5, 3], [2, 5], [3, 6], [6, 2],
  ];
  return (
    <svg
      className={className}
      viewBox="0 0 420 330"
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="hero-card" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "var(--primary)" }} />
          <stop offset="1" style={{ stopColor: "var(--brand-strong)" }} />
        </linearGradient>
      </defs>

      {/* A soft halo behind it all. */}
      <circle cx="215" cy="170" r="150" className="fill-brand-soft" />
      <circle cx="215" cy="170" r="104" className="fill-brand-soft" />

      {/* The cards, rising out of the phone, behind it. */}
      {cards.map((card) => (
        <g
          key={card.turn}
          transform={`translate(${215 + card.x} ${160 + card.y}) rotate(${card.turn})`}
          opacity={card.opacity}
        >
          <rect x="-76" y="-96" width="152" height="96" rx="12" fill="url(#hero-card)" />
          <g className="stroke-primary-foreground" strokeWidth="1" opacity="0.22">
            <circle cx="76" cy="-96" r="28" />
            <circle cx="76" cy="-96" r="46" />
            <circle cx="76" cy="-96" r="64" />
          </g>
          <rect x="-62" y="-82" width="20" height="20" rx="6" className="fill-primary-foreground/25" />
          <rect x="-62" y="-54" width="18" height="13" rx="3" className="stroke-primary-foreground/40" strokeWidth="1.2" />
          <rect x="-62" y="-30" width="74" height="8" rx="4" className="fill-primary-foreground/85" />
          <rect x="-62" y="-17" width="48" height="5" rx="2.5" className="fill-primary-foreground/55" />
        </g>
      ))}

      {/* The phone. */}
      <rect
        x="148" y="96" width="134" height="224" rx="24"
        className="fill-card stroke-foreground/20" strokeWidth="2"
      />
      <rect x="160" y="110" width="110" height="196" rx="14" className="fill-sunk" />
      <rect x="196" y="102" width="38" height="5" rx="2.5" className="fill-foreground/15" />

      {/* The code on its screen. */}
      <g transform="translate(180 196)">
        <rect x="-8" y="-8" width="86" height="86" rx="10" className="fill-qr-paper stroke-foreground/10" />
        {[
          [0, 0],
          [50, 0],
          [0, 50],
        ].map(([fx, fy]) => (
          <g key={`${fx}-${fy}`}>
            <rect x={fx} y={fy} width="20" height="20" rx="4" className="stroke-primary" strokeWidth="4" />
            <rect x={fx + 6} y={fy + 6} width="8" height="8" rx="1.5" className="fill-primary" />
          </g>
        ))}
        {modules.map(([mx, my]) => (
          <rect key={`${mx}-${my}`} x={mx * 10} y={my * 10} width="7" height="7" rx="1.5" className="fill-brand-strong" />
        ))}
      </g>

      {/* Sparks around it. */}
      <g className="fill-primary">
        <circle cx="70" cy="70" r="4" opacity="0.5" />
        <circle cx="352" cy="58" r="5" opacity="0.4" />
        <circle cx="372" cy="236" r="3.5" opacity="0.55" />
        <circle cx="58" cy="252" r="3" opacity="0.4" />
      </g>
      <path d="M340 128 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4 z" className="fill-primary" opacity="0.7" />
      <path d="M86 150 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 z" className="fill-primary" opacity="0.5" />
    </svg>
  );
}
