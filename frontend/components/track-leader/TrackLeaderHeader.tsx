"use client";

import { usePathname } from "next/navigation";
import { useTrackLeader } from "@/context/TrackLeaderContext";

interface TrackLeaderHeaderProps {
  onMobileMenuToggle?: () => void;
}

export default function TrackLeaderHeader({
  onMobileMenuToggle,
}: TrackLeaderHeaderProps) {
  const pathname = usePathname();
  const { trackLeader, theme, toggleTheme } = useTrackLeader();
  const isLight = theme === "light";

  const getPageTitle = (path: string): string => {
    if (path.startsWith("/track-leader/registrations")) {
      return "REGISTRATIONS";
    }
    return "TRACK LEADER CONSOLE";
  };

  const title = getPageTitle(pathname || "");
  const leaderName = trackLeader?.name || trackLeader?.email || "Track Leader";
  const leaderEmail = trackLeader?.email || "";
  const initial = (leaderName.trim().charAt(0) || "T").toUpperCase();

  return (
    <header
      className={`sticky top-0 z-20 h-16 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between transition-colors border-b ${
        isLight
          ? "bg-white/90 border-slate-200"
          : "bg-[#080b11]/90 border-neutral-800/80"
      }`}
    >
      {/* Left: Mobile Hamburger (☰) below md + Status Dot + Current Console Title */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {/* Mobile Hamburger Button: ONLY shown below md breakpoint */}
        <button
          onClick={onMobileMenuToggle}
          aria-label="Open mobile navigation menu"
          title="Open menu"
          className={`md:hidden p-2 rounded-lg border transition cursor-pointer shrink-0 ${
            isLight
              ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700"
              : "bg-neutral-900/90 border-neutral-800 text-neutral-300 hover:text-[#35e0c9] hover:bg-neutral-800"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Small Status Dot + Page Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              isLight
                ? "bg-teal-600 shadow-[0_0_8px_rgba(13,148,136,0.6)]"
                : "bg-[#35e0c9] shadow-[0_0_8px_#35e0c9]"
            }`}
          />
          <h1
            className={`font-mono font-bold text-xs sm:text-sm uppercase tracking-wider truncate ${
              isLight ? "text-slate-900" : "text-white"
            }`}
          >
            {title}
          </h1>
        </div>
      </div>

      {/* Right: Theme Toggle (☀️ / 🌙) + Avatar / Identity Pill */}
      <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
        {/* Dark / Light Mode Toggle Button matching Admin */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className={`p-2 rounded-xl border transition cursor-pointer flex items-center justify-center ${
            isLight
              ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700"
              : "bg-neutral-900/80 hover:bg-neutral-800 border-neutral-800 text-neutral-300 hover:text-[#35e0c9]"
          }`}
        >
          {theme === "dark" ? (
            /* Sun Icon (clicking switches to light mode) */
            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            /* Moon Icon (clicking switches to dark mode) */
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

        {/* Track Leader Avatar + Identity Pill */}
        <div
          className={`flex items-center gap-2.5 p-1 md:px-3 md:py-1.5 rounded-full border text-xs font-mono ${
            isLight
              ? "bg-slate-100 border-slate-300 text-slate-800"
              : "bg-neutral-900/80 border-neutral-800 text-neutral-300"
          }`}
        >
          <div
            className={`w-7 h-7 rounded-full font-mono font-bold text-xs flex items-center justify-center uppercase shrink-0 border ${
              isLight
                ? "bg-teal-50 border-teal-300 text-teal-800"
                : "bg-[#35e0c9]/15 border-[#35e0c9]/40 text-[#35e0c9]"
            }`}
          >
            {initial}
          </div>
          <div className="hidden md:flex flex-col text-left leading-tight">
            <span
              className={`truncate max-w-[160px] font-semibold ${
                isLight ? "text-slate-900" : "text-neutral-200"
              }`}
              title={leaderName}
            >
              {leaderName}
            </span>
            <span
              className={`text-[10px] uppercase font-mono tracking-wider font-bold ${
                isLight ? "text-teal-700" : "text-[#35e0c9]"
              }`}
            >
              {leaderEmail ? leaderEmail : "TRACK LEADER"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
