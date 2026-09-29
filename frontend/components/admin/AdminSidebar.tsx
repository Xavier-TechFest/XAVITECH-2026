"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdmin } from "@/context/AdminContext";

interface AdminSidebarProps {
  onItemClick?: () => void;
  forceExpanded?: boolean;
}

export default function AdminSidebar({ onItemClick, forceExpanded = false }: AdminSidebarProps) {
  const pathname = usePathname();
  const { admin, logout, isSidebarCollapsed, toggleSidebar } = useAdmin();
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

  // If forceExpanded is true (e.g. inside mobile drawer), ignore collapsed state
  const isCollapsed = forceExpanded ? false : isSidebarCollapsed;

  const adminEmail = admin?.email || "admin@college.edu";
  const initial = (adminEmail.trim().charAt(0) || "A").toUpperCase();

  const navItems = [
    {
      href: "/xavitech-superadmin/dashboard",
      label: "Dashboard",
      isActive: pathname === "/xavitech-superadmin/dashboard",
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
      href: "/xavitech-superadmin/registrations",
      label: "Registrations",
      isActive: pathname.startsWith("/xavitech-superadmin/registrations"),
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
    {
      href: "/xavitech-superadmin/teams",
      label: "Teams",
      isActive: pathname.startsWith("/xavitech-superadmin/teams"),
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      href: "/xavitech-superadmin/track-leaders",
      label: "Track Leaders",
      isActive: pathname.startsWith("/xavitech-superadmin/track-leaders"),
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
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
            /* Collapsed: Centered hamburger button (☰). Never an X. */
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
                href="/xavitech-superadmin/dashboard"
                onClick={onItemClick}
                className="group block"
              >
                <div className="font-mono font-black text-xl tracking-tight text-white group-hover:text-[#35e0c9] transition">
                  XAVITECH
                </div>
                <div className="text-[11px] font-mono tracking-widest text-[#35e0c9] uppercase font-bold flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#35e0c9]" />
                  ADMIN PANEL
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
              key={item.href}
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

        {/* 3. Bottom Section: Admin Info & Logout */}
        <div className="p-3 border-t border-neutral-800/80 bg-[#080b11]">
          {isCollapsed ? (
            /* Collapsed Bottom: [ R ] Initial Avatar + [ ⇥ ] Logout icon */
            <div className="flex flex-col items-center gap-3">
              {/* Circular Avatar with First Letter */}
              <div
                className="w-10 h-10 rounded-full bg-neutral-900/90 border border-neutral-800 flex items-center justify-center relative cursor-help"
                title={`Logged-in Admin: ${adminEmail}`}
                aria-label={`Logged-in Admin: ${adminEmail}`}
              >
                <span className="font-mono font-bold text-sm text-[#35e0c9] uppercase">
                  {initial}
                </span>
                <span className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#0a0e17]" />
              </div>

              {/* Logout Icon Button (opens confirmation modal) */}
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
              {/* Admin Info Box */}
              <div className="px-3 py-2.5 mb-2 rounded-xl bg-neutral-900/60 border border-neutral-800/60 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#35e0c9]/15 border border-[#35e0c9]/40 text-[#35e0c9] font-mono font-bold text-xs flex items-center justify-center uppercase shrink-0">
                  {initial}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Logged-in Admin
                  </div>
                  <div className="text-xs font-mono text-neutral-200 truncate mt-0.5" title={adminEmail}>
                    {adminEmail}
                  </div>
                </div>
              </div>

              {/* Full Logout Button (opens confirmation modal) */}
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
                <h2 id="logout-modal-title" className="text-base font-bold font-mono text-white">
                  Confirm Logout
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Are you sure you want to end your current admin session?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono uppercase tracking-wider transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 hover:border-red-500/50 text-xs font-mono uppercase tracking-wider font-semibold transition cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoggingOut ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>LOGGING OUT...</span>
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
