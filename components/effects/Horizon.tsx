/**
 * The site's "ground": a planet limb with a few spaceport spires standing on
 * it. Replaces the neon city skyline so the hero and the footer bookend the
 * page in the same sci-fi setting as everything in between. Pure CSS, no JS.
 */
const SPIRES = [
  { l: "3%", w: 26, h: 70, ant: 22, c: "#35E0C9" },
  { l: "9%", w: 18, h: 118, ant: 34, c: "#F2A63C" },
  { l: "15%", w: 34, h: 56, ant: 0, c: "#35E0C9" },
  { l: "27%", w: 16, h: 92, ant: 26, c: "#35E0C9" },
  { l: "41%", w: 22, h: 132, ant: 40, c: "#F2A63C" },
  { l: "52%", w: 30, h: 60, ant: 0, c: "#35E0C9" },
  { l: "64%", w: 18, h: 104, ant: 30, c: "#35E0C9" },
  { l: "74%", w: 24, h: 74, ant: 18, c: "#F2A63C" },
  { l: "84%", w: 16, h: 126, ant: 38, c: "#35E0C9" },
  { l: "93%", w: 28, h: 64, ant: 0, c: "#35E0C9" },
] as const;

export default function Horizon({ className = "h-[260px]" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden ${className}`}
    >
      {/* planet surface + atmosphere rim */}
      <div
        className="absolute left-1/2 top-[calc(100%-70px)] aspect-square w-[260%] -translate-x-1/2 rounded-full bg-[#04060B]"
        style={{
          boxShadow:
            "0 -1px 0 rgba(53,224,201,0.75), 0 -10px 50px rgba(53,224,201,0.28), 0 -40px 120px rgba(53,224,201,0.12), inset 0 24px 70px rgba(53,224,201,0.10)",
        }}
      />

      {/* spaceport spires */}
      {SPIRES.map((s) => (
        <div key={s.l} className="absolute bottom-0" style={{ left: s.l, width: s.w, height: s.h }}>
          <div className="absolute inset-0 bg-[#080B13]" style={{ borderTop: "1px solid rgba(53,224,201,0.25)" }} />
          {s.ant > 0 && (
            <div
              className="absolute left-1/2 w-px -translate-x-1/2 bg-[#1B2433]"
              style={{ bottom: "100%", height: s.ant }}
            />
          )}
          <span
            className="led-blink absolute left-1/2 h-[3px] w-[3px] -translate-x-1/2 rounded-full"
            style={{
              bottom: `calc(100% + ${s.ant}px)`,
              backgroundColor: s.c,
              boxShadow: `0 0 8px ${s.c}`,
              animationDelay: `${(s.h % 7) * 0.3}s`,
            }}
          />
          {/* lit windows */}
          <span
            className="absolute left-[30%] h-[3px] w-[5px]"
            style={{ bottom: "32%", backgroundColor: s.c, opacity: 0.75 }}
          />
          <span
            className="absolute right-[26%] h-[3px] w-[5px]"
            style={{ bottom: "58%", backgroundColor: s.c, opacity: 0.5 }}
          />
        </div>
      ))}

      {/* runway light strip along the limb */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-circuit/60 to-transparent" />
    </div>
  );
}
