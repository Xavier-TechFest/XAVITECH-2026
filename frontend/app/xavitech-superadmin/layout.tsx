"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { AdminProvider, useAdmin } from "@/context/AdminContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

function AdminAuthLoading() {
  return (
    <div className="min-h-screen bg-[#080b11] flex flex-col items-center justify-center p-4 selection:bg-[#35e0c9]/30">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-neutral-800 border-t-[#35e0c9] animate-spin" />
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-400">
          <span className="w-1.5 h-1.5 rounded-full bg-[#35e0c9] animate-pulse" />
          <span>Verifying Admin Authorization...</span>
        </div>
      </div>
    </div>
  );
}

function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const normalizedPath = pathname?.replace(/\/$/, "") || "";
  const isLoginPage = normalizedPath === "/xavitech-superadmin";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { admin, isLoadingAdmin, isSidebarCollapsed, theme } = useAdmin();

  // If on login page, render children directly without admin layout chrome
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Guard protected routes: prevent unauthenticated flash of Sidebar, Header, or page content
  if (isLoadingAdmin || !admin) {
    return <AdminAuthLoading />;
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
        <AdminSidebar />
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
            <AdminSidebar
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
        {/* AdminHeader: mobile hamburger only on mobile (< md), clean on desktop, theme toggle available throughout */}
        <AdminHeader onMobileMenuToggle={() => setMobileMenuOpen(true)} />

        {/* Page Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <AdminLayoutShell>{children}</AdminLayoutShell>
    </AdminProvider>
  );
}
