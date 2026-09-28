"use client";

import React, { useState } from "react";
import Link from "next/link";
import { trackLeaderForgotPassword } from "@/lib/api";

export default function TrackLeaderForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await trackLeaderForgotPassword(cleanEmail);
      setSuccessMessage(
        res.message ||
          "If a Track Leader account exists for this email, a password reset link has been sent."
      );
    } catch (err: any) {
      setErrorMessage(
        err.message || "Unable to process password reset request. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
            Track Leader Password Recovery
          </h1>
          <p className="text-xs text-slate-400 mt-1.5">
            Enter your email to receive a password reset link
          </p>
        </div>

        {/* Success Alert */}
        {successMessage ? (
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
              <div className="space-y-1">
                <p className="font-semibold text-emerald-200">Reset Link Dispatched</p>
                <p className="text-emerald-300/90 leading-relaxed">{successMessage}</p>
                <p className="text-[11px] text-emerald-400/80 mt-1">
                  Please check your inbox (and spam folder). The link expires in 30 minutes.
                </p>
              </div>
            </div>

            <div className="pt-2 text-center">
              <Link
                href="/track-leader/login"
                className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-semibold text-sm transition-all shadow-md shadow-cyan-950/40"
              >
                Return to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <>
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  disabled={isSubmitting}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="leader@xavitech.org"
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
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <span>Send Reset Link</span>
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
        )}
      </div>
    </div>
  );
}
