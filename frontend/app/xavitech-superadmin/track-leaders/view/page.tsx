"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAdmin } from "@/context/AdminContext";
import {
  AdminTrackLeaderDetail,
  adminUpdateTrackLeader,
  adminUpdateTrackLeaderStatus,
  adminResetTrackLeaderCredentials,
} from "@/lib/api";

function TrackLeaderDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const trackLeaderId = searchParams.get("trackLeaderId");
  const {
    getTrackLeaderDetails,
    getTracks,
    clearTrackLeadersCache,
  } = useAdmin();

  const [leader, setLeader] = useState<AdminTrackLeaderDetail | null>(null);
  const [tracks, setTracks] = useState<Array<{ id: string; name: string; slug: string; is_active: boolean }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showCredsDisplayModal, setShowCredsDisplayModal] = useState(false);

  // Edit form state
  const [formData, setFormData] = useState({ name: "", email: "", trackId: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reissued credentials state
  const [issuedCreds, setIssuedCreds] = useState<{
    name: string;
    email: string;
    temporaryPassword: string;
    trackName?: string;
  } | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);

  // Load Tracks for edit modal
  useEffect(() => {
    let isMounted = true;
    getTracks().then((trks) => {
      if (isMounted) setTracks(trks);
    });
    return () => {
      isMounted = false;
    };
  }, [getTracks]);

  // Load Leader Details
  const loadData = async (forceRefresh = false) => {
    if (!trackLeaderId) {
      setIsLoading(false);
      setErrorMsg("No track leader identifier specified in the request URL.");
      return;
    }

    try {
      const data = await getTrackLeaderDetails(trackLeaderId, forceRefresh);
      setLeader(data);
      setIsLoading(false);
    } catch (err: any) {
      if (err.status === 401) {
        router.replace("/xavitech-superadmin");
      } else {
        setErrorMsg(err.message || "Track leader not found");
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [trackLeaderId]);

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leader) return;
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
      await adminUpdateTrackLeader(leader.id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        trackId: formData.trackId,
      });

      clearTrackLeadersCache();
      setShowEditModal(false);
      await loadData(true);
    } catch (err: any) {
      setFormError(err.message || "Failed to update track leader.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Status Toggle Submit
  const handleStatusToggleSubmit = async () => {
    if (!leader) return;
    setIsSubmitting(true);
    try {
      const nextStatus = !leader.is_active;
      await adminUpdateTrackLeaderStatus(leader.id, nextStatus);
      clearTrackLeadersCache();
      setShowStatusModal(false);
      await loadData(true);
    } catch (err: any) {
      console.error("Status update error:", err);
      alert(err.message || "Failed to update status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Reset Credentials Submit
  const handleResetSubmit = async () => {
    if (!leader) return;
    setIsSubmitting(true);
    try {
      const result = await adminResetTrackLeaderCredentials(leader.id);
      clearTrackLeadersCache();
      setShowResetModal(false);

      if (result.temporaryPassword) {
        setIssuedCreds({
          name: result.user.name || leader.name || "Track Leader",
          email: result.user.email,
          temporaryPassword: result.temporaryPassword,
          trackName: leader.track?.name,
        });
        setCopiedPassword(false);
        setShowCredsDisplayModal(true);
      }

      await loadData(true);
    } catch (err: any) {
      console.error("Reset credentials error:", err);
      alert(err.message || "Failed to reset credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPassword = () => {
    if (!issuedCreds?.temporaryPassword) return;
    navigator.clipboard.writeText(issuedCreds.temporaryPassword);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="py-24 flex items-center justify-center text-sm text-neutral-400 font-mono">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-5 w-5 text-[#35e0c9]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Loading track leader details...</span>
        </div>
      </div>
    );
  }

  if (errorMsg || !leader) {
    return (
      <div className="py-20 max-w-xl mx-auto flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold font-mono text-white">Track Leader Not Found</h1>
        <p className="text-sm text-neutral-400 mt-2 max-w-md">
          {errorMsg || `The Track Leader with identifier "${trackLeaderId}" does not exist in the database.`}
        </p>
        <Link
          href="/xavitech-superadmin/track-leaders"
          className="mt-6 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-mono"
        >
          ← Return to Track Leaders List
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl w-full mx-auto space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/xavitech-superadmin/track-leaders"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-[#35e0c9] transition"
        >
          <span>←</span>
          <span>Back to Track Leaders</span>
        </Link>

        <div className="flex items-center gap-2">
          {leader.must_change_password && (
            <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Must Change Password
            </span>
          )}
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
              leader.is_active
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-red-500/10 text-red-400 border-red-500/30"
            }`}
          >
            {leader.is_active ? "ACTIVE" : "INACTIVE"}
          </span>
        </div>
      </div>

      {/* Header Info Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
            Track Leader Profile
          </span>
          <h1 className="text-3xl font-extrabold font-mono text-[#35e0c9] tracking-tight">
            {leader.name || "Unnamed Leader"}
          </h1>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            {leader.email} • ID: {leader.id}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setFormData({
                name: leader.name || "",
                email: leader.email,
                trackId: leader.track?.id || (tracks.length > 0 ? tracks[0].id : ""),
              });
              setFormError(null);
              setShowEditModal(true);
            }}
            className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-mono uppercase tracking-wider transition cursor-pointer"
          >
            Edit Profile
          </button>

          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-mono uppercase tracking-wider transition cursor-pointer"
          >
            Reset Key
          </button>

          <button
            type="button"
            onClick={() => setShowStatusModal(true)}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono uppercase tracking-wider border transition cursor-pointer ${
              leader.is_active
                ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30"
                : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
            }`}
          >
            {leader.is_active ? "Deactivate" : "Activate"}
          </button>
        </div>
      </div>

      {/* Grid: Track Info & Account Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assigned Track Card */}
        <div className="bg-[#0e131f]/90 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl">
          <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#35e0c9]" />
            Assigned Track
          </h2>

          {leader.track ? (
            <div className="space-y-3 font-mono text-xs">
              <div>
                <span className="text-[11px] text-neutral-500 block uppercase">Track Name</span>
                <p className="text-base font-bold text-white mt-0.5">{leader.track.name}</p>
              </div>

              <div>
                <span className="text-[11px] text-neutral-500 block uppercase">Track Slug</span>
                <p className="text-[#35e0c9] mt-0.5 font-bold">{leader.track.slug}</p>
              </div>

              <div>
                <span className="text-[11px] text-neutral-500 block uppercase">Track UUID</span>
                <p className="text-neutral-400 text-[11px] mt-0.5 break-all">{leader.track.id}</p>
              </div>

              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] bg-[#35e0c9]/10 text-[#35e0c9] border border-[#35e0c9]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#35e0c9]" />
                  Active Assignment
                </span>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs font-mono text-neutral-500">
              No track currently assigned.
            </div>
          )}
        </div>

        {/* Account Details Card */}
        <div className="bg-[#0e131f]/90 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl">
          <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Account Security & Audit
          </h2>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <span className="text-[11px] text-neutral-500 block uppercase">System Role</span>
              <p className="font-bold text-white mt-0.5">{leader.role}</p>
            </div>

            <div>
              <span className="text-[11px] text-neutral-500 block uppercase">Active Devices / Sessions</span>
              <p className="text-white mt-0.5 font-bold">
                {leader.activeSessionsCount} concurrent session(s)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <span className="text-[11px] text-neutral-500 block uppercase">Created At</span>
                <p className="text-neutral-300 mt-0.5 text-[11px]">
                  {new Date(leader.created_at).toLocaleString("en-GB")}
                </p>
              </div>
              <div>
                <span className="text-[11px] text-neutral-500 block uppercase">Last Updated</span>
                <p className="text-neutral-300 mt-0.5 text-[11px]">
                  {new Date(leader.updated_at).toLocaleString("en-GB")}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[11px] text-neutral-500 block">Password Storage</span>
              <span className="text-neutral-400 text-[11px]">
                Encrypted via bcrypt (12 salt rounds) • Plaintext never persisted
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Concurrent Sessions Table Card */}
      <div className="bg-[#0e131f]/90 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            Active Session Telemetry
          </h2>
          <span className="text-xs font-mono text-neutral-400">
            {leader.sessions?.length || 0} Session(s)
          </span>
        </div>

        {leader.sessions && leader.sessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-[11px] text-neutral-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Session ID</th>
                  <th className="py-2.5 px-3">Device / User Agent</th>
                  <th className="py-2.5 px-3">Last Active</th>
                  <th className="py-2.5 px-3">Expires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {leader.sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-neutral-800/30">
                    <td className="py-2.5 px-3 text-neutral-300 text-[11px] truncate max-w-[120px]">
                      {s.id}
                    </td>
                    <td className="py-2.5 px-3 text-white truncate max-w-[240px]">
                      {s.userAgent || "Unknown Device"}
                    </td>
                    <td className="py-2.5 px-3 text-neutral-400 text-[11px]">
                      {s.lastUsedAt ? new Date(s.lastUsedAt).toLocaleString("en-GB") : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-neutral-400 text-[11px]">
                      {new Date(s.expiresAt).toLocaleDateString("en-GB")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs font-mono text-neutral-500">
            No active sessions currently logged in.
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-[#0e131f] border border-neutral-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h2 className="text-base font-bold font-mono text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Edit Track Leader
              </h2>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
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
                  onClick={() => setShowEditModal(false)}
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

      {/* Deactivate / Reactivate Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-[#0e131f] border border-neutral-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  leader.is_active
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
                  {leader.is_active ? "Deactivate Track Leader" : "Reactivate Track Leader"}
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">{leader.email}</p>
              </div>
            </div>

            <p className="text-xs text-neutral-400 font-mono leading-relaxed">
              {leader.is_active
                ? "Deactivating will revoke all active sessions immediately and block login access."
                : "Reactivating will restore the ability to log in with existing credentials."}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleStatusToggleSubmit}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold uppercase tracking-wider transition cursor-pointer disabled:opacity-70 ${
                  leader.is_active
                    ? "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40"
                    : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40"
                }`}
              >
                {isSubmitting
                  ? "Updating..."
                  : leader.is_active
                  ? "Confirm Deactivate"
                  : "Confirm Reactivate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-[#0e131f] border border-neutral-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold font-mono text-white">Reset Credentials</h2>
                <p className="text-xs text-neutral-400 mt-0.5">{leader.email}</p>
              </div>
            </div>

            <p className="text-xs text-neutral-400 font-mono leading-relaxed">
              This will generate a new secure temporary password, set <span className="text-white">must_change_password = true</span>, and revoke all existing sessions for this Track Leader.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowResetModal(false)}
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

      {/* One-Time Credentials Display Modal */}
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
                <p className="text-xs text-neutral-400 mt-0.5">Account: {issuedCreds.email}</p>
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

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] font-mono text-amber-300 leading-relaxed">
              <strong>Notice:</strong> This password is not stored in plaintext. In Phase 8 Part 4, this credential will be dispatched via email. Copy or communicate it now for immediate authentication.
            </div>

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

export default function AdminTrackLeaderDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 flex items-center justify-center text-sm text-neutral-400 font-mono">
          <div className="flex items-center gap-3">
            <svg className="animate-spin h-5 w-5 text-[#35e0c9]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Loading track leader...</span>
          </div>
        </div>
      }
    >
      <TrackLeaderDetailContent />
    </Suspense>
  );
}
