"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTrackLeader } from "@/context/TrackLeaderContext";

interface TrackLeaderSidebarProps {
  onItemClick?: () => void;
  forceExpanded?: boolean;
}

export default function TrackLeaderSidebar({
  onItemClick,
  forceExpanded = false,
}: TrackLeaderSidebarProps) {
  const pathname = usePathname();
  const { trackLeader, logout, isSidebarCollapsed, toggleSidebar } = useTrackLeader();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
      if (onItemClick) {
        onItemClick();
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const isCollapsed = forceExpanded ? false : isSidebarCollapsed;

  const leaderName = trackLeader?.name || trackLeader?.email || "Track Leader";
  const leaderEmail = trackLeader?.email || "";
  const initial = (leaderName.trim().charAt(0) || "T").toUpperCase();

  const navItems = [
    {
      href: "/track-leader/dashboard",
      label: "Dashboard",
      isActive: pathname === "/track-leader/dashboard" || pathname === "/track-leader",
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      ),
    },
    {
      href: "/track-leader/registrations",
      label: "Registrations",
      isActive: pathname.startsWith("/track-leader/registrations"),
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
    },
  ];

  return (
    <>
      <aside
        className={`${
          isCollapsed ? "w-20" : "w-64"
        } shrink-0 flex flex-col h-full bg-[#0a0e17] border-r border-neutral-800/80 select-none transition-[width] duration-300 ease-in-out`}
      >
        {/* 1. Header Area: Branding + Desktop Toggle */}
        <div
          className={`h-16 px-4 border-b border-neutral-800/80 flex items-center ${
            isCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          {isCollapsed ? (
            /* Collapsed: Centered hamburger button (☰) */
            <button
              onClick={toggleSidebar}
              aria-label="Expand sidebar"
              title="Expand sidebar"
              className="p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-neutral-300 hover:text-[#35e0c9] hover:bg-neutral-800 transition cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          ) : (
            /* Expanded: XAVITECH Branding + Hamburger Collapse Button (☰) */
            <>
              <Link
                href="/track-leader/dashboard"
                onClick={onItemClick}
                className="group block"
              >
                <div className="font-mono font-black text-xl tracking-tight text-white group-hover:text-[#35e0c9] transition">
                  XAVITECH
                </div>
                <div className="text-[11px] font-mono tracking-widest text-[#35e0c9] uppercase font-bold flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#35e0c9]" />
                  TRACK LEADER PORTAL
                </div>
              </Link>
              {!forceExpanded && (
                <button
                  onClick={toggleSidebar}
                  aria-label="Collapse sidebar"
                  title="Collapse sidebar"
                  className="p-2 rounded-lg bg-neutral-900/90 border border-neutral-800 text-neutral-300 hover:text-[#35e0c9] hover:bg-neutral-800 transition cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
            </>
          )}
        </div>

        {/* 2. Navigation Items */}
        <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
          {!isCollapsed && (
            <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-wider text-neutral-500">
              Navigation
            </div>
          )}
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={onItemClick}
              title={item.label}
              aria-label={item.label}
              className={`flex items-center ${
                isCollapsed ? "justify-center px-0 py-3" : "gap-3 px-3.5 py-2.5"
              } rounded-xl text-xs font-mono tracking-wide transition group relative ${
                item.isActive
                  ? "bg-[#35e0c9]/10 text-[#35e0c9] font-bold border border-[#35e0c9]/30 shadow-sm shadow-[#35e0c9]/10"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
              }`}
            >
              <span
                className={`${
                  item.isActive ? "text-[#35e0c9]" : "text-neutral-500 group-hover:text-neutral-300"
                } transition`}
              >
                {item.icon}
              </span>
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* 3. Bottom Section: Track Leader Identity & Logout */}
        <div className="p-3 border-t border-neutral-800/80 bg-[#080b11]">
          {isCollapsed ? (
            /* Collapsed Bottom: Initial Avatar + Logout icon */
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-10 h-10 rounded-full bg-neutral-900/90 border border-neutral-800 flex items-center justify-center relative cursor-help"
                title={`Track Leader: ${leaderName} (${leaderEmail})`}
                aria-label={`Track Leader: ${leaderName}`}
              >
                <span className="font-mono font-bold text-sm text-[#35e0c9] uppercase">
                  {initial}
                </span>
                <span className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#0a0e17]" />
              </div>

              <button
                type="button"
                disabled={isLoggingOut}
                onClick={() => setShowLogoutModal(true)}
                title="Logout"
                aria-label="Logout"
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 hover:border-red-500/40 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          ) : (
            /* Expanded Bottom: Full box with Initial Avatar + Full Logout button */
            <>
              {/* Identity Box */}
              <div className="px-3 py-2.5 mb-2 rounded-xl bg-neutral-900/60 border border-neutral-800/60 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#35e0c9]/15 border border-[#35e0c9]/40 text-[#35e0c9] font-mono font-bold text-xs flex items-center justify-center uppercase shrink-0">
                  {initial}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    TRACK LEADER
                  </div>
                  <div className="text-xs font-mono text-neutral-200 truncate mt-0.5 font-semibold" title={leaderName}>
                    {leaderName}
                  </div>
                </div>
              </div>

              {/* Full Logout Button */}
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={() => setShowLogoutModal(true)}
                aria-label="Logout"
                title="Logout"
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 hover:border-red-500/40 rounded-xl text-xs font-mono uppercase tracking-wider transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Logout</span>
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={(e) => {
            if (!isLoggingOut && e.target === e.currentTarget) {
              setShowLogoutModal(false);
            }
          }}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-[#0e131f] border border-neutral-800 p-6 shadow-2xl space-y-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </div>
              <div>
                <h3 id="logout-modal-title" className="text-base font-bold text-white font-mono">
                  Confirm Logout
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  End your active Track Leader session
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Are you sure you want to end your current Track Leader console session? You will need to sign in again to access your assigned track data.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider font-bold text-white bg-red-600 hover:bg-red-500 transition cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-red-900/30"
              >
                {isLoggingOut ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Logging out...</span>
                  </>
                ) : (
                  <span>Logout</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
