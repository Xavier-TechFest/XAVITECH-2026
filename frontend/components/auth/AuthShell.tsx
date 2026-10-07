"use client";

import React from "react";
import Link from "next/link";
import AuthBranding from "./AuthBranding";

interface AuthShellProps {
  children: React.ReactNode;
  portalType: "participant" | "track-leader" | "superadmin";
  backHref?: string;
  backLabel?: string;
  technicalMeta?: Array<{ label: string; value: string }>;
  hasNavbar?: boolean;
}

export default function AuthShell({
  children,
  portalType,
  backHref,
  backLabel = "Back to Festival",
  technicalMeta,
  hasNavbar = false,
}: AuthShellProps) {
  return (
    <main
      className={`relative isolate min-h-screen overflow-hidden bg-[#05090b] px-4 text-[#ece8de] flex flex-col justify-between sm:px-6 lg:px-8 ${
        hasNavbar ? "pt-24 pb-12 sm:pt-28 sm:pb-16" : "py-8 sm:py-12"
      }`}
    >
      {/* 1. Background Atmospheric Glow Orbs & Subtle Grids (Matching profile/page.tsx) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -right-28 top-12 h-80 w-80 rounded-full bg-emerald-500/[0.07] blur-3xl" />
        <div className="absolute -left-32 top-[36rem] h-96 w-96 rounded-full bg-cyan-500/[0.045] blur-3xl" />
        <div className="absolute bottom-[-10rem] right-1/3 h-80 w-80 rounded-full bg-marigold/[0.035] blur-3xl" />
        {/* Subtle Tech Circuit Grid Overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(53,224,201,.55) 1px, transparent 1px), linear-gradient(to right, rgba(53,224,201,.55) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
            maskImage: "linear-gradient(to bottom, black 30%, transparent 95%)",
          }}
        />
        {/* Subtle Stardust Dots */}
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: "radial-gradient(#dce6ff 0.7px, transparent 0.7px)",
            backgroundSize: "73px 73px",
          }}
        />
      </div>

      {/* 2. Top Navigation Bar (Header Breadcrumb Row) */}
      <div className="mx-auto w-full max-w-5xl flex items-center justify-between border-b border-white/10 pb-4 mb-6 sm:mb-8">
        {backHref ? (
          <Link
            href={backHref}
            className="group inline-flex min-h-10 items-center gap-2 font-body text-xs sm:text-sm text-slate-300 transition-colors hover:text-circuit"
          >
            <span
              aria-hidden="true"
              className="text-circuit transition-transform group-hover:-translate-x-1"
            >
              ←
            </span>
            {backLabel}
          </Link>
        ) : (
          <div className="inline-flex items-center gap-2 font-oxanium text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-circuit animate-pulse" />
            XAVITECH 2026 // SECURE ACCESS
          </div>
        )}

        <div className="flex items-center gap-3 font-mono text-[10px] sm:text-xs text-slate-500">
          <span className="hidden sm:inline">SECURE PROTOCOL</span>
          <span className="border border-white/10 bg-white/[0.02] px-2 py-0.5 text-slate-300 font-oxanium tracking-widest text-[9px]">
            TLS 1.3
          </span>
        </div>
      </div>

      {/* 3. Main Center Stage: 2-Column on Desktop (Branding + Card), Single Column on Mobile */}
      <div className="mx-auto w-full max-w-5xl my-auto py-2 sm:py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Technical Branding Panel */}
          <div className="lg:col-span-6 xl:col-span-6">
            <AuthBranding portalType={portalType} technicalMeta={technicalMeta} />
          </div>

          {/* Right Column: Authentication Form Card */}
          <div className="lg:col-span-6 xl:col-span-6 w-full max-w-md mx-auto lg:max-w-none">
            {children}
          </div>
        </div>
      </div>

      {/* 4. Technical Footer */}
      <div className="mx-auto w-full max-w-5xl mt-8 pt-4 border-t border-white/[0.07] flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left font-oxanium text-[9px] uppercase tracking-[0.18em] text-slate-600">
        <div>
          XaviTech 2026 <span className="mx-2 text-marigold/70">/</span> Xavier University, Patna
        </div>
        <div className="font-mono text-[9px] text-slate-600">
          AUTHORIZED ACCESS ONLY • ALL ATTEMPTS LOGGED
        </div>
      </div>
    </main>
  );
}
