"use client";

import Link from "next/link";
import Eyebrow from "@/components/ui/Eyebrow";
import { Clock, Landmark, MapPin, ArrowRight } from "lucide-react";

export default function ParticipantInfoSection() {
  return (
    <section id="student-guide" className="relative py-10 sm:py-16 border-t border-line/60 bg-[#05080e]/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-line bg-surface/90 p-5 sm:p-8 backdrop-blur-md shadow-xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line/60 pb-4">
            <div>
              <Eyebrow n="03">STUDENT GUIDE</Eyebrow>
              <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white">
                Essential Event-Day Information
              </h2>
            </div>
            <p className="font-space text-xs sm:text-sm text-slate-300">
              Saturday, 31 October 2026 · Xavier University, Patna
            </p>
          </div>

          {/* Student Essentials Grid */}
          <div className="mt-6 grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* 1. Date & Reporting */}
            <div className="rounded-xl bg-[#06090f] p-4 sm:p-5 border border-line/80 flex flex-col justify-between hover:border-circuit/40 transition-colors shadow-sm">
              <div>
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="p-2 rounded-lg bg-circuit/10 border border-circuit/30 text-circuit">
                    <Clock className="w-4 h-4" />
                  </div>
                  <strong className="font-oxanium text-xs font-bold uppercase tracking-wider text-white">
                    Reporting Window
                  </strong>
                </div>
                <p className="font-space text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Report between <strong className="text-marigold">8:00 AM – 8:30 AM</strong> at the Main Registration Desk for identity verification and fest credential badging.
                </p>
              </div>
              <span className="font-mono text-[11px] text-circuit/90 mt-4 pt-3 border-t border-line/40 block">
                Registration Area · Ground Floor Foyer
              </span>
            </div>

            {/* 2. Main Ceremonies */}
            <div className="rounded-xl bg-[#06090f] p-4 sm:p-5 border border-line/80 flex flex-col justify-between hover:border-marigold/40 transition-colors shadow-sm">
              <div>
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="p-2 rounded-lg bg-marigold/10 border border-marigold/30 text-marigold">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <strong className="font-oxanium text-xs font-bold uppercase tracking-wider text-white">
                    Festival Ceremonies
                  </strong>
                </div>
                <p className="font-space text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Opening Ceremony starts at <strong className="text-white">8:35 AM</strong> sharp. The Grand Valedictory and Prize Gala convenes at <strong className="text-white">5:30 PM</strong>.
                </p>
              </div>
              <span className="font-mono text-[11px] text-marigold/90 mt-4 pt-3 border-t border-line/40 block">
                Main Auditorium · Xavier University
              </span>
            </div>

            {/* 3. Campus Venues */}
            <div className="rounded-xl bg-[#06090f] p-4 sm:p-5 border border-line/80 flex flex-col justify-between hover:border-blue-500/40 transition-colors shadow-sm sm:col-span-2 lg:col-span-1">
              <div>
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <strong className="font-oxanium text-xs font-bold uppercase tracking-wider text-white">
                    Finding Your Arena
                  </strong>
                </div>
                <p className="font-space text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Digital signage, directional markers, and student volunteers will direct squads from check-in to their respective computer labs and arenas.
                </p>
              </div>
              <span className="font-mono text-[11px] text-blue-400/90 mt-4 pt-3 border-t border-line/40 block">
                Information &amp; Help Desks in Foyer
              </span>
            </div>
          </div>

          {/* Quick Action Navigation on Mobile & Desktop */}
          <div className="mt-6 pt-5 border-t border-line/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <span className="font-space text-xs sm:text-sm text-muted">
              Have questions regarding event rules, team eligibility, or online registration?
            </span>

            <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs w-full md:w-auto">
              <Link
                href="/registration"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-marigold px-4 py-2.5 text-bg font-bold hover:brightness-110 transition-all shadow-[0_0_15px_rgba(242,166,60,0.2)]"
              >
                <span>Register Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/events"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-circuit/15 border border-circuit/40 px-4 py-2.5 text-circuit hover:bg-circuit hover:text-bg transition-colors font-bold"
              >
                <span>All Events</span>
              </Link>
              <Link
                href="/contact"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-line bg-[#06090f] px-4 py-2.5 text-slate-300 hover:border-circuit hover:text-white transition-colors font-medium"
              >
                <span>Help &amp; Contact</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
