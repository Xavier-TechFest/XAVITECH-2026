"use client";

import { useState, useMemo, useEffect } from "react";
import { EVENTS, TRACKS, EventItem, TrackItem } from "@/lib/eventsData";
import EventCard from "@/components/ui/EventCard";
import EventModal from "@/components/ui/EventModal";
import { motion } from "framer-motion";

export default function EventsDirectory() {
  const [selectedTrack, setSelectedTrack] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedModalEvent, setSelectedModalEvent] = useState<EventItem | null>(null);

  // Group events by track
  const groupedTracks = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return TRACKS.filter((t) => t.id !== "all").map((track) => {
      const trackEvents = EVENTS.filter((e) => {
        const matchesTrack = e.trackId === track.id;
        const matchesSearch =
          !q ||
          e.name.toLowerCase().includes(q) ||
          e.fullTitle.toLowerCase().includes(q) ||
          e.shortDesc.toLowerCase().includes(q) ||
          e.trackName.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          e.badgeLevel.toLowerCase().includes(q);

        return matchesTrack && matchesSearch;
      });

      return {
        track,
        events: trackEvents,
      };
    }).filter((group) => {
      if (selectedTrack !== "all" && group.track.id !== selectedTrack) {
        return false;
      }
      return group.events.length > 0;
    });
  }, [selectedTrack, searchQuery]);

  const totalFilteredCount = useMemo(() => {
    return groupedTracks.reduce((sum, g) => sum + g.events.length, 0);
  }, [groupedTracks]);

  const handleSelectTrack = (trackId: string) => {
    setSelectedTrack(trackId);
    if (trackId !== "all") {
      setTimeout(() => {
        const el = document.getElementById(`track-${trackId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  };

  return (
    <section className="relative min-h-screen px-4 pb-28 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* 1. CENTERED HEADER SECTION */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/40 bg-[#09152e]/80 px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-cyan-400 shadow-[0_0_20px_rgba(53,224,201,0.2)]">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <span>// 02 · TRACKS & EVENTS</span>
          </div>

          <h1 className="mt-5 font-display text-4xl font-extrabold uppercase tracking-tight text-white sm:text-6xl lg:text-7xl">
            EXPLORE OUR{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-amber-400 bg-clip-text text-transparent">
              EVENTS
            </span>
          </h1>

          <p className="mt-3 max-w-2xl font-display text-base font-medium text-blue-200/80 sm:text-lg">
            Choose your track. Find your challenge. Show what you&apos;re made of.
          </p>
        </div>

        {/* 2. PROMINENT BIG SEARCH BAR BELOW HEADING */}
        <div className="mt-8 mx-auto max-w-3xl">
          <div className="relative">
            <div className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-cyan-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search about any arena, event name, track, or venue..."
              className="w-full rounded-2xl border-2 border-blue-500/50 bg-[#070e20]/90 py-4 pl-14 pr-12 font-mono text-sm text-white placeholder-blue-300/40 backdrop-blur-xl outline-none shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all duration-300 focus:border-cyan-400 focus:shadow-[0_0_40px_rgba(53,224,201,0.5)] focus:ring-1 focus:ring-cyan-400"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-blue-300 hover:bg-blue-900/40 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 3. TRACK FILTER CHIPS */}
        <div className="mt-8 flex flex-wrap justify-center gap-2.5">
          {TRACKS.map((track) => {
            const isSelected = selectedTrack === track.id;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => handleSelectTrack(track.id)}
                className={`group flex items-center gap-2 rounded-xl border px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  isSelected
                    ? "border-amber-400 bg-gradient-to-r from-blue-700 to-cyan-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                    : "border-blue-900/60 bg-[#081226]/80 text-blue-300/80 hover:border-cyan-400/60 hover:text-white"
                }`}
              >
                <span>{track.name}</span>
              </button>
            );
          })}
        </div>

        {/* Counter readout */}
        <div className="mt-6 text-center font-mono text-xs text-blue-300/70 tracking-widest uppercase">
          SHOWING <span className="text-cyan-400 font-bold">{totalFilteredCount}</span> ARENAS ACROSS CATEGORIZED TRACKS
        </div>

        {/* 4. TRACK-WISE CATEGORIZED SECTIONS */}
        {groupedTracks.length > 0 ? (
          <div className="mt-12 space-y-20">
            {groupedTracks.map(({ track, events }) => (
              <motion.div
                key={track.id}
                id={`track-${track.id}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative scroll-mt-28"
              >
                {/* Track Category Header Banner */}
                <div className="relative mb-8 text-center">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-blue-500/30" />
                  </div>
                  <div className="relative inline-flex items-center gap-3 bg-[#070b16] px-6 py-2 rounded-full border border-blue-500/40 shadow-[0_0_25px_rgba(37,99,235,0.25)]">
                    <span className="text-amber-400 font-extrabold text-sm">◆◆</span>
                    <h2 className="font-display text-xl sm:text-2xl font-black uppercase tracking-wider text-white">
                      {track.name}
                    </h2>
                    <span className="text-amber-400 font-extrabold text-sm">◆◆</span>
                  </div>
                  <p className="mt-2 text-xs font-mono text-blue-300/60">
                    {track.description}
                  </p>
                </div>

                {/* Grid of Events under this specific track */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {events.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onOpenInfo={(item) => setSelectedModalEvent(item)}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center justify-center rounded-3xl border border-dashed border-blue-900/60 bg-[#081226]/50 p-12 text-center">
            <span className="font-mono text-4xl">🔍</span>
            <h3 className="mt-4 font-display text-lg font-bold text-white">No Arenas Found</h3>
            <p className="mt-2 text-xs text-blue-300/70">
              Try tweaking your search query or select &quot;ALL ARENAS&quot;.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedTrack("all");
              }}
              className="mt-5 rounded-xl border border-cyan-400/60 bg-cyan-500/10 px-6 py-2.5 font-mono text-xs font-bold text-cyan-300 hover:bg-cyan-400 hover:text-bg transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Popup Modal for Detailed Info */}
        <EventModal
          event={selectedModalEvent}
          onClose={() => setSelectedModalEvent(null)}
        />
      </div>
    </section>
  );
}
