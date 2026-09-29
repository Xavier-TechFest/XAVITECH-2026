"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAdmin } from "@/context/AdminContext";
import {
  AdminTrackLeaderListItem,
  AdminCreateTrackLeaderPayload,
  PaginationMeta,
  adminCreateTrackLeader,
  adminUpdateTrackLeader,
  adminUpdateTrackLeaderStatus,
  adminResetTrackLeaderCredentials,
} from "@/lib/api";

export default function AdminTrackLeadersPage() {
  const {
    getTrackLeaders,
    getTracks,
    clearTrackLeadersCache,
  } = useAdmin();

  // Search & Filter states
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [selectedTrackId, setSelectedTrackId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [page, setPage] = useState(1);
  const limit = 15;

  // Data states
  const [trackLeaders, setTrackLeaders] = useState<AdminTrackLeaderListItem[]>([]);
  const [tracks, setTracks] = useState<Array<{ id: string; name: string; slug: string; is_active: boolean }>>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 15,
    totalRecords: 0,
    totalPages: 1,
  });
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showCredsDisplayModal, setShowCredsDisplayModal] = useState(false);

  // Selected leader for modal operations
  const [selectedLeader, setSelectedLeader] = useState<AdminTrackLeaderListItem | null>(null);

  // Form states for Add / Edit
  const [formData, setFormData] = useState<AdminCreateTrackLeaderPayload>({
    name: "",
    email: "",
    trackId: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reissued / Temporary Credentials display state
  const [issuedCreds, setIssuedCreds] = useState<{
    name: string;
    email: string;
    temporaryPassword: string;
    trackName?: string;
    emailSent?: boolean;
  } | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);

  // Load Tracks for Dropdown
  useEffect(() => {
    let isMounted = true;
    getTracks().then((trks) => {
      if (isMounted) setTracks(trks);
    });
    return () => {
      isMounted = false;
    };
  }, [getTracks]);

  // Fetch Track Leaders
  const fetchTrackLeaders = useCallback(
    async (forceRefresh = false) => {
      setIsLoadingData(true);
      setErrorMsg(null);
      try {
        const data = await getTrackLeaders(
          {
            page,
            limit,
            search: appliedSearch,
            trackId: selectedTrackId,
            status: selectedStatus,
          },
          forceRefresh
        );
        setTrackLeaders(data.trackLeaders);
        setPagination(data.pagination);
      } catch (err: any) {
        console.error("Error fetching track leaders:", err);
        setErrorMsg(err.message || "Failed to load track leaders.");
      } finally {
        setIsLoadingData(false);
      }
    },
    [page, limit, appliedSearch, selectedTrackId, selectedStatus, getTrackLeaders]
  );

  useEffect(() => {
    fetchTrackLeaders();
  }, [fetchTrackLeaders]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setAppliedSearch(search.trim());
  };

  const handleClearFilters = () => {
    setSearch("");
    setAppliedSearch("");
    setSelectedTrackId("");
    setSelectedStatus("");
    setPage(1);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormData({
      name: "",
      email: "",
      trackId: tracks.length > 0 ? tracks[0].id : "",
    });
    setFormError(null);
    setShowAddModal(true);
  };

  // Submit Add
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError("Name is required.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setFormError("A valid email address is required.");
      return;
    }
    if (!formData.trackId) {
      setFormError("Please select a track to assign.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await adminCreateTrackLeader({
        name: formData.name.trim(),
        email: formData.email.trim(),
        trackId: formData.trackId,
      });

      clearTrackLeadersCache();
      setShowAddModal(false);

      if (result.temporaryPassword) {
        setIssuedCreds({
          name: result.user.name || formData.name,
          email: result.user.email,
          temporaryPassword: result.temporaryPassword,
          trackName: result.track.name,
          emailSent: result.emailSent,
        });
        setCopiedPassword(false);
        setShowCredsDisplayModal(true);
      }

      await fetchTrackLeaders(true);
    } catch (err: any) {
      setFormError(err.message || "Failed to create track leader.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (leader: AdminTrackLeaderListItem) => {
    setSelectedLeader(leader);
    setFormData({
      name: leader.name || "",
      email: leader.email,
      trackId: leader.track?.id || (tracks.length > 0 ? tracks[0].id : ""),
    });
    setFormError(null);
    setShowEditModal(true);
  };

  // Submit Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeader) return;
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError("Name is required.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setFormError("A valid email address is required.");
      return;
    }
    if (!formData.trackId) {
      setFormError("Please select a track.");
      return;
    }

    setIsSubmitting(true);
    try {
      await adminUpdateTrackLeader(selectedLeader.id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        trackId: formData.trackId,
      });

      clearTrackLeadersCache();
      setShowEditModal(false);
      setSelectedLeader(null);
      await fetchTrackLeaders(true);
    } catch (err: any) {
      setFormError(err.message || "Failed to update track leader.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Status Toggle Modal (Activate / Deactivate)
  const handleOpenStatusModal = (leader: AdminTrackLeaderListItem) => {
    setSelectedLeader(leader);
    setShowStatusModal(true);
  };

  // Submit Status Toggle
  const handleStatusToggleSubmit = async () => {
    if (!selectedLeader) return;
    setIsSubmitting(true);
    try {
      const nextStatus = !selectedLeader.is_active;
      await adminUpdateTrackLeaderStatus(selectedLeader.id, nextStatus);
      clearTrackLeadersCache();
      setShowStatusModal(false);
      setSelectedLeader(null);
      await fetchTrackLeaders(true);
    } catch (err: any) {
      console.error("Status update error:", err);
      alert(err.message || "Failed to update status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Reset Credentials Modal
  const handleOpenResetModal = (leader: AdminTrackLeaderListItem) => {
    setSelectedLeader(leader);
    setShowResetModal(true);
  };

  // Submit Reset Credentials
  const handleResetSubmit = async () => {
    if (!selectedLeader) return;
    setIsSubmitting(true);
    try {
      const result = await adminResetTrackLeaderCredentials(selectedLeader.id);
      clearTrackLeadersCache();
      setShowResetModal(false);

      if (result.temporaryPassword) {
        setIssuedCreds({
          name: result.user.name || selectedLeader.name || "Track Leader",
          email: result.user.email,
          temporaryPassword: result.temporaryPassword,
          trackName: selectedLeader.track?.name,
          emailSent: result.emailSent,
        });
        setCopiedPassword(false);
        setShowCredsDisplayModal(true);
      }

      setSelectedLeader(null);
      await fetchTrackLeaders(true);
    } catch (err: any) {
      console.error("Reset credentials error:", err);
      alert(err.message || "Failed to reset credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy password to clipboard
  const handleCopyPassword = () => {
    if (!issuedCreds?.temporaryPassword) return;
    navigator.clipboard.writeText(issuedCreds.temporaryPassword);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 3000);
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl w-full mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-mono uppercase tracking-tight text-white">
            Track Leaders
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Manage XAVITECH track leaders and their assigned tracks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-mono text-neutral-400 block">Total Leaders</span>
            <span className="text-lg font-bold font-mono text-[#35e0c9]">{pagination.totalRecords}</span>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#35e0c9] hover:bg-[#2bc4af] text-black font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-[#35e0c9]/10 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Track Leader</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar Card */}
      <div className="bg-[#0e131f]/90 border border-neutral-800 rounded-2xl p-4 sm:p-6 mb-6 backdrop-blur-xl">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search name/email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#131929] border border-neutral-700/80 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#35e0c9] focus:ring-1 focus:ring-[#35e0c9] transition"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#35e0c9] hover:bg-[#2bc4af] text-black font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                Search
              </button>
              {(appliedSearch || selectedTrackId || selectedStatus) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Filter Dropdowns Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-800/80">
            {/* Filter by Track */}
            <div>
              <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5">
                Assigned Track
              </label>
              <select
                value={selectedTrackId}
                onChange={(e) => {
                  setSelectedTrackId(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-[#131929] border border-neutral-700/80 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-[#35e0c9]"
              >
                <option value="">All Tracks</option>
                {tracks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Status */}
            <div>
              <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5">
                Account Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-[#131929] border border-neutral-700/80 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-[#35e0c9]"
              >
                <option value="">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* Main Table Card */}
      <div className="bg-[#0e131f]/90 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
        {isLoadingData ? (
          <div className="py-24 flex items-center justify-center text-sm text-neutral-400 font-mono">
            <div className="flex items-center gap-3">
              <svg className="animate-spin h-5 w-5 text-[#35e0c9]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Loading track leaders...</span>
            </div>
          </div>
        ) : errorMsg ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-mono text-red-400">{errorMsg}</p>
            <button
              onClick={() => fetchTrackLeaders(true)}
              className="mt-4 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-mono rounded-xl transition cursor-pointer text-neutral-200"
            >
              Retry
            </button>
          </div>
        ) : trackLeaders.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-[#35e0c9]/10 text-[#35e0c9] flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="text-sm font-mono text-neutral-300 font-bold">No Track Leaders found</p>
            <p className="text-xs text-neutral-500 mt-1">
              {appliedSearch || selectedTrackId || selectedStatus
                ? "Try adjusting your search filters to find records."
                : "No Track Leaders have been added yet. Click above to add the first Track Leader."}
            </p>
            {appliedSearch || selectedTrackId || selectedStatus ? (
              <button
                onClick={handleClearFilters}
                className="mt-4 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-mono rounded-xl transition cursor-pointer text-neutral-200"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={handleOpenAdd}
                className="mt-4 px-4 py-2 bg-[#35e0c9] hover:bg-[#2bc4af] text-black text-xs font-mono font-bold rounded-xl transition cursor-pointer"
              >
                + Add Track Leader
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-900/40 text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Assigned Track</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-xs font-mono">
                {trackLeaders.map((leader) => (
                  <tr key={leader.id} className="hover:bg-neutral-800/30 transition">
                    {/* Name */}
                    <td className="py-3.5 px-4 font-bold text-white">
                      {leader.name || "—"}
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4 text-neutral-300">
                      {leader.email}
                    </td>

                    {/* Assigned Track */}
                    <td className="py-3.5 px-4">
                      {leader.track ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#35e0c9]/10 text-[#35e0c9] border border-[#35e0c9]/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#35e0c9]" />
                          {leader.track.name}
                        </span>
                      ) : (
                        <span className="text-neutral-500 italic">Unassigned</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {leader.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-red-500/10 text-red-400 border border-red-500/30">
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Created */}
                    <td className="py-3.5 px-4 text-neutral-400">
                      {new Date(leader.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Details */}
                        <Link
                          href={`/xavitech-superadmin/track-leaders/view?trackLeaderId=${leader.id}`}
                          className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-[11px] transition"
                        >
                          View
                        </Link>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(leader)}
                          className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg text-[11px] transition cursor-pointer"
                        >
                          Edit
                        </button>

                        {/* Reset Credentials */}
                        <button
                          type="button"
                          onClick={() => handleOpenResetModal(leader)}
                          title="Reset / Reissue credentials"
                          className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-[11px] transition cursor-pointer"
                        >
                          Reset Key
                        </button>

                        {/* Deactivate / Reactivate */}
                        <button
                          type="button"
                          onClick={() => handleOpenStatusModal(leader)}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] border transition cursor-pointer ${
                            leader.is_active
                              ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30"
                              : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          }`}
                        >
                          {leader.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {!isLoadingData && pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-neutral-800 flex items-center justify-between text-xs font-mono text-neutral-400 bg-neutral-900/20">
            <div>
              Showing page <span className="text-white">{pagination.page}</span> of{" "}
              <span className="text-white">{pagination.totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 1. ADD TRACK LEADER MODAL                                              */}
      {/* ===================================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-[#0e131f] border border-neutral-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h2 className="text-base font-bold font-mono text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#35e0c9]" />
                Add Track Leader
              </h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-white text-lg font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs font-mono text-red-400">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-neutral-300 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Kumar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-[#131929] border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-[#35e0c9]"
                />
              </div>

              <div>
                <label className="block text-neutral-300 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="e.g. rahul@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-[#131929] border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-[#35e0c9]"
                />
              </div>

              <div>
                <label className="block text-neutral-300 uppercase tracking-wider mb-1">
                  Assign Track *
                </label>
                <select
                  value={formData.trackId}
                  onChange={(e) => setFormData({ ...formData, trackId: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-[#131929] border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-[#35e0c9]"
                >
                  <option value="" disabled>
                    Select an official track...
                  </option>
                  {tracks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-[11px] text-neutral-400 leading-relaxed">
                Role will automatically be set to <strong className="text-white">TRACK_LEADER</strong>. A secure temporary password will be generated automatically.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#35e0c9] hover:bg-[#2bc4af] text-black font-bold uppercase tracking-wider transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Track Leader</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. EDIT TRACK LEADER MODAL                                             */}
      {/* ===================================================================== */}
      {showEditModal && selectedLeader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-[#0e131f] border border-neutral-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h2 className="text-base font-bold font-mono text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Edit Track Leader
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedLeader(null);
                }}
                className="text-neutral-400 hover:text-white text-lg font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs font-mono text-red-400">
                {formError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-neutral-300 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-[#131929] border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-[#35e0c9]"
                />
              </div>

              <div>
                <label className="block text-neutral-300 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-[#131929] border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-[#35e0c9]"
                />
              </div>

              <div>
                <label className="block text-neutral-300 uppercase tracking-wider mb-1">
                  Reassign Track *
                </label>
                <select
                  value={formData.trackId}
                  onChange={(e) => setFormData({ ...formData, trackId: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-[#131929] border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-[#35e0c9]"
                >
                  {tracks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedLeader(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#35e0c9] hover:bg-[#2bc4af] text-black font-bold uppercase tracking-wider transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. DEACTIVATE / ACTIVATE MODAL                                        */}
      {/* ===================================================================== */}
      {showStatusModal && selectedLeader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-[#0e131f] border border-neutral-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  selectedLeader.is_active
                    ? "bg-red-500/10 border border-red-500/30 text-red-400"
                    : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold font-mono text-white">
                  {selectedLeader.is_active ? "Deactivate Track Leader" : "Reactivate Track Leader"}
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {selectedLeader.email}
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-400 font-mono leading-relaxed">
              {selectedLeader.is_active
                ? "Deactivating this Track Leader will immediately revoke all their active sessions and prevent further login access."
                : "Reactivating this Track Leader will restore their ability to log in with their existing credentials."}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedLeader(null);
                }}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleStatusToggleSubmit}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold uppercase tracking-wider transition cursor-pointer disabled:opacity-70 ${
                  selectedLeader.is_active
                    ? "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40"
                    : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40"
                }`}
              >
                {isSubmitting
                  ? "Updating..."
                  : selectedLeader.is_active
                  ? "Confirm Deactivate"
                  : "Confirm Reactivate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. RESET CREDENTIALS CONFIRMATION MODAL                                */}
      {/* ===================================================================== */}
      {showResetModal && selectedLeader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-[#0e131f] border border-neutral-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold font-mono text-white">
                  Reset Credentials
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {selectedLeader.email}
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-400 font-mono leading-relaxed">
              This will generate a brand new secure temporary password, set <span className="text-white">must_change_password = true</span>, and immediately revoke all existing sessions for this Track Leader.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setShowResetModal(false);
                  setSelectedLeader(null);
                }}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleResetSubmit}
                className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 text-xs font-mono font-semibold uppercase tracking-wider transition cursor-pointer disabled:opacity-70 flex items-center gap-2"
              >
                {isSubmitting ? "Resetting..." : "Confirm Reset"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. ONE-TIME TEMPORARY CREDENTIALS DISPLAY MODAL                       */}
      {/* ===================================================================== */}
      {showCredsDisplayModal && issuedCreds && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-[#0e131f] border border-emerald-500/40 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold font-mono text-white">
                  Temporary Credentials Issued
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Account: {issuedCreds.email}
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#131929] rounded-xl border border-neutral-700/80 space-y-2 font-mono text-xs">
              <div className="flex justify-between items-center text-neutral-400">
                <span>Name:</span>
                <span className="text-white font-semibold">{issuedCreds.name}</span>
              </div>
              {issuedCreds.trackName && (
                <div className="flex justify-between items-center text-neutral-400">
                  <span>Assigned Track:</span>
                  <span className="text-[#35e0c9]">{issuedCreds.trackName}</span>
                </div>
              )}
              <div className="pt-2 border-t border-neutral-700/60">
                <span className="text-neutral-400 block mb-1">Temporary Password:</span>
                <div className="flex items-center justify-between bg-black/50 p-2.5 rounded-lg border border-neutral-700">
                  <span className="text-emerald-400 font-bold select-all tracking-wider text-sm">
                    {issuedCreds.temporaryPassword}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded text-[11px] transition cursor-pointer"
                  >
                    {copiedPassword ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            </div>

            {issuedCreds.emailSent ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-300 leading-relaxed flex items-start gap-2.5">
                <svg className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <strong className="text-emerald-400">Credentials Emailed:</strong> A transactional email containing these login credentials and login instructions has been dispatched to <span className="text-white font-bold">{issuedCreds.email}</span>.
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] font-mono text-amber-300 leading-relaxed flex items-start gap-2.5">
                <svg className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <strong>Email Delivery Offline:</strong> Automated email delivery could not be sent (or Brevo API is unconfigured in development). Please copy and communicate the temporary password above directly to the Track Leader.
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowCredsDisplayModal(false);
                  setIssuedCreds(null);
                }}
                className="px-5 py-2 rounded-xl bg-[#35e0c9] hover:bg-[#2bc4af] text-black font-mono font-bold text-xs uppercase tracking-wider transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
