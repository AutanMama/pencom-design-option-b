// Grey pillars motif from the RE-BRAND guide, used as a faint background watermark.
export default function PillarWatermark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 200" aria-hidden="true" className={className} fill="currentColor">
      <polygon points="120,8 232,52 8,52" />
      <rect x="14" y="58" width="212" height="10" rx="2" />
      {[30, 74, 118, 162, 206].map((x) => (
        <g key={x}>
          <rect x={x - 12} y="72" width="28" height="7" rx="1.5" />
          <rect x={x - 7} y="81" width="18" height="90" />
          <rect x={x - 12} y="173" width="28" height="7" rx="1.5" />
        </g>
      ))}
      <rect x="6" y="183" width="228" height="10" rx="2" />
    </svg>
  );
}
