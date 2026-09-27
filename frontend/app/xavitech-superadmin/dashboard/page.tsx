"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  adminGetMe,
  adminGetDashboardStats,
  AdminProfile,
  AdminDashboardStats,
} from "@/lib/api";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        const [profile, liveStats] = await Promise.all([
          adminGetMe(),
          adminGetDashboardStats().catch((err) => {
            console.error("Error loading stats:", err);
            return null;
          }),
        ]);

        if (isMounted) {
          setAdmin(profile);
          setStats(liveStats);
          setIsLoading(false);
        }
      } catch (err) {
        // If not authenticated or not an admin, immediately redirect to login
        router.replace("/xavitech-superadmin");
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#080b11] text-white">
        <div className="flex items-center gap-3 text-sm text-neutral-400 font-mono">
          <svg
            className="animate-spin h-5 w-5 text-[#35e0c9]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading admin overview...</span>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#080b11] text-white flex flex-col">
      <AdminHeader admin={admin} />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto relative overflow-hidden">
        {/* Background Ambience Glow */}
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#35e0c9]/10 rounded-full blur-3xl pointer-events-none" />

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
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
                {stats ? stats.totalRegistrations : 0}
              </span>
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
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
                {stats ? stats.totalParticipants : 0}
              </span>
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
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
                {stats ? stats.totalTeams : 0}
              </span>
              <span className="text-xs text-neutral-500 font-mono">squads</span>
            </div>
            <Link
              href="/xavitech-superadmin/teams"
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
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400">
                {stats ? stats.activeEvents : 0}
              </span>
              <span className="text-xs text-neutral-500 font-mono">events</span>
            </div>
            <p className="mt-4 text-[11px] text-neutral-500 font-mono">
              13 official fest events
            </p>
          </div>
        </div>

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
                  {admin?.email}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 block">
                  System Role
                </span>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#35e0c9]/10 text-[#35e0c9] border border-[#35e0c9]/30 mt-1">
                  {admin?.role}
                </span>
              </div>
            </div>
          </div>

          {/* Concurrent Session Details */}
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

              <div className="pt-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 block">
                  Console Scope
                </span>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Phase 7 Live: Real registration and team query engines enabled. Payment module remains frozen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
