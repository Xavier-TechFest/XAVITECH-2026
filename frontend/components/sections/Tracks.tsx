"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import CyberDog, { type CursorPoint, type DogMode } from "./CyberDog";
import { TracksBackdrop } from "./Backdrops";
import Eyebrow from "@/components/ui/Eyebrow";
import { firePulse } from "@/lib/pulse";
import { TRACKS, eventsOf } from "@/lib/fest";
import { trackPageHref } from "@/lib/trackBus";

const tracks = TRACKS;

const COLS = 11;
const ROWS = 7;

// binary-grid geometry (matches the `p-6` padding and 1.3:1 aspect in the markup)
const GRID_PADDING = 24;
const GRID_BASE_WIDTH = 420;
const GRID_ASPECT = 1.3;

export default function Tracks() {
  const router = useRouter();
  // The binary grid is driven from a rAF loop that writes styles straight to
  // the digit spans (no React state per pointer move — 77 cells re-rendering
  // on every move is exactly the kind of cost a phone can't afford).
  const zeroRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const oneRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const pointerRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const anchorRef = useRef<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  // Mobile only: a real tab bar instead of five stacked cards — always one
  // active track, switched by tapping a pill (see the `sm:hidden` block below).
  const [mobileTrack, setMobileTrack] = useState(0);

  const gridRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const cursorRef = useRef<CursorPoint | null>(null);
  const [stageWidth, setStageWidth] = useState(0);
  const [targetX, setTargetX] = useState<number | null>(null);

  // the real rendered size of the binary grid (it shrinks on phones)
  const [gridSize, setGridSize] = useState({
    w: GRID_BASE_WIDTH,
    h: GRID_BASE_WIDTH / GRID_ASPECT,
  });

  // The five cards only sit side by side from `lg` up. Below that they stack
  // (1 column on phones, 2 on tablets), so "walk to / hop onto the card" makes
  // no sense — the dog just patrols and follows your finger instead.
  const [isWide, setIsWide] = useState(false);

  // the card that's currently popped up: live hover wins, a click "pins" it
  const activeIndex = hoveredIndex ?? selectedIndex;

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // keep the binary grid maths in sync with its real size
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const update = () => setGridSize({ w: el.clientWidth, h: el.clientHeight });
    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Track the pointer for the dog (mouse moves, finger drags and taps). Stored
  // in a ref (no re-renders), measured relative to the dog's stage: x from its
  // left edge, y from its bottom edge.
  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      const stage = stageRef.current;
      if (!stage) return;
      const r = stage.getBoundingClientRect();
      cursorRef.current = {
        x: e.clientX - r.left,
        y: e.clientY - r.bottom,
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

  // measure the rail + the active card's centre (cards don't move, so one
  // measurement per change is enough; the observer handles rotation / resize)
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const measure = () => {
      setStageWidth(rail.clientWidth);

      if (!isWide || activeIndex === null) {
        setTargetX(null);
        return;
      }

      const card = cardRefs.current[activeIndex];
      if (!card) return;

      const railRect = rail.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      setTargetX(cardRect.left - railRect.left + cardRect.width / 2);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [activeIndex, isWide]);

  const dogMode: DogMode = !isWide
    ? "idle"
    : selectedIndex !== null
      ? "selected"
      : hoveredIndex !== null
        ? "hover"
        : "idle";

  const updateMouse = (e: ReactPointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    pointerRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, t: performance.now() };
  };
  const resetMouse = () => {
    pointerRef.current = null;
  };

  // Which track (if any) the grid should "light up" for: on phones the tab
  // that's open, otherwise whichever card is hovered / pinned.
  useEffect(() => {
    anchorRef.current = window.matchMedia("(max-width: 639px)").matches ? mobileTrack : activeIndex;
  }, [mobileTrack, activeIndex]);

  // digit maths uses the real rendered size, so it lines up on any screen
  const contentWidth = gridSize.w - GRID_PADDING * 2;
  const contentHeight = gridSize.h - GRID_PADDING * 2;
  const cellWidth = contentWidth / COLS;
  const cellHeight = contentHeight / ROWS;
  const radius = Math.max(70, 105 * (gridSize.w / GRID_BASE_WIDTH));

  // The 0 -> 1 interaction. Three sources drive the glow point, in priority:
  //   1. a live pointer (mouse hover, or a finger dragging sideways / tapping)
  //   2. the selected track: its band of columns lights up, so the visual
  //      answers "which track am I on" (5 tracks across 11 columns)
  //   3. touch devices only, otherwise-idle: an ambient wander that also
  //      sweeps down the grid as the section scrolls — so it stays alive
  //      without needing a hover that phones don't have.
  // Runs only while the grid is on screen and the tab is visible.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const gridEl: HTMLDivElement = grid;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cw = (gridSize.w - GRID_PADDING * 2) / COLS;
    const ch = (gridSize.h - GRID_PADDING * 2) / ROWS;
    const contentW = gridSize.w - GRID_PADDING * 2;
    const contentH = gridSize.h - GRID_PADDING * 2;
    const total = COLS * ROWS;
    const shown = new Float32Array(total).fill(-1);
    const pos = { x: gridSize.w / 2, y: gridSize.h / 2, k: 0 }; // k = strength 0..1
    let visible = false;
    let raf = 0;
    let last = 0;

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(frame);
    });
    io.observe(grid);

    function frame(now: number) {
      raf = 0;
      if (!visible || document.hidden) return;
      raf = requestAnimationFrame(frame);
      // phones: ~30fps is plenty for a glow that's easing anyway
      if (coarse && now - last < 33) return;
      const dt = Math.min(0.06, (now - last) / 1000 || 0.016);
      last = now;

      let tx = pos.x;
      let ty = pos.y;
      let tk = 0;
      const ptr = pointerRef.current;
      if (ptr && now - ptr.t < 1500) {
        tx = ptr.x;
        ty = ptr.y;
        tk = 1;
      } else if (anchorRef.current !== null) {
        const i = anchorRef.current;
        tx = GRID_PADDING + ((i + 0.5) / 5) * contentW;
        ty = GRID_PADDING + contentH * (0.5 + 0.28 * Math.sin(now / 1400));
        tk = 0.85;
      } else if (coarse && !reduce) {
        const r = gridEl.getBoundingClientRect();
        const vh = window.innerHeight;
        const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
        tx = GRID_PADDING + contentW * (0.5 + 0.38 * Math.sin(now / 2300));
        ty = GRID_PADDING + contentH * p;
        tk = 0.7;
      }
      const e = 1 - Math.exp(-8 * dt);
      pos.x += (tx - pos.x) * e;
      pos.y += (ty - pos.y) * e;
      pos.k += (tk - pos.k) * e;

      for (let i = 0; i < total; i++) {
        const col = i % COLS;
        const row = (i / COLS) | 0;
        const dx = pos.x - (GRID_PADDING + col * cw + cw / 2);
        const dy = pos.y - (GRID_PADDING + row * ch + ch / 2);
        const q = Math.round(Math.max(0, 1 - Math.hypot(dx, dy) / radius) * pos.k * 40) / 40;
        if (q === shown[i]) continue;
        shown[i] = q;
        const z = zeroRefs.current[i];
        const o = oneRefs.current[i];
        if (z) {
          z.style.opacity = String(0.35 - q * 0.28);
          z.style.transform = `scale(${1 + q * 0.08})`;
        }
        if (o) {
          o.style.opacity = String(q);
          o.style.color = `rgba(53, 224, 201, ${0.35 + q * 0.65})`;
          o.style.transform = `scale(${1 + q * 0.35})`;
          o.style.textShadow = q > 0.05 ? `0 0 ${q * 16}px rgba(53, 224, 201, ${q * 0.85})` : "none";
        }
      }
    }

    raf = requestAnimationFrame(frame);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [gridSize.w, gridSize.h, radius]);

  return (
    <section
      id="tracks"
      className="relative isolate overflow-hidden py-16 sm:py-20 lg:py-24"
    >
      <TracksBackdrop />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
        <div className="grid gap-8 md:grid-cols-[0.85fr_1fr] md:gap-16">
          {/* Binary Interaction (below the intro copy on phones) */}
          <div className="order-2 flex items-center justify-center md:order-1">
            <div
              ref={gridRef}
              className="grid aspect-[1.3/1] w-full max-w-[420px] grid-cols-11 gap-[6px] p-6"
              // pan-y: vertical swipes still scroll the page, sideways drags paint the grid
              style={{ touchAction: "pan-y" }}
              onPointerMove={updateMouse}
              onPointerDown={updateMouse}
              onPointerLeave={resetMouse}
              onPointerCancel={resetMouse}
            >
              {Array.from({ length: COLS * ROWS }).map((_, index) => (
                <div
                  key={index}
                  className="relative flex items-center justify-center font-mono text-[10px] sm:text-[11px]"
                >
                  <span
                    ref={(el) => {
                      zeroRefs.current[index] = el;
                    }}
                    className="absolute"
                    style={{ opacity: 0.35, color: "rgba(167, 156, 135, 0.95)" }}
                  >
                    0
                  </span>
                  <span
                    ref={(el) => {
                      oneRefs.current[index] = el;
                    }}
                    className="absolute"
                    style={{ opacity: 0, color: "rgba(53, 224, 201, 0.35)" }}
                  >
                    1
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Track Introduction */}
          <div className="order-1 flex items-center md:order-2">
            <div>
              <Eyebrow n="02" className="mb-4 sm:mb-5">
                Tracks
              </Eyebrow>
              <p className="max-w-prose font-display text-xl font-medium leading-snug text-ink sm:text-3xl lg:text-4xl">
                Every event sits under one of these.{" "}
                <span className="[@media(hover:none)]:hidden">Hover</span>
                <span className="hidden [@media(hover:none)]:inline">Tap</span>{" "}
                a track to bring it forward.
              </p>
            </div>
          </div>
        </div>

        {/* rail: holds the phone tab bar OR the tablet/desktop cards, plus the cyber
            dog stage — which now shows on every screen size, phones included. */}
        <div ref={railRef} className="relative overflow-visible">
        {/* Mobile only (< sm): a swipeable A–E tab bar, one track open at a
            time, instead of the desktop layout simply stacked into a column. */}
        <div className="mt-10 sm:hidden">
          <div
            role="tablist"
            aria-label="Tracks"
            className="-mx-5 flex snap-x snap-mandatory scroll-pl-5 gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {tracks.map((track, index) => {
              const on = mobileTrack === index;
              return (
                <button
                  key={track.name}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={(e) => {
                    setMobileTrack(index);
                    firePulse(index);
                    // keep the chosen tab fully in view inside the swipe strip
                    e.currentTarget.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                  }}
                  className={`flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors duration-200 ${
                    on
                      ? "border-marigold/70 bg-surface-raised text-ink"
                      : "border-line/60 bg-surface text-muted"
                  }`}
                >
                  <span className={on ? "text-marigold" : "text-muted/70"}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  {track.name}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mobileTrack}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="mt-4 rounded-2xl border border-marigold/70 bg-surface-raised p-5"
            >
              <span className="text-xs tracking-[0.2em] text-muted">
                0{mobileTrack + 1}
              </span>
              <h3 className="mt-1.5 font-display text-xl font-semibold leading-tight text-ink [overflow-wrap:anywhere]">
                {tracks[mobileTrack].name}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                {tracks[mobileTrack].detail}
              </p>
              <p className="mt-3 text-[13px] leading-snug text-ink/80">
                {tracks[mobileTrack].blurb}
              </p>
              <button type="button" onClick={() => { firePulse(mobileTrack); router.push(trackPageHref(tracks[mobileTrack].id)); }} className="mt-3 inline-flex min-h-10 items-center gap-2 text-[13px] font-medium text-circuit transition-colors hover:text-marigold">
                View events in this track
                <span aria-hidden="true">↓</span>
              </button>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Tablet & up: the five cards, 2 columns on tablets, 5 across from `lg` */}
        <div className="hidden sm:mt-14 sm:block lg:mt-16">
          <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {tracks.map((track, index) => {
              const isActive = activeIndex === index;
              const isSelected = selectedIndex === index;

              return (
                <button
                  key={track.name}
                  type="button"
                  ref={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  // real hover only for mouse pointers; taps use click (pin) instead,
                  // so a tap never leaves a card stuck open with no way to close it
                  onPointerEnter={(e) => {
                    if (e.pointerType === "mouse") setHoveredIndex(index);
                  }}
                  onPointerLeave={(e) => {
                    if (e.pointerType === "mouse")
                      setHoveredIndex((h) => (h === index ? null : h));
                  }}
                  // keyboard focus behaves like hover (but a tap/click focus doesn't)
                  onFocus={(e) => {
                    if (e.currentTarget.matches(":focus-visible")) setHoveredIndex(index);
                  }}
                  onBlur={() => setHoveredIndex((h) => (h === index ? null : h))}
                  onClick={() => {
                    setSelectedIndex(index);
                    // the 3D ring gate behind the page flashes in this track's colour
                    firePulse(index);
                    // open the track page already filtered to this track
                    router.push(trackPageHref(track.id));
                  }}
                  aria-pressed={isSelected}
                  className={`group relative w-full min-w-0 overflow-visible rounded-2xl border p-4 text-left transition-colors duration-300 sm:last:col-span-2 lg:p-3 lg:last:col-span-1 xl:p-4 ${
                    isActive
                      ? "border-marigold/70 bg-surface-raised"
                      : "border-line/60 bg-surface hover:border-marigold/50"
                  }`}
                >
                  <div
                    className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(53,224,201,0.20),transparent_65%)] blur-xl transition-opacity duration-500 ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  />

                  <div className="relative z-10">
                    <span className="text-xs tracking-[0.2em] text-muted">
                      0{index + 1}
                    </span>

                    <h3
                      className={`mt-1.5 font-display font-semibold leading-tight text-ink transition-all duration-300 [overflow-wrap:anywhere] ${
                        isActive ? "text-xl lg:text-lg xl:text-xl" : "text-base"
                      }`}
                    >
                      {track.name}
                    </h3>

                    <p className="mt-1 text-xs leading-relaxed text-muted">
                      {track.detail}
                    </p>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-circuit/80">
                      {eventsOf(track.id).length} {eventsOf(track.id).length === 1 ? "event" : "events"}
                    </p>

                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <p className="mt-3 max-w-sm text-[13px] leading-snug text-ink/80">
                            {track.blurb}
                          </p>
                          <span className="mt-3 inline-flex min-h-10 items-center gap-2 text-[13px] font-medium text-circuit transition-colors hover:text-marigold">
                            View events in this track
                            <span aria-hidden="true">↓</span>
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

          {/* Cyber dog stage — visible on phones too */}
          <div
            ref={stageRef}
            className="relative mt-4 h-24 sm:mt-0 lg:h-28 xl:h-32"
            aria-hidden="true"
          >
            {/* floor the dog walks on */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-circuit/10 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-circuit/50 to-transparent" />
            <CyberDog
              stageWidth={stageWidth}
              targetX={targetX}
              mode={dogMode}
              cursorRef={cursorRef}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
