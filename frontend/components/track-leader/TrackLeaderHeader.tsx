"use client";

import { useTrackLeader } from "@/context/TrackLeaderContext";

interface TrackLeaderHeaderProps {
  onMobileMenuToggle?: () => void;
}

export default function TrackLeaderHeader({
  onMobileMenuToggle,
}: TrackLeaderHeaderProps) {
  const { trackLeader, theme, toggleTheme } = useTrackLeader();

  const leaderName = trackLeader?.name || trackLeader?.email || "Track Leader";
  const leaderEmail = trackLeader?.email || "";
  const initial = (leaderName.trim().charAt(0) || "T").toUpperCase();

  return (
    <header className="sticky top-0 z-20 h-16 bg-[#080b11]/90 backdrop-blur-md border-b border-neutral-800/80 px-4 sm:px-8 flex items-center justify-between transition-colors">
      {/* Left: Mobile Hamburger (☰) below md + Status Dot + Current Console Title */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {/* Mobile Hamburger Button: ONLY shown below md breakpoint */}
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
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-[#35e0c9] shadow-[0_0_8px_#35e0c9] shrink-0" />
          <h1 className="font-mono font-bold text-xs sm:text-sm uppercase tracking-wider text-white truncate">
            TRACK LEADER CONSOLE
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
            theme === "light"
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
        <div className="flex items-center gap-2.5 p-1 md:px-3 md:py-1.5 rounded-full bg-neutral-900/80 border border-neutral-800 text-xs font-mono text-neutral-300">
          <div className="w-7 h-7 rounded-full bg-[#35e0c9]/15 border border-[#35e0c9]/40 text-[#35e0c9] font-mono font-bold text-xs flex items-center justify-center uppercase shrink-0">
            {initial}
          </div>
          <div className="hidden md:flex flex-col text-left leading-tight">
            <span
              className="truncate max-w-[160px] text-neutral-200 font-semibold"
              title={leaderName}
            >
              {leaderName}
            </span>
            <span className="text-[10px] uppercase font-mono text-[#35e0c9] tracking-wider font-bold">
              {leaderEmail ? leaderEmail : "TRACK LEADER"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
