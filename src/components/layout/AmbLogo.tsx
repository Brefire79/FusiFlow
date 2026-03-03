export default function AmbLogo({ size = 80 }: { size?: number }) {
  const id = `amb-grad-${size}`;
  return (
    <div className="flex items-center gap-3 shrink-0">
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer ring */}
        <circle cx="100" cy="100" r="96" stroke={`url(#${id})`} strokeWidth="2" />
        <circle cx="100" cy="100" r="89" stroke={`url(#${id})`} strokeWidth="1.2" opacity="0.5" />

        {/* Inner fill */}
        <circle cx="100" cy="100" r="86" fill="#060E1F" />

        {/* Circuit traces – horizontal */}
        <line x1="14" y1="100" x2="55" y2="100" stroke="#D07D5F" strokeWidth="0.8" opacity="0.3" />
        <line x1="145" y1="100" x2="186" y2="100" stroke="#D07D5F" strokeWidth="0.8" opacity="0.3" />
        {/* Circuit traces – vertical */}
        <line x1="100" y1="14" x2="100" y2="52" stroke="#D07D5F" strokeWidth="0.8" opacity="0.3" />
        <line x1="100" y1="148" x2="100" y2="186" stroke="#D07D5F" strokeWidth="0.8" opacity="0.3" />
        {/* Circuit dots */}
        <circle cx="55" cy="100" r="2.5" fill="#D07D5F" opacity="0.5" />
        <circle cx="145" cy="100" r="2.5" fill="#D07D5F" opacity="0.5" />
        <circle cx="100" cy="52" r="2.5" fill="#D07D5F" opacity="0.5" />
        <circle cx="100" cy="148" r="2.5" fill="#D07D5F" opacity="0.5" />

        {/* Corner circuit paths */}
        <path d="M58 62 L72 62 L72 74" stroke="#2ABEDD" strokeWidth="0.7" opacity="0.25" fill="none" />
        <path d="M142 62 L128 62 L128 74" stroke="#2ABEDD" strokeWidth="0.7" opacity="0.25" fill="none" />
        <path d="M58 138 L72 138 L72 126" stroke="#2ABEDD" strokeWidth="0.7" opacity="0.25" fill="none" />
        <path d="M142 138 L128 138 L128 126" stroke="#2ABEDD" strokeWidth="0.7" opacity="0.25" fill="none" />

        {/* Tiny corner dots */}
        <circle cx="58" cy="62" r="1.5" fill="#2ABEDD" opacity="0.3" />
        <circle cx="142" cy="62" r="1.5" fill="#2ABEDD" opacity="0.3" />
        <circle cx="58" cy="138" r="1.5" fill="#2ABEDD" opacity="0.3" />
        <circle cx="142" cy="138" r="1.5" fill="#2ABEDD" opacity="0.3" />

        {/* Inner decorative ring */}
        <circle cx="100" cy="100" r="60" stroke="#D07D5F" strokeWidth="0.5" opacity="0.15" strokeDasharray="4 6" />

        {/* "AMB" text */}
        <text
          x="100"
          y="105"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="44"
          fontWeight="900"
          fontFamily="Inter, system-ui, sans-serif"
          letterSpacing="4"
          fill={`url(#${id})`}
        >
          AMB
        </text>

        {/* Sub-text inside circle */}
        <text
          x="100"
          y="134"
          textAnchor="middle"
          fontSize="9"
          fontWeight="600"
          fontFamily="Inter, system-ui, sans-serif"
          letterSpacing="3"
          fill="#938586"
        >
          ENTRETENIMENTO
        </text>

        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E5B799" />
            <stop offset="50%" stopColor="#D07D5F" />
            <stop offset="100%" stopColor="#DF8C69" />
          </linearGradient>
        </defs>
      </svg>

      <div className="hidden lg:block">
        <p className="text-base font-bold tracking-wide" style={{ color: '#E5B799' }}>
          AMB FUSI
        </p>
        <p className="text-[9px] uppercase tracking-[0.2em]" style={{ color: '#938586' }}>
          Entretenimento Digital
        </p>
      </div>
    </div>
  );
}
