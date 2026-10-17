"use client";

import Eyebrow from "@/components/ui/Eyebrow";
import { Calendar, MapPin, Sparkles } from "lucide-react";

export default function ScheduleHero() {
  return (
    <div className="relative pt-20 sm:pt-28 pb-6 sm:pb-8 overflow-hidden border-b border-line/60">
      {/* Subtle ambient background glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[340px] w-full max-w-6xl opacity-15 blur-3xl bg-gradient-to-b from-circuit via-marigold/20 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Eyebrow & Date Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <Eyebrow n="01">EVENT TIMETABLE</Eyebrow>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-circuit/40 bg-circuit/10 px-2.5 sm:px-3 py-1 font-mono text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-circuit">
              <span className="h-1.5 w-1.5 rounded-full bg-circuit animate-pulse" />
              <Calendar className="w-3 h-3 text-circuit inline-block" />
              <span>31 October 2026</span>
              <span className="text-muted">·</span>
              <MapPin className="w-3 h-3 text-circuit inline-block" />
              <span className="hidden xs:inline">Xavier University, Patna</span>
              <span className="xs:hidden">Patna</span>
            </span>
          </div>
        </div>

        {/* Main Title & Lead */}
        <div className="mt-4 sm:mt-5 grid gap-4 lg:grid-cols-[1.6fr_1fr] lg:items-end">
          <div>
            <h1 className="font-display text-2xl font-extrabold uppercase tracking-tight text-white xs:text-3xl sm:text-4xl lg:text-5xl leading-[1.1]">
              XAVITECH 2026 <br />
              <span className="bg-gradient-to-r from-circuit via-white to-marigold bg-clip-text text-transparent">
                Event Schedule
              </span>
            </h1>

            <p className="mt-2.5 sm:mt-3 max-w-2xl font-space text-xs sm:text-sm leading-relaxed text-slate-300">
              Find exact timings, venues, and track schedules for all 13 official competitions and workshops.
            </p>
          </div>

          {/* Quick Metrics (Mobile-Optimized) */}
          <div className="grid grid-cols-3 gap-2 bg-surface/80 p-2.5 sm:p-4 rounded-xl border border-line backdrop-blur-md">
            <div className="border-r border-line/60 pr-1.5 text-center sm:text-left">
              <span className="block font-mono text-xl sm:text-2xl font-black text-circuit">13</span>
              <span className="block font-oxanium text-[9px] sm:text-[10px] uppercase tracking-wider text-muted">Events</span>
            </div>
            <div className="border-r border-line/60 pr-1.5 text-center sm:text-left">
              <span className="block font-mono text-xl sm:text-2xl font-black text-marigold">5</span>
              <span className="block font-oxanium text-[9px] sm:text-[10px] uppercase tracking-wider text-muted">Tracks (A–E)</span>
            </div>
            <div className="text-center sm:text-left">
              <span className="block font-mono text-xl sm:text-2xl font-black text-white">1</span>
              <span className="block font-oxanium text-[9px] sm:text-[10px] uppercase tracking-wider text-muted">Day Fest</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
