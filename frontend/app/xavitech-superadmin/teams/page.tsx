"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  adminGetMe,
  adminGetTeams,
  adminGetEvents,
  AdminProfile,
  AdminTeamListItem,
  PaginationMeta,
} from "@/lib/api";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminTeamsPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Search & Filter states
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [page, setPage] = useState(1);
  const limit = 15;

  // Data states
  const [teams, setTeams] = useState<AdminTeamListItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 15,
    totalRecords: 0,
    totalPages: 1,
  });
  const [events, setEvents] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Verify Admin Session
  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const profile = await adminGetMe();
        if (isMounted) {
          setAdmin(profile);
          setIsLoadingAuth(false);
        }
      } catch (err) {
        router.replace("/xavitech-superadmin");
      }
    }
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, [router]);

  // Load Events dropdown
  useEffect(() => {
    async function loadEvents() {
      const evs = await adminGetEvents();
      setEvents(evs);
    }
    loadEvents();
  }, []);

  // Fetch Teams
  const fetchTeams = useCallback(async () => {
    setIsLoadingData(true);
    setErrorMsg(null);
    try {
      const data = await adminGetTeams({
        page,
        limit,
        search: appliedSearch,
        eventId: selectedEventId,
        status: selectedStatus,
      });
      setTeams(data.teams);
      setPagination(data.pagination);
    } catch (err: any) {
      console.error("Error fetching teams:", err);
      setErrorMsg(err.message || "Failed to load teams.");
    } finally {
      setIsLoadingData(false);
    }
  }, [page, limit, appliedSearch, selectedEventId, selectedStatus]);

  useEffect(() => {
    if (!isLoadingAuth) {
      fetchTeams();
    }
  }, [isLoadingAuth, fetchTeams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setAppliedSearch(search.trim());
  };

  const handleClearFilters = () => {
    setSearch("");
    setAppliedSearch("");
    setSelectedEventId("");
    setSelectedStatus("");
    setPage(1);
  };

  if (isLoadingAuth) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#080b11] text-white">
        <div className="flex items-center gap-3 text-sm text-neutral-400 font-mono">
          <svg className="animate-spin h-5 w-5 text-[#35e0c9]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Verifying administrator privileges...</span>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#080b11] text-white flex flex-col">
      <AdminHeader admin={admin} />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black font-mono uppercase tracking-tight">
              Team Management
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Inspect team rosters, leaders, squad sizes, and registration links
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono text-neutral-400 block">Total Teams in System</span>
            <span className="text-lg font-bold font-mono text-[#35e0c9]">{pagination.totalRecords}</span>
          </div>
        </div>

        {/* Filter & Search Bar Card */}
        <div className="bg-[#0e131f]/90 border border-neutral-800 rounded-2xl p-4 sm:p-6 mb-6 backdrop-blur-xl">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            {/* Search Input Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by Team Name, Leader Name, or Leader Email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#131929] border border-neutral-700/80 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#35e0c9] focus:ring-1 focus:ring-[#35e0c9] transition"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#35e0c9] hover:bg-[#2bc4b0] text-black font-semibold rounded-xl text-xs font-mono uppercase tracking-wider transition cursor-pointer"
                >
                  Search
                </button>
                {(appliedSearch || selectedEventId || selectedStatus) && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-mono transition cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-800/80">
              {/* Event Filter */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                  Filter by Event
                </label>
                <select
                  value={selectedEventId}
                  onChange={(e) => {
                    setSelectedEventId(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 bg-[#131929] border border-neutral-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-[#35e0c9]"
                >
                  <option value="">All Events</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                  Team Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 bg-[#131929] border border-neutral-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-[#35e0c9]"
                >
                  <option value="">All Statuses</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
            {errorMsg}
          </div>
        )}

        {/* Teams Table Card */}
        <div className="bg-[#0e131f]/90 border border-neutral-800 rounded-2xl overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 bg-[#131929]/60 text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                  <th className="py-3.5 px-4 sm:px-6">Team Name</th>
                  <th className="py-3.5 px-4">Event</th>
                  <th className="py-3.5 px-4">Team Leader</th>
                  <th className="py-3.5 px-4">Institution</th>
                  <th className="py-3.5 px-4">Squad Size</th>
                  <th className="py-3.5 px-4">Associated Registration</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-xs">
                {isLoadingData ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-neutral-400 font-mono">
                      <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-[#35e0c9]" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Querying teams database...</span>
                      </div>
                    </td>
                  </tr>
                ) : teams.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-neutral-400 font-mono">
                      No teams registered yet matching the specified query.
                    </td>
                  </tr>
                ) : (
                  teams.map((team) => (
                    <tr key={team.id} className="hover:bg-[#131929]/40 transition">
                      <td className="py-4 px-4 sm:px-6 font-mono font-bold text-white">
                        <Link
                          href={`/xavitech-superadmin/teams/view?teamId=${team.id}`}
                          className="text-[#35e0c9] hover:underline"
                        >
                          {team.teamName}
                        </Link>
                      </td>
                      <td className="py-4 px-4 text-white font-medium max-w-[180px] truncate">
                        {team.event?.name || "—"}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-white">{team.leader?.name || "Leader"}</div>
                        <div className="text-[11px] text-neutral-400 font-mono truncate max-w-[160px]">
                          {team.leader?.email || "—"}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-neutral-300 max-w-[140px] truncate">
                        {team.leader?.institution || "—"}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-mono font-semibold text-white">
                          {team.totalTeamSize} members
                        </span>
                        <span className="text-[10px] text-neutral-400 block font-mono">
                          (1 Leader + {team.memberCount} Members)
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {team.registration ? (
                          <Link
                            href={`/xavitech-superadmin/registrations/view?registrationId=${team.registration.registrationId}`}
                            className="font-mono text-xs text-[#35e0c9] hover:underline font-semibold"
                          >
                            {team.registration.registrationId}
                          </Link>
                        ) : (
                          <span className="text-neutral-500 font-mono text-[11px]">Unregistered draft</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                            team.status === "SUBMITTED"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : team.status === "CANCELLED"
                              ? "bg-red-500/10 text-red-400 border-red-500/30"
                              : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                          }`}
                        >
                          {team.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-[11px] text-neutral-400 font-mono whitespace-nowrap">
                        {team.createdAt ? new Date(team.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link
                          href={`/xavitech-superadmin/teams/view?teamId=${team.id}`}
                          className="px-2.5 py-1 bg-neutral-800 hover:bg-[#35e0c9] hover:text-black text-neutral-300 rounded-lg text-xs font-mono transition"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-neutral-800 gap-3 text-xs font-mono">
            <span className="text-neutral-400">
              Showing page <strong className="text-white">{pagination.page}</strong> of{" "}
              <strong className="text-white">{pagination.totalPages}</strong> ({pagination.totalRecords} total teams)
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1 || isLoadingData}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page >= pagination.totalPages || isLoadingData}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
