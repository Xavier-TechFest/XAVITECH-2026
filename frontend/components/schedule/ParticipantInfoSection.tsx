"use client";

import Link from "next/link";
import Eyebrow from "@/components/ui/Eyebrow";
import { Calendar, Clock, Landmark, MapPin, HelpCircle, ArrowRight } from "lucide-react";

export default function ParticipantInfoSection() {
  return (
    <section id="student-guide" className="relative py-8 sm:py-16 border-t border-line/60 bg-[#070b12]/60">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-line bg-surface/80 p-4 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line/60 pb-3">
            <div>
              <Eyebrow n="03">STUDENT GUIDE</Eyebrow>
              <h2 className="mt-1 font-display text-xl sm:text-2xl font-bold uppercase text-white">
                Essential Event-Day Information
              </h2>
            </div>
            <p className="font-space text-xs text-muted">
              Saturday, 31 October 2026 · Xavier University, Patna
            </p>
          </div>

          {/* Student Essentials Grid */}
          <div className="mt-5 grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* 1. Date & Reporting */}
            <div className="rounded-lg bg-[#06090f] p-3 sm:p-4 border border-line/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded bg-circuit/10 border border-circuit/30 text-circuit">
                    <Clock className="w-4 h-4" />
                  </div>
                  <strong className="font-oxanium text-xs uppercase tracking-wide text-white">
                    Reporting Window
                  </strong>
                </div>
                <p className="font-space text-xs text-slate-300 leading-relaxed">
                  Arrive between <strong className="text-marigold">8:00 AM – 8:30 AM</strong> at the Main Registration Area for badging and check-in.
                </p>
              </div>
              <span className="font-mono text-[10px] text-muted mt-3 block">
                Registration Area · Ground Floor
              </span>
            </div>

            {/* 2. Main Ceremonies */}
            <div className="rounded-lg bg-[#06090f] p-3 sm:p-4 border border-line/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded bg-marigold/10 border border-marigold/30 text-marigold">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <strong className="font-oxanium text-xs uppercase tracking-wide text-white">
                    Festival Ceremonies
                  </strong>
                </div>
                <p className="font-space text-xs text-slate-300 leading-relaxed">
                  Opening Ceremony starts at <strong className="text-white">8:35 AM</strong>. The Grand Valedictory and Prize Gala begins at <strong className="text-white">5:30 PM</strong>.
                </p>
              </div>
              <span className="font-mono text-[10px] text-muted mt-3 block">
                Xaviers university campus
              </span>
            </div>

            {/* 3. Campus Venues */}
            <div className="rounded-lg bg-[#06090f] p-3 sm:p-4 border border-line/60 flex flex-col justify-between sm:col-span-2 lg:col-span-1">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <strong className="font-oxanium text-xs uppercase tracking-wide text-white">
                    Finding Your Arena
                  </strong>
                </div>
                <p className="font-space text-xs text-slate-300 leading-relaxed">
                  Directional signage and student volunteers will guide you from the registration desk to your specific lab or auditorium.
                </p>
              </div>
              <span className="font-mono text-[10px] text-muted mt-3 block">
                Help Desks in Foyer
              </span>
            </div>
          </div>

          {/* Quick Action Navigation on Mobile & Desktop */}
          <div className="mt-5 pt-4 border-t border-line/60 flex flex-wrap items-center justify-between gap-3">
            <span className="font-space text-xs text-muted">
              Have questions regarding eligibility, rules, or team registration?
            </span>

            <div className="flex flex-wrap gap-2 font-mono text-xs w-full sm:w-auto">
              <Link
                href="/events"
                className="flex-1 sm:flex-initial text-center rounded-lg bg-circuit/15 border border-circuit/40 px-3.5 py-2 text-circuit hover:bg-circuit hover:text-bg transition-colors font-semibold"
              >
                All Events
              </Link>
              <Link
                href="/registration"
                className="flex-1 sm:flex-initial text-center rounded-lg bg-marigold px-3.5 py-2 text-bg font-bold hover:opacity-90 transition-opacity"
              >
                Register Now
              </Link>
              <Link
                href="/contact"
                className="flex-1 sm:flex-initial text-center rounded-lg border border-line bg-[#06090f] px-3.5 py-2 text-slate-300 hover:border-circuit hover:text-white transition-colors"
              >
                Help &amp; Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
