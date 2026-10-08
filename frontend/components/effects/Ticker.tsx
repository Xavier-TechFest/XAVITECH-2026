const ITEMS = [
  "XAVITECH 2026",
  "31 OCTOBER 2026",
  "XAVIER UNIVERSITY · PATNA",
  "FIVE TRACKS",
  "CODE · GAME · COMPETE",
  "REGISTER NOW",
];

/** Neon marquee band that separates the hero from the rest of the page. */
export default function Ticker() {
  const row = (
    <ul className="flex shrink-0 items-center" aria-hidden="true">
      {ITEMS.map((t) => (
        <li key={t} className="flex items-center whitespace-nowrap font-display text-sm font-semibold uppercase tracking-[0.28em] text-ink/90 sm:text-base">
          <span className="px-6 sm:px-9">{t}</span>
          <span className="text-marigold">✦</span>
        </li>
      ))}
    </ul>
  );
  return (
    <div
      role="presentation"
      className="ticker relative z-10 overflow-hidden border-y border-circuit/30 bg-bg/90 py-3"
    >
      <div className="ticker-track flex w-max will-change-transform">
        {row}
        {row}
        {row}
        {row}
      </div>
    </div>
  );
}
