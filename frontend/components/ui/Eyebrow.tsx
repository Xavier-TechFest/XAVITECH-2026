/** Shared section label so every section opens the same way: `// 02 ── TRACKS`. */
export default function Eyebrow({
  n,
  children,
  className = "",
}: {
  n: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-circuit/80 sm:text-xs ${className}`}
    >
      <span className="text-marigold">{`// ${n}`}</span>
      <span aria-hidden="true" className="h-px w-8 shrink-0 bg-circuit/40" />
      <span>{children}</span>
    </p>
  );
}
