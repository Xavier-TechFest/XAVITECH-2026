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
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl w-full mx-auto space-y-8">
      {/* 1. Header & Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="text-xs uppercase font-mono tracking-wider text-cyan-400 font-semibold mb-1">
            Track Operations Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome, {trackLeader?.name || "Track Leader"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Signed in as{" "}
            <span className="text-slate-200 font-mono font-medium">
              {trackLeader?.email}
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => refreshTrackAndEvents()}
          disabled={isEventsLoading}
          className="self-start md:self-auto inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors disabled:opacity-50"
        >
          <svg
            className={`w-4 h-4 text-cyan-400 ${
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
          <span>{isEventsLoading ? "Refreshing..." : "Sync Live Data"}</span>
        </button>
      </div>

      {/* 2. Track Assignment Status Card */}
      <section id="track" className="space-y-3">
        <h2 className="text-xs uppercase font-mono tracking-wider text-slate-400 font-semibold">
          Assigned Track Foundation
        </h2>

        {assignedTrack ? (
          <div className="bg-[#0c101a] border border-cyan-900/40 rounded-2xl p-6 sm:p-7 shadow-xl shadow-cyan-950/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
              <div className="space-y-2">
                <div className="flex items-center space-x-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
                  <span className="text-xs uppercase font-mono text-cyan-400 tracking-wider">
                    Official XAVITECH Track
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {assignedTrack.name}
                </h3>
                {assignedTrack.description && (
                  <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                    {assignedTrack.description}
                  </p>
                )}
                <div className="pt-2 flex flex-wrap gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-400 font-mono">
                    slug: {assignedTrack.slug}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 font-medium">
                    Status: {assignedTrack.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Event count stat box */}
              <div className="sm:self-stretch flex sm:flex-col justify-center items-end sm:items-center px-6 py-4 rounded-xl bg-slate-900/80 border border-slate-800/80 shrink-0">
                <span className="text-3xl font-extrabold text-cyan-400 font-mono">
                  {events.length}
                </span>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium mt-0.5">
                  Track Events
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#0c101a] border border-amber-900/40 rounded-2xl p-6 sm:p-7 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-950/50 border border-amber-800/50 flex items-center justify-center mx-auto text-amber-400">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white">
              No Track Assigned
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Your account currently does not have an active track assigned.
              Please reach out to the XAVITECH festival administrator to receive
              your track assignment.
            </p>
          </div>
        )}
      </section>

      {/* 3. Assigned Events List Section */}
      <section id="events" className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Assigned Track Events ({events.length})
            </h2>
            <p className="text-xs text-slate-400">
              Events belonging strictly to your designated track
            </p>
          </div>
        </div>

        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-[#0c101a] border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-lg transition-all flex flex-col justify-between space-y-4 hover:shadow-cyan-950/20"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider font-mono font-medium px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                      {event.registration_type}
                    </span>
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                        event.registration_open
                          ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {event.registration_open ? "Registration Open" : "Closed"}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white tracking-tight">
                    {event.title || event.name}
                  </h4>

                  {event.tagline && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {event.tagline}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <div>
                    Team:{" "}
                    <span className="text-slate-200">
                      {event.min_team_size === event.max_team_size
                        ? event.min_team_size
                        : `${event.min_team_size}-${event.max_team_size}`}{" "}
                      {event.max_team_size === 1 ? "solo" : "members"}
                    </span>
                  </div>
                  <div>
                    Fee:{" "}
                    <span className="text-cyan-400 font-bold">
                      {event.entry_fee === 0 ? "Free" : `₹${event.entry_fee}`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-xl bg-slate-900/40 border border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              No events found for this track.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
