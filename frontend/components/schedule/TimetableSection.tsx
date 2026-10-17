"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Eyebrow from "@/components/ui/Eyebrow";
import { SCHEDULE_EVENTS, ScheduleEvent, TRACK_FILTERS } from "@/lib/scheduleData";
import { EVENTS, EventItem, getEventByIdOrSlug } from "@/lib/eventsData";
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
  Eye,
  RotateCcw,
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
    const matched = getEventByIdOrSlug(scheduleEvent.id) || EVENTS.find((item) => item.id === scheduleEvent.id);
    if (matched && onOpenModal) {
      onOpenModal(matched);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedTrack("ALL");
    setSelectedDuration("ALL");
  };

  const hasActiveFilters = searchQuery !== "" || selectedTrack !== "ALL" || selectedDuration !== "ALL";

  return (
    <section id="timetable" className="relative py-10 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Eyebrow n="02">COMPETITIONS &amp; WORKSHOPS</Eyebrow>
            <h2 className="mt-2 font-display text-2xl font-extrabold uppercase tracking-tight text-white sm:text-3xl lg:text-4xl">
              13 Arena Timings &amp; Venues
            </h2>
            <p className="mt-1.5 font-space text-xs sm:text-sm text-slate-300 max-w-2xl">
              Filter and search all festival competitions, reporting times, and campus coordinates.
            </p>
          </div>

          {/* Table / Cards View Toggle */}
          <div className="flex items-center gap-1 self-start md:self-auto bg-[#06090f] p-1 rounded-xl border border-line shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              aria-pressed={viewMode === "cards"}
              className={`flex items-center gap-2 px-3 py-1.5 font-mono text-xs font-semibold rounded-lg transition-all ${
                viewMode === "cards"
                  ? "bg-circuit text-bg font-bold shadow-[0_0_14px_rgba(53,224,201,0.25)]"
                  : "text-muted hover:text-white"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              aria-pressed={viewMode === "table"}
              className={`flex items-center gap-2 px-3 py-1.5 font-mono text-xs font-semibold rounded-lg transition-all ${
                viewMode === "table"
                  ? "bg-circuit text-bg font-bold shadow-[0_0_14px_rgba(53,224,201,0.25)]"
                  : "text-muted hover:text-white"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Console */}
        <div className="mt-6 space-y-3.5 rounded-2xl border border-line bg-surface/90 p-4 sm:p-5 backdrop-blur-md shadow-lg">
          {/* Top Row: Search Input & Format Filter */}
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            {/* Instant Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-circuit pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search event, venue (e.g. Lab 1, De Nobili, BGMI, Hackathon)..."
                className="w-full rounded-xl border border-line bg-[#06090f] py-2.5 sm:py-3 pl-10 pr-9 font-space text-xs sm:text-sm text-white placeholder:text-muted focus:border-circuit focus:outline-none focus:ring-1 focus:ring-circuit/50 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Duration Type Segmented Selector */}
            <div className="flex items-center gap-1 bg-[#06090f] p-1 rounded-xl border border-line self-start shadow-inner">
              <button
                type="button"
                onClick={() => setSelectedDuration("ALL")}
                className={`px-3 py-1.5 font-mono text-xs rounded-lg transition-all ${
                  selectedDuration === "ALL"
                    ? "bg-circuit text-bg font-bold shadow-[0_0_12px_rgba(53,224,201,0.25)]"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                All Formats
              </button>
              <button
                type="button"
                onClick={() => setSelectedDuration("FULL_DAY")}
                className={`px-3 py-1.5 font-mono text-xs rounded-lg transition-all ${
                  selectedDuration === "FULL_DAY"
                    ? "bg-circuit text-bg font-bold shadow-[0_0_12px_rgba(53,224,201,0.25)]"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                Full Day
              </button>
              <button
                type="button"
                onClick={() => setSelectedDuration("TIMED")}
                className={`px-3 py-1.5 font-mono text-xs rounded-lg transition-all ${
                  selectedDuration === "TIMED"
                    ? "bg-circuit text-bg font-bold shadow-[0_0_12px_rgba(53,224,201,0.25)]"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                Timed
              </button>
            </div>
          </div>

          {/* Bottom Row: Track Filter Pills */}
          <div className="flex items-center gap-2 pt-2.5 border-t border-line/60 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted shrink-0 mr-1 hidden sm:inline">
              Tracks:
            </span>
            {TRACK_FILTERS.map((t) => {
              const isSelected = selectedTrack === t.letter;
              return (
                <button
                  key={t.letter}
                  type="button"
                  onClick={() => setSelectedTrack(t.letter)}
                  className={`px-3 py-1.5 font-mono text-xs rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? "text-bg font-bold shadow-[0_0_14px_rgba(53,224,201,0.2)]"
                      : "bg-[#06090f] text-slate-300 hover:bg-surface-raised border border-line hover:border-slate-500 hover:text-white"
                  }`}
                  style={{
                    backgroundColor: isSelected ? t.color : undefined,
                    color: isSelected ? "#03080d" : undefined,
                    borderColor: isSelected ? t.color : undefined,
                  }}
                >
                  <span>{t.label}</span>
                  <span className={`text-[10px] tabular-nums rounded-full px-1.5 py-0.2 ${isSelected ? "bg-black/25 font-bold text-black" : "bg-white/5 text-muted"}`}>
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter & Reset Action */}
        <div className="mt-3 flex items-center justify-between text-xs font-mono text-muted px-1">
          <span>
            Showing <strong className="text-circuit">{filteredEvents.length}</strong> of 13 official competitions
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-marigold hover:text-white transition-colors flex items-center gap-1.5 font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset all filters</span>
            </button>
          )}
        </div>
        {/* =========================================================================
            VIEW MODE 1: Cards View (Default — Professional cards with images behind)
           ========================================================================= */}
        {viewMode === "cards" ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.length === 0 ? (
              <div className="col-span-full py-16 text-center text-muted font-space rounded-2xl border border-line bg-surface/60">
                <p className="text-base font-medium text-slate-300">No competitions match your current filter.</p>
                <p className="text-xs text-muted mt-1">Try clearing your search term or selecting another track.</p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-circuit/40 bg-circuit/10 px-4 py-2 text-xs font-mono font-bold text-circuit hover:bg-circuit hover:text-bg transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear all filters</span>
                </button>
              </div>
            ) : (
              filteredEvents.map((event) => {
                const accent = event.accentColor;
                const matched = getEventByIdOrSlug(event.id);
                const eventHref = matched ? `/events/${matched.id}` : `/events/${event.id}`;

                return (
                  <article
                    key={event.id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-[#04080d] transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-2xl"
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
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-[0.25] group-hover:opacity-[0.35]"
                      />
                      {/* Premium multi-stop dark gradient for maximum text contrast */}
                      <div className="absolute inset-0 bg-gradient-to-b from-[#03080d]/92 via-[#03080d]/85 via-45% to-[#03080d]/98" />
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
                      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
                        <span
                          className="font-oxanium text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border"
                          style={{
                            color: accent,
                            borderColor: `${accent}60`,
                            backgroundColor: `${accent}15`,
                          }}
                        >
                          Track {event.trackLetter} · {event.type}
                        </span>

                        <span className="font-mono text-[11px] font-semibold text-slate-200 px-2.5 py-0.5 rounded-full bg-black/50 border border-white/10">
                          {event.duration}
                        </span>
                      </div>

                      {/* Event Title & Subtitle */}
                      <div className="pt-3.5">
                        <h3 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white transition-colors group-hover:text-circuit leading-tight">
                          {event.name}
                        </h3>
                        <p className="font-oxanium text-xs uppercase tracking-wider text-slate-300/80 mt-1">
                          {event.trackName}
                        </p>
                      </div>

                      {/* Primary Focus: TIMING & VENUE BOX */}
                      <div className="mt-4 space-y-2.5 rounded-xl bg-black/65 p-3.5 border border-white/10 backdrop-blur-md shadow-inner">
                        {/* Timing */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 font-oxanium text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            <Clock className="w-3.5 h-3.5 text-marigold" />
                            <span>TIMING</span>
                          </span>
                          <span className="font-mono tabular-nums text-xs sm:text-sm font-bold text-marigold tracking-tight">
                            {event.time}
                          </span>
                        </div>

                        {/* Venue */}
                        <div className="flex items-start justify-between gap-2 pt-2 border-t border-white/10">
                          <span className="flex items-center gap-1.5 font-oxanium text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                            <MapPin className="w-3.5 h-3.5 text-circuit" />
                            <span>VENUE</span>
                          </span>
                          <span className="font-oxanium text-xs sm:text-sm font-bold text-circuit text-right">
                            {event.venue}
                          </span>
                        </div>
                      </div>

                      {/* Circuit of Minds: Split Sessions Details */}
                      {event.isSplit && event.sessions && (
                        <div className="mt-3 rounded-xl bg-black/65 p-3 border border-circuit/30 text-xs font-mono shadow-inner">
                          <span className="font-oxanium text-[10px] font-bold uppercase tracking-wider text-circuit flex items-center gap-1.5 mb-2">
                            <Sparkles className="w-3.5 h-3.5 text-circuit" />
                            <span>Two Consecutive Rounds:</span>
                          </span>
                          <div className="space-y-1.5">
                            {event.sessions.map((s, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between gap-2 text-[11px] text-slate-200"
                              >
                                <span className="text-marigold font-semibold tabular-nums">{s.time}</span>
                                <span className="text-white font-medium flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-circuit" />
                                  <span>{s.venue}</span>
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Schedule Conflict / Clash Warning */}
                      {event.clashWarning && (
                        <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 p-2.5 text-xs font-space text-amber-200/90 leading-relaxed">
                          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <span>{event.clashWarning}</span>
                        </div>
                      )}

                      <div className="flex-1 min-h-3" />

                      {/* Action Buttons */}
                      <div className="mt-5 pt-3.5 border-t border-white/10 flex items-center justify-between gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleQuickView(event)}
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-lg border border-line bg-surface-raised/90 px-3 py-2 font-mono text-xs font-semibold text-slate-200 hover:border-circuit/60 hover:text-circuit hover:bg-circuit/10 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Quick Overview</span>
                        </button>

                        <Link
                          href={eventHref}
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-lg bg-circuit/15 border border-circuit/40 px-3.5 py-2 font-mono text-xs font-bold text-circuit hover:bg-circuit hover:text-bg transition-all shadow-[0_0_12px_rgba(53,224,201,0.15)]"
                        >
                          <span>Event Specs</span>
                          <ArrowRight className="w-3.5 h-3.5" />
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
          <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-surface/95 shadow-2xl">
            <table className="w-full min-w-[720px] border-collapse text-left font-space text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-line bg-[#06090f] text-xs font-oxanium uppercase tracking-wider text-muted">
                  <th className="py-3.5 pl-4 pr-3">Event &amp; Track</th>
                  <th className="py-3.5 px-3">Timing</th>
                  <th className="py-3.5 px-3">Venue</th>
                  <th className="py-3.5 px-3">Format</th>
                  <th className="py-3.5 pl-2 pr-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-muted font-space">
                      No competitions match your current filter.{" "}
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="text-circuit underline ml-1 font-medium"
                      >
                        Clear filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((event) => {
                    const matched = getEventByIdOrSlug(event.id);
                    const eventHref = matched ? `/events/${matched.id}` : `/events/${event.id}`;

                    return (
                      <tr
                        key={event.id}
                        className="group transition-colors hover:bg-white/[0.03]"
                      >
                        {/* Event Name & Track */}
                        <td className="py-4 pl-4 pr-3 align-top">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-display text-sm sm:text-base font-bold uppercase text-white group-hover:text-circuit transition-colors">
                                {event.name}
                              </span>
                              <span
                                className="rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase border"
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
                              <div className="mt-2 space-y-1 rounded-lg bg-[#06090f] p-2 border border-circuit/30 text-[11px] font-mono text-slate-300">
                                {event.sessions.map((s, idx) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    <span className="text-marigold font-semibold tabular-nums">{s.time}</span>
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
                              <span className="mt-1.5 font-mono text-[10px] text-amber-300/90 flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                <span>{event.clashWarning}</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Timing */}
                        <td className="py-4 px-3 align-top whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm font-bold text-marigold tabular-nums">
                            <Clock className="w-3.5 h-3.5 text-marigold shrink-0" />
                            <span>{event.time}</span>
                          </div>
                          <span className="font-mono text-[10px] text-muted block mt-1">
                            {event.duration}
                          </span>
                        </td>

                        {/* Venue */}
                        <td className="py-4 px-3 align-top">
                          <div className="flex items-center gap-1.5 font-oxanium text-xs sm:text-sm font-bold text-circuit">
                            <MapPin className="w-3.5 h-3.5 text-circuit shrink-0" />
                            <span>{event.venue}</span>
                          </div>
                        </td>

                        {/* Format / Duration */}
                        <td className="py-4 px-3 align-top whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-md font-mono text-[11px] font-semibold ${
                              event.isFullDay
                                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                                : "bg-[#06090f] text-slate-200 border border-line"
                            }`}
                          >
                            {event.duration}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 pl-2 pr-4 align-top text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleQuickView(event)}
                              className="rounded-lg border border-line px-2.5 py-1.5 font-mono text-xs text-slate-300 hover:border-circuit hover:text-circuit bg-[#06090f] transition-colors inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Quick View</span>
                            </button>
                            <Link
                              href={eventHref}
                              className="rounded-lg bg-circuit/15 border border-circuit/40 px-3 py-1.5 font-mono text-xs font-bold text-circuit hover:bg-circuit hover:text-bg transition-colors inline-flex items-center gap-1"
                            >
                              <span>Specs</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
