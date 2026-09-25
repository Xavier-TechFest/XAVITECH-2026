"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useState, type ReactNode } from "react";
import { useMouse } from "@/hooks/useMouse";
import { useScrollProgress } from "@/hooks/useScrollProgress";

// three.js is only fetched on the client, after first paint
const Scene = dynamic(() => import("./Scene"), { ssr: false });

/* ------------------------------------------------------------------ */
/* Static starfield: used while the 3D scene loads, and permanently for */
/* reduced-motion, save-data and no-WebGL visitors.                     */
/* ------------------------------------------------------------------ */

function buildStarTile(size = 520, count = 46) {
  // tiny seeded PRNG: identical on server and client, so no hydration diff
  let seed = 7;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const colors = ["#DCE6FF", "#DCE6FF", "#DCE6FF", "#35E0C9", "#F2A63C", "#E23F7E"];
  let dots = "";
  for (let i = 0; i < count; i++) {
    const x = (rnd() * size).toFixed(1);
    const y = (rnd() * size).toFixed(1);
    const r = (0.5 + rnd() * 0.9).toFixed(2);
    const o = (0.35 + rnd() * 0.6).toFixed(2);
    const c = colors[Math.floor(rnd() * colors.length)];
    dots += `<circle cx='${x}' cy='${y}' r='${r}' fill='${c}' fill-opacity='${o}'/>`;
  }
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>${dots}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const STAR_TILE = buildStarTile();

function webglAvailable() {
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") ||
      canvas.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/** If the WebGL scene ever throws, quietly fall back to the static sky. */
class SceneBoundary extends Component<
  { children: ReactNode; onFail: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Page-wide fixed background (the first project's "world behind the sections"),
 * re-themed as a scroll-driven starfield: stars, warp streaks, an orbital
 * fortress, tracer fire, falling binary and an orbital ring gate.
 *
 * Sits at z-0 behind everything; the section backdrops are translucent so it
 * shows through. Purely decorative and never intercepts input.
 */
export default function CosmosBackdrop() {
  const mouseRef = useMouse();
  const scrollRef = useScrollProgress();
  const [live, setLive] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const saveData = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection?.saveData;

    const update = () => setLive(!reduce.matches && !saveData && webglAvailable());
    update();
    reduce.addEventListener("change", update);
    return () => reduce.removeEventListener("change", update);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#05060A]"
    >
      {/* nebula glow: same teal / pink / marigold as the rest of the site */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 82% 18%, rgba(53,224,201,0.10), transparent 70%), radial-gradient(ellipse 50% 45% at 8% 72%, rgba(226,63,126,0.09), transparent 70%), radial-gradient(ellipse 60% 40% at 50% 100%, rgba(242,166,60,0.07), transparent 70%)",
        }}
      />

      {/* static stars: fade out once the live scene has taken over */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          backgroundImage: STAR_TILE,
          backgroundSize: "520px 520px",
          opacity: live ? 0.25 : 1,
        }}
      />

      {live && (
        <div className="cosmos-fade-in absolute inset-0">
          <SceneBoundary onFail={() => setLive(false)}>
            <Scene mouseRef={mouseRef} scrollRef={scrollRef} />
          </SceneBoundary>
        </div>
      )}
    </div>
  );
}
