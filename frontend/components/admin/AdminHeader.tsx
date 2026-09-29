"use client";

import { usePathname } from "next/navigation";
import { useAdmin } from "@/context/AdminContext";

interface AdminHeaderProps {
  onMobileMenuToggle?: () => void;
}

export default function AdminHeader({ onMobileMenuToggle }: AdminHeaderProps) {
  const pathname = usePathname();
  const { admin, theme, toggleTheme } = useAdmin();

  // Route-to-title mapping matching exact specification
  const getPageTitle = (path: string): string => {
    if (path === "/xavitech-superadmin/dashboard") {
      return "ADMIN DASHBOARD";
    }
    if (path.startsWith("/xavitech-superadmin/registrations/view")) {
      return "REGISTRATION DETAILS";
    }
    if (path.startsWith("/xavitech-superadmin/registrations")) {
      return "REGISTRATIONS";
    }
    if (path.startsWith("/xavitech-superadmin/teams/view")) {
      return "TEAM DETAILS";
    }
    if (path.startsWith("/xavitech-superadmin/teams")) {
      return "TEAMS";
    }
    return "ADMIN DASHBOARD";
  };

  const title = getPageTitle(pathname);
  const adminEmail = admin?.email || "admin@college.edu";
  const initial = (adminEmail.trim().charAt(0) || "A").toUpperCase();

  return (
    <header className="sticky top-0 z-20 h-16 bg-[#080b11]/90 backdrop-blur-md border-b border-neutral-800/80 px-4 sm:px-8 flex items-center justify-between transition-colors">
      {/* Left: Mobile Hamburger (☰) below md + Small Status Dot + Current Page Title */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {/* Mobile Hamburger Button: ONLY shown below md breakpoint, ALWAYS ☰ */}
        <button
          onClick={onMobileMenuToggle}
          aria-label="Open mobile navigation menu"
          title="Open menu"
          className="md:hidden p-2 rounded-lg bg-neutral-900/90 border border-neutral-800 text-neutral-300 hover:text-[#35e0c9] hover:bg-neutral-800 transition cursor-pointer shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Small Status Dot + Page Title */}
        <div className="flex items-center gap-2.5 min-w-0 truncate">
          <span className="w-2 h-2 rounded-full bg-[#35e0c9] shadow-[0_0_8px_#35e0c9] shrink-0" />
          <h1 className="font-mono font-bold text-xs sm:text-sm uppercase tracking-wider text-white truncate">
            {title}
          </h1>
        </div>
      </div>

      {/* Right: Theme Toggle (☀️ / 🌙) + Circular Admin Avatar (First Letter) + Email on Desktop Only */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Dark / Light Mode Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className={`p-2 rounded-xl border transition cursor-pointer flex items-center justify-center ${
            theme === "light"
              ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700"
              : "bg-neutral-900/80 hover:bg-neutral-800 border-neutral-800 text-neutral-300 hover:text-[#35e0c9]"
          }`}
        >
          {theme === "dark" ? (
            /* Sun Icon (currently dark mode, clicking switches to light mode) */
            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            /* Moon Icon (currently light mode, clicking switches to dark mode) */
            <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </button>

        {/* Circular Admin Avatar + Email on Desktop Only */}
        <div className="flex items-center gap-2.5 p-1 md:px-3 md:py-1.5 rounded-full bg-neutral-900/80 border border-neutral-800 text-xs font-mono text-neutral-300">
          <div className="w-7 h-7 rounded-full bg-[#35e0c9]/15 border border-[#35e0c9]/40 text-[#35e0c9] font-mono font-bold text-xs flex items-center justify-center uppercase shrink-0">
            {initial}
          </div>
          {/* Email text is completely hidden on mobile (< md), visible on md and above */}
          <span className="hidden md:inline truncate max-w-[280px] text-neutral-200" title={adminEmail}>
            {adminEmail}
          </span>
        </div>
      </div>
    </header>
  );
}