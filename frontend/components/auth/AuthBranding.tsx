"use client";

import React from "react";

interface AuthBrandingProps {
  portalType: "participant" | "track-leader" | "superadmin";
  technicalMeta?: Array<{ label: string; value: string }>;
}

export default function AuthBranding({
  portalType,
  technicalMeta,
}: AuthBrandingProps) {
  const portalConfig = {
    participant: {
      statusText: "SYSTEM ONLINE",
      statusAccent: "circuit",
      badge: "PARTICIPANT GATEWAY",
      tagline: "Festival Participation Portal",
      description:
        "Authenticate to access your verified festival credentials, track registrations, event schedules, and live festival updates.",
      metrics: [
        { label: "PROTOCOL", value: "OAUTH2 / GOOGLE" },
        { label: "EVENTS", value: "13 COMPETITIONS" },
        { label: "GATEWAY", value: "XVT-PARTICIPANT-01" },
      ],
    },
    "track-leader": {
      statusText: "TRACK CONSOLE ACTIVE",
      statusAccent: "circuit",
      badge: "TRACK OPERATIONS CONSOLE",
      tagline: "Assigned Track Operations & Coordination",
      description:
        "Dedicated administration terminal for appointed Track Leaders. Manage event registrations, participant rosters, and track logistics.",
      metrics: [
        { label: "ACCESS LEVEL", value: "TRACK COORDINATOR" },
        { label: "ISOLATION", value: "ROLE & TRACK STRICT" },
        { label: "GATEWAY", value: "XVT-TL-CONSOLE-02" },
      ],
    },
    superadmin: {
      statusText: "RESTRICTED ACCESS // LEVEL 4",
      statusAccent: "marigold",
      badge: "SUPERADMIN CONTROL",
      tagline: "Central Festival Infrastructure",
      description:
        "Authorized festival operations, coordination console, and system management. All connection attempts and transactions are audited.",
      metrics: [
        { label: "SECURITY", value: "MULTI-SECRET / TLS 1.3" },
        { label: "ROLE", value: "FESTIVAL SUPERADMIN" },
        { label: "GATEWAY", value: "XVT-ROOT-ADMIN-00" },
      ],
    },
  }[portalType];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Technical Status Pill */}
      <div className="inline-flex items-center gap-2.5 px-3 py-1.5 border border-white/10 bg-[#080e11]/80 backdrop-blur-md">
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              portalConfig.statusAccent === "marigold" ? "bg-marigold" : "bg-circuit"
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              portalConfig.statusAccent === "marigold" ? "bg-marigold" : "bg-circuit"
            }`}
          />
        </span>
        <span className="font-oxanium text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
          {portalConfig.statusText}
        </span>
      </div>

      {/* 2. Hero Typography */}
      <div className="space-y-3">
        <div className="font-oxanium text-[11px] font-bold uppercase tracking-[0.22em] text-marigold">
          {portalConfig.badge}
        </div>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.1]">
          XAVITECH <span className="text-marigold">2026</span>
        </h1>
        <p className="font-sora text-sm sm:text-base text-slate-200 font-medium">
          {portalConfig.tagline}
        </p>
        <p className="font-space text-xs sm:text-sm text-slate-400 max-w-lg leading-relaxed">
          {portalConfig.description}
        </p>
      </div>

      {/* 3. Subtle Technical Telemetry HUD Box (Desktop and Tablet) */}
      <div className="hidden sm:block relative border border-white/10 bg-[#080e11]/85 p-5 backdrop-blur-md">
        {/* Precision corner reticles */}
        <span
          className="absolute left-0 top-0 h-3 w-3 -translate-x-px -translate-y-px border-l border-t border-circuit/80"
          aria-hidden="true"
        />
        <span
          className="absolute bottom-0 right-0 h-3 w-3 translate-x-px translate-y-px border-b border-r border-marigold/70"
          aria-hidden="true"
        />

        <div className="font-oxanium text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3 flex items-center justify-between">
          <span>TELEMETRY / NODE SPEC</span>
          <span className="text-circuit/80">ONLINE</span>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-1 border-t border-white/[0.06]">
          {(technicalMeta || portalConfig.metrics).map((item, idx) => (
            <div key={idx} className="space-y-1">
              <span className="block font-oxanium text-[9px] uppercase tracking-wider text-slate-500">
                {item.label}
              </span>
              <span className="block font-mono text-xs font-semibold text-slate-200 truncate">
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {/* Technical decorative circuit pulse line */}
        <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center gap-2 text-[10px] font-mono text-slate-600">
          <span className="h-1 w-1 rounded-full bg-circuit" />
          <div className="flex-1 h-px bg-gradient-to-r from-circuit/30 via-white/10 to-transparent" />
          <span>PATNA // LAT 25.5941° N</span>
        </div>
      </div>
    </div>
  );
}
