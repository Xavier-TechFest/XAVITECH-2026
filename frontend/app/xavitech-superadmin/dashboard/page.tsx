"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdmin } from "@/context/AdminContext";
import { AdminDashboardStats } from "@/lib/api";

export default function AdminDashboardPage() {
  const { admin, dashboardStats, getDashboardStats } = useAdmin();
  const [stats, setStats] = useState<AdminDashboardStats | null>(dashboardStats);
  const [isLoadingStats, setIsLoadingStats] = useState(!dashboardStats);
  const [isSyncing, setIsSyncing] = useState(false);

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

  const handleSyncData = async () => {
    setIsSyncing(true);
    try {
      const data = await getDashboardStats(true);
      if (data) {
        setStats(data);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-neutral-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#35e0c9]/30 bg-[#35e0c9]/10 text-[#35e0c9] text-xs font-mono uppercase tracking-widest mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#35e0c9]" />
            Live Database Metrics
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-mono uppercase tracking-tight text-white">
            Festival Operations Console
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Real-time registration, participant, and team telemetry across all 13 events
          </p>
        </div>

        {/* Actions: View Registrations + Sync Live Data */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <Link
            href="/xavitech-superadmin/registrations"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#35e0c9] hover:bg-[#2bc4b0] text-black font-bold text-xs font-mono uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-[#35e0c9]/20"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            <span>View Registrations</span>
          </Link>

          <button
            type="button"
            onClick={handleSyncData}
            disabled={isSyncing || isLoadingStats}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-mono uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 bg-neutral-900/90 border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white"
          >
            <svg
              className={`w-3.5 h-3.5 text-[#35e0c9] ${isSyncing ? "animate-spin" : ""}`}
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
            <span>{isSyncing ? "Syncing..." : "Sync Live Data"}</span>
          </button>
        </div>
      </div>

      {/* Overview Stats Cards (6 Distinct Telemetry Panels) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* 1. Total Registrations (All Statuses) */}
        <div className="bg-[#0e131f]/90 border border-neutral-800/80 rounded-2xl p-5 sm:p-6 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                Total Registrations
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-300">
                All Statuses
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              {isLoadingStats ? (
                <span className="text-2xl font-mono text-neutral-500 animate-pulse">...</span>
              ) : (
                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
                  {stats ? stats.totalRegistrations : 0}
                </span>
              )}
              <span className="text-xs text-neutral-500 font-mono">records submitted</span>
            </div>
            <p className="text-[11px] text-neutral-500 font-mono mt-1">
              Includes confirmed, pending, draft & cancelled
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-dashed border-neutral-800/80 flex items-center justify-between">
            <span className="text-[11px] font-mono text-emerald-400 font-semibold">
              {stats?.confirmedRegistrations ?? 0} Confirmed
            </span>
            <span className="text-[11px] font-mono text-amber-400 font-semibold">
              {stats?.paymentPendingRegistrations ?? 0} Pending
            </span>
            <Link
              href="/xavitech-superadmin/registrations"
              className="text-xs text-[#35e0c9] hover:underline font-mono ml-2"
            >
              All →
            </Link>
          </div>
        </div>

        {/* 2. Confirmed Registrations */}
        <div className="bg-[#0e131f]/90 border border-emerald-900/40 rounded-2xl p-5 sm:p-6 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400/90">
                Confirmed Registrations
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              {isLoadingStats ? (
                <span className="text-2xl font-mono text-neutral-500 animate-pulse">...</span>
              ) : (
                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400">
                  {stats ? (stats.confirmedRegistrations ?? 0) : 0}
                </span>
              )}
              <span className="text-xs text-neutral-500 font-mono">verified paid</span>
            </div>
            <p className="text-[11px] text-neutral-400 font-mono mt-1">
              Successfully paid & confirmed fest entries
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-dashed border-emerald-950 flex items-center justify-between">
            <span className="text-[11px] font-mono text-emerald-400/80">
              Official fest admissions
            </span>
            <Link
              href="/xavitech-superadmin/registrations?status=CONFIRMED"
              className="text-xs text-emerald-400 hover:underline font-mono"
            >
              View confirmed →
            </Link>
          </div>
        </div>

        {/* 3. Pending Payment Registrations */}
        <div className="bg-[#0e131f]/90 border border-amber-900/40 rounded-2xl p-5 sm:p-6 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400/90">
                Pending Payment Registrations
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              {isLoadingStats ? (
                <span className="text-2xl font-mono text-neutral-500 animate-pulse">...</span>
              ) : (
                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-amber-400">
                  {stats ? (stats.paymentPendingRegistrations ?? 0) : 0}
                </span>
              )}
              <span className="text-xs text-neutral-500 font-mono">awaiting payment</span>
            </div>
            <p className="text-[11px] text-neutral-400 font-mono mt-1">
              Awaiting Easebuzz gateway payment completion
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-dashed border-amber-950 flex items-center justify-between">
            <span className="text-[11px] font-mono text-amber-400/80">
              Not yet confirmed or admitted
            </span>
            <Link
              href="/xavitech-superadmin/registrations?status=PAYMENT_PENDING"
              className="text-xs text-amber-400 hover:underline font-mono"
            >
              View pending →
            </Link>
          </div>
        </div>

        {/* 4. Confirmed Participants */}
        <div className="bg-[#0e131f]/90 border border-emerald-900/40 rounded-2xl p-5 sm:p-6 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400/90">
                Total Confirmed Participants
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                Verified
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              {isLoadingStats ? (
                <span className="text-2xl font-mono text-neutral-500 animate-pulse">...</span>
              ) : (
                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400">
                  {stats ? (stats.confirmedParticipants ?? stats.totalConfirmedParticipants ?? 0) : 0}
                </span>
              )}
              <span className="text-xs text-neutral-500 font-mono">delegates</span>
            </div>
            <p className="text-[11px] text-neutral-400 font-mono mt-1">
              Only participants in confirmed registrations
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-dashed border-emerald-950 flex items-center justify-between">
            <span className="text-[11px] font-mono text-neutral-400">
              Zero unpaid entries included
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              Authoritative
            </span>
          </div>
        </div>

        {/* 5. Pending Participants */}
        <div className="bg-[#0e131f]/90 border border-amber-900/40 rounded-2xl p-5 sm:p-6 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400/90">
                Total Pending Participants
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950/60 text-amber-400 border border-amber-800/40">
                Awaiting
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              {isLoadingStats ? (
                <span className="text-2xl font-mono text-neutral-500 animate-pulse">...</span>
              ) : (
                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-amber-400">
                  {stats ? (stats.pendingParticipants ?? stats.totalPendingParticipants ?? 0) : 0}
                </span>
              )}
              <span className="text-xs text-neutral-500 font-mono">individuals</span>
            </div>
            <p className="text-[11px] text-neutral-400 font-mono mt-1">
              Participants in awaiting-payment registrations
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-dashed border-amber-950 flex items-center justify-between">
            <span className="text-[11px] font-mono text-neutral-400">
              Total registered individuals: {stats?.totalParticipants ?? 0}
            </span>
            <span className="text-xs font-mono text-amber-400 font-bold">
              Pending
            </span>
          </div>
        </div>

        {/* 6. Total Teams */}
        <div className="bg-[#0e131f]/90 border border-neutral-800/80 rounded-2xl p-5 sm:p-6 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                Total Registered Teams
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950/60 text-purple-400 border border-purple-800/40">
                Squads
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              {isLoadingStats ? (
                <span className="text-2xl font-mono text-neutral-500 animate-pulse">...</span>
              ) : (
                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-[#35e0c9]">
                  {stats ? stats.totalTeams : 0}
                </span>
              )}
              <span className="text-xs text-neutral-500 font-mono">unique squads</span>
            </div>
            <p className="text-[11px] text-neutral-500 font-mono mt-1">
              Unique team registrations without leader/member duplication
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-dashed border-neutral-800/80 flex items-center justify-between">
            <span className="text-[11px] font-mono text-emerald-400 font-semibold">
              {stats?.confirmedTeams ?? 0} Confirmed
            </span>
            <span className="text-[11px] font-mono text-amber-400 font-semibold">
              {stats?.pendingTeams ?? 0} Pending
            </span>
            <Link
              href="/xavitech-superadmin/registrations?participationType=TEAM"
              className="text-xs text-[#35e0c9] hover:underline font-mono"
            >
              View teams →
            </Link>
          </div>
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
                Authoritative Metrics Breakdown
              </span>
              <span className="text-[11px] text-neutral-500 font-mono">Live PostgreSQL Aggregates</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <span className="text-[10px] font-mono uppercase text-emerald-400/80 block">Confirmed Regs</span>
                <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">
                  {stats.confirmedRegistrations ?? 0}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <span className="text-[10px] font-mono uppercase text-amber-400/80 block">Pending Regs</span>
                <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block">
                  {stats.paymentPendingRegistrations ?? 0}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <span className="text-[10px] font-mono uppercase text-emerald-400/80 block">Confirmed Attendees</span>
                <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">
                  {stats.confirmedParticipants ?? stats.totalConfirmedParticipants ?? 0}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <span className="text-[10px] font-mono uppercase text-amber-400/80 block">Pending Attendees</span>
                <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block">
                  {stats.pendingParticipants ?? stats.totalPendingParticipants ?? 0}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20">
                <span className="text-[10px] font-mono uppercase text-purple-400/80 block">Confirmed Teams</span>
                <span className="text-2xl font-bold font-mono text-purple-400 mt-1 block">
                  {stats.confirmedTeams ?? 0}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20">
                <span className="text-[10px] font-mono uppercase text-purple-400/80 block">Pending Teams</span>
                <span className="text-2xl font-bold font-mono text-purple-400 mt-1 block">
                  {stats.pendingTeams ?? 0}
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
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                        {tr.confirmedCount ?? 0} Confirmed
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
                        {tr.pendingCount ?? 0} Pending
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-[#35e0c9]/10 text-[#35e0c9] border border-[#35e0c9]/30 font-bold">
                        {tr.count} total
                      </span>
                    </div>
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
