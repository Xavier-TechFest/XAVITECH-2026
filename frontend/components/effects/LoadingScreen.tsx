"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/** How long the logos stay fully visible before the dissolve starts. */
const HOLD_MS = 2000;
/** How long the pixel dissolve takes. */
const DISSOLVE_MS = 950;
const BG = "#07080B";

/**
 * Splash: university logo (large, centred) above the XAVITECH wordmark, on
 * a soft ambient backdrop consistent with the rest of the site. After
 * HOLD_MS the whole screen breaks apart into square pixels — starting at
 * the bottom-left corner, sweeping to the top-right — revealing the
 * homepage underneath.
 *
 * Plays every time the homepage becomes the active route: on first load,
 * and again on returning to "/" via in-app navigation (e.g. the navbar
 * logo) from another page — not just once per browser session.
 */
export default function LoadingScreen() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [runId, setRunId] = useState(0);
  const [stage, setStage] = useState<"hold" | "dissolving" | "done">("hold");

  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const uniRef = useRef<HTMLImageElement>(null);
  const xaviRef = useRef<HTMLImageElement>(null);

  // Every time the route becomes "/" (first load, or navigating back to it),
  // start a fresh run of the sequence.
  useEffect(() => {
    if (isHome) {
      setStage("hold");
      setRunId((n) => n + 1);
    }
  }, [isHome]);

  useEffect(() => {
    if (!isHome || runId === 0) return;

    let cancelled = false;
    let holdTimer = 0;
    let raf = 0;
    document.documentElement.style.overflow = "hidden";

    const finish = () => {
      if (cancelled) return;
      document.documentElement.style.overflow = "";
      setStage("done");
    };

    const dissolve = () => {
      if (cancelled) return;
      setStage("dissolving");

      const canvas = canvasRef.current;
      const content = contentRef.current;
      const root = rootRef.current;
      const ctx = canvas?.getContext("2d");
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!canvas || !content || !root || !ctx || reduced) return finish();

      const W = window.innerWidth;
      const H = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.scale(dpr, dpr);

      // Paint exactly what's on screen right now onto the canvas — including
      // the backdrop glow and grid, so the dissolve reveals the *rendered*
      // splash, not a flat rectangle — then swap the live DOM for it.
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);
      // recreate the two ambient glows for the frozen frame the dissolve reveals-through
      const g1 = ctx.createRadialGradient(W * 0.5, H * 0.32, 0, W * 0.5, H * 0.32, Math.max(W, H) * 0.45);
      g1.addColorStop(0, "rgba(53,224,201,0.16)");
      g1.addColorStop(1, "rgba(53,224,201,0)");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, W, H);
      const g2 = ctx.createRadialGradient(W * 0.5, H * 0.78, 0, W * 0.5, H * 0.78, Math.max(W, H) * 0.4);
      g2.addColorStop(0, "rgba(242,166,60,0.12)");
      g2.addColorStop(1, "rgba(242,166,60,0)");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, W, H);
      for (const img of [uniRef.current, xaviRef.current]) {
        if (!img) continue;
        const r = img.getBoundingClientRect();
        ctx.drawImage(img, r.left, r.top, r.width, r.height);
      }
      canvas.style.display = "block";
      content.style.visibility = "hidden";
      root.style.background = "transparent";

      // Erase blocks by distance from the bottom-left corner, with a little
      // jitter so the edge isn't a perfectly straight diagonal line.
      const size = W < 640 ? 22 : 30;
      const cols = Math.ceil(W / size);
      const rows = Math.ceil(H / size);
      const diag = Math.hypot(W, H);
      const cells: { x: number; y: number; t: number }[] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const d = Math.hypot(c * size, H - (r + 1) * size) / diag; // 0 at bottom-left
          cells.push({ x: c * size, y: r * size, t: d * 0.7 + Math.random() * 0.3 });
        }
      }
      cells.sort((a, b) => a.t - b.t);

      let next = 0;
      const start = performance.now();
      const ease = (p: number) => 1 - Math.pow(1 - p, 2); // ease-out — quick start, gentle tail
      const step = (now: number) => {
        if (cancelled) return;
        const p = ease(Math.min(1, (now - start) / DISSOLVE_MS));
        while (next < cells.length && cells[next].t <= p) {
          const cell = cells[next++];
          ctx.clearRect(cell.x - 0.5, cell.y - 0.5, size + 1, size + 1);
        }
        if (p < 1) raf = requestAnimationFrame(step);
        else finish();
      };
      raf = requestAnimationFrame(step);
    };

    // Start the hold only once both logos have actually loaded (capped so a
    // slow network never blocks the site indefinitely).
    const imgs = [uniRef.current, xaviRef.current].filter(Boolean) as HTMLImageElement[];
    const loaded = Promise.all(
      imgs.map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((res) => {
              img.addEventListener("load", () => res(), { once: true });
              img.addEventListener("error", () => res(), { once: true });
            }),
      ),
    );
    const cap = new Promise<void>((res) => window.setTimeout(res, 4000));
    Promise.race([loaded, cap]).then(() => {
      if (!cancelled) holdTimer = window.setTimeout(dissolve, HOLD_MS);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(holdTimer);
      cancelAnimationFrame(raf);
      document.documentElement.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId, isHome]);

  if (!isHome || stage === "done") return null;

  return (
    <div ref={rootRef} aria-hidden="true" className="fixed inset-0 z-[100] overflow-hidden" style={{ background: BG }}>
      {/* ambient backdrop — same language as the rest of the site */}
      <div data-splash-bg aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[32%] h-[60vmax] w-[60vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-circuit/[0.14] blur-[110px]" />
        <div className="absolute left-1/2 top-[78%] h-[55vmax] w-[55vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-marigold/[0.1] blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(53,224,201,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(53,224,201,0.4) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />
      </div>

      <div
        ref={contentRef}
        className={`relative flex h-full w-full flex-col items-center justify-center gap-6 px-6 sm:gap-8 ${
          stage === "hold" ? "splash-content-in" : ""
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={uniRef}
          src="/university-logo.webp"
          alt=""
          width={836}
          height={900}
          fetchPriority="high"
          className="splash-uni h-[38svh] max-h-[420px] w-auto object-contain drop-shadow-[0_0_36px_rgba(53,224,201,0.22)]"
        />

        <span className="splash-rule relative h-px w-32 overflow-hidden bg-line/70 sm:w-40">
          <span className="absolute inset-y-0 left-0 w-full origin-left scale-x-0 bg-gradient-to-r from-transparent via-circuit to-transparent" />
        </span>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={xaviRef}
          src="/xavitech-logo-splash.webp"
          alt=""
          width={1000}
          height={341}
          fetchPriority="high"
          className="splash-xavi h-auto w-[min(66vw,340px)] object-contain"
        />

        <p className="splash-caption font-mono text-[10px] uppercase tracking-[0.3em] text-muted sm:text-[11px]">
          Xavier University · Patna
        </p>
      </div>

      <canvas ref={canvasRef} className="absolute left-0 top-0 hidden" />
    </div>
  );
}
