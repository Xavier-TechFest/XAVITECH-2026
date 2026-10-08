"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useAdmin } from "@/context/AdminContext";
import { AdminRegistrationListItem, PaginationMeta } from "@/lib/api";
import ExportModal from "@/components/export/ExportModal";

const OFFICIAL_TRACK_ORDER = [
  "flagship-innovation",
  "coding-development",
  "gaming-adventure",
  "knowledge-leadership",
  "creative-learning",
];

export default function AdminRegistrationsPage() {
  const { getRegistrations, getEvents, getTracks } = useAdmin();

  // Export Modal state
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Filter & Search states
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [selectedTrackId, setSelectedTrackId] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("");
  const [page, setPage] = useState(1);
  const limit = 15;

  // Data states
  const [registrations, setRegistrations] = useState<AdminRegistrationListItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 15,
    totalRecords: 0,
    totalPages: 1,
  });
  const [tracks, setTracks] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [events, setEvents] = useState<
    Array<{
      id: string;
      name: string;
      slug: string;
      trackId?: string;
      track?: { id: string; name: string; slug: string };
    }>
  >([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load Tracks and Events dropdowns (cached via AdminContext)
  useEffect(() => {
    let isMounted = true;
    Promise.all([getTracks(), getEvents()]).then(([trks, evs]) => {
      if (isMounted) {
        const sortedTracks = [...(trks || [])].sort((a, b) => {
          const idxA = OFFICIAL_TRACK_ORDER.indexOf(a.slug);
          const idxB = OFFICIAL_TRACK_ORDER.indexOf(b.slug);
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          return a.name.localeCompare(b.name);
        });
        setTracks(sortedTracks);
        setEvents(evs || []);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [getTracks, getEvents]);

  // Cascading Event options based on selected Track
  const availableEvents = useMemo(() => {
    if (!selectedTrackId) return events;
    return events.filter(
      (ev) =>
        ev.trackId === selectedTrackId ||
        ev.track?.id === selectedTrackId ||
        ev.track?.slug === selectedTrackId
    );
  }, [events, selectedTrackId]);

  // Fetch / Retrieve Registrations with combined filters
  const fetchRegistrations = useCallback(async () => {
    setIsLoadingData(true);
    setErrorMsg(null);
    try {
      const data = await getRegistrations({
        page,
        limit,
        search: appliedSearch,
        trackId: selectedTrackId,
        eventId: selectedEventId,
        registrationType: selectedType,
        status: selectedStatus,
        paymentStatus: selectedPaymentStatus,
      });
      setRegistrations(data.registrations);
      setPagination(data.pagination);
    } catch (err: any) {
      console.error("Error fetching registrations:", err);
      setErrorMsg(err.message || "Failed to load registrations.");
    } finally {
      setIsLoadingData(false);
    }
  }, [page, limit, appliedSearch, selectedTrackId, selectedEventId, selectedType, selectedStatus, selectedPaymentStatus, getRegistrations]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setAppliedSearch(search.trim());
  };

  const handleTrackChange = (newTrackId: string) => {
    setSelectedTrackId(newTrackId);
    setSelectedEventId(""); // Automatically reset selected event to All Events
    setPage(1); // Reset pagination to page 1
  };

  const handleEventChange = (newEventId: string) => {
    setSelectedEventId(newEventId);
    setPage(1); // Reset pagination to page 1
  };

  const handleClearFilters = () => {
    setSearch("");
    setAppliedSearch("");
    setSelectedTrackId("");
    setSelectedEventId("");
    setSelectedType("");
    setSelectedStatus("");
    setSelectedPaymentStatus("");
    setPage(1);
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl w-full mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-mono uppercase tracking-tight">
            Registration Management
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Search, filter, and inspect participant registrations across all 13 official events
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setExportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#35e0c9]/10 hover:bg-[#35e0c9]/20 border border-[#35e0c9]/40 hover:border-[#35e0c9] text-[#35e0c9] font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md shadow-[#35e0c9]/10"
            title="Configure and Export Registrations"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export</span>
          </button>

          <div className="text-right">
            <span className="text-xs font-mono text-neutral-400 block">Total Database Records</span>
            <span className="text-lg font-bold font-mono text-[#35e0c9]">{pagination.totalRecords}</span>
          </div>
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
                placeholder="Search by Registration ID (e.g. XVT-2026), Leader Name, Email, or Team Name..."
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
              {(appliedSearch || selectedTrackId || selectedEventId || selectedType || selectedStatus || selectedPaymentStatus) && (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-neutral-800/80">
            {/* Filter by Track */}
            <div>
              <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                Filter by Track
              </label>
              <select
                value={selectedTrackId}
                onChange={(e) => handleTrackChange(e.target.value)}
                className="w-full px-3 py-2 bg-[#131929] border border-neutral-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-[#35e0c9]"
              >
                <option value="">All Tracks ({tracks.length || 5})</option>
                {tracks.map((trk) => (
                  <option key={trk.id} value={trk.id}>
                    {trk.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Event (Cascading based on Track) */}
            <div>
              <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                Filter by Event
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => handleEventChange(e.target.value)}
                className="w-full px-3 py-2 bg-[#131929] border border-neutral-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-[#35e0c9]"
              >
                <option value="">All Events ({availableEvents.length})</option>
                {availableEvents.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Registration Type Filter */}
            <div>
              <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                Participation Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-[#131929] border border-neutral-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-[#35e0c9]"
              >
                <option value="">All Types</option>
                <option value="INDIVIDUAL">INDIVIDUAL</option>
                <option value="TEAM">TEAM</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                Registration Status
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
                <option value="PAYMENT_PENDING">PAYMENT_PENDING</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="PAYMENT_SUCCESS">PAYMENT_SUCCESS</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            {/* Payment Status Filter */}
            <div>
              <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                Payment Status
              </label>
              <select
                value={selectedPaymentStatus}
                onChange={(e) => {
                  setSelectedPaymentStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-[#131929] border border-neutral-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-[#35e0c9]"
              >
                <option value="">All Payments</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="PENDING">PENDING</option>
                <option value="INITIATED">INITIATED</option>
                <option value="FAILED">FAILED</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="NOT_APPLICABLE">NOT_APPLICABLE (Free)</option>
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

      {/* Registrations Table Card */}
      <div className="bg-[#0e131f]/90 border border-neutral-800 rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 bg-[#131929]/60 text-[11px] font-mono uppercase tracking-wider text-neutral-400">
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
            <tbody className="divide-y divide-neutral-800/60 text-xs">
              {isLoadingData ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-neutral-400 font-mono">
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-[#35e0c9]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Loading registrations...</span>
                    </div>
                  </td>
                </tr>
              ) : registrations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-neutral-400 font-mono">
                    No registrations found matching the specified search or filter criteria.
                  </td>
                </tr>
              ) : (
                registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-[#131929]/40 transition">
                    <td className="py-4 px-4 sm:px-6 font-mono font-semibold text-[#35e0c9]">
                      <Link
                        href={`/xavitech-superadmin/registrations/view?registrationId=${reg.registrationId}`}
                        className="hover:underline"
                      >
                        {reg.registrationId}
                      </Link>
                    </td>
                    <td className="py-4 px-4 text-white font-medium max-w-[180px] truncate">
                      {reg.event?.name || "—"}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                          reg.registrationType === "TEAM"
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                        }`}
                      >
                        {reg.registrationType}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-white">{reg.user?.name || "Participant"}</div>
                      <div className="text-[11px] text-neutral-400 font-mono truncate max-w-[160px]">
                        {reg.user?.email || "—"}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-neutral-300 max-w-[140px] truncate">
                      {reg.user?.institution || "—"}
                    </td>
                    <td className="py-4 px-4">
                      {reg.team ? (
                        <div>
                          <span className="font-semibold text-white">{reg.team.teamName}</span>
                          <span className="text-[10px] text-neutral-400 block font-mono">
                            {reg.team.totalTeamSize} members
                          </span>
                        </div>
                      ) : (
                        <span className="text-neutral-500 font-mono">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                            reg.status === "CONFIRMED" || reg.status === "PAYMENT_SUCCESS"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : reg.status === "CANCELLED" || reg.status === "PAYMENT_FAILED"
                              ? "bg-red-500/10 text-red-400 border-red-500/30"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          }`}
                        >
                          {reg.status}
                        </span>
                        {reg.paymentStatus && (
                          <span
                            className={`inline-block px-1.5 py-0.5 text-[9px] font-mono rounded border uppercase ${
                              reg.paymentStatus === "SUCCESS"
                                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                                : reg.paymentStatus === "FAILED" || reg.paymentStatus === "CANCELLED"
                                ? "bg-rose-500/10 text-rose-300 border-rose-500/20"
                                : "bg-neutral-800 text-neutral-400 border-neutral-700"
                            }`}
                          >
                            Pay: {reg.paymentStatus}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-[11px] text-neutral-400 font-mono whitespace-nowrap">
                      {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        href={`/xavitech-superadmin/registrations/view?registrationId=${reg.registrationId}`}
                        className="px-2.5 py-1 bg-neutral-800 hover:bg-[#35e0c9] hover:text-black text-neutral-300 rounded-lg text-xs font-mono transition"
                      >
                        Details
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
            <strong className="text-white">{pagination.totalPages}</strong> ({pagination.totalRecords} total registrations)
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

      {/* Dynamic Export Configuration Modal */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        role="admin"
        activeFilters={{
          search: appliedSearch,
          trackId: selectedTrackId,
          eventId: selectedEventId,
          registrationType: selectedType,
          status: selectedStatus,
          paymentStatus: selectedPaymentStatus,
        }}
        tracks={tracks}
        events={events}
      />
    </div>
  );
}
