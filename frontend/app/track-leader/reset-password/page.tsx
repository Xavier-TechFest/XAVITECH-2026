"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { trackLeaderResetPassword } from "@/lib/api";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const hasNoToken = !token.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasNoToken) {
      setErrorMessage("Password reset token is missing. Please request a new link.");
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await trackLeaderResetPassword(token, newPassword, confirmPassword);
      setSuccess(true);
    } catch (err: any) {
      setErrorMessage(
        err.message || "Failed to reset password. The link may be expired or invalid."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasNoToken) {
    return (
      <div className="space-y-5">
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs flex items-start space-x-3">
          <svg
            className="w-5 h-5 text-rose-400 shrink-0 mt-0.5"
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
          <div>
            <p className="font-semibold text-rose-200">Missing Reset Token</p>
            <p className="mt-1 text-rose-300/90 leading-relaxed">
              No reset token was found in your link. The link may be incomplete or invalid.
            </p>
          </div>
        </div>
        <div className="pt-2 text-center">
          <Link
            href="/track-leader/forgot-password"
            className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-semibold text-sm transition-all shadow-md shadow-cyan-950/40"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-5">
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-start space-x-3">
          <svg
            className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="font-semibold text-emerald-200">Password Reset Complete</p>
            <p className="mt-1 text-emerald-300/90 leading-relaxed">
              Your password has been successfully updated. All previous sessions have been invalidated.
            </p>
          </div>
        </div>
        <div className="pt-2 text-center">
          <Link
            href="/track-leader/login"
            className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-semibold text-sm transition-all shadow-md shadow-cyan-950/40"
          >
            Sign In with New Password
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            New Password
          </label>
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            disabled={isSubmitting}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#07090f] border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Confirm Password
          </label>
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            disabled={isSubmitting}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your new password"
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
              <span>Resetting Password...</span>
            </>
          ) : (
            <span>Reset Password</span>
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
        <p className="text-xs text-slate-400">
          Remember your password?{" "}
          <Link
            href="/track-leader/login"
            className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
}

export default function TrackLeaderResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md bg-[#0c101a] border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/20 relative">
        {/* Brand Header */}
        <div className="text-center mb-7">
          <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 items-center justify-center font-bold text-white text-lg shadow-lg shadow-cyan-900/40 mb-3.5">
            TL
          </div>
          <div className="text-xs uppercase font-mono tracking-widest text-cyan-400 font-semibold mb-1">
            XAVITECH 2026
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Set New Password
          </h1>
          <p className="text-xs text-slate-400 mt-1.5">
            Choose a strong password to secure your Track Leader account
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400">Loading reset verification...</p>
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
