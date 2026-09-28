"use client";

import React from "react";
import { useTrackLeader } from "@/context/TrackLeaderContext";

export default function TrackLeaderDashboardPage() {
  const {
    trackLeader,
    assignedTrack,
    events,
    loading,
    isEventsLoading,
    refreshTrackAndEvents,
  } = useTrackLeader();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-2 border-[#35e0c9]/20 border-t-[#35e0c9] animate-spin" />
      </div>
    );
  }

  const leaderName = trackLeader?.name || "Track Leader";
  const leaderEmail = trackLeader?.email || "";

  return (
    <div className="p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
      {/* 1. Header & Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-neutral-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#35e0c9]/30 bg-[#35e0c9]/10 text-[#35e0c9] text-xs font-mono uppercase tracking-widest mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#35e0c9]" />
            TRACK OPERATIONS CONSOLE
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-mono uppercase tracking-tight text-white">
            Welcome, {leaderName}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Signed in as{" "}
            <span className="text-neutral-200 font-mono font-medium">
              {leaderEmail}
            </span>
            {assignedTrack && (
              <span className="hidden sm:inline">
                {" "}— Assigned Track:{" "}
                <span className="text-[#35e0c9] font-mono font-semibold">
                  {assignedTrack.name}
                </span>
              </span>
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() => refreshTrackAndEvents()}
          disabled={isEventsLoading}
          className="self-start md:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 text-xs font-mono uppercase tracking-wider text-neutral-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
        >
          <svg
            className={`w-3.5 h-3.5 text-[#35e0c9] ${
              isEventsLoading ? "animate-spin" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>{isEventsLoading ? "Syncing..." : "Sync Live Data"}</span>
        </button>
      </div>

      {/* 2. Track Assignment Status Card */}
      <section id="track" className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#35e0c9]" />
          <h2 className="text-xs uppercase font-mono tracking-wider text-neutral-400 font-semibold">
            Assigned Track Foundation
          </h2>
        </div>

        {assignedTrack ? (
          <div className="bg-[#0e131f]/90 border border-neutral-800/80 rounded-2xl p-6 sm:p-7 backdrop-blur-xl relative overflow-hidden shadow-xl shadow-black/20">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 relative z-10">
              {/* Left Column: Track Info */}
              <div className="space-y-3 flex-1 min-w-0">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#35e0c9]/10 border border-[#35e0c9]/30 text-[#35e0c9] text-xs font-mono uppercase tracking-wider font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#35e0c9]" />
                  OFFICIAL XAVITECH TRACK
                </div>

                <h3 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight break-words">
                  {assignedTrack.name}
                </h3>

                {assignedTrack.description && (
                  <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
                    {assignedTrack.description}
                  </p>
                )}

                <div className="pt-2 flex flex-wrap items-center gap-2.5 text-xs font-mono">
                  <span className="px-3 py-1 rounded-lg bg-neutral-900/90 border border-neutral-800 text-neutral-400">
                    slug: <span className="text-neutral-200">{assignedTrack.slug}</span>
                  </span>
                  <span
                    className={`px-3 py-1 rounded-lg border font-semibold ${
                      assignedTrack.is_active
                        ? "bg-emerald-950/40 border-emerald-800/50 text-emerald-400"
                        : "bg-rose-950/40 border-rose-800/50 text-rose-400"
                    }`}
                  >
                    Status: {assignedTrack.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Right/Bottom Column: Event count stat box (centered full-width on mobile, right-column on desktop) */}
              <div className="w-full sm:w-44 sm:self-stretch flex flex-col justify-center items-center py-6 px-6 rounded-2xl bg-neutral-900/90 border border-neutral-800/90 shrink-0 text-center">
                <span className="text-4xl sm:text-4xl font-black text-[#35e0c9] font-mono block">
                  {events.length}
                </span>
                <span className="text-xs sm:text-[11px] font-mono uppercase tracking-wider text-neutral-400 mt-1.5 block font-bold">
                  TRACK EVENTS
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#0e131f]/90 border border-amber-900/40 rounded-2xl p-6 sm:p-7 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-950/50 border border-amber-800/50 flex items-center justify-center mx-auto text-amber-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white font-mono">
              No Track Assigned
            </h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              Your account currently does not have an active track assigned. Please reach out to the XAVITECH festival administrator to receive your track assignment.
            </p>
          </div>
        )}
      </section>

      {/* 3. Assigned Events List Section */}
      <section id="events" className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h2 className="text-lg sm:text-xl font-black font-mono uppercase tracking-tight text-white">
                Assigned Track Events
              </h2>
              <span className="inline-flex items-center justify-center min-w-[28px] px-2.5 py-0.5 rounded-lg bg-[#35e0c9]/15 border border-[#35e0c9]/40 text-[#35e0c9] text-xs sm:text-sm font-mono font-bold shrink-0 shadow-sm shadow-[#35e0c9]/10">
                {events.length}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Events belonging strictly to your designated track
            </p>
          </div>
        </div>

        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-[#0e131f]/90 border border-neutral-800/80 hover:border-neutral-700/80 rounded-2xl p-5 sm:p-6 backdrop-blur-xl transition-all duration-200 hover:shadow-lg hover:shadow-[#35e0c9]/5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] uppercase tracking-wider font-mono font-bold px-2.5 py-1 rounded-md bg-[#35e0c9]/10 text-[#35e0c9] border border-[#35e0c9]/30">
                      {event.registration_type}
                    </span>
                    <span
                      className={`text-[11px] font-mono font-semibold px-2.5 py-1 rounded-md border ${
                        event.registration_open
                          ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/50"
                          : "bg-neutral-900 text-neutral-400 border-neutral-800"
                      }`}
                    >
                      {event.registration_open ? "Registration Open" : "Closed"}
                    </span>
                  </div>

                  <h4 className="text-base sm:text-lg font-bold font-mono text-white tracking-tight">
                    {event.title || event.name}
                  </h4>

                  {event.tagline && (
                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {event.tagline}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400 font-mono">
                  <div>
                    Team:{" "}
                    <span className="text-neutral-200">
                      {event.min_team_size === event.max_team_size
                        ? event.min_team_size
                        : `${event.min_team_size}-${event.max_team_size}`}{" "}
                      {event.max_team_size === 1 ? "solo" : "members"}
                    </span>
                  </div>
                  <div>
                    Fee:{" "}
                    <span className="text-[#35e0c9] font-bold">
                      {event.entry_fee === 0 ? "Free" : `₹${event.entry_fee}`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-[#0e131f]/90 border border-neutral-800 text-center">
            <p className="text-xs text-neutral-400 font-mono">
              No events found for this track.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
