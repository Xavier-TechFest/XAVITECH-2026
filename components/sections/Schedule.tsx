"use client";

import { useEffect, useRef, useState } from "react";
import { ScheduleBackdrop } from "./Backdrops";
import Eyebrow from "@/components/ui/Eyebrow";
import { EVENT_DATE } from "./Countdown";
import { firePulse } from "@/lib/pulse";

const schedule = [
  { time: "08:30", label: "Check-in & campus opens" },
  { time: "09:00", label: "Opening ceremony" },
  { time: "10:00", label: "Events begin" },
  { time: "13:00", label: "Lunch break" },
  { time: "14:00", label: "Judging rounds" },
  { time: "17:30", label: "Results published" },
  { time: "18:30", label: "Closing & prize distribution" },
];

/** "T-39d 04h 12m" until a slot on the day of the fest (or "LIVE / DONE" once past). */
function tMinus(time: string, now: number) {
  const [h, m] = time.split(":").map(Number);
  const slot = new Date(EVENT_DATE);
  slot.setHours(h, m, 0, 0);
  const diff = slot.getTime() - now;
  if (diff <= 0) return "T+ 00 · slot has passed";
  const d = Math.floor(diff / 86_400_000);
  const hh = Math.floor((diff / 3_600_000) % 24);
  const mm = Math.floor((diff / 60_000) % 60);
  return `T-${d}d ${String(hh).padStart(2, "0")}h ${String(mm).padStart(2, "0")}m`;
}

export default function Schedule() {
  const [selected, setSelected] = useState<number | null>(null);
  const [now, setNow] = useState<number | null>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  // mission clock: only ticks while a slot is open
  useEffect(() => {
    if (selected === null) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, [selected]);

  // the timeline "charges" as it scrolls through the viewport
  useEffect(() => {
    const list = listRef.current;
    const fill = fillRef.current;
    if (!list || !fill) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      fill.style.transform = "scaleY(1)";
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = list.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.8 - r.top) / Math.max(1, r.height)));
      fill.style.transform = `scaleY(${p.toFixed(3)})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="schedule" className="relative isolate overflow-hidden py-16 sm:py-24 lg:py-28">
      <ScheduleBackdrop />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
        <div className="grid gap-5 md:grid-cols-[1fr_1.4fr] md:gap-16">
          <Eyebrow n="04">Schedule</Eyebrow>
          <p className="max-w-prose font-display text-xl font-medium leading-snug text-ink sm:text-3xl lg:text-4xl">
            One day, start to finish. Times firm up closer to the date —
            check back the morning of.
          </p>
        </div>

        <ol ref={listRef} className="relative mt-10 max-w-xl sm:mt-14">
          <div aria-hidden="true" className="absolute bottom-2 left-[3.3rem] top-2 w-px bg-line">
            <div
              ref={fillRef}
              className="h-full origin-top bg-gradient-to-b from-circuit to-marigold shadow-[0_0_8px_rgba(53,224,201,0.6)]"
              style={{ transform: "scaleY(0)" }}
            />
          </div>
          {schedule.map((item, i) => {
            const open = selected === i;
            return (
              <li key={item.time} className="relative pb-3 last:pb-0">
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => {
                    setSelected(open ? null : i);
                    firePulse(i);
                  }}
                  className="group flex w-full gap-6 rounded-lg py-2 text-left"
                >
                  <span
                    className={`w-16 shrink-0 pt-0.5 text-right text-sm tabular-nums transition-colors ${
                      open ? "text-marigold" : "text-muted"
                    }`}
                  >
                    {item.time}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-marigold transition-transform duration-300 ease-out group-hover:scale-150 group-hover:shadow-[0_0_12px_rgba(242,166,60,0.7)] ${
                      open ? "scale-150 shadow-[0_0_14px_rgba(242,166,60,0.9)]" : ""
                    }`}
                  />
                  <span
                    className={`-mt-0.5 transition-colors duration-300 group-hover:text-marigold ${
                      open ? "text-marigold" : "text-ink"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>

                {open && (
                  <div className="ml-[7.625rem] mt-1 border-l border-circuit/40 pl-4 font-mono text-[11px] uppercase tracking-[0.18em] text-circuit sm:text-xs">
                    <span className="text-muted">MISSION CLOCK </span>
                    {now === null ? "…" : tMinus(item.time, now)}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
