"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { adminLogout, AdminProfile } from "@/lib/api";

interface AdminHeaderProps {
  admin: AdminProfile | null;
}

export default function AdminHeader({ admin }: AdminHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await adminLogout();
    } catch (err) {
      console.error("Error logging out admin session:", err);
    } finally {
      router.replace("/xavitech-superadmin");
    }
  };

  const navLinks = [
    { href: "/xavitech-superadmin/dashboard", label: "Dashboard" },
    { href: "/xavitech-superadmin/registrations", label: "Registrations" },
    { href: "/xavitech-superadmin/teams", label: "Teams" },
  ];

  return (
    <header className="border-b border-neutral-800 bg-[#080b11]/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Badge */}
          <div className="flex items-center gap-6">
            <Link
              href="/xavitech-superadmin/dashboard"
              className="flex items-center gap-2 font-mono font-black text-lg tracking-wider text-white hover:text-[#35e0c9] transition"
            >
              <span>XAVITECH</span>
              <span className="text-[#35e0c9] font-bold">ADMIN</span>
            </Link>

            {/* Nav Tabs */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/xavitech-superadmin/dashboard"
                    ? pathname === link.href
                    : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono tracking-wider transition ${
                      isActive
                        ? "bg-[#35e0c9]/15 text-[#35e0c9] font-semibold border border-[#35e0c9]/30"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Session Status & Logout */}
          <div className="flex items-center gap-3">
            {admin && (
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-300">
                <span className="w-1.5 h-1.5 rounded-full bg-[#35e0c9] animate-pulse" />
                <span className="truncate max-w-[180px]">{admin.email}</span>
              </div>
            )}

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-mono uppercase tracking-wider transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>{isLoggingOut ? "Exiting..." : "Logout"}</span>
            </button>
          </div>
        </div>

        {/* Mobile Nav Tabs */}
        <div className="flex md:hidden items-center space-x-1 pb-3 pt-1 border-t border-neutral-800/60 overflow-x-auto">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/xavitech-superadmin/dashboard"
                ? pathname === link.href
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1 rounded-md text-xs font-mono tracking-wider whitespace-nowrap transition ${
                  isActive
                    ? "bg-[#35e0c9]/15 text-[#35e0c9] font-semibold border border-[#35e0c9]/30"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
