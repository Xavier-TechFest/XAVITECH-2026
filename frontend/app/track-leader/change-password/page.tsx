"use client";

import React, { useState } from "react";
import { useTrackLeader } from "@/context/TrackLeaderContext";

export default function TrackLeaderChangePasswordPage() {
  const { changePassword, trackLeader, logout } = useTrackLeader();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage("All password fields are required.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New password and confirmation do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMessage("New password must be different from your temporary password.");
      return;
    }

    setIsSubmitting(true);

    try {
      await changePassword(currentPassword, newPassword);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to change password. Please verify current credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md bg-[#0c101a] border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/20 relative">
        {/* Banner Alert for First Login */}
        <div className="mb-6 p-4 rounded-xl bg-amber-950/30 border border-amber-800/50 text-amber-300">
          <div className="flex items-center space-x-2 font-semibold text-xs uppercase tracking-wider mb-1">
            <svg
              className="w-4 h-4 text-amber-400"
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
            <span>Password Change Required</span>
          </div>
          <p className="text-xs text-amber-200/80 leading-relaxed">
            You are logged in with an administrator-issued temporary password. Please create a new secure password to unlock your track console.
          </p>
        </div>

        {/* User Identity Note */}
        {trackLeader && (
          <div className="mb-5 text-center">
            <div className="text-xs text-slate-400">Account</div>
            <div className="text-sm font-semibold text-slate-200 truncate">
              {trackLeader.email}
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-lg bg-rose-950/40 border border-rose-900/60 text-xs text-rose-300 flex items-start space-x-2.5">
            <svg
              className="w-4 h-4 text-rose-400 shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Current / Temporary Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              required
              disabled={isSubmitting}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#07090f] border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              New Password (min 8 characters)
            </label>
            <input
              type="password"
              autoComplete="new-password"
              required
              disabled={isSubmitting}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#07090f] border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              autoComplete="new-password"
              required
              disabled={isSubmitting}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#07090f] border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-semibold text-sm transition-all shadow-md shadow-cyan-950/40 flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <span>Save New Password & Continue</span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-center">
          <button
            type="button"
            onClick={logout}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Sign out instead
          </button>
        </div>
      </div>
    </div>
  );
}
