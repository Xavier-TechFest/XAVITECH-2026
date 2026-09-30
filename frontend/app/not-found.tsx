"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CyberDog, { type CursorPoint, type DogMode } from "@/components/sections/CyberDog";
import {
  Compass,
  Terminal,
  Radio,
  ArrowLeft,
  Home,
  Layers,
  Sparkles,
  WifiOff,
  Crosshair,
  RotateCw,
  Cpu,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

interface Waypoint {
  id: string;
  tag: string;
  title: string;
  desc: string;
  href: string;
  accent: string;
  badge: string;
}

const WAYPOINTS: Waypoint[] = [
  {
    id: "home",
    tag: "01 // CORE",
    title: "Festival Hub",
    desc: "Return to the central XAVITECH 2026 terminal, festival schedule, and main stage.",
    href: "/",
    accent: "#35e0c9", // circuit teal
    badge: "GATEWAY",
  },
  {
    id: "events",
    tag: "02 // ARENAS",
    title: "Flagship Events",
    desc: "Explore 15 flagship competitions, hackathons, coding duels, and esports.",
    href: "/events",
    accent: "#f2a63c", // marigold
    badge: "15 CHALLENGES",
  },
  {
    id: "tracks",
    tag: "03 // DOMAINS",
    title: "Track Directory",
    desc: "Browse specialized tracks in AI, Cybersecurity, Robotics, Web3, and Systems.",
    href: "/tracks",
    accent: "#818cf8", // indigo
    badge: "5 DOMAINS",
  },
];

export default function NotFound() {
  const router = useRouter();

  // Stage and CyberDog movement refs
  const stageRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<CursorPoint | null>(null);
  const waypointRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  // CyberDog coordination state
  const [stageWidth, setStageWidth] = useState(0);
  const [targetX, setTargetX] = useState<number | null>(null);
  const [dogMode, setDogMode] = useState<DogMode>("idle");
  const [activeWaypoint, setActiveWaypoint] = useState<string | null>(null);

  // Telemetry & interactive diagnostics
  const [radarPings, setRadarPings] = useState<{ id: number; x: number }[]>([]);
  const [isPinging, setIsPinging] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "INITIALIZING TELEMETRY: SECTOR RECON ...",
    "STATUS: ROUTE NOT LOCATED [HTTP 404]",
    "AUTONOMOUS SCOUT: UNIT-K9 DEPLOYED ON RUNWAY",
    "SIGNAL SCAN: WAITING FOR OPERATOR RE-ROUTING ...",
  ]);

  // Measure stage width for CyberDog physics and boundary clamping
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const measure = () => {
      setStageWidth(stage.clientWidth);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  // Track pointer across the entire window for CyberDog head orientation & cursor following
  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      const stage = stageRef.current;
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      cursorRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.bottom,
        t: performance.now(),
      };
    };

    const onLeave = () => {
      cursorRef.current = null;
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // Dispatch CyberDog toward a specific waypoint node
  const handleWaypointEnter = (waypoint: Waypoint) => {
    setActiveWaypoint(waypoint.id);
    const el = waypointRefs.current[waypoint.id];
    const stage = stageRef.current;
    if (el && stage) {
      const elRect = el.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      const center = elRect.left - stageRect.left + elRect.width / 2;
      setTargetX(center);
      setDogMode("hover");
    } else {
      setDogMode("hover");
    }

    setTerminalLogs((prev) => [
      ...prev.slice(-4),
      `TARGET VECTOR: [${waypoint.tag}] ${waypoint.title.toUpperCase()} // SCOUT ENGAGED`,
    ]);
  };

  const handleWaypointLeave = () => {
    setActiveWaypoint(null);
    setTargetX(null);
    setDogMode("idle");
  };

  const handleWaypointClick = (waypoint: Waypoint) => {
    setDogMode("selected");
    setTerminalLogs((prev) => [
      ...prev.slice(-4),
      `EXECUTING JUMP TO: ${waypoint.href} // ENGAGING WARP ...`,
    ]);
  };

  // Interactive floor investigation: click anywhere on runway to dispatch CyberDog
  const handleStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const clickX = e.clientX - rect.left;

    // Trigger radar ripple
    const pingId = Date.now();
    setRadarPings((prev) => [...prev.slice(-3), { id: pingId, x: clickX }]);
    setTimeout(() => {
      setRadarPings((prev) => prev.filter((p) => p.id !== pingId));
    }, 1200);

    setTargetX(clickX);
    setDogMode("hover");

    setTerminalLogs((prev) => [
      ...prev.slice(-4),
      `RUNWAY CLICK: VECTOR X=${Math.round(clickX)}px // SCOUT INVESTIGATING COORDINATE`,
    ]);
  };

  // Diagnostic Ping feature
  const triggerDiagnosticPing = () => {
    if (isPinging) return;
    setIsPinging(true);
    setDogMode("hover");

    // Spawn radar pings across stage
    if (stageWidth > 0) {
      const p1 = { id: Date.now(), x: stageWidth * 0.25 };
      const p2 = { id: Date.now() + 1, x: stageWidth * 0.5 };
      const p3 = { id: Date.now() + 2, x: stageWidth * 0.75 };
      setRadarPings([p1, p2, p3]);
      setTimeout(() => setRadarPings([]), 1400);
    }

    setTerminalLogs((prev) => [
      ...prev.slice(-3),
      "EMITTING BROADCAST PING ACROSS 0x404 VOID ...",
      "REPLY 200 OK: FESTIVAL CLUSTER ONLINE (12ms)",
      "DIAGNOSIS: CURRENT ROUTE UNMAPPED. FALLBACK READY.",
    ]);

    setTimeout(() => {
      setIsPinging(false);
      setDogMode("idle");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#07080B] text-slate-100 flex flex-col justify-between selection:bg-[#35e0c9] selection:text-[#07080B] relative overflow-hidden font-body">
      {/* Background Cyber Mesh & Gridlines */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(53,224,201,0.09),transparent_60%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #35e0c9 1px, transparent 1px), linear-gradient(to bottom, #35e0c9 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse at 50% 40%, black 40%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 40%, black 40%, transparent 80%)",
        }}
        aria-hidden="true"
      />

      {/* Top Cyber Telemetry Bar */}
      <header className="relative z-20 w-full border-b border-neutral-800/80 bg-[#07080B]/90 backdrop-blur-md px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-white hover:text-[#35e0c9] transition-colors font-bold tracking-wider"
            >
              <span className="w-2 h-2 rounded-full bg-[#35e0c9] animate-pulse" />
              <span>XAVITECH // 2026</span>
            </Link>
            <span className="hidden sm:inline text-neutral-600">/</span>
            <span className="hidden sm:inline text-neutral-400">TELEMETRY DECK</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-neutral-400">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-rose-500/30 bg-rose-500/10 text-rose-300">
              <WifiOff className="w-3 h-3 text-rose-400" />
              <span>SIGNAL LOST (404)</span>
            </div>
            <span className="hidden md:inline text-neutral-600">|</span>
            <span className="hidden md:inline text-neutral-500">NODE: XU-PATNA // INGRESS-00</span>
          </div>
        </div>
      </header>

      {/* Main Interactive 404 Arena */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center items-center">
        {/* Error Code & Technical HUD Reticle */}
        <div className="w-full text-center space-y-4">
          {/* Status Chip */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#35e0c9]/30 bg-[#35e0c9]/10 text-xs font-mono uppercase tracking-widest text-[#35e0c9]">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>ERR_SECTOR_NOT_FOUND // VECTOR 0x404</span>
          </div>

          {/* Glitch / Cyber 404 Display */}
          <div className="relative inline-block select-none my-2">
            {/* Corner brackets */}
            <span className="absolute -top-3 -left-4 sm:-left-8 text-2xl font-mono text-[#35e0c9]/40 select-none">
              [
            </span>
            <span className="absolute -bottom-3 -right-4 sm:-right-8 text-2xl font-mono text-[#35e0c9]/40 select-none">
              ]
            </span>

            <h1 className="text-7xl sm:text-9xl font-black font-display tracking-tight text-white drop-shadow-[0_0_35px_rgba(53,224,201,0.35)]">
              4<span className="text-[#35e0c9]">0</span>4
            </h1>

            {/* Subtle scanning horizontal beam across 404 */}
            <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-transparent via-[#35e0c9]/60 to-transparent blur-[1px]" />
          </div>

          {/* Subtitle & Clear Explanatory Copy */}
          <div className="max-w-xl mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold font-display uppercase tracking-wider text-white">
              Uncharted Sector Drift
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
              The requested coordinates do not correspond to any active node in the XAVITECH grid.
              Our autonomous robotic scout has been dispatched to secure your telemetry.
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CYBERDOG RUNWAY STAGE                                                     */}
        {/* ========================================================================= */}
        <div className="w-full max-w-4xl mt-8 sm:mt-12 mb-6">
          {/* Runway Header / Scout Status Bar */}
          <div className="flex items-center justify-between px-3 py-1.5 border-t border-x border-[#35e0c9]/30 bg-[#0c1017] rounded-t-xl text-[11px] font-mono">
            <div className="flex items-center gap-2 text-[#35e0c9]">
              <Cpu className="w-3.5 h-3.5" />
              <span className="font-semibold tracking-wider">UNIT-K9 // CYBERSCOUT</span>
              <span className="hidden sm:inline text-neutral-500">•</span>
              <span className="hidden sm:inline text-neutral-400">
                GAIT: {dogMode === "selected" ? "PERCHED" : dogMode === "hover" ? "ALERT TROT" : "PATROL"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-neutral-400 hidden md:inline">
                CLICK RUNWAY TO DISPATCH SCOUT
              </span>
              <button
                type="button"
                onClick={triggerDiagnosticPing}
                disabled={isPinging}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-[#35e0c9]/40 bg-[#35e0c9]/10 text-[#35e0c9] hover:bg-[#35e0c9]/20 hover:border-[#35e0c9] transition-all text-[11px] font-mono cursor-pointer active:scale-95"
                title="Send diagnostic ping"
              >
                <RotateCw className={`w-3 h-3 ${isPinging ? "animate-spin text-[#35e0c9]" : ""}`} />
                <span>{isPinging ? "PINGING..." : "PING RECON"}</span>
              </button>
            </div>
          </div>

          {/* Interactive Runway Deck with CyberDog */}
          <div
            ref={stageRef}
            onClick={handleStageClick}
            className="relative h-28 sm:h-32 border-x border-b border-[#35e0c9]/30 bg-gradient-to-b from-[#0c1017] to-[#080b11] overflow-hidden cursor-crosshair group shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
            title="Click anywhere to guide CyberDog"
          >
            {/* Grid ticks and perspective markings */}
            <div className="pointer-events-none absolute inset-0 flex justify-between px-4 sm:px-8 text-[9px] font-mono text-neutral-600 select-none items-end pb-1.5">
              <span>00m // W</span>
              <span className="hidden sm:inline">15m // SECTOR-A</span>
              <span>30m // RETICLE</span>
              <span className="hidden sm:inline">45m // SECTOR-B</span>
              <span>60m // E</span>
            </div>

            {/* Glowing runway floor and laser scanline */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#35e0c9]/15 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#35e0c9] to-transparent shadow-[0_0_12px_#35e0c9]" />

            {/* Radar ripple rings when clicking or pinging */}
            {radarPings.map((ping) => (
              <span
                key={ping.id}
                className="pointer-events-none absolute bottom-0 -translate-x-1/2 w-16 h-16 rounded-full border border-[#35e0c9] animate-ping opacity-75"
                style={{ left: ping.x }}
              />
            ))}

            {/* The CyberDog autonomous robotic unit */}
            <CyberDog
              stageWidth={stageWidth}
              targetX={targetX}
              mode={dogMode}
              cursorRef={cursorRef}
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RECON WAYPOINTS: SECTOR RECOVERY DESTINATIONS                             */}
        {/* ========================================================================= */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4">
          {WAYPOINTS.map((wp) => {
            const isHovered = activeWaypoint === wp.id;
            return (
              <Link
                key={wp.id}
                href={wp.href}
                ref={(el) => {
                  waypointRefs.current[wp.id] = el;
                }}
                onPointerEnter={() => handleWaypointEnter(wp)}
                onPointerLeave={handleWaypointLeave}
                onClick={() => handleWaypointClick(wp)}
                className={`group relative p-4 sm:p-5 rounded-xl border transition-all duration-300 flex flex-col justify-between text-left ${
                  isHovered
                    ? "border-[#35e0c9] bg-[#121622] shadow-[0_8px_30px_rgba(53,224,201,0.2)] -translate-y-1"
                    : "border-neutral-800 bg-[#0d111a]/80 hover:border-neutral-700 hover:bg-[#121622]"
                }`}
              >
                {/* Accent glow corner */}
                <div
                  className="pointer-events-none absolute -top-8 -right-8 w-20 h-20 rounded-full blur-xl transition-opacity duration-300"
                  style={{
                    backgroundColor: wp.accent,
                    opacity: isHovered ? 0.25 : 0,
                  }}
                  aria-hidden="true"
                />

                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span
                      className="font-bold tracking-wider"
                      style={{ color: isHovered ? wp.accent : "#868C99" }}
                    >
                      {wp.tag}
                    </span>
                    <span className="px-1.5 py-0.5 rounded border border-neutral-700 bg-neutral-900/80 text-[10px] text-neutral-400">
                      {wp.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold font-display text-white group-hover:text-[#35e0c9] transition-colors flex items-center gap-1.5">
                    {wp.title}
                    <ChevronRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#35e0c9]" />
                  </h3>

                  <p className="mt-1.5 text-xs text-neutral-400 leading-relaxed">
                    {wp.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px] font-mono text-neutral-500 group-hover:text-neutral-300">
                  <span>DISPATCH SCOUT HERE</span>
                  <span className="text-[#35e0c9] font-bold group-hover:translate-x-1 transition-transform">
                    NAVIGATE →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* COMPACT CYBER TERMINAL TELEMETRY                                          */}
        {/* ========================================================================= */}
        <div className="w-full max-w-4xl mt-6 rounded-xl border border-neutral-800 bg-[#090d14]/90 p-3 sm:p-4 text-xs font-mono shadow-inner">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-2">
            <div className="flex items-center gap-2 text-neutral-400">
              <Terminal className="w-3.5 h-3.5 text-[#35e0c9]" />
              <span className="text-[11px] font-bold text-neutral-300">
                TERMINAL // RECON LOGS
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#35e0c9] animate-ping" />
              <span className="text-[10px] text-neutral-500">LIVE FEED</span>
            </div>
          </div>

          <div className="space-y-1 text-neutral-400 text-[11px] leading-relaxed select-text">
            {terminalLogs.map((log, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-[#35e0c9] select-none font-bold">&gt;</span>
                <span className={index === terminalLogs.length - 1 ? "text-white" : ""}>
                  {log}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Back Action */}
        <div className="mt-6 flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-800 bg-[#0d111a] hover:border-neutral-700 hover:bg-[#121622] text-xs font-mono text-neutral-300 hover:text-white transition-all cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#35e0c9]" />
            <span>RETURN TO PREVIOUS SECTOR</span>
          </button>
        </div>
      </main>

      {/* Cyber Footer Status Bar */}
      <footer className="relative z-20 w-full border-t border-neutral-800/80 bg-[#07080B]/90 backdrop-blur-md px-4 sm:px-8 py-3 text-xs font-mono text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left text-[11px]">
          <div>
            <span>XAVITECH 2026 // XAVIER UNIVERSITY PATNA</span>
            <span className="hidden sm:inline mx-2 text-neutral-700">•</span>
            <span className="hidden sm:inline text-neutral-400">ANNUAL TECH FESTIVAL</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-neutral-400">
              AUTONOMOUS K9 PATROL ACTIVE
            </span>
            <span className="text-neutral-700 hidden sm:inline">|</span>
            <Link
              href="/"
              className="text-[#35e0c9] hover:underline hover:text-cyan-200 transition-colors"
            >
              FESTIVAL HOMEPAGE
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
