"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useTrackLeader } from "@/context/TrackLeaderContext";
import ModalPortal from "@/components/ui/ModalPortal";
import {
  api,
  AdminRegistrationListItem,
  AdminRegistrationDetail,
} from "@/lib/api";
import ExportModal from "@/components/export/ExportModal";

export default function TrackLeaderRegistrationsPage() {
  const {
    trackLeader,
    loading,
    assignedTrack,
    events,
    theme,
    registrations: cachedRegistrations,
    registrationsLoading,
    registrationsRefreshing,
    registrationsError,
    registrationsLoaded,
    refreshRegistrations,
  } = useTrackLeader();
  const isLight = theme === "light";

  // Export Modal state
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Filter & Search states (pure client-side)
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [page, setPage] = useState(1);
  const limit = 15;

  // Modal inspection states (read-only)
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [selectedRegId, setSelectedRegId] = useState<string | null>(null);
  const [inspectDetail, setInspectDetail] = useState<AdminRegistrationDetail | null>(null);
  const [isInspectLoading, setIsInspectLoading] = useState(false);
  const [inspectError, setInspectError] = useState<string | null>(null);

  // Initial load: fetch once if not yet loaded in context
  useEffect(() => {
    if (!registrationsLoaded && !registrationsLoading) {
      refreshRegistrations(false);
    }
  }, [registrationsLoaded, registrationsLoading, refreshRegistrations]);

  // Client-side filtering on cached registration dataset
  const filteredRegistrations = useMemo(() => {
    let list = cachedRegistrations || [];

    // Filter by Event
    if (selectedEventId) {
      list = list.filter((r) => {
        const evId = r.event?.id || (r as any).eventId;
        return evId === selectedEventId;
      });
    }

    // Filter by Participation Type
    if (selectedType) {
      const typeUpper = selectedType.toUpperCase();
      list = list.filter((r) => (r.registrationType || "").toUpperCase() === typeUpper);
    }

    // Filter by Registration Status
    if (selectedStatus) {
      const statusUpper = selectedStatus.toUpperCase();
      list = list.filter((r) => (r.status || "").toUpperCase() === statusUpper);
    }

    // Filter by Search Query
    if (appliedSearch) {
      const q = appliedSearch.toLowerCase().trim();
      list = list.filter((r) => {
        const regId = (r.registrationId || r.id || "").toLowerCase();
        const userName = (r.user?.name || "").toLowerCase();
        const userEmail = (r.user?.email || "").toLowerCase();
        const teamName = (r.team?.teamName || "").toLowerCase();
        const eventName = (r.event?.name || "").toLowerCase();
        const institution = (r.user?.institution || "").toLowerCase();
        return (
          regId.includes(q) ||
          userName.includes(q) ||
          userEmail.includes(q) ||
          teamName.includes(q) ||
          eventName.includes(q) ||
          institution.includes(q)
        );
      });
    }

    return list;
  }, [cachedRegistrations, selectedEventId, selectedType, selectedStatus, appliedSearch]);

  // Client-side pagination metrics
  const totalRecords = filteredRegistrations.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / limit));
  const safePage = Math.min(page, totalPages);

  const paginatedRegistrations = useMemo(() => {
    const start = (safePage - 1) * limit;
    return filteredRegistrations.slice(start, start + limit);
  }, [filteredRegistrations, safePage, limit]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setAppliedSearch(search.trim());
  };

  const handleEventChange = (newEventId: string) => {
    setSelectedEventId(newEventId);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setAppliedSearch("");
    setSelectedEventId("");
    setSelectedType("");
    setSelectedStatus("");
    setPage(1);
  };

  // Open Details Modal
  const openInspectModal = async (registrationId: string) => {
    setSelectedRegId(registrationId);
    setInspectModalOpen(true);
    setIsInspectLoading(true);
    setInspectError(null);
    setInspectDetail(null);

    try {
      const details = await api.trackLeaderGetRegistrationDetails(registrationId);
      setInspectDetail(details);
    } catch (err: any) {
      console.error("Error loading registration inspection details:", err);
      setInspectError(err.message || "Failed to load registration details.");
    } finally {
      setIsInspectLoading(false);
    }
  };

  const closeInspectModal = () => {
    setInspectModalOpen(false);
    setSelectedRegId(null);
    setInspectDetail(null);
    setInspectError(null);
  };

  if (loading || !trackLeader) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-2 border-[#35e0c9]/20 border-t-[#35e0c9] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
      {/* 1. Top Header Banner with Contextual Track Indicator */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b ${
        isLight ? "border-slate-200" : "border-neutral-800/80"
      }`}>
        <div>
          {/* Strict Track Isolation Indicator (NO track dropdown) */}
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono uppercase tracking-wider mb-2 font-semibold ${
              isLight
                ? "bg-teal-50 border-teal-200 text-teal-800"
                : "bg-[#35e0c9]/10 border-[#35e0c9]/30 text-[#35e0c9]"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isLight ? "bg-teal-600" : "bg-[#35e0c9]"
              }`}
            />
            {assignedTrack
              ? `Showing registrations for: ${assignedTrack.name}`
              : "Track Registrations Console"}
          </div>

          <h1
            className={`text-2xl sm:text-3xl font-black font-mono uppercase tracking-tight ${
              isLight ? "text-slate-900" : "text-white"
            }`}
          >
            Registration Management
          </h1>
          <p
            className={`text-xs sm:text-sm mt-1 ${
              isLight ? "text-slate-600" : "text-neutral-400"
            }`}
          >
            Search, filter, and inspect registrations strictly belonging to{" "}
            <span className={isLight ? "text-slate-900 font-semibold" : "text-neutral-200 font-semibold"}>
              {assignedTrack ? assignedTrack.name : "your assigned track"}
            </span>
          </p>
        </div>

        {/* Total Records Counter & Refresh Button */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => refreshRegistrations(true)}
            disabled={registrationsLoading || registrationsRefreshing}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-mono uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 ${
              isLight
                ? "bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-sm"
                : "bg-neutral-900/90 border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white"
            }`}
            title="Refresh track registrations from server"
          >
            <svg
              className={`w-3.5 h-3.5 ${isLight ? "text-teal-600" : "text-[#35e0c9]"} ${
                registrationsRefreshing ? "animate-spin" : ""
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
            <span>{registrationsRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>

          <button
            type="button"
            onClick={() => setExportModalOpen(true)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer shadow-sm ${
              isLight
                ? "bg-teal-50 hover:bg-teal-100 border-teal-300 text-teal-800 shadow-teal-100"
                : "bg-[#35e0c9]/10 hover:bg-[#35e0c9]/20 border-[#35e0c9]/40 hover:border-[#35e0c9] text-[#35e0c9] shadow-[#35e0c9]/10"
            }`}
            title="Configure and Export Track Registrations"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export</span>
          </button>

          <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center">
            <span
              className={`text-xs font-mono block ${
                isLight ? "text-slate-600" : "text-neutral-400"
              }`}
            >
              Track Records
            </span>
            <span
              className={`text-xl sm:text-2xl font-bold font-mono ${
                isLight ? "text-teal-700" : "text-[#35e0c9]"
              }`}
            >
              {!registrationsLoaded && registrationsLoading ? "—" : totalRecords}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Filter & Search Bar Card */}
      <div
        className={`border rounded-2xl p-4 sm:p-6 backdrop-blur-xl transition-all shadow-xl ${
          isLight
            ? "bg-white border-slate-200 shadow-slate-200/50"
            : "bg-[#0e131f]/90 border-neutral-800 shadow-black/20"
        }`}
      >
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          {/* Search Input Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by Registration ID (e.g. XVT-), Registrant Name, Email, or Team Name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm transition focus:outline-none ${
                  isLight
                    ? "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                    : "bg-[#131929] border-neutral-700/80 text-white placeholder-neutral-500 focus:border-[#35e0c9] focus:ring-1 focus:ring-[#35e0c9]"
                }`}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#35e0c9] hover:bg-[#2bc4b0] text-black font-bold rounded-xl text-xs font-mono uppercase tracking-wider transition cursor-pointer shadow-md shadow-[#35e0c9]/15"
              >
                Search
              </button>
              {(appliedSearch || selectedEventId || selectedType || selectedStatus) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className={`px-4 py-2.5 rounded-xl text-xs font-mono transition cursor-pointer border ${
                    isLight
                      ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700"
                      : "bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300"
                  }`}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Filters Row: Strict Cascading Events for Assigned Track + Type + Status */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t ${
              isLight ? "border-slate-200" : "border-neutral-800/80"
            }`}
          >
            {/* Filter by Event (Populated ONLY with events from the assigned track) */}
            <div>
              <label
                className={`block text-[11px] font-mono uppercase font-semibold mb-1.5 ${
                  isLight ? "text-slate-600" : "text-neutral-400"
                }`}
              >
                Filter by Event ({events.length})
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => handleEventChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-xl text-xs transition focus:outline-none ${
                  isLight
                    ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-teal-600"
                    : "bg-[#131929] border-neutral-700/80 text-white focus:border-[#35e0c9]"
                }`}
              >
                <option value="">All Track Events ({events.length})</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title || ev.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Participation Type Filter */}
            <div>
              <label
                className={`block text-[11px] font-mono uppercase font-semibold mb-1.5 ${
                  isLight ? "text-slate-600" : "text-neutral-400"
                }`}
              >
                Participation Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setPage(1);
                }}
                className={`w-full px-3 py-2 border rounded-xl text-xs transition focus:outline-none ${
                  isLight
                    ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-teal-600"
                    : "bg-[#131929] border-neutral-700/80 text-white focus:border-[#35e0c9]"
                }`}
              >
                <option value="">All Types</option>
                <option value="INDIVIDUAL">INDIVIDUAL</option>
                <option value="TEAM">TEAM</option>
              </select>
            </div>

            {/* Registration Status Filter */}
            <div>
              <label
                className={`block text-[11px] font-mono uppercase font-semibold mb-1.5 ${
                  isLight ? "text-slate-600" : "text-neutral-400"
                }`}
              >
                Registration Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                className={`w-full px-3 py-2 border rounded-xl text-xs transition focus:outline-none ${
                  isLight
                    ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-teal-600"
                    : "bg-[#131929] border-neutral-700/80 text-white focus:border-[#35e0c9]"
                }`}
              >
                <option value="">All Statuses</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="PAYMENT_PENDING">PAYMENT_PENDING</option>
                <option value="DRAFT">DRAFT</option>
                <option value="PAYMENT_SUCCESS">PAYMENT_SUCCESS</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* Error Alert */}
      {registrationsError && (
        <div
          className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs font-mono ${
            isLight
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-rose-950/40 border-rose-800/60 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 shrink-0 text-rose-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>{registrationsError}</span>
          </div>
          <button
            type="button"
            onClick={() => refreshRegistrations(true)}
            className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-xs font-mono font-bold uppercase tracking-wider transition cursor-pointer self-start sm:self-auto"
          >
            Retry
          </button>
        </div>
      )}

      {/* 3. Registrations Table Card */}
      <div
        className={`border rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl ${
          isLight
            ? "bg-white border-slate-200 shadow-slate-200/50"
            : "bg-[#0e131f]/90 border-neutral-800 shadow-black/20"
        }`}
      >
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className={`border-b text-[11px] font-mono uppercase tracking-wider ${
                  isLight
                    ? "border-slate-200 bg-slate-50 text-slate-600"
                    : "border-neutral-800 bg-[#131929]/60 text-neutral-400"
                }`}
              >
                <th className="py-3.5 px-4 sm:px-6">Registration ID</th>
                <th className="py-3.5 px-4">Event</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Leader / Registrant</th>
                <th className="py-3.5 px-4">Institution</th>
                <th className="py-3.5 px-4">Team</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-[11px]">Registered Date</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y text-xs ${
                isLight ? "divide-slate-200" : "divide-neutral-800/60"
              }`}
            >
              {!registrationsLoaded && registrationsLoading ? (
                <tr>
                  <td
                    colSpan={9}
                    className={`py-12 text-center font-mono ${
                      isLight ? "text-slate-500" : "text-neutral-400"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4 text-[#35e0c9]"
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
                      <span>Loading registrations for this track...</span>
                    </div>
                  </td>
                </tr>
              ) : !registrationsLoaded && registrationsError ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-12 text-center font-mono"
                  >
                    <div className="text-red-400 text-xs mb-3">{registrationsError}</div>
                    <button
                      type="button"
                      onClick={() => refreshRegistrations(true)}
                      className="px-4 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-mono font-bold uppercase tracking-wider transition cursor-pointer"
                    >
                      Retry Loading
                    </button>
                  </td>
                </tr>
              ) : paginatedRegistrations.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className={`py-12 text-center font-mono ${
                      isLight ? "text-slate-500" : "text-neutral-400"
                    }`}
                  >
                    {!assignedTrack ? (
                      "No track is currently assigned to your account."
                    ) : (cachedRegistrations || []).length === 0 ? (
                      "No registrations found for your assigned track yet."
                    ) : (
                      <div className="space-y-2">
                        <p>No registrations match the selected filters.</p>
                        <button
                          type="button"
                          onClick={handleClearFilters}
                          className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition cursor-pointer border ${
                            isLight
                              ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700"
                              : "bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300"
                          }`}
                        >
                          Clear Filters
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedRegistrations.map((reg) => (
                  <tr
                    key={reg.id}
                    className={`transition ${
                      isLight ? "hover:bg-slate-50" : "hover:bg-[#131929]/40"
                    }`}
                  >
                    {/* Registration ID */}
                    <td className="py-4 px-4 sm:px-6 font-mono font-semibold">
                      <button
                        type="button"
                        onClick={() => openInspectModal(reg.registrationId || reg.id)}
                        className={`text-left hover:underline cursor-pointer ${
                          isLight ? "text-teal-700" : "text-[#35e0c9]"
                        }`}
                        title="Click to inspect registration details"
                      >
                        {reg.registrationId}
                      </button>
                    </td>

                    {/* Event */}
                    <td
                      className={`py-4 px-4 font-medium max-w-[180px] truncate ${
                        isLight ? "text-slate-900" : "text-white"
                      }`}
                    >
                      {reg.event?.name || "—"}
                    </td>

                    {/* Type Badge */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                          reg.registrationType === "TEAM"
                            ? isLight
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-purple-500/10 text-purple-400 border-purple-500/30"
                            : isLight
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                        }`}
                      >
                        {reg.registrationType}
                      </span>
                    </td>

                    {/* Leader / Registrant */}
                    <td className="py-4 px-4">
                      <div
                        className={`font-medium ${
                          isLight ? "text-slate-900" : "text-white"
                        }`}
                      >
                        {reg.user?.name || "Participant"}
                      </div>
                      <div
                        className={`text-[11px] font-mono truncate max-w-[160px] ${
                          isLight ? "text-slate-500" : "text-neutral-400"
                        }`}
                      >
                        {reg.user?.email || "—"}
                      </div>
                    </td>

                    {/* Institution */}
                    <td
                      className={`py-4 px-4 max-w-[140px] truncate ${
                        isLight ? "text-slate-600" : "text-neutral-300"
                      }`}
                    >
                      {reg.user?.institution || "—"}
                    </td>

                    {/* Team */}
                    <td className="py-4 px-4">
                      {reg.team ? (
                        <div>
                          <span
                            className={`font-semibold ${
                              isLight ? "text-slate-900" : "text-white"
                            }`}
                          >
                            {reg.team.teamName}
                          </span>
                          <span
                            className={`text-[10px] block font-mono ${
                              isLight ? "text-slate-500" : "text-neutral-400"
                            }`}
                          >
                            {reg.team.totalTeamSize} members
                          </span>
                        </div>
                      ) : (
                        <span
                          className={`font-mono ${
                            isLight ? "text-slate-400" : "text-neutral-500"
                          }`}
                        >
                          —
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                          reg.status === "CONFIRMED" || reg.status === "PAYMENT_SUCCESS"
                            ? isLight
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : reg.status === "CANCELLED" || reg.status === "PAYMENT_FAILED"
                            ? isLight
                              ? "bg-rose-50 text-rose-800 border-rose-300"
                              : "bg-red-500/10 text-red-400 border-red-500/30"
                            : isLight
                            ? "bg-amber-50 text-amber-800 border-amber-300"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {reg.status}
                      </span>
                    </td>

                    {/* Registered Date */}
                    <td
                      className={`py-4 px-4 text-[11px] font-mono whitespace-nowrap ${
                        isLight ? "text-slate-500" : "text-neutral-400"
                      }`}
                    >
                      {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString() : "—"}
                    </td>

                    {/* Details Action Button */}
                    <td className="py-4 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => openInspectModal(reg.registrationId || reg.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-mono transition cursor-pointer border ${
                          isLight
                            ? "bg-slate-100 hover:bg-teal-600 hover:text-white border-slate-300 text-slate-700"
                            : "bg-neutral-800 hover:bg-[#35e0c9] hover:text-black border-neutral-700 text-neutral-300"
                        }`}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Cards View */}
        <div className="md:hidden divide-y divide-neutral-800/40">
          {!registrationsLoaded && registrationsLoading ? (
            <div className="py-12 text-center text-xs font-mono text-neutral-400">
              Loading registrations for this track...
            </div>
          ) : !registrationsLoaded && registrationsError ? (
            <div className="py-12 text-center text-xs font-mono text-red-400 space-y-3 p-4">
              <div>{registrationsError}</div>
              <button
                type="button"
                onClick={() => refreshRegistrations(true)}
                className="px-4 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-mono font-bold uppercase tracking-wider transition cursor-pointer"
              >
                Retry Loading
              </button>
            </div>
          ) : paginatedRegistrations.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-neutral-400">
              {!assignedTrack ? (
                "No track is currently assigned to your account."
              ) : (cachedRegistrations || []).length === 0 ? (
                "No registrations found for your assigned track yet."
              ) : (
                <div className="space-y-2 p-4">
                  <p>No registrations match the selected filters.</p>
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition cursor-pointer border ${
                      isLight
                        ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700"
                        : "bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300"
                    }`}
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          ) : (
            paginatedRegistrations.map((reg) => (
              <div
                key={reg.id}
                className={`p-4 space-y-3 ${
                  isLight ? "border-b border-slate-200" : "border-b border-neutral-800/60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono font-bold text-sm ${
                      isLight ? "text-teal-700" : "text-[#35e0c9]"
                    }`}
                  >
                    {reg.registrationId}
                  </span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                      reg.status === "CONFIRMED" || reg.status === "PAYMENT_SUCCESS"
                        ? isLight
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : reg.status === "CANCELLED" || reg.status === "PAYMENT_FAILED"
                        ? isLight
                          ? "bg-rose-50 text-rose-800 border-rose-300"
                          : "bg-red-500/10 text-red-400 border-red-500/30"
                        : isLight
                        ? "bg-amber-50 text-amber-800 border-amber-300"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    }`}
                  >
                    {reg.status}
                  </span>
                </div>

                <div>
                  <div
                    className={`font-bold text-sm ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}
                  >
                    {reg.event?.name || "—"}
                  </div>
                  <div
                    className={`text-xs mt-0.5 ${
                      isLight ? "text-slate-600" : "text-neutral-400"
                    }`}
                  >
                    {reg.user?.name || "Participant"} ({reg.user?.email || "—"})
                  </div>
                  {reg.user?.institution && (
                    <div
                      className={`text-xs ${
                        isLight ? "text-slate-500" : "text-neutral-500"
                      }`}
                    >
                      {reg.user.institution}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span
                    className={`text-[11px] font-mono ${
                      isLight ? "text-slate-500" : "text-neutral-400"
                    }`}
                  >
                    {reg.registrationType} •{" "}
                    {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString() : ""}
                  </span>

                  <button
                    type="button"
                    onClick={() => openInspectModal(reg.registrationId || reg.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition cursor-pointer border ${
                      isLight
                        ? "bg-slate-100 hover:bg-teal-600 hover:text-white border-slate-300 text-slate-700"
                        : "bg-neutral-800 hover:bg-[#35e0c9] hover:text-black border-neutral-700 text-neutral-300"
                    }`}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Footer */}
        <div
          className={`flex flex-col sm:flex-row items-center justify-between p-4 border-t gap-3 text-xs font-mono ${
            isLight
              ? "border-slate-200 bg-slate-50 text-slate-600"
              : "border-neutral-800 bg-[#0e131f] text-neutral-400"
          }`}
        >
          <span>
            {!registrationsLoaded && registrationsLoading ? (
              <span>Loading track registrations...</span>
            ) : (
              <>
                Showing page{" "}
                <strong className={isLight ? "text-slate-900" : "text-white"}>
                  {safePage}
                </strong>{" "}
                of{" "}
                <strong className={isLight ? "text-slate-900" : "text-white"}>
                  {totalPages}
                </strong>{" "}
                ({totalRecords} total {totalRecords === 1 ? "registration" : "registrations"}
                {filteredRegistrations.length !== (cachedRegistrations || []).length && (
                  <span className={isLight ? "text-slate-500" : "text-neutral-500"}>
                    {" "}• filtered from {(cachedRegistrations || []).length}
                  </span>
                )})
              </>
            )}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1 || (!registrationsLoaded && registrationsLoading)}
              className={`px-3 py-1.5 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed border ${
                isLight
                  ? "bg-white hover:bg-slate-200 border-slate-300 text-slate-700"
                  : "bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200"
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages || (!registrationsLoaded && registrationsLoading)}
              className={`px-3 py-1.5 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed border ${
                isLight
                  ? "bg-white hover:bg-slate-200 border-slate-300 text-slate-700"
                  : "bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* 4. Read-Only Inspection Modal */}
      {inspectModalOpen && (
        <ModalPortal onClose={closeInspectModal}>
          <div
            className="fixed inset-0 z-[100] w-screen h-screen flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
            role="dialog"
            aria-modal="true"
            aria-labelledby="inspection-modal-title"
          >
            {/* Full-viewport backdrop overlay */}
            <div
              className="fixed inset-0 w-screen h-screen bg-black/80 backdrop-blur-sm transition-opacity"
              aria-hidden="true"
              onClick={closeInspectModal}
            />

            <div
              className={`relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border p-6 shadow-2xl space-y-6 ${
                isLight
                  ? "bg-white border-slate-200 text-slate-900"
                  : "bg-[#0e131f] border-neutral-800 text-white"
              }`}
            >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-neutral-800/80">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[11px] font-mono uppercase tracking-wider ${
                      isLight ? "text-slate-500" : "text-neutral-400"
                    }`}
                  >
                    Track Registration Record
                  </span>
                  {inspectDetail && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                        inspectDetail.status === "CONFIRMED" ||
                        inspectDetail.status === "PAYMENT_SUCCESS"
                          ? isLight
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : inspectDetail.status === "CANCELLED" ||
                            inspectDetail.status === "PAYMENT_FAILED"
                          ? isLight
                            ? "bg-rose-50 text-rose-800 border-rose-300"
                            : "bg-red-500/10 text-red-400 border-red-500/30"
                          : isLight
                          ? "bg-amber-50 text-amber-800 border-amber-300"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {inspectDetail.status}
                    </span>
                  )}
                </div>
                <h3
                  id="inspection-modal-title"
                  className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${
                    isLight ? "text-teal-700" : "text-[#35e0c9]"
                  }`}
                >
                  {inspectDetail?.registrationId || selectedRegId}
                </h3>
              </div>

              <button
                type="button"
                onClick={closeInspectModal}
                aria-label="Close dialog"
                className={`p-2 rounded-xl transition cursor-pointer border ${
                  isLight
                    ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700"
                    : "bg-neutral-900 border-neutral-800 hover:bg-neutral-800 text-neutral-300 hover:text-white"
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            {isInspectLoading ? (
              <div className="py-16 text-center text-xs font-mono text-neutral-400">
                <div className="w-6 h-6 border-2 border-[#35e0c9]/30 border-t-[#35e0c9] rounded-full animate-spin mx-auto mb-2" />
                <span>Loading registration details...</span>
              </div>
            ) : inspectError ? (
              <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-mono">
                {inspectError}
              </div>
            ) : inspectDetail ? (
              <div className="space-y-6">
                {/* Event Information */}
                <div
                  className={`p-4 rounded-xl border ${
                    isLight
                      ? "bg-slate-50 border-slate-200"
                      : "bg-[#131929]/50 border-neutral-800"
                  }`}
                >
                  <h4
                    className={`text-xs font-mono uppercase tracking-wider font-bold mb-3 flex items-center gap-2 ${
                      isLight ? "text-slate-700" : "text-neutral-300"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#35e0c9]" />
                    Event Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className={isLight ? "text-slate-500 block" : "text-neutral-500 block"}>
                        Event Name
                      </span>
                      <span
                        className={`font-bold text-sm ${
                          isLight ? "text-slate-900" : "text-white"
                        }`}
                      >
                        {inspectDetail.event?.name || "—"}
                      </span>
                    </div>
                    <div>
                      <span className={isLight ? "text-slate-500 block" : "text-neutral-500 block"}>
                        Category / Track
                      </span>
                      <span
                        className={`font-mono ${
                          isLight ? "text-slate-700 font-semibold" : "text-neutral-200"
                        }`}
                      >
                        {inspectDetail.event?.category || assignedTrack?.name || "—"}
                      </span>
                    </div>
                    <div>
                      <span className={isLight ? "text-slate-500 block" : "text-neutral-500 block"}>
                        Participation Format
                      </span>
                      <span
                        className={`font-semibold ${
                          isLight ? "text-slate-900" : "text-white"
                        }`}
                      >
                        {inspectDetail.registrationType}
                      </span>
                    </div>
                    <div>
                      <span className={isLight ? "text-slate-500 block" : "text-neutral-500 block"}>
                        Entry Fee
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          isLight ? "text-teal-700" : "text-[#35e0c9]"
                        }`}
                      >
                        {inspectDetail.event?.fee === 0 ? "Free" : `₹${inspectDetail.event?.fee ?? 0}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Leader / Registrant Information */}
                <div
                  className={`p-4 rounded-xl border ${
                    isLight
                      ? "bg-slate-50 border-slate-200"
                      : "bg-[#131929]/50 border-neutral-800"
                  }`}
                >
                  <h4
                    className={`text-xs font-mono uppercase tracking-wider font-bold mb-3 flex items-center gap-2 ${
                      isLight ? "text-slate-700" : "text-neutral-300"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    Registrant / Leader Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className={isLight ? "text-slate-500 block" : "text-neutral-500 block"}>
                        Full Name
                      </span>
                      <span
                        className={`font-bold ${
                          isLight ? "text-slate-900" : "text-white"
                        }`}
                      >
                        {inspectDetail.leader?.name || "Participant"}
                      </span>
                    </div>
                    <div>
                      <span className={isLight ? "text-slate-500 block" : "text-neutral-500 block"}>
                        Email Address
                      </span>
                      <span
                        className={`font-mono ${
                          isLight ? "text-slate-800" : "text-neutral-200"
                        }`}
                      >
                        {inspectDetail.leader?.email || "—"}
                      </span>
                    </div>
                    <div>
                      <span className={isLight ? "text-slate-500 block" : "text-neutral-500 block"}>
                        Phone Number
                      </span>
                      <span
                        className={`font-mono ${
                          isLight ? "text-slate-800" : "text-neutral-200"
                        }`}
                      >
                        {inspectDetail.leader?.phone || "—"}
                      </span>
                    </div>
                    <div>
                      <span className={isLight ? "text-slate-500 block" : "text-neutral-500 block"}>
                        Institution / College
                      </span>
                      <span
                        className={`font-medium ${
                          isLight ? "text-slate-800" : "text-neutral-200"
                        }`}
                      >
                        {inspectDetail.leader?.institution || "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Team Details (if Team registration) */}
                {inspectDetail.team && (
                  <div
                    className={`p-4 rounded-xl border ${
                      isLight
                        ? "bg-slate-50 border-slate-200"
                        : "bg-[#131929]/50 border-neutral-800"
                    }`}
                  >
                    <h4
                      className={`text-xs font-mono uppercase tracking-wider font-bold mb-3 flex items-center gap-2 ${
                        isLight ? "text-slate-700" : "text-neutral-300"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      Team Roster ({inspectDetail.team.totalTeamSize} Total Members)
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className={isLight ? "text-slate-500" : "text-neutral-400"}>
                          Team Name:
                        </span>
                        <span
                          className={`font-bold ${
                            isLight ? "text-slate-900" : "text-white"
                          }`}
                        >
                          {inspectDetail.team.teamName}
                        </span>
                      </div>

                      {/* Members List */}
                      {inspectDetail.team.members && inspectDetail.team.members.length > 0 ? (
                        <div className="space-y-1.5 pt-2">
                          <span
                            className={`text-[11px] font-mono uppercase block ${
                              isLight ? "text-slate-500" : "text-neutral-500"
                            }`}
                          >
                            Additional Team Members:
                          </span>
                          {inspectDetail.team.members.map((member) => (
                            <div
                              key={member.id}
                              className={`p-2 rounded-lg text-xs font-mono flex items-center justify-between ${
                                isLight
                                  ? "bg-white border border-slate-200 text-slate-800"
                                  : "bg-[#0a0e17] border border-neutral-800 text-neutral-300"
                              }`}
                            >
                              <span>
                                #{member.memberOrder} {member.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p
                          className={`text-xs italic ${
                            isLight ? "text-slate-500" : "text-neutral-500"
                          }`}
                        >
                          No additional team members listed.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Read-Only Console Notice */}
                <div
                  className={`p-3 rounded-xl border text-[11px] font-mono flex items-center gap-2.5 ${
                    isLight
                      ? "bg-teal-50/70 border-teal-200 text-teal-900"
                      : "bg-[#35e0c9]/5 border-[#35e0c9]/20 text-neutral-300"
                  }`}
                >
                  <svg
                    className={`w-4 h-4 shrink-0 ${isLight ? "text-teal-700" : "text-[#35e0c9]"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    Track Leader Console: Read-only inspection mode. Modification and status overrides are reserved for festival administrators.
                  </span>
                </div>
              </div>
            ) : null}

            {/* Modal Footer */}
            <div className="flex items-center justify-end pt-3 border-t border-neutral-800/80">
              <button
                type="button"
                onClick={closeInspectModal}
                className={`px-5 py-2 rounded-xl text-xs font-mono uppercase tracking-wider font-semibold transition cursor-pointer border ${
                  isLight
                    ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700"
                    : "bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200 hover:text-white"
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </ModalPortal>
    )}

      {/* Dynamic Export Modal strictly for assigned track */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        role="track-leader"
        theme={theme}
        activeFilters={{
          search: appliedSearch,
          eventId: selectedEventId,
          registrationType: selectedType,
          status: selectedStatus,
        }}
        assignedTrack={assignedTrack}
        events={events}
      />
    </div>
  );
}
