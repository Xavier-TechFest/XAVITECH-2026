"use client";

import { motion } from "framer-motion";
import { EventItem } from "@/lib/eventsData";
import Link from "next/link";

interface EventCardProps {
  event: EventItem;
  onOpenInfo: (event: EventItem) => void;
}

export default function EventCard({ event, onOpenInfo }: EventCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col justify-between overflow-visible rounded-2xl border border-blue-900/80 bg-[#081024]/95 p-4 pt-6 sm:p-5 sm:pt-7 shadow-2xl transition-all duration-300 hover:border-cyan-400 hover:shadow-[0_0_40px_rgba(53,224,201,0.35)]"
    >
      {/* Outer Glow backdrop */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${event.accentColor}25, transparent 75%)`,
        }}
      />

      {/* Cyber Corner Notches (4 corners bracket styling) */}
      <span className="pointer-events-none absolute left-2 top-2 h-3.5 w-3.5 border-l-2 border-t-2 border-cyan-400/70 transition-colors group-hover:border-cyan-300" />
      <span className="pointer-events-none absolute right-2 top-2 h-3.5 w-3.5 border-r-2 border-t-2 border-cyan-400/70 transition-colors group-hover:border-cyan-300" />
      <span className="pointer-events-none absolute bottom-2 left-2 h-3.5 w-3.5 border-b-2 border-l-2 border-cyan-400/70 transition-colors group-hover:border-cyan-300" />
      <span className="pointer-events-none absolute bottom-2 right-2 h-3.5 w-3.5 border-b-2 border-r-2 border-cyan-400/70 transition-colors group-hover:border-cyan-300" />

      {/* Top Diamond Header Ornament (Fixed Clipping with padding) */}
      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 rounded-full border border-amber-400/90 bg-[#09152e] px-3.5 py-0.5 shadow-lg">
        <span className="text-[10px] text-amber-400 font-extrabold">◆◆</span>
        <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-amber-300">
          {event.badgeLevel}
        </span>
        <span className="text-[10px] text-amber-400 font-extrabold">◆◆</span>
      </div>

      {/* Top Image Frame */}
      <div className="relative overflow-hidden rounded-xl border border-blue-500/30 bg-[#050b18] aspect-[16/10]">
        <img
          src={event.image}
          alt={event.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#081024] via-transparent to-transparent opacity-80" />

        {/* Floating Track Pill inside image */}
        <div className="absolute bottom-2 left-2 rounded-md bg-black/75 px-2.5 py-1 backdrop-blur-md border border-white/10 font-mono text-[10px] text-cyan-300 font-semibold uppercase tracking-wider">
          {event.trackName}
        </div>
      </div>

      {/* Event Details Section */}
      <div className="mt-4 flex flex-1 flex-col justify-between">
        <div>
          {/* Main 1-Word Crisp Event Title (e.g. "HACKATHON", "WEB DEVELOPMENT") */}
          <h3 className="font-display text-xl sm:text-2xl font-black uppercase tracking-tight text-white group-hover:text-cyan-300 transition-colors text-center">
            {event.name}
          </h3>

          {/* Subtitle with full title info */}
          <p className="mt-1.5 text-xs leading-relaxed text-blue-200/70 text-center line-clamp-2">
            {event.shortDesc}
          </p>

          {/* Quick info row */}
          <div className="mt-4 flex items-center justify-between font-mono text-[11px] text-blue-300/80 border-t border-blue-900/50 pt-3">
            <span className="flex items-center gap-1">
              <span className="text-cyan-400">📍</span>
              <span className="truncate max-w-[110px]">{event.venue}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-amber-400">👥</span>
              <span>{event.team}</span>
            </span>
          </div>
        </div>

        {/* Action Buttons & Bottom Fee Bar */}
        <div className="mt-5 space-y-2.5">
          {/* Two Buttons Side-by-Side */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onOpenInfo(event)}
              className="flex h-9 items-center justify-center rounded-lg border border-blue-400/50 bg-blue-950/40 font-mono text-xs font-bold uppercase tracking-wider text-blue-200 transition-all hover:border-cyan-400 hover:bg-cyan-500/20 hover:text-white"
            >
              EXPLORE
            </button>

            <Link
              href={`/events/${event.id}/register`}
              className="flex h-9 items-center justify-center rounded-lg border border-cyan-400/80 bg-gradient-to-r from-blue-600 to-cyan-500 font-mono text-xs font-bold uppercase tracking-wider text-white transition-all hover:shadow-[0_0_20px_rgba(53,224,201,0.6)] hover:brightness-110"
            >
              REGISTER
            </Link>
          </div>

          {/* Bottom Prize / Price Bar */}
          <div className="rounded-lg bg-gradient-to-r from-blue-800 via-blue-700 to-cyan-600 py-1.5 px-3 text-center font-mono text-xs font-extrabold text-white shadow-md flex items-center justify-between">
            <span className="text-[10px] text-blue-200 uppercase tracking-widest">PRIZE POOL</span>
            <span className="text-amber-300 font-extrabold tracking-wider">{event.prize}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
