"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  TrackLeaderProvider,
  useTrackLeader,
} from "@/context/TrackLeaderContext";

function TrackLeaderPortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { trackLeader, assignedTrack, logout } = useTrackLeader();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // If on auth or recovery page, render without the portal chrome
  const isAuthPage =
    pathname === "/track-leader/login" ||
    pathname === "/track-leader/change-password" ||
    pathname === "/track-leader/forgot-password" ||
    pathname === "/track-leader/reset-password";

  if (isAuthPage) {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col font-sans">
      {/* 1. Portal Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0c101a]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between shadow-lg shadow-black/20">
        <div className="flex items-center space-x-3">
          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            aria-label="Toggle Navigation"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Logo & Portal Branding */}
          <Link
            href="/track-leader/dashboard"
            className="flex items-center space-x-2.5 group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-md shadow-cyan-900/30 group-hover:scale-105 transition-transform">
              TL
            </div>
            <div>
              <div className="text-xs font-semibold tracking-wider uppercase text-cyan-400 font-mono">
                XAVITECH 2026
              </div>
              <div className="text-sm font-bold text-white tracking-tight">
                Track Leader Portal
              </div>
            </div>
          </Link>
        </div>

        {/* Assigned Track Pill & User Summary */}
        <div className="flex items-center space-x-3 sm:space-x-5">
          {assignedTrack && (
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/50 text-xs text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-medium truncate max-w-[180px]">
                {assignedTrack.name}
              </span>
            </div>
          )}

          {trackLeader && (
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-200 truncate max-w-[160px]">
                {trackLeader.name || trackLeader.email}
              </span>
              <span className="text-[10px] uppercase font-mono text-cyan-400 tracking-wider">
                TRACK LEADER
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-lg border border-rose-900/40 hover:bg-rose-950/30 transition-all flex items-center space-x-1.5"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* 2. Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-[#0c101a] border-r border-slate-800 p-5 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-800 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                  TL
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase text-cyan-400 font-mono">
                    Track Leader
                  </div>
                  <div className="text-xs text-slate-400 truncate max-w-[160px]">
                    {trackLeader?.email}
                  </div>
                </div>
              </div>

              {assignedTrack && (
                <div className="mb-6 p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-[11px] uppercase font-mono text-slate-400 mb-1">
                    Assigned Track
                  </div>
                  <div className="text-sm font-semibold text-cyan-300">
                    {assignedTrack.name}
                  </div>
                </div>
              )}

              <nav className="space-y-1">
                <Link
                  href="/track-leader/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-white bg-slate-800/60 hover:bg-slate-800 transition-colors"
                >
                  <svg
                    className="w-4 h-4 text-cyan-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  <span>Dashboard</span>
                </Link>

                <Link
                  href="/track-leader/dashboard#events"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/40 transition-colors"
                >
                  <svg
                    className="w-4 h-4 text-indigo-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <span>Track Events</span>
                </Link>
              </nav>
            </div>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setShowLogoutModal(true);
              }}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg border border-rose-900/60 bg-rose-950/20 text-rose-300 text-sm font-medium hover:bg-rose-950/40 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Content Container */}
      <main className="flex-1 flex flex-col">{children}</main>

      {/* 4. Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-[#0d121d] border border-slate-800 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-400">
              <div className="p-2.5 rounded-lg bg-rose-950/50 border border-rose-900/40">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-white">
                Confirm Logout
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Are you sure you want to end your current Track Leader session?
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={() => setShowLogoutModal(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={handleLogout}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors flex items-center space-x-1.5 disabled:opacity-50"
              >
                {isLoggingOut && (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackLeaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TrackLeaderProvider>
      <TrackLeaderPortalShell>{children}</TrackLeaderPortalShell>
    </TrackLeaderProvider>
  );
}
