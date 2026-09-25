"use client";

import { useEffect, useRef } from "react";
import Countdown from "./Countdown";
import Horizon from "@/components/effects/Horizon";

const SPARK_COLORS = [
  "227, 148, 51", // marigold
  "53, 224, 201", // circuit
  "220, 230, 255", // starlight
];

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanXRef = useRef<HTMLDivElement>(null);
  const scanYRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Scroll effect from the first project's hero: as you scroll away the copy
  // eases back (lags the page a little) and fades out. Layout is untouched -
  // only opacity/transform on the content wrapper are written.
  useEffect(() => {
    const hero = heroRef.current;
    const content = contentRef.current;
    if (!hero || !content) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const p = Math.min(1, Math.max(0, window.scrollY / (hero.offsetHeight * 0.75)));
      content.style.opacity = String(1 - p);
      content.style.transform = `translate3d(0, ${(p * 44).toFixed(1)}px, 0)`;
      content.style.pointerEvents = p > 0.95 ? "none" : "";
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    const canvas = canvasRef.current;
    if (!hero || !canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;
    const ctx: CanvasRenderingContext2D = context;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;
    let rafId = 0;

    // Ambient constellation dots
    const DOT_COUNT = Math.min(
      55,
      Math.max(18, Math.floor((window.innerWidth * window.innerHeight) / 26000))
    );

    const dots = Array.from({ length: DOT_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00028,
      vy: (Math.random() - 0.5) * 0.00028,
      r: Math.random() * 1.3 + 1,
      colorIndex: Math.floor(Math.random() * SPARK_COLORS.length),
    }));

    // Cursor spark trail
    type Spark = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      r: number;
      color: string;
    };
    const sparks: Spark[] = [];

    // Click / tap the sky to fire: bolts from the two bottom turrets, then an impact burst
    type Bolt = { sx: number; sy: number; tx: number; ty: number; u: number };
    type Ring = { x: number; y: number; r: number; life: number };
    const bolts: Bolt[] = [];
    const rings: Ring[] = [];
    let lastFrameAt = performance.now();

    const pointer = { x: -9999, y: -9999, inside: false };
    const scan = { x: 0, y: 0 };
    const tilt = { x: 0, y: 0 };

    function resize() {
      const rect = hero!.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas!.width = Math.floor(width * dpr);
      canvas!.height = Math.floor(height * dpr);
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function onPointerMove(e: PointerEvent) {
      const rect = hero!.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      pointer.inside = inside;
      if (!inside) return;

      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;

      tilt.x = (pointer.x / width - 0.5) * 2;
      tilt.y = (pointer.y / height - 0.5) * 2;
    }

    function onPointerLeave() {
      pointer.inside = false;
    }

    function onPointerDown(e: PointerEvent) {
      if (reduceMotion) return;
      if ((e.target as HTMLElement).closest("a, button")) return;
      const rect = hero!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // muzzle line = bottom of what is actually visible of the hero
      const baseY = Math.min(height, window.innerHeight - rect.top) - 6;
      if (y > baseY - 20) return;
      for (const sx of [width * 0.1, width * 0.9]) {
        bolts.push({ sx, sy: baseY, tx: x, ty: y, u: 0 });
      }
      if (bolts.length > 12) bolts.splice(0, bolts.length - 12);
    }

    function drawStar(cx: number, cy: number, r: number, color: string, alpha: number) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        ctx.rotate(Math.PI / 2);
        ctx.moveTo(0, 0);
        ctx.lineTo(0, r);
      }
      ctx.strokeStyle = `rgba(${color}, ${alpha})`;
      ctx.lineWidth = 1.4;
      ctx.lineCap = "round";
      ctx.shadowColor = `rgba(${color}, ${alpha})`;
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.restore();
    }

    function frame() {
      ctx.clearRect(0, 0, width, height);

      // ambient constellation
      for (const d of dots) {
        if (!reduceMotion) {
          d.x += d.vx;
          d.y += d.vy;
          if (d.x < 0 || d.x > 1) d.vx *= -1;
          if (d.y < 0 || d.y > 1) d.vy *= -1;
        }
        const color = SPARK_COLORS[d.colorIndex];
        ctx.beginPath();
        ctx.arc(d.x * width, d.y * height, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, 0.55)`;
        ctx.shadowColor = `rgba(${color}, 0.6)`;
        ctx.shadowBlur = 6;
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const ax = dots[i].x * width;
          const ay = dots[i].y * height;
          const bx = dots[j].x * width;
          const by = dots[j].y * height;
          const dist = Math.hypot(ax - bx, ay - by);
          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.strokeStyle = `rgba(201, 162, 39, ${0.16 * (1 - dist / 140)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // cursor sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        if (!reduceMotion) {
          s.x += s.vx;
          s.y += s.vy;
          s.life -= 0.018;
        } else {
          s.life -= 0.08;
        }
        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        drawStar(s.x, s.y, s.r * 3.2, s.color, s.life);
      }

      // bolts + impact rings
      const nowT = performance.now();
      const dtF = Math.min(0.05, (nowT - lastFrameAt) / 1000);
      lastFrameAt = nowT;
      for (let i = bolts.length - 1; i >= 0; i--) {
        const b = bolts[i];
        b.u += dtF / 0.22;
        const hu = Math.min(1, b.u);
        const tu = Math.max(0, hu - 0.32);
        const hx = b.sx + (b.tx - b.sx) * hu;
        const hy = b.sy + (b.ty - b.sy) * hu;
        const tx0 = b.sx + (b.tx - b.sx) * tu;
        const ty0 = b.sy + (b.ty - b.sy) * tu;
        ctx.save();
        ctx.lineCap = "round";
        ctx.shadowColor = "rgba(53, 224, 201, 0.95)";
        ctx.shadowBlur = 14;
        ctx.strokeStyle = "rgba(53, 224, 201, 0.9)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(tx0, ty0);
        ctx.lineTo(hx, hy);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(235, 255, 252, 1)";
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
        if (b.u >= 1) {
          bolts.splice(i, 1);
          rings.push({ x: b.tx, y: b.ty, r: 4, life: 1 });
          if (rings.length > 8) rings.shift();
          for (let k = 0; k < 9; k++) {
            const a = Math.random() * Math.PI * 2;
            const sp = 0.6 + Math.random() * 1.6;
            sparks.push({
              x: b.tx,
              y: b.ty,
              vx: Math.cos(a) * sp,
              vy: Math.sin(a) * sp,
              life: 1,
              r: Math.random() * 1.2 + 1,
              color: SPARK_COLORS[Math.floor(Math.random() * 2)],
            });
          }
          if (sparks.length > 160) sparks.splice(0, sparks.length - 160);
        }
      }
      for (let i = rings.length - 1; i >= 0; i--) {
        const rg = rings[i];
        rg.r += 150 * dtF;
        rg.life -= dtF * 2.4;
        if (rg.life <= 0) {
          rings.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(rg.x, rg.y, rg.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(53, 224, 201, ${rg.life * 0.7})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // lerp scanlines + wordmark tilt via direct DOM writes (no React re-render)
      if (pointer.inside) {
        scan.x += (pointer.x - scan.x) * 0.14;
        scan.y += (pointer.y - scan.y) * 0.14;
        if (scanXRef.current) {
          scanXRef.current.style.opacity = "1";
          scanXRef.current.style.transform = `translateY(${scan.y}px)`;
        }
        if (scanYRef.current) {
          scanYRef.current.style.opacity = "1";
          scanYRef.current.style.transform = `translateX(${scan.x}px)`;
        }
      } else {
        if (scanXRef.current) scanXRef.current.style.opacity = "0";
        if (scanYRef.current) scanYRef.current.style.opacity = "0";
      }

      if (wordmarkRef.current && !reduceMotion) {
        const targetX = pointer.inside ? tilt.x : 0;
        const targetY = pointer.inside ? tilt.y : 0;
        wordmarkRef.current.style.transform = `perspective(900px) rotateX(${
          targetY * -4
        }deg) rotateY(${targetX * 6}deg)`;
      }

      if (!reduceMotion) rafId = requestAnimationFrame(frame);
    }

    resize();
    frame();

    // ResizeObserver instead of window "resize": mobile browsers fire "resize"
    // every time the address bar collapses, which would needlessly reallocate
    // (and clear) the canvas while the user scrolls.
    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reduceMotion) frame();
    });
    resizeObserver.observe(hero);
    hero.addEventListener("pointermove", onPointerMove);
    hero.addEventListener("pointerdown", onPointerDown);
    hero.addEventListener("pointerleave", onPointerLeave);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      hero.removeEventListener("pointermove", onPointerMove);
      hero.removeEventListener("pointerdown", onPointerDown);
      hero.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <section
      ref={heroRef}
      id="top"
      className="min-h-hero relative flex items-center overflow-hidden pb-16 pt-24 sm:pb-12 sm:pt-20"
    >
      {/* night sky base (translucent: the fixed 3D starfield shows through) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 28%, rgba(242,166,60,0.10), transparent 70%), radial-gradient(ellipse 60% 40% at 12% 78%, rgba(53,224,201,0.08), transparent 70%), linear-gradient(180deg, rgba(5,6,10,0.15) 0%, rgba(10,9,20,0.25) 45%, rgba(19,15,28,0.62) 72%, rgba(5,6,10,0.9) 100%)",
        }}
      />

      {/* glowing horizon arc */}
      <div
        aria-hidden="true"
        className="horizon-pulse pointer-events-none absolute left-1/2 top-[34%] -z-10 h-[300px] w-[420px] -translate-x-1/2 rounded-full blur-3xl sm:h-[380px] sm:w-[560px]"
        style={{
          background:
            "linear-gradient(180deg, rgba(53,224,201,0.26), rgba(242,166,60,0.24) 50%, rgba(53,224,201,0.12) 85%, transparent 100%)",
        }}
      />

      {/* pulsing circuit traces across the upper sky */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
        viewBox="0 0 1000 400"
        preserveAspectRatio="none"
      >
        {[
          { d: "M0,80 C 200,40 350,150 550,90 S 850,20 1000,70", color: "#35E0C9", dur: "4.8s", delay: "0s" },
          { d: "M0,150 C 250,190 400,110 600,170 S 900,130 1000,180", color: "#F2A63C", dur: "6.2s", delay: "1.1s" },
          { d: "M0,230 C 220,270 420,205 640,245 S 880,290 1000,225", color: "#35E0C9", dur: "5.5s", delay: "2.3s" },
        ].map((trace) => (
          <g key={trace.d}>
            <path d={trace.d} fill="none" stroke={trace.color} strokeWidth="1.4" opacity="0.16" />
            <path
              d={trace.d}
              fill="none"
              stroke={trace.color}
              strokeWidth="1.8"
              className="trace-pulse"
              style={{ animationDuration: trace.dur, animationDelay: trace.delay }}
            />
          </g>
        ))}
      </svg>

      {/* planet limb + spaceport spires (replaces the neon city: same setting as the footer) */}
      <Horizon className="-z-10 h-[260px] sm:h-[300px]" />

      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full"
      />

      {/* cursor scanlines */}
      <div
        ref={scanXRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-[1] h-px w-full opacity-0 transition-opacity duration-300"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(53,224,201,0.55) 45%, rgba(53,224,201,0.55) 55%, transparent)",
          boxShadow: "0 0 12px rgba(53,224,201,0.5)",
        }}
      />
      <div
        ref={scanYRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-[1] h-full w-px opacity-0 transition-opacity duration-300"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(242,166,60,0.55) 45%, rgba(242,166,60,0.55) 55%, transparent)",
          boxShadow: "0 0 12px rgba(242,166,60,0.5)",
        }}
      />

      <div ref={contentRef} className="relative z-10 mx-auto w-full max-w-6xl px-6 will-change-[transform,opacity]">
        <div className="inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-full border border-circuit/30 bg-circuit/10 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.14em] text-circuit shadow-[0_0_24px_rgba(53,224,201,0.08)] backdrop-blur-sm sm:px-5 sm:py-2.5 sm:text-xs sm:tracking-[0.18em]">
          <span className="h-1.5 w-1.5 rounded-full bg-circuit shadow-[0_0_8px_rgba(53,224,201,0.9)]" />
          <span>Explore</span>
          <span className="text-marigold">×</span>
          <span className="text-ink">Create</span>
          <span className="text-marigold">×</span>
          <span>INNOVATE</span>
        </div>

        <h1
          ref={wordmarkRef}
          className="mt-6 max-w-full font-display text-[clamp(1.8rem,9vw,8rem)] font-extrabold leading-[0.95] tracking-tight text-ink will-change-transform sm:leading-[0.88]"
          style={{ transformStyle: "preserve-3d" }}
        >
          <span className="bg-gradient-to-r from-circuit via-ink to-marigold bg-clip-text text-transparent">
            XAVITECH
          </span>
        </h1>

        <p className="mt-5 max-w-prose text-base text-muted sm:mt-6 sm:text-xl">
          A day-long technology festival on the campus of Xavier University —
          infusing innovation and technology into the air.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-7 sm:mt-10 sm:gap-y-8">
          <a
            href="#events"
            className="group relative w-full overflow-hidden rounded-full bg-marigold px-7 py-3.5 text-center text-sm font-semibold text-bg transition-transform duration-300 hover:-translate-y-0.5 sm:w-auto sm:py-3"
          >
            <span className="relative z-10">INSPECT</span>
            <span className="absolute inset-0 -z-0 translate-x-[-105%] bg-gradient-to-r from-signal to-marigold transition-transform duration-500 group-hover:translate-x-0" />
          </a>

          <Countdown />
        </div>
      </div>

      <p
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-16 z-10 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-circuit/50 sm:bottom-6"
      >
        <span className="[@media(hover:none)]:hidden">Click</span>
        <span className="hidden [@media(hover:none)]:inline">Tap</span> the sky to fire
      </p>
    </section>
  );
}
