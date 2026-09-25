import type { CSSProperties } from "react";
import Horizon from "@/components/effects/Horizon";

const SCANLINES: CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.5) 4px)",
};

const fadeDown: CSSProperties = {
  maskImage: "linear-gradient(180deg, black 0%, black 35%, transparent 95%)",
  WebkitMaskImage: "linear-gradient(180deg, black 0%, black 35%, transparent 95%)",
};

const fadeUp: CSSProperties = {
  maskImage: "linear-gradient(0deg, black 0%, black 35%, transparent 95%)",
  WebkitMaskImage: "linear-gradient(0deg, black 0%, black 35%, transparent 95%)",
};

/** Thin glowing divider with a diamond node: the shared "seam" between sections. */
function Seam() {
  return (
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-circuit/45 to-transparent">
      <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-circuit shadow-[0_0_10px_rgba(53,224,201,0.9)]" />
    </div>
  );
}

const TRACES = [
  { d: "M-20,120 H190 L240,170 H440 L490,120 H780 L830,170 H1220", color: "#35E0C9", dur: "5.2s", delay: "0s", desktopOnly: false },
  { d: "M-20,300 H130 L180,350 H320 V500 L370,550 H720 L770,500 H1220", color: "#F2A63C", dur: "6.4s", delay: "1.2s", desktopOnly: false },
  { d: "M-20,640 H260 L310,590 H560 V680 L610,730 H1220", color: "#35E0C9", dur: "7s", delay: "0.6s", desktopOnly: false },
  { d: "M1220,60 H1010 L960,110 H700 V230 L650,280 H520", color: "#35E0C9", dur: "5.8s", delay: "2.1s", desktopOnly: true },
  { d: "M400,-20 V90 L450,140 V300 L500,350 H900", color: "#F2A63C", dur: "6s", delay: "3s", desktopOnly: true },
  { d: "M1220,430 H1050 L1000,480 H860 V620", color: "#35E0C9", dur: "5s", delay: "1.7s", desktopOnly: true },
] as const;

const VIAS: readonly [number, number, string][] = [
  [240, 170, "#35E0C9"],
  [490, 120, "#35E0C9"],
  [830, 170, "#35E0C9"],
  [180, 350, "#F2A63C"],
  [370, 550, "#F2A63C"],
  [770, 500, "#F2A63C"],
  [310, 590, "#35E0C9"],
  [610, 730, "#35E0C9"],
  [960, 110, "#35E0C9"],
  [450, 140, "#F2A63C"],
];

function Chip() {
  const pinsX = Array.from({ length: 8 }, (_, i) => 18 + i * 20);
  const pinsY = [24, 48, 72, 96, 120];
  return (
    <g
      transform="translate(900 470)"
      stroke="#35E0C9"
      fill="none"
      opacity="0.3"
      className="hidden md:block"
    >
      <rect x="0" y="0" width="180" height="140" rx="8" strokeWidth="1.2" />
      <rect x="34" y="30" width="112" height="80" rx="4" strokeWidth="1" opacity="0.7" />
      <circle cx="90" cy="70" r="14" strokeWidth="1" />
      <circle cx="90" cy="70" r="3" fill="#35E0C9" stroke="none" className="node-pulse" />
      {pinsX.map((x) => (
        <g key={x}>
          <line x1={x} y1="0" x2={x} y2="-14" />
          <line x1={x} y1="140" x2={x} y2="154" />
        </g>
      ))}
      {pinsY.map((y) => (
        <g key={y}>
          <line x1="0" y1={y} x2="-14" y2={y} />
          <line x1="180" y1={y} x2="194" y2={y} />
        </g>
      ))}
    </g>
  );
}

function CircuitSvg({ className, style }: { className: string; style?: CSSProperties }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      style={style}
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
    >
      {TRACES.map((t) => (
        <g key={t.d} className={t.desktopOnly ? "hidden md:block" : undefined}>
          <path d={t.d} fill="none" stroke={t.color} strokeWidth="1.3" opacity="0.16" />
          <path
            d={t.d}
            fill="none"
            stroke={t.color}
            strokeWidth="1.8"
            className="trace-pulse"
            style={{ animationDuration: t.dur, animationDelay: t.delay }}
          />
        </g>
      ))}
      {VIAS.map(([cx, cy, color], i) => (
        <g key={`${cx}-${cy}`}>
          <circle cx={cx} cy={cy} r="5.5" fill="#07080B" stroke={color} strokeWidth="1.2" opacity="0.5" />
          <circle
            cx={cx}
            cy={cy}
            r="1.8"
            fill={color}
            opacity="0.75"
            className={i % 3 === 0 ? "node-pulse" : undefined}
          />
        </g>
      ))}
      <Chip />
    </svg>
  );
}

export function TracksBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(5,7,10,0.74) 0%, rgba(10,13,19,0.6) 45%, rgba(8,9,14,0.74) 100%)" }}
      />

      {/* glows */}
      <div className="absolute -left-32 top-0 h-[280px] w-[280px] rounded-full bg-circuit/10 blur-3xl sm:-left-40 sm:h-[460px] sm:w-[460px]" />
      <div className="absolute -right-28 bottom-0 h-[240px] w-[240px] rounded-full bg-marigold/10 blur-3xl sm:-right-32 sm:h-[380px] sm:w-[380px]" />

      {/* circuit traces: one anchored to the top, a mirrored copy at the bottom
          on tall (phone / tablet) layouts so the whole section is covered */}
      <CircuitSvg
        className="absolute left-1/2 top-0 h-[800px] w-full min-w-[1200px] -translate-x-1/2"
        style={fadeDown}
      />
      <CircuitSvg
        className="absolute bottom-0 left-1/2 h-[800px] w-full min-w-[1200px] -translate-x-1/2 -scale-y-100 lg:hidden"
        style={fadeDown}
      />

      <div className="absolute inset-0 opacity-[0.03]" style={SCANLINES} />
      <Seam />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Events: neon stage (spotlights, horizon, perspective grid floor)     */
/* ------------------------------------------------------------------ */

const BEAMS = [
  { left: "14%", rgb: "53,224,201", delay: "0s", phoneHidden: false },
  { left: "50%", rgb: "242,166,60", delay: "-3s", phoneHidden: false },
  { left: "86%", rgb: "53,224,201", delay: "-6s", phoneHidden: true },
] as const;

const SPARKS = [
  { l: "6%", t: "14%", c: "#35E0C9", d: "0s", phoneHidden: false },
  { l: "22%", t: "8%", c: "#F2A63C", d: "0.6s", phoneHidden: true },
  { l: "34%", t: "24%", c: "#35E0C9", d: "1.2s", phoneHidden: false },
  { l: "47%", t: "10%", c: "#35E0C9", d: "0.3s", phoneHidden: true },
  { l: "61%", t: "20%", c: "#F2A63C", d: "1.8s", phoneHidden: false },
  { l: "74%", t: "9%", c: "#35E0C9", d: "0.9s", phoneHidden: true },
  { l: "88%", t: "22%", c: "#35E0C9", d: "1.5s", phoneHidden: false },
  { l: "95%", t: "12%", c: "#F2A63C", d: "2.1s", phoneHidden: true },
] as const;

export function EventsBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* night sky, same family as the hero */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 100%, rgba(53,224,201,0.10), transparent 70%), linear-gradient(180deg, rgba(6,7,11,0.76) 0%, rgba(12,10,22,0.58) 38%, rgba(20,14,30,0.66) 78%, rgba(6,7,11,0.8) 100%)",
        }}
      />

      {/* stage spotlights sweeping from the top */}
      {BEAMS.map((b) => (
        <div
          key={b.left}
          className={`absolute -top-6 h-[70%] w-[200px] -translate-x-1/2 sm:w-[300px] ${
            b.phoneHidden ? "hidden sm:block" : ""
          }`}
          style={{ left: b.left }}
        >
          <div
            className="beam-sway h-full w-full"
            style={{
              animationDelay: b.delay,
              background: `linear-gradient(180deg, rgba(${b.rgb},0.20), transparent 88%)`,
              clipPath: "polygon(46% 0, 54% 0, 100% 100%, 0 100%)",
            }}
          />
        </div>
      ))}

      {/* twinkling lights */}
      {SPARKS.map((s) => (
        <span
          key={s.l}
          className={`led-blink absolute h-1 w-1 rounded-full ${s.phoneHidden ? "hidden sm:block" : ""}`}
          style={{
            left: s.l,
            top: s.t,
            backgroundColor: s.c,
            boxShadow: `0 0 8px ${s.c}`,
            animationDelay: s.d,
          }}
        />
      ))}

      {/* glowing horizon */}
      <div
        className="horizon-pulse absolute -bottom-32 left-1/2 h-[300px] w-[440px] -translate-x-1/2 rounded-full blur-3xl sm:w-[680px]"
        style={{
          background:
            "linear-gradient(0deg, rgba(53,224,201,0.34), rgba(242,166,60,0.26) 50%, rgba(53,224,201,0.14) 85%, transparent)",
        }}
      />

      {/* receding grid floor (horizontal + converging vertical lines) */}
      <div className="absolute inset-x-0 bottom-0 h-[170px] overflow-hidden sm:h-[220px]">
        <div
          className="hero-grid-floor absolute inset-x-[-25%] bottom-0 h-[420px]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(242,166,60,0.30) 1px, transparent 1px), linear-gradient(90deg, rgba(53,224,201,0.26) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            transform: "perspective(220px) rotateX(62deg)",
            transformOrigin: "bottom",
            maskImage: "linear-gradient(to top, black, transparent 85%)",
            WebkitMaskImage: "linear-gradient(to top, black, transparent 85%)",
          }}
        />
      </div>

      <div className="absolute inset-0 opacity-[0.03]" style={SCANLINES} />
      <Seam />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Schedule: radar clock + time ruler + data rails                      */
/* ------------------------------------------------------------------ */

const RADAR_TICKS = Array.from({ length: 72 }, (_, i) => {
  const a = (i * 5 * Math.PI) / 180;
  const len = i % 6 === 0 ? 18 : 8;
  const r1 = 280;
  const r2 = 280 - len;
  return {
    i,
    x1: (r1 * Math.sin(a)).toFixed(2),
    y1: (-r1 * Math.cos(a)).toFixed(2),
    x2: (r2 * Math.sin(a)).toFixed(2),
    y2: (-r2 * Math.cos(a)).toFixed(2),
    major: i % 6 === 0,
  };
});

export function ScheduleBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(7,8,11,0.74) 0%, rgba(10,13,18,0.6) 50%, rgba(7,8,11,0.74) 100%)" }}
      />

      {/* glows */}
      <div className="absolute -left-32 bottom-0 h-[260px] w-[260px] rounded-full bg-marigold/10 blur-3xl sm:h-[420px] sm:w-[420px]" />
      <div className="absolute -right-32 top-0 h-[260px] w-[260px] rounded-full bg-circuit/10 blur-3xl sm:h-[420px] sm:w-[420px]" />

      {/* time ruler down the left edge */}
      <div
        className="absolute inset-y-0 left-0 w-2.5 opacity-50 sm:w-4"
        style={{
          backgroundImage:
            "repeating-linear-gradient(180deg, rgba(53,224,201,0.55) 0 1px, transparent 1px 12px)",
          maskImage: "linear-gradient(180deg, transparent, black 12%, black 88%, transparent)",
          WebkitMaskImage: "linear-gradient(180deg, transparent, black 12%, black 88%, transparent)",
        }}
      />
      <div
        className="absolute inset-y-0 left-0 w-4 opacity-60 sm:w-6"
        style={{
          backgroundImage:
            "repeating-linear-gradient(180deg, rgba(242,166,60,0.75) 0 1px, transparent 1px 60px)",
          maskImage: "linear-gradient(180deg, transparent, black 12%, black 88%, transparent)",
          WebkitMaskImage: "linear-gradient(180deg, transparent, black 12%, black 88%, transparent)",
        }}
      />

      {/* data rails with travelling pulses (desktop / tablet only) */}
      <div className="absolute inset-y-0 left-[6%] hidden w-px overflow-hidden bg-gradient-to-b from-transparent via-circuit/20 to-transparent sm:block">
        <span className="rail-flow absolute left-0 top-0 h-24 w-px bg-gradient-to-b from-transparent via-circuit to-transparent" />
      </div>
      <div className="absolute inset-y-0 right-[8%] hidden w-px overflow-hidden bg-gradient-to-b from-transparent via-marigold/20 to-transparent md:block">
        <span
          className="rail-flow absolute left-0 top-0 h-24 w-px bg-gradient-to-b from-transparent via-marigold to-transparent"
          style={{ animationDelay: "-2.5s" }}
        />
      </div>

      {/* radar clock */}
      <div className="absolute -right-24 -top-10 h-[300px] w-[300px] opacity-60 sm:-right-32 sm:top-6 sm:h-[420px] sm:w-[420px] sm:opacity-80 lg:-right-16 lg:top-1/2 lg:h-[560px] lg:w-[560px] lg:-translate-y-1/2">
        <svg viewBox="-300 -300 600 600" className="h-full w-full" fill="none" stroke="#35E0C9">
          {[280, 210, 140, 70].map((r) => (
            <circle key={r} r={r} strokeWidth="1" opacity="0.18" />
          ))}
          <line x1="-280" y1="0" x2="280" y2="0" strokeWidth="1" opacity="0.14" />
          <line x1="0" y1="-280" x2="0" y2="280" strokeWidth="1" opacity="0.14" />
          {RADAR_TICKS.map((t) => (
            <line
              key={t.i}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              strokeWidth={t.major ? 1.6 : 1}
              stroke={t.major ? "#F2A63C" : "#35E0C9"}
              opacity={t.major ? 0.5 : 0.28}
            />
          ))}
          <circle r="3.5" fill="#35E0C9" stroke="none" className="node-pulse" />
        </svg>
        <div
          className="radar-spin absolute inset-[3.3%] rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, transparent 285deg, rgba(53,224,201,0.06) 320deg, rgba(53,224,201,0.26) 360deg)",
          }}
        />
      </div>

      <div className="absolute inset-0 opacity-[0.03]" style={SCANLINES} />
      <Seam />
    </div>
  );
}

/* Footer: the hero's planet horizon again, as a bookend               */

export function FooterBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(7,8,11,0.76) 0%, rgba(10,9,18,0.8) 60%, rgba(18,14,26,0.94) 100%)" }}
      />
      <div className="absolute -left-24 top-0 h-[220px] w-[220px] rounded-full bg-circuit/10 blur-3xl sm:h-[320px] sm:w-[320px]" />

      {/* same planet limb as the hero: the page starts and ends on the same horizon */}
      <Horizon className="h-[130px] sm:h-[150px]" />

      <div className="absolute inset-0 opacity-[0.03]" style={SCANLINES} />
      <Seam />
    </div>
  );
}
