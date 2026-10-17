"use client";

import { DAY_SCHEDULE } from "@/lib/scheduleData";
import { Clock, MapPin, Sparkles } from "lucide-react";

export default function CompactDaySchedule() {
  return (
    <section aria-label="Key Festival Milestones" className="relative py-6 sm:py-8 border-b border-line/60 bg-[#05080e]/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-circuit opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-circuit" />
            </span>
            <h2 className="font-oxanium text-xs font-bold uppercase tracking-[0.2em] text-slate-200">
              Key Festival Milestones
            </h2>
          </div>
          <p className="font-space text-xs text-muted">
            All general assembly sessions, badging, and ceremonies convene at Xavier University campus.
          </p>
        </div>

        {/* 3-Column Milestone Grid */}
        <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
          {DAY_SCHEDULE.map((item, index) => {
            const isFirst = index === 0;
            const isLast = index === DAY_SCHEDULE.length - 1;
            const accent = isFirst ? "#35e0c9" : isLast ? "#f2a63c" : "#60a5fa";

            return (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-line bg-surface/85 p-4 sm:p-5 transition-all duration-300 hover:border-white/25 hover:bg-surface-raised hover:-translate-y-0.5 shadow-md"
              >
                {/* Subtle top indicator bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px] opacity-70 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: accent }}
                />

                <div>
                  {/* Top Header: Time and Milestone Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-marigold shrink-0" />
                      <span className="font-mono tabular-nums text-xs sm:text-sm font-bold text-marigold">
                        {item.time}
                      </span>
                    </div>

                    <span className="font-mono text-[10px] uppercase tracking-wider text-slate-300 px-2 py-0.5 rounded-full border border-white/10 bg-white/5">
                      {item.badge}
                    </span>
                  </div>

                  {/* Milestone Title */}
                  <h3 className="font-display text-base sm:text-lg font-bold uppercase tracking-tight text-white group-hover:text-circuit transition-colors mt-2.5">
                    {item.programme}
                  </h3>

                  {/* Milestone Description */}
                  <p className="font-space text-xs text-slate-300/90 leading-relaxed mt-1.5">
                    {item.description}
                  </p>
                </div>

                {/* Venue Footer */}
                <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1.5 font-oxanium text-xs font-semibold text-circuit">
                    <MapPin className="w-3.5 h-3.5 text-circuit shrink-0" />
                    <span>{item.venue}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
