"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Eyebrow from "@/components/ui/Eyebrow";
import { SCHEDULE_EVENTS, ScheduleEvent, TRACK_FILTERS } from "@/lib/scheduleData";
import { EVENTS, EventItem } from "@/lib/eventsData";
import {
  Clock,
  MapPin,
  Search,
  Table as TableIcon,
  LayoutGrid,
  X,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface TimetableSectionProps {
  onOpenModal?: (event: EventItem) => void;
}

export default function TimetableSection({ onOpenModal }: TimetableSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrack, setSelectedTrack] = useState<string>("ALL");
  const [selectedDuration, setSelectedDuration] = useState<"ALL" | "FULL_DAY" | "TIMED">("ALL");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Filter events based on search, track, and duration
  const filteredEvents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return SCHEDULE_EVENTS.filter((e) => {
      const matchesTrack = selectedTrack === "ALL" || e.trackLetter === selectedTrack;

      const matchesDuration =
        selectedDuration === "ALL" ||
        (selectedDuration === "FULL_DAY" && e.isFullDay) ||
        (selectedDuration === "TIMED" && !e.isFullDay);

      const matchesSearch =
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.type.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        e.trackName.toLowerCase().includes(q) ||
        e.time.toLowerCase().includes(q) ||
        e.duration.toLowerCase().includes(q) ||
        (e.sessions && e.sessions.some((s) => s.venue.toLowerCase().includes(q) || s.time.toLowerCase().includes(q)));

      return matchesTrack && matchesDuration && matchesSearch;
    });
  }, [searchQuery, selectedTrack, selectedDuration]);

  const handleQuickView = (scheduleEvent: ScheduleEvent) => {
    const matched = EVENTS.find((item) => item.id === scheduleEvent.id);
    if (matched && onOpenModal) {
      onOpenModal(matched);
    }
  };

  return (
    <section id="timetable" className="relative py-8 sm:py-16">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4">
          <div>
            <Eyebrow n="02">EVENT TIMETABLE</Eyebrow>
            <h2 className="mt-1 font-display text-2xl font-bold uppercase tracking-tight text-white sm:text-3xl lg:text-4xl">
              13 Arena Timings &amp; Venues
            </h2>
            <p className="mt-1 font-space text-xs sm:text-sm text-slate-300">
              Browse all official competitions, timings, and campus locations.
            </p>
          </div>

          {/* Table / Cards View Toggle */}
          <div className="flex items-center gap-1.5 self-start md:self-auto bg-surface p-1 rounded-lg border border-line">
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs font-semibold rounded transition-colors ${
                viewMode === "cards"
                  ? "bg-circuit text-bg font-bold shadow-[0_0_12px_rgba(53,224,201,0.3)]"
                  : "text-muted hover:text-white"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs font-semibold rounded transition-colors ${
                viewMode === "table"
                  ? "bg-circuit text-bg font-bold shadow-[0_0_12px_rgba(53,224,201,0.3)]"
                  : "text-muted hover:text-white"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Console */}
        <div className="mt-4 sm:mt-6 space-y-3 rounded-xl border border-line bg-surface/80 p-3 sm:p-4 backdrop-blur-md">
          {/* Top Row: Search Input & Format Filter */}
          <div className="grid gap-2.5 sm:grid-cols-[1fr_auto]">
            {/* Instant Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-circuit pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search event, venue (e.g. Lab 1, De Nobili, Hackathon)..."
                className="w-full rounded-lg border border-line bg-[#06090f] py-2 sm:py-2.5 pl-9 pr-8 font-space text-xs sm:text-sm text-white placeholder:text-muted focus:border-circuit focus:outline-none focus:ring-1 focus:ring-circuit"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-white"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Duration Type Quick Selector */}
            <div className="flex items-center gap-1 bg-[#06090f] p-1 rounded-lg border border-line self-start">
              <button
                type="button"
                onClick={() => setSelectedDuration("ALL")}
                className={`px-2.5 py-1 font-mono text-[11px] sm:text-xs rounded transition-colors ${
                  selectedDuration === "ALL"
                    ? "bg-slate-200 text-bg font-bold"
                    : "text-muted hover:text-white"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setSelectedDuration("FULL_DAY")}
                className={`px-2.5 py-1 font-mono text-[11px] sm:text-xs rounded transition-colors ${
                  selectedDuration === "FULL_DAY"
                    ? "bg-circuit text-bg font-bold"
                    : "text-muted hover:text-white"
                }`}
              >
                Full Day
              </button>
              <button
                type="button"
                onClick={() => setSelectedDuration("TIMED")}
                className={`px-2.5 py-1 font-mono text-[11px] sm:text-xs rounded transition-colors ${
                  selectedDuration === "TIMED"
                    ? "bg-marigold text-bg font-bold"
                    : "text-muted hover:text-white"
                }`}
              >
                Timed
              </button>
            </div>
          </div>

          {/* Bottom Row: Track Filter Pills (Mobile Scrollable) */}
          <div className="flex items-center gap-1.5 pt-2 border-t border-line/40 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-muted shrink-0 mr-1 hidden sm:inline">
              Tracks:
            </span>
            {TRACK_FILTERS.map((t) => {
              const isSelected = selectedTrack === t.letter;
              return (
                <button
                  key={t.letter}
                  type="button"
                  onClick={() => setSelectedTrack(t.letter)}
                  className={`px-2.5 sm:px-3 py-1 font-mono text-xs rounded-md transition-all whitespace-nowrap shrink-0 ${
                    isSelected
                      ? "text-bg font-bold shadow-[0_0_12px_rgba(53,224,201,0.25)]"
                      : "bg-[#06090f] text-slate-300 hover:bg-surface-raised border border-line hover:text-white"
                  }`}
                  style={{
                    backgroundColor: isSelected ? t.color : undefined,
                    color: isSelected ? "#03080d" : undefined,
                    borderColor: isSelected ? t.color : undefined,
                  }}
                >
                  <span>{t.label}</span>{" "}
                  <span className={`text-[10px] ${isSelected ? "opacity-90 font-bold" : "opacity-60"}`}>
                    ({t.count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter & Reset Link */}
        <div className="mt-2.5 flex items-center justify-between text-xs font-mono text-muted px-1">
          <span>
            Showing <strong className="text-circuit">{filteredEvents.length}</strong> of 13 official events
          </span>
          {(searchQuery || selectedTrack !== "ALL" || selectedDuration !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedTrack("ALL");
                setSelectedDuration("ALL");
              }}
              className="text-marigold hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              <span>Reset filters</span>
            </button>
          )}
        </div>

        {/* =========================================================================
            VIEW MODE 1: Cards View (Default — Professional cards with images behind)
           ========================================================================= */}
        {viewMode === "cards" ? (
          <div className="mt-5 grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.length === 0 ? (
              <div className="col-span-full py-12 text-center text-muted font-space rounded-xl border border-line bg-surface/50">
                <p>No events match your current filter.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedTrack("ALL");
                    setSelectedDuration("ALL");
                  }}
                  className="mt-2 text-circuit underline text-xs font-mono inline-block"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              filteredEvents.map((event) => {
                const accent = event.accentColor;

                return (
                  <article
                    key={event.id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-[#04090d] transition-all duration-300 hover:-translate-y-1 shadow-lg"
                    style={{
                      borderColor: `${accent}40`,
                      boxShadow: `0 4px 20px -2px ${accent}15`,
                    }}
                  >
                    {/* Background Image behind card with gradient overlay */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-[0.28] group-hover:opacity-[0.38]"
                      />
                      {/* Premium multi-stop dark gradient for maximum text contrast */}
                      <div className="absolute inset-0 bg-gradient-to-b from-[#03080d]/90 via-[#03080d]/85 via-50% to-[#03080d]/98" />
                      <div
                        className="absolute inset-0 opacity-10 transition-opacity duration-300 group-hover:opacity-20"
                        style={{
                          background: `radial-gradient(circle at top right, ${accent}, transparent 70%)`,
                        }}
                      />
                    </div>

                    {/* Cybernetic Corner Accents */}
                    <div
                      className="pointer-events-none absolute left-3 top-3 h-3 w-3 border-l-2 border-t-2"
                      style={{ borderColor: accent }}
                    />
                    <div
                      className="pointer-events-none absolute right-3 top-3 h-3 w-3 border-r-2 border-t-2"
                      style={{ borderColor: accent }}
                    />
                    <div
                      className="pointer-events-none absolute bottom-3 left-3 h-3 w-3 border-b-2 border-l-2"
                      style={{ borderColor: accent }}
                    />
                    <div
                      className="pointer-events-none absolute bottom-3 right-3 h-3 w-3 border-b-2 border-r-2"
                      style={{ borderColor: accent }}
                    />

                    {/* Card Content */}
                    <div className="relative z-10 flex h-full flex-col p-4 sm:p-5">
                      {/* Top Header: Track & Duration Badges */}
                      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                        <span
                          className="font-oxanium text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
                          style={{
                            color: accent,
                            borderColor: `${accent}60`,
                            backgroundColor: `${accent}15`,
                          }}
                        >
                          Track {event.trackLetter} · {event.type}
                        </span>

                        <span className="font-mono text-[10px] sm:text-[11px] font-semibold text-slate-300 px-2 py-0.5 rounded bg-black/40 border border-white/10">
                          {event.duration}
                        </span>
                      </div>

                      {/* Event Title */}
                      <div className="pt-3">
                        <h3
                          className="font-space text-2xl font-black uppercase tracking-tight text-white transition-colors group-hover:text-circuit"
                          style={{
                            textShadow: `0 0 20px ${accent}40`,
                          }}
                        >
                          {event.name}
                        </h3>
                        <p className="font-oxanium text-xs uppercase tracking-wider text-slate-300 mt-0.5">
                          {event.trackName}
                        </p>
                      </div>

                      {/* Primary Focus: TIMING & VENUE BOX */}
                      <div className="mt-3.5 space-y-2 rounded-lg bg-black/60 p-3 border border-white/10 backdrop-blur-sm">
                        {/* Timing */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 font-oxanium text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            <Clock className="w-3.5 h-3.5 text-marigold" />
                            <span>Timing</span>
                          </span>
                          <span className="font-mono text-xs sm:text-sm font-bold text-marigold">
                            {event.time}
                          </span>
                        </div>

                        {/* Venue */}
                        <div className="flex items-start justify-between gap-2 pt-1.5 border-t border-white/5">
                          <span className="flex items-center gap-1.5 font-oxanium text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                            <MapPin className="w-3.5 h-3.5 text-circuit" />
                            <span>Venue</span>
                          </span>
                          <span className="font-oxanium text-xs sm:text-sm font-bold text-circuit text-right">
                            {event.venue}
                          </span>
                        </div>
                      </div>

                      {/* Circuit of Minds: Split Sessions Details */}
                      {event.isSplit && event.sessions && (
                        <div className="mt-2.5 rounded-lg bg-black/60 p-2.5 border border-circuit/30 text-xs font-mono">
                          <span className="font-oxanium text-[10px] font-bold uppercase tracking-wider text-circuit flex items-center gap-1 mb-1.5">
                            <Sparkles className="w-3 h-3 text-circuit" />
                            <span>Two Consecutive Rounds:</span>
                          </span>
                          <div className="space-y-1">
                            {event.sessions.map((s, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between gap-1 text-[11px] text-slate-200"
                              >
                                <span className="text-marigold font-semibold">{s.time}</span>
                                <span className="text-white font-medium flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-circuit" />
                                  <span>{s.venue}</span>
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Schedule Conflict / Clash Warning for Students */}
                      {event.clashWarning && (
                        <div className="mt-2.5 flex items-start gap-1.5 rounded bg-amber-500/10 border border-amber-500/25 p-2 text-[10px] sm:text-[11px] font-mono text-amber-200/90 leading-tight">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{event.clashWarning}</span>
                        </div>
                      )}

                      <div className="flex-1 min-h-2" />

                      {/* Action Buttons */}
                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleQuickView(event)}
                          className="font-mono text-xs text-muted hover:text-white transition-colors py-1 px-1.5"
                        >
                          Quick Overview
                        </button>

                        <Link
                          href={`/events/${event.id}`}
                          className="flex items-center gap-1 rounded px-3 py-1.5 font-mono text-xs font-bold text-circuit bg-circuit/15 border border-circuit/40 hover:bg-circuit hover:text-bg transition-all"
                        >
                          <span>Event Specs</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        ) : (
          /* =========================================================================
              VIEW MODE 2: Table View (Optimized for desktop & fast row comparison)
             ========================================================================= */
          <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-surface/90 shadow-2xl">
            <table className="w-full min-w-[700px] border-collapse text-left font-space text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-line bg-[#070b12] text-xs font-oxanium uppercase tracking-wider text-muted">
                  <th className="py-3 pl-4 pr-3">Event &amp; Track</th>
                  <th className="py-3 px-3">Timing</th>
                  <th className="py-3 px-3">Venue</th>
                  <th className="py-3 px-3">Format</th>
                  <th className="py-3 pl-2 pr-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted font-space">
                      No events match your current filter.{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedTrack("ALL");
                          setSelectedDuration("ALL");
                        }}
                        className="text-circuit underline ml-1"
                      >
                        Clear filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((event) => (
                    <tr
                      key={event.id}
                      className="group transition-colors hover:bg-surface-raised/70"
                    >
                      {/* Event Name & Track */}
                      <td className="py-3.5 pl-4 pr-3 align-top">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-display text-sm sm:text-base font-bold uppercase text-white group-hover:text-circuit transition-colors">
                              {event.name}
                            </span>
                            <span
                              className="rounded px-1.5 py-0.2 font-mono text-[10px] font-bold uppercase border"
                              style={{
                                color: event.accentColor,
                                borderColor: `${event.accentColor}50`,
                                backgroundColor: `${event.accentColor}15`,
                              }}
                            >
                              Track {event.trackLetter}
                            </span>
                          </div>
                          <span className="font-oxanium text-[11px] text-muted mt-0.5">
                            {event.type}
                          </span>

                          {/* Circuit of Minds split session info */}
                          {event.isSplit && event.sessions && (
                            <div className="mt-1.5 space-y-1 rounded bg-[#06090f] p-1.5 border border-circuit/30 text-[11px] font-mono text-slate-300">
                              {event.sessions.map((s, idx) => (
                                <div key={idx} className="flex items-center gap-1.5">
                                  <span className="text-marigold font-semibold">{s.time}</span>
                                  <span className="text-muted">·</span>
                                  <span className="text-white flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-circuit" />
                                    <span>{s.venue}</span>
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Clash Notice */}
                          {event.clashWarning && (
                            <span className="mt-1 font-mono text-[10px] text-amber-300/90 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
                              <span>{event.clashWarning}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Timing */}
                      <td className="py-3.5 px-3 align-top whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm font-bold text-marigold">
                          <Clock className="w-3.5 h-3.5 text-marigold shrink-0" />
                          <span>{event.time}</span>
                        </div>
                        <span className="font-mono text-[10px] text-muted block mt-0.5">
                          {event.duration}
                        </span>
                      </td>

                      {/* Venue */}
                      <td className="py-3.5 px-3 align-top">
                        <div className="flex items-center gap-1.5 font-oxanium text-xs sm:text-sm font-bold text-circuit">
                          <MapPin className="w-3.5 h-3.5 text-circuit shrink-0" />
                          <span>{event.venue}</span>
                        </div>
                      </td>

                      {/* Format / Duration */}
                      <td className="py-3.5 px-3 align-top whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded font-mono text-[10px] sm:text-[11px] font-semibold ${
                            event.isFullDay
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                              : "bg-[#06090f] text-slate-200 border border-line"
                          }`}
                        >
                          {event.duration}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pl-2 pr-4 align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleQuickView(event)}
                            className="rounded border border-line px-2 py-1 font-mono text-xs text-slate-300 hover:border-circuit hover:text-circuit bg-[#06090f] transition-colors"
                          >
                            Quick View
                          </button>
                          <Link
                            href={`/events/${event.id}`}
                            className="rounded bg-circuit/15 border border-circuit/40 px-2.5 py-1 font-mono text-xs font-semibold text-circuit hover:bg-circuit hover:text-bg transition-colors inline-flex items-center gap-1"
                          >
                            <span>Specs</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
