"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

const links = [
  { label: "Home", href: "/" },
  { label: "Tracks", href: "/tracks" },
  { label: "Events", href: "/events" },
  { label: "Schedule", href: "/#schedule" },
  { label: "About", href: "/#about" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, loading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };

    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onChange);
    return () => {
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onChange);
    };
  }, [open]);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-line/60 bg-bg/80 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between pl-[max(1.25rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] py-3.5 sm:pl-[max(1.5rem,env(safe-area-inset-left))] sm:pr-[max(1.5rem,env(safe-area-inset-right))] md:py-4">
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-tight text-ink sm:text-xl transition-colors hover:text-circuit"
        >
          XAVITECH <span className="text-marigold">2026</span>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="group relative text-sm text-muted transition-colors hover:text-ink"
              >
                {link.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-marigold transition-transform duration-300 ease-out group-hover:scale-x-100" />
              </Link>
            </li>
          ))}
        </ul>

        {/* User Auth CTA in Desktop View */}
        <div className="hidden md:flex items-center gap-4">
          {loading ? (
            <div className="h-8 w-20 rounded-full bg-surface border border-line/50 animate-pulse" />
          ) : isAuthenticated && user ? (
            <Link
              href="/profile"
              className="flex items-center gap-2 pl-3 py-1 pr-1.5 rounded-full bg-surface border border-line text-xs font-mono text-ink hover:border-circuit transition-colors group"
            >
              <span className="max-w-[100px] truncate text-muted group-hover:text-ink">
                {user.name?.split(" ")[0] || "Profile"}
              </span>
              <div className="w-6 h-6 rounded-full bg-surface-raised border border-line flex items-center justify-center text-[10px] font-bold text-circuit overflow-hidden">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (user.name || user.email || "U").charAt(0).toUpperCase()
                )}
              </div>
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-xs font-mono font-medium px-4 py-1.5 rounded-full border border-line bg-surface text-ink hover:border-circuit hover:text-circuit transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* 44x44px mobile touch target */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <span
            className={`h-[1.5px] w-5 bg-ink transition-transform ${
              open ? "translate-y-[3.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-[1.5px] w-5 bg-ink transition-transform ${
              open ? "-translate-y-[3.5px] -rotate-45" : ""
            }`}
          />
        </button>
      </nav>

      {/* Mobile Drawer */}
      {open && (
        <div
          id="mobile-menu"
          className="relative max-h-[calc(100svh-4rem)] overflow-y-auto overscroll-contain border-t border-circuit/20 bg-[#050910] pb-[max(1.25rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-4 shadow-[0_24px_60px_rgba(0,0,0,.55)] md:hidden"
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-circuit/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-marigold/10 blur-3xl" />
            <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "linear-gradient(rgba(53,224,201,.7) 1px, transparent 1px), linear-gradient(to right, rgba(53,224,201,.7) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          </div>
          <div className="relative mx-auto max-w-6xl">
            <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <p className="font-oxanium text-[10px] font-bold uppercase tracking-[0.24em] text-circuit">Navigation system</p>
                <p className="mt-1 font-space text-xs text-slate-400">Choose your destination</p>
              </div>
              <span className="flex items-center gap-2 border border-emerald-400/25 bg-emerald-400/[0.06] px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-widest text-emerald-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Online
              </span>
            </div>
            <ul className="flex flex-col gap-2">
              {links.map((link, index) => {
                const active = link.href === "/" ? pathname === "/" : link.href.startsWith("/#") ? false : pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={`group relative flex min-h-[58px] items-center justify-between overflow-hidden border px-4 transition-all duration-200 active:scale-[0.99] ${active ? "border-circuit/70 bg-circuit/[0.09] shadow-[inset_3px_0_0_#35e0c9,0_0_18px_rgba(53,224,201,.08)]" : "border-white/[0.09] bg-white/[0.025] hover:border-circuit/40 hover:bg-circuit/[0.05]"}`}
                    >
                      <span className="flex items-center gap-4">
                        <span className={`font-mono text-[10px] tracking-widest ${active ? "text-circuit" : "text-slate-600 group-hover:text-circuit/80"}`}>{String(index + 1).padStart(2, "0")}</span>
                        <span className={`font-oxanium text-sm font-bold uppercase tracking-[0.12em] ${active ? "text-white" : "text-slate-300 group-hover:text-white"}`}>{link.label}</span>
                      </span>
                      <span className={`text-lg transition-transform group-hover:translate-x-1 ${active ? "text-circuit" : "text-slate-600 group-hover:text-circuit"}`} aria-hidden="true">→</span>
                    </Link>
                  </li>
                );
              })}
              <li className="pt-2">
                {isAuthenticated ? (
                  <Link href="/profile" onClick={() => setOpen(false)} className="flex h-12 w-full items-center justify-center gap-2 border border-circuit/70 bg-circuit font-oxanium text-xs font-black uppercase tracking-[0.16em] text-[#03100f] shadow-[0_0_22px_rgba(53,224,201,.2)] transition hover:brightness-110">
                    My Profile <span aria-hidden="true">↗</span>
                  </Link>
                ) : (
                  <Link href="/login" onClick={() => setOpen(false)} className="flex h-12 w-full items-center justify-center gap-2 bg-gradient-to-r from-marigold to-amber-300 font-oxanium text-xs font-black uppercase tracking-[0.16em] text-[#11100b] shadow-[0_0_22px_rgba(242,166,60,.2)] transition hover:brightness-110">
                    Sign In with Google <span aria-hidden="true">↗</span>
                  </Link>
                )}
              </li>
            </ul>
            <div className="mt-4 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-slate-600">
              <span>XAVITECH 2026</span><span>Menu // {String(links.length).padStart(2, "0")} links</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
