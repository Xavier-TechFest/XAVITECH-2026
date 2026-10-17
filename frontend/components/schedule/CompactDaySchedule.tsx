"use client";

import { DAY_SCHEDULE } from "@/lib/scheduleData";
import { Clock, MapPin } from "lucide-react";

export default function CompactDaySchedule() {
  return (
    <section aria-label="Key Day Milestones" className="relative py-4 sm:py-6 border-b border-line/60 bg-[#070b12]/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3 mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-circuit animate-pulse" />
            <h2 className="font-oxanium text-[11px] sm:text-xs font-bold uppercase tracking-[0.16em] text-slate-300">
              Key Day Milestones
            </h2>
          </div>
          <p className="font-space text-[11px] sm:text-xs text-muted">
            All festival events and ceremonies convene at Xaviers university campus.
          </p>
        </div>

        {/* Compact 3-Pill Grid */}
        <div className="grid gap-2.5 sm:gap-3 sm:grid-cols-3">
          {DAY_SCHEDULE.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-2.5 rounded-lg border border-line bg-surface/80 p-2.5 sm:p-3.5 hover:border-circuit/50 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-marigold shrink-0" />
                  <span className="font-mono text-xs font-bold text-marigold whitespace-nowrap">
                    {item.time}
                  </span>
                  <span className="inline-block h-1 w-1 rounded-full bg-line shrink-0" />
                  <span className="font-mono text-[9px] sm:text-[10px] uppercase text-muted truncate">
                    {item.badge}
                  </span>
                </div>
                <h3 className="font-display text-xs sm:text-sm font-bold uppercase text-white truncate mt-1">
                  {item.programme}
                </h3>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-flex items-center gap-1 rounded bg-circuit/10 border border-circuit/30 px-2 py-0.5 font-oxanium text-[11px] sm:text-xs font-semibold text-circuit">
                  <MapPin className="w-3 h-3 text-circuit shrink-0" />
                  <span className="truncate max-w-[120px] sm:max-w-none">{item.venue}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
