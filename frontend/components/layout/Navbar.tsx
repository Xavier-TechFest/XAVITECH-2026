"use client";

import { useEffect, useState, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

const links = [
  { label: "Tracks", href: "/tracks" },
  { label: "Events", href: "/events" },
  { label: "Schedule", href: "/#schedule" },
  { label: "Results", href: "/results" },
  { label: "About", href: "/#about" },
  { label: "Committee", href: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, loading } = useAuth();
  const pathname = usePathname();

  // Logo / university name -> homepage. Already on the homepage? Just scroll to the top.
  const goHome = (e: MouseEvent<HTMLAnchorElement>) => {
    setOpen(false);
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Close the mobile menu with Escape, and whenever we grow into the desktop layout
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
      <nav className="mx-auto flex max-w-6xl items-center justify-between pl-[max(1.25rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] py-2 sm:pl-[max(1.5rem,env(safe-area-inset-left))] sm:pr-[max(1.5rem,env(safe-area-inset-right))] md:py-4">
        <Link
          href="/"
          onClick={goHome}
          aria-label="XAVITECH — Xavier University, Patna — home"
          className="flex items-center gap-2.5"
        >
          <img
            src="/xavitech-logo-nav.webp"
            alt="XAVITECH"
            width={520}
            height={178}
            className="h-7 w-auto sm:h-8"
          />

          <span className="font-mono text-[9px] font-bold uppercase leading-tight tracking-[0.14em] text-white sm:text-[10px]">
            <span className="block">Xavier University</span>
            <span className="block text-center">|Patna|</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <li key={link.href}>
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

        {/* Action buttons (Registration + Auth) */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/registration"
            className="rounded-full bg-marigold px-5 py-2 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
          >
            Registration
          </Link>

          {loading ? (
            <div className="h-8 w-20 rounded-full bg-surface border border-line/50 animate-pulse" />
          ) : isAuthenticated && user ? (
            <Link
              href="/profile"
              className="flex items-center gap-2 pl-3 py-1.5 pr-1.5 rounded-full bg-surface border border-line text-xs font-mono text-ink hover:border-circuit transition-colors group"
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
              className="text-xs font-mono font-medium px-4 py-2 rounded-full border border-line bg-surface text-ink hover:border-circuit hover:text-circuit transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* 44x44px touch target */}
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

      {open && (
        <div
          id="mobile-menu"
          className="max-h-[calc(100svh-4rem)] overflow-y-auto overscroll-contain border-t border-line/60 bg-bg pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] pt-2 md:hidden"
        >
          <ul className="flex flex-col">
            {links.map((link) => (
              <li key={link.href} className="border-b border-line/40 last:border-0">
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 items-center text-base text-muted transition-colors hover:text-ink active:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="pt-3 flex flex-col gap-2.5">
              <Link
                href="/registration"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-marigold px-6 text-sm font-semibold text-bg text-center"
              >
                Registration
              </Link>
              {loading ? (
                <div className="h-12 w-full rounded-full bg-surface border border-line/50 animate-pulse" />
              ) : isAuthenticated && user ? (
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 items-center justify-center gap-2.5 rounded-full border border-line bg-surface px-6 text-sm font-mono text-ink hover:border-circuit hover:text-circuit transition-colors"
                >
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
                  <span>My Profile ({user.name?.split(" ")[0] || "User"})</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 items-center justify-center rounded-full border border-line bg-surface px-6 text-sm font-mono font-medium text-ink hover:border-circuit hover:text-circuit transition-colors"
                >
                  Sign In
                </Link>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
