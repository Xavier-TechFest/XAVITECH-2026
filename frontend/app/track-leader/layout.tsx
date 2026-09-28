"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import {
  TrackLeaderProvider,
  useTrackLeader,
} from "@/context/TrackLeaderContext";
import TrackLeaderSidebar from "@/components/track-leader/TrackLeaderSidebar";
import TrackLeaderHeader from "@/components/track-leader/TrackLeaderHeader";

function TrackLeaderPortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isSidebarCollapsed, theme } = useTrackLeader();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If on auth or recovery page, render without the portal chrome
  const isAuthPage =
    pathname === "/track-leader/login" ||
    pathname === "/track-leader/change-password" ||
    pathname === "/track-leader/forgot-password" ||
    pathname === "/track-leader/reset-password";

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div
      data-admin-theme={theme}
      className={`min-h-screen ${
        theme === "light"
          ? "admin-theme-light bg-[#f8fafc] text-slate-900"
          : "admin-theme-dark bg-[#080b11] text-white"
      } flex flex-col md:flex-row relative transition-colors duration-200`}
    >
      {/* 1. Desktop Fixed Sidebar with Stable Width and Smooth Transition */}
      <div
        className={`hidden md:flex ${
          isSidebarCollapsed ? "md:w-20" : "md:w-64"
        } md:flex-col md:fixed md:inset-y-0 z-30 shrink-0 transition-[width] duration-300 ease-in-out`}
      >
        <TrackLeaderSidebar />
      </div>

      {/* 2. Mobile Slide-Over Drawer (256px wide, fixed from left edge, full height) */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          {/* Full-screen Dark Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          {/* Fixed Left-edge Drawer: exactly 256px (w-64), shrink-0, h-full, z-50 */}
          <div className="fixed inset-y-0 left-0 z-50 w-64 shrink-0 h-full bg-[#0a0e17] shadow-2xl flex flex-col">
            <TrackLeaderSidebar
              forceExpanded={true}
              onItemClick={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 3. Main Area */}
      <div
        className={`flex-1 ${
          isSidebarCollapsed ? "md:pl-20" : "md:pl-64"
        } flex flex-col min-w-0 transition-[padding] duration-300 ease-in-out`}
      >
        <TrackLeaderHeader onMobileMenuToggle={() => setMobileMenuOpen(true)} />
        <main className="flex-1">{children}</main>
      </div>
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
