"use client";

import { useState, useMemo } from "react";
import { EVENTS, TRACKS, EventItem, TrackItem } from "@/lib/eventsData";
import EventCard from "@/components/ui/EventCard";
import EventModal from "@/components/ui/EventModal";

export default function EventsDirectory() {
  const [selectedTrack, setSelectedTrack] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedModalEvent, setSelectedModalEvent] = useState<EventItem | null>(null);
  // Filter and group events by track
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
      }, 80);
    }
  };

  return (
    <section className="relative min-h-screen px-3.5 pb-24 pt-24 sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="mx-auto max-w-7xl">

        {/* 1. FUTURISTIC COMMAND HERO HEADER */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          <div className="mb-3 flex items-center gap-2 font-oxanium text-xs tracking-[0.25em] text-cyan-300 uppercase">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#35e0c9]" />
            <span>XAVITECH 2026</span>
          </div>

          <h1 className="relative z-10 font-display text-3xl font-extrabold uppercase tracking-tight text-white drop-shadow-md sm:text-5xl lg:text-7xl">
            EXPLORE OUR{" "}
            <span className="bg-gradient-to-r from-circuit via-cyan-300 to-marigold bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(53,224,201,0.4)]">
              EVENTS
            </span>
          </h1>

          <p className="mt-3 max-w-full font-space text-sm text-slate-300 sm:whitespace-nowrap sm:text-base">
            Choose your track. Find your arena. Compete among Xavier Patna&apos;s best tech engineers.
          </p>
        </div>

        {/* 2. REFINED HUD COMMAND SEARCH CONSOLE */}
        <div className="mt-8 mx-auto max-w-2xl relative">
          <div className="relative flex items-center rounded-xs border border-cyan-500/30 bg-[#060c14]/90 shadow-xl backdrop-blur-xl transition-all duration-300 focus-within:border-cyan-400 focus-within:shadow-[0_0_25px_rgba(53,224,201,0.25)] overflow-hidden">
            {/* Corner Bracket Details */}
            <div className="absolute top-0 left-0 h-2 w-2 border-t-2 border-l-2 border-cyan-400" />
            <div className="absolute bottom-0 right-0 h-2 w-2 border-b-2 border-r-2 border-cyan-400" />

            <div className="pointer-events-none pl-4 font-mono text-xs text-cyan-400 font-bold shrink-0 flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="hidden sm:inline">CMD:</span>
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search arenas, keywords, venues, or tracks..."
              className="w-full bg-transparent py-3.5 pl-3 pr-10 font-space text-sm text-white placeholder-slate-400 outline-none"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 rounded-xs p-1 font-mono text-xs text-slate-400 hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 3. TRACK SECTOR SELECTOR TABS */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="font-oxanium text-[11px] uppercase tracking-widest text-slate-400 flex items-center gap-1">
              <span className="text-cyan-400">//</span> SELECT TRACK SECTOR (A–G)
            </span>
            <span className="font-oxanium text-[11px] uppercase tracking-widest text-cyan-400 font-bold">
              {totalFilteredCount} Arenas Active
            </span>
          </div>

          {/* Cybernetic Track Selector Buttons */}
          <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth snap-x">
            {TRACKS.map((track) => {
              const isSelected = selectedTrack === track.id;

              return (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => handleSelectTrack(track.id)}
                  className={`snap-start shrink-0 flex items-center gap-2 rounded-xs border px-4 py-2.5 font-oxanium text-xs font-extrabold uppercase tracking-wider transition-all duration-200 active:scale-95 ${
                    isSelected
                      ? "border-cyan-400 bg-cyan-950/80 text-cyan-300 shadow-[0_0_18px_rgba(53,224,201,0.3)]"
                      : "border-white/15 bg-[#080e17] text-slate-300 hover:border-cyan-500/50 hover:text-white hover:bg-cyan-950/40"
                  }`}
                >
                  <span
                    className={`rounded-xs px-1.5 py-0.5 text-[10px] font-black ${
                      isSelected
                        ? "bg-cyan-400 text-black shadow-[0_0_6px_rgba(53,224,201,0.8)]"
                        : "bg-white/10 text-slate-300"
                    }`}
                  >
                    {track.letter}
                  </span>
                  <span className="whitespace-nowrap">{track.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. TRACK SECTIONS & CARD GRID */}
        {groupedTracks.length > 0 ? (
          <div className="mt-12 space-y-16">
            {groupedTracks.map(({ track, events }) => (
              <div
                key={track.id}
                id={`track-${track.id}`}
                className="relative scroll-mt-24"
              >
                {/* HUD Track Header */}
                <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-cyan-500/30 pb-4">
                  <div>
                    <div className="flex items-center gap-2 font-oxanium text-xs font-black text-cyan-400 tracking-wider">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                      {track.num} // TRACK {track.letter} SECTOR
                    </div>

                    <h2 className="mt-1 font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                      {track.name}
                    </h2>

                    <p className="mt-1 font-space text-xs text-slate-300 max-w-xl">
                      {track.description}
                    </p>
                  </div>

                  <div className="mt-2 sm:mt-0 shrink-0 font-oxanium text-xs font-extrabold text-marigold bg-marigold/10 border border-marigold/40 px-3.5 py-1.5 rounded-xs w-fit shadow-[0_0_10px_rgba(242,166,60,0.2)]">
                    {events.length} {events.length === 1 ? "Arena Terminal" : "Arena Terminals"}
                  </div>
                </div>

                {/* 3-Column Card Grid on Desktop, 1-Column on Mobile */}
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {events.map((event, idx) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      index={idx + 1}
                      onOpenInfo={(item) => setSelectedModalEvent(item)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-14 flex flex-col items-center justify-center rounded-xs border border-dashed border-cyan-500/30 bg-[#060c14]/60 p-10 text-center backdrop-blur-md">
            <h3 className="font-display text-lg font-bold text-white">No Matching Arenas Found</h3>
            <p className="mt-1.5 font-space text-xs text-slate-400 max-w-md">
              No active competition terminals found matching &quot;{searchQuery}&quot;. Clear your search query or select another track sector.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedTrack("all");
              }}
              className="mt-5 rounded-xs border border-cyan-400 bg-cyan-950/60 px-6 py-2.5 font-oxanium text-xs font-bold text-cyan-300 hover:bg-cyan-400 hover:text-black transition-colors"
            >
              Reset Search & Filters
            </button>
          </div>
        )}

        {/* Event Details Info Modal */}
        <EventModal
          event={selectedModalEvent}
          onClose={() => setSelectedModalEvent(null)}
        />
      </div>
    </section>
  );
}
