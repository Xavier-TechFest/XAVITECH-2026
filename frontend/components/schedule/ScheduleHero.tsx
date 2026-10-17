"use client";

import Eyebrow from "@/components/ui/Eyebrow";
import { Calendar, MapPin } from "lucide-react";

export default function ScheduleHero() {
  return (
    <div className="relative pt-24 sm:pt-32 pb-8 sm:pb-10 overflow-hidden border-b border-line/60">
      {/* Subtle ambient background glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[380px] w-full max-w-6xl opacity-20 blur-3xl bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-circuit/30 via-transparent to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Eyebrow & Date Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Eyebrow n="01">FESTIVAL SCHEDULE</Eyebrow>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-circuit/30 bg-circuit/10 px-3 py-1 font-mono text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-circuit shadow-[0_0_15px_rgba(53,224,201,0.12)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-circuit opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-circuit" />
              </span>
              <Calendar className="w-3.5 h-3.5 text-circuit" />
              <span>31 October 2026</span>
              <span className="text-line">|</span>
              <MapPin className="w-3.5 h-3.5 text-circuit" />
              <span className="hidden xs:inline">Xavier University, Patna</span>
              <span className="xs:hidden">Patna</span>
            </span>
          </div>
        </div>

        {/* Main Title & Lead */}
        <div className="mt-5 sm:mt-6 grid gap-6 lg:grid-cols-[1.55fr_1fr] lg:items-end">
          <div>
            <h1 className="font-display text-3xl font-extrabold uppercase tracking-tight text-white xs:text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">
              XAVITECH 2026 <br />
              <span className="text-circuit">Event Schedule</span>
            </h1>

            <p className="mt-3 max-w-2xl font-space text-sm sm:text-base leading-relaxed text-slate-300">
              Official festival timetable with exact competition timings, campus venues, and track coordinates for all 13 competitions and workshops at Xavier University, Patna.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="relative overflow-hidden rounded-2xl border border-line bg-surface/90 p-3.5 sm:p-5 backdrop-blur-md shadow-lg">
            <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-circuit/10 blur-xl" />
            <div className="grid grid-cols-3 gap-2">
              <div className="border-r border-line/80 pr-2 text-center sm:text-left">
                <span className="block font-mono tabular-nums text-2xl sm:text-3xl font-black text-circuit">13</span>
                <span className="block font-oxanium text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted mt-0.5">Events</span>
              </div>
              <div className="border-r border-line/80 pr-2 text-center sm:text-left">
                <span className="block font-mono tabular-nums text-2xl sm:text-3xl font-black text-marigold">5</span>
                <span className="block font-oxanium text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted mt-0.5">Tracks (A–E)</span>
              </div>
              <div className="text-center sm:text-left pl-1">
                <span className="block font-mono tabular-nums text-2xl sm:text-3xl font-black text-white">1</span>
                <span className="block font-oxanium text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted mt-0.5">Day Fest</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
