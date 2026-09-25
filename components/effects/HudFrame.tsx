"use client";

import { useEffect, useRef, useState } from "react";
import { STAGE_IDS, STAGE_LABELS, useScrollProgress } from "@/hooks/useScrollProgress";

/**
 * The page's flight-deck HUD, fixed over everything (below the navbar):
 *  - a section rail on the right (click to jump; jumping triggers the warp)
 *  - a status readout bottom-left: current sector, scroll velocity, progress
 *  - viewport corner brackets
 *  - a scan sweep whenever you cross into another section
 * All live numbers are written straight to the DOM from a short-lived rAF
 * loop that only runs while you are scrolling.
 */
export default function HudFrame() {
  const scroll = useScrollProgress();
  const [active, setActive] = useState(0);

  const sweepRef = useRef<HTMLDivElement>(null);
  const secRef = useRef<HTMLSpanElement>(null);
  const velRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const railFillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = performance.now();
    let lastY = window.scrollY;
    let vel = 0;
    let section = 0;

    const tick = (now: number) => {
      raf = 0;
      const dt = Math.max(0.001, Math.min(0.05, (now - last) / 1000));
      last = now;
      const s = scroll.current;

      vel += (Math.min(Math.abs(s.y - lastY) / dt / 5500, 1) - vel) * (1 - Math.exp(-7 * dt));
      const dir = s.y >= lastY ? 1 : -1;
      lastY = s.y;

      const sec = s.section;
      if (sec !== section) {
        section = sec;
        setActive(sec);
        const sweep = sweepRef.current;
        if (sweep && !reduce) {
          sweep.style.setProperty("--sweep-dir", dir > 0 ? "1" : "-1");
          sweep.classList.remove("hud-sweep-run");
          void sweep.offsetWidth; // restart the CSS animation
          sweep.classList.add("hud-sweep-run");
        }
      }

      if (secRef.current) {
        secRef.current.textContent = `SECTOR ${String(sec).padStart(2, "0")} · ${STAGE_LABELS[sec]}`;
      }
      if (velRef.current) velRef.current.textContent = `VEL ${(vel * 0.99).toFixed(2)}c`;
      if (barRef.current) barRef.current.style.transform = `scaleX(${s.targetProgress.toFixed(3)})`;
      if (railFillRef.current) {
        railFillRef.current.style.transform = `scaleY(${(s.stage / (STAGE_IDS.length - 1)).toFixed(3)})`;
      }

      // keep ticking only while something is still moving
      if (vel > 0.002) raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    wake();
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", wake, { passive: true });
    return () => {
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", wake);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [scroll]);

  const jump = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div aria-hidden="false" className="pointer-events-none fixed inset-0 z-20">
      {/* scan sweep on section change */}
      <div ref={sweepRef} className="hud-sweep absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="hud-sweep-line absolute inset-x-0 top-0 h-px bg-circuit" />
        <div className="hud-sweep-wash absolute inset-0 bg-circuit/[0.035]" />
      </div>

      {/* corner brackets */}
      <div aria-hidden="true">
        <span className="absolute left-3 top-[76px] hidden h-5 w-5 border-l border-t border-circuit/35 md:block" />
        <span className="absolute right-3 top-[76px] hidden h-5 w-5 border-r border-t border-circuit/35 md:block" />
        <span className="absolute bottom-3 left-3 h-5 w-5 border-b border-l border-circuit/35" />
        <span className="absolute bottom-3 right-3 h-5 w-5 border-b border-r border-circuit/35" />
      </div>

      {/* status readout */}
      <div
        aria-hidden="true"
        className="absolute bottom-[max(1.1rem,env(safe-area-inset-bottom))] left-[max(1.6rem,env(safe-area-inset-left))] font-mono text-[9px] uppercase leading-relaxed tracking-[0.22em] text-circuit/70 sm:text-[10px]"
      >
        <div>
          <span ref={secRef}>SECTOR 00 · HOME</span>
        </div>
        <div className="text-muted/80">
          <span ref={velRef}>VEL 0.00c</span>
        </div>
        <div className="mt-1.5 h-px w-24 bg-line sm:w-28">
          <div ref={barRef} className="h-full origin-left scale-x-0 bg-circuit shadow-[0_0_8px_rgba(53,224,201,0.8)]" />
        </div>
      </div>

      {/* section rail (desktop) */}
      <nav
        aria-label="Sections"
        className="pointer-events-auto absolute right-5 top-1/2 hidden -translate-y-1/2 md:block lg:right-7"
      >
        <div className="relative flex flex-col items-end gap-4">
          <div className="absolute bottom-1 right-[3.5px] top-1 w-px bg-line">
            <div ref={railFillRef} className="h-full origin-top scale-y-0 bg-circuit/70" />
          </div>
          {STAGE_IDS.map((id, i) => {
            const on = active === i;
            return (
              <button
                key={id}
                type="button"
                onClick={() => jump(id)}
                aria-label={`Go to ${STAGE_LABELS[i]}`}
                aria-current={on ? "true" : undefined}
                className="group relative flex items-center gap-3"
              >
                <span
                  className={`font-mono text-[10px] uppercase tracking-[0.2em] transition-all duration-300 ${
                    on
                      ? "translate-x-0 text-circuit opacity-100"
                      : "translate-x-1 text-muted opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                  }`}
                >
                  {String(i).padStart(2, "0")} {STAGE_LABELS[i]}
                </span>
                <span
                  className={`relative block h-2 w-2 rotate-45 border transition-all duration-300 ${
                    on
                      ? "scale-125 border-circuit bg-circuit shadow-[0_0_10px_rgba(53,224,201,0.9)]"
                      : "border-muted bg-bg group-hover:border-circuit"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
