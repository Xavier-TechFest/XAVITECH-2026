"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdmin } from "@/context/AdminContext";
import { AdminDashboardStats } from "@/lib/api";

export default function AdminDashboardPage() {
  const { admin, dashboardStats, getDashboardStats } = useAdmin();
  const [stats, setStats] = useState<AdminDashboardStats | null>(dashboardStats);
  const [isLoadingStats, setIsLoadingStats] = useState(!dashboardStats);

  useEffect(() => {
    let isMounted = true;

    // Use cached stats if available; otherwise fetch once
    if (dashboardStats) {
      setStats(dashboardStats);
      setIsLoadingStats(false);
    } else {
      getDashboardStats().then((data) => {
        if (isMounted) {
          setStats(data);
          setIsLoadingStats(false);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [dashboardStats, getDashboardStats]);

  return (
    <div className="p-4 sm:p-8 max-w-7xl w-full mx-auto">
      {/* Section Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#35e0c9]/30 bg-[#35e0c9]/10 text-[#35e0c9] text-xs font-mono uppercase tracking-widest mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#35e0c9]" />
          Live Database Metrics
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-mono uppercase tracking-tight">
          Festival Operations Console
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Real-time registration, participant, and team telemetry
        </p>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
        {/* Total Registrations */}
        <div className="bg-[#0e131f]/90 border border-neutral-800/80 rounded-2xl p-5 sm:p-6 backdrop-blur-xl">
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block mb-2">
            Total Registrations
          </span>
          <div className="flex items-baseline gap-2">
            {isLoadingStats ? (
              <span className="text-2xl font-mono text-neutral-500 animate-pulse">...</span>
            ) : (
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
                {stats ? stats.totalRegistrations : 0}
              </span>
            )}
            <span className="text-xs text-neutral-500 font-mono">records</span>
          </div>
          <Link
            href="/xavitech-superadmin/registrations"
            className="mt-4 inline-flex items-center gap-1 text-xs text-[#35e0c9] hover:underline font-mono"
          >
            <span>View all registrations</span>
            <span>→</span>
          </Link>
        </div>

        {/* Total Participants */}
        <div className="bg-[#0e131f]/90 border border-neutral-800/80 rounded-2xl p-5 sm:p-6 backdrop-blur-xl">
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block mb-2">
            Total Participants
          </span>
          <div className="flex items-baseline gap-2">
            {isLoadingStats ? (
              <span className="text-2xl font-mono text-neutral-500 animate-pulse">...</span>
            ) : (
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
                {stats ? stats.totalParticipants : 0}
              </span>
            )}
            <span className="text-xs text-neutral-500 font-mono">individuals</span>
          </div>
          <p className="mt-4 text-[11px] text-neutral-500 font-mono">
            Individual + team members
          </p>
        </div>

        {/* Total Teams */}
        <div className="bg-[#0e131f]/90 border border-neutral-800/80 rounded-2xl p-5 sm:p-6 backdrop-blur-xl">
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block mb-2">
            Total Teams
          </span>
          <div className="flex items-baseline gap-2">
            {isLoadingStats ? (
              <span className="text-2xl font-mono text-neutral-500 animate-pulse">...</span>
            ) : (
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
                {stats ? stats.totalTeams : 0}
              </span>
            )}
            <span className="text-xs text-neutral-500 font-mono">squads</span>
          </div>
          <Link
            href="/xavitech-superadmin/registrations?participationType=TEAM"
            className="mt-4 inline-flex items-center gap-1 text-xs text-[#35e0c9] hover:underline font-mono"
          >
            <span>View all teams</span>
            <span>→</span>
          </Link>
        </div>

        {/* Active Events */}
        <div className="bg-[#0e131f]/90 border border-neutral-800/80 rounded-2xl p-5 sm:p-6 backdrop-blur-xl">
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block mb-2">
            Active Events
          </span>
          <div className="flex items-baseline gap-2">
            {isLoadingStats ? (
              <span className="text-2xl font-mono text-neutral-500 animate-pulse">...</span>
            ) : (
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400">
                {stats ? stats.activeEvents : 0}
              </span>
            )}
            <span className="text-xs text-neutral-500 font-mono">events</span>
          </div>
          <p className="mt-4 text-[11px] text-neutral-500 font-mono">
            13 official fest events
          </p>
        </div>
      </div>

      {/* Live Status Distributions & Track Breakdowns */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Registration Status Breakdown */}
          <div className="bg-[#0e131f]/90 border border-neutral-800/80 rounded-2xl p-6 backdrop-blur-xl">
            <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#35e0c9]" />
                Registration Status Distribution
              </span>
              <span className="text-[11px] text-neutral-500 font-mono">Live PostgreSQL Aggregates</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <span className="text-[10px] font-mono uppercase text-emerald-400/80 block">Confirmed</span>
                <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">
                  {stats.confirmedRegistrations ?? 0}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <span className="text-[10px] font-mono uppercase text-amber-400/80 block">Pay Pending</span>
                <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block">
                  {stats.paymentPendingRegistrations ?? 0}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20">
                <span className="text-[10px] font-mono uppercase text-blue-400/80 block">Draft / In Progress</span>
                <span className="text-2xl font-bold font-mono text-blue-400 mt-1 block">
                  {stats.pendingRegistrations ?? 0}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                <span className="text-[10px] font-mono uppercase text-red-400/80 block">Cancelled / Failed</span>
                <span className="text-2xl font-bold font-mono text-red-400 mt-1 block">
                  {stats.failedOrCancelledRegistrations ?? 0}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20">
                <span className="text-[10px] font-mono uppercase text-purple-400/80 block">Total Teams</span>
                <span className="text-2xl font-bold font-mono text-purple-400 mt-1 block">
                  {stats.totalTeams ?? 0}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-teal-500/5 border border-teal-500/20">
                <span className="text-[10px] font-mono uppercase text-teal-400/80 block">Total Attendees</span>
                <span className="text-2xl font-bold font-mono text-[#35e0c9] mt-1 block">
                  {stats.totalParticipants ?? 0}
                </span>
              </div>
            </div>
          </div>

          {/* Track-Wise Distribution */}
          <div className="bg-[#0e131f]/90 border border-neutral-800/80 rounded-2xl p-6 backdrop-blur-xl">
            <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                Track-Wise Registrations
              </span>
              <Link href="/xavitech-superadmin/registrations" className="text-[11px] text-[#35e0c9] font-mono hover:underline">
                View All →
              </Link>
            </h2>

            <div className="space-y-2">
              {stats.trackCounts && stats.trackCounts.length > 0 ? (
                stats.trackCounts.map((tr) => (
                  <div
                    key={tr.trackId}
                    className="p-2.5 rounded-xl bg-[#131929]/50 border border-neutral-800 flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <span className="text-white font-semibold">{tr.name}</span>
                      <span className="text-neutral-500 text-[10px] block">{tr.slug}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#35e0c9]/10 text-[#35e0c9] border border-[#35e0c9]/30 font-bold">
                      {tr.count} records
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs font-mono text-neutral-500 text-center py-4">No track data recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Identity & Session Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Admin Identity Card */}
        <div className="bg-[#0e131f]/90 border border-neutral-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xl">
          <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#35e0c9]" />
            Administrator Identity
          </h2>

          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 block">
                Coordinator Name
              </span>
              <p className="text-lg font-bold text-white mt-0.5">
                Welcome, {admin?.name || "Administrator"}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 block">
                Coordinator Email
              </span>
              <p className="text-sm font-mono text-[#35e0c9] mt-0.5">
                {admin?.email || "admin@college.edu"}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 block">
                System Role
              </span>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#35e0c9]/10 text-[#35e0c9] border border-[#35e0c9]/30 mt-1">
                {admin?.role || "ADMIN"}
              </span>
            </div>
          </div>
        </div>

        {/* Concurrent Session Details Card */}
        <div className="bg-[#0e131f]/90 border border-neutral-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xl">
          <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Concurrent Session Status
          </h2>

          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 block">
                Current Session Identifier
              </span>
              <p className="text-xs font-mono text-neutral-300 mt-0.5 truncate">
                {admin?.sessionId || "Active Authenticated Session"}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 block">
                Multi-Device State
              </span>
              <p className="text-sm text-neutral-300 mt-0.5">
                Active simultaneous sessions supported. Logging out here invalidates only this device.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
