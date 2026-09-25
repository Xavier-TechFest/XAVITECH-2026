"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CyberDog, { type CursorPoint, type DogMode } from "./CyberDog";
import { TracksBackdrop } from "./Backdrops";
import Eyebrow from "@/components/ui/Eyebrow";
import { firePulse } from "@/lib/pulse";

const tracks = [
  {
    name: "Hackathon",
    detail: "Models, agents, applied ML",
    blurb:
      "Build something that works in a single stretch. Bring a team of four, pick a problem, ship a working prototype by judging.",
  },
  {
    name: "Coding & Development",
    detail: "CTF, pentesting, defense",
    blurb:
      "Web builds, debugging sprints, and security challenges — for people who'd rather solve it in the editor than on a whiteboard.",
  },
  {
    name: "Gaming & Adventure",
    detail: "Full-stack builds, hackathons",
    blurb:
      "Treasure hunts, elimination races, and head-to-head gaming rounds spread across the day. Team up or go solo.",
  },
  {
    name: "Stage & Central Events",
    detail: "Bots, embedded, IoT",
    blurb:
      "The main-stage lineup — quizzes, debates, prompt battles, and the events everyone ends up watching between their own rounds.",
  },
  {
    name: "Workshop & Knowledge",
    detail: "UI/UX, product thinking",
    blurb:
      "Hands-on sessions run by people who do this for a living. Walk in knowing the basics, walk out having built something.",
  },
];

const COLS = 11;
const ROWS = 7;

// binary-grid geometry (matches the `p-6` padding and 1.3:1 aspect in the markup)
const GRID_PADDING = 24;
const GRID_BASE_WIDTH = 420;
const GRID_ASPECT = 1.3;

export default function Tracks() {
  const [mouse, setMouse] = useState({ x: -100, y: -100 });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

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
    setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };
  const resetMouse = () => setMouse({ x: -100, y: -100 });

  // digit maths uses the real rendered size, so it lines up on any screen
  const contentWidth = gridSize.w - GRID_PADDING * 2;
  const contentHeight = gridSize.h - GRID_PADDING * 2;
  const cellWidth = contentWidth / COLS;
  const cellHeight = contentHeight / ROWS;
  const radius = Math.max(70, 105 * (gridSize.w / GRID_BASE_WIDTH));

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
              {Array.from({ length: COLS * ROWS }).map((_, index) => {
                const col = index % COLS;
                const row = Math.floor(index / COLS);

                const cellX = GRID_PADDING + col * cellWidth + cellWidth / 2;
                const cellY = GRID_PADDING + row * cellHeight + cellHeight / 2;

                const distance = Math.hypot(mouse.x - cellX, mouse.y - cellY);
                const intensity = Math.max(0, 1 - distance / radius);

                return (
                  <div
                    key={index}
                    className="relative flex items-center justify-center font-mono text-[10px] sm:text-[11px]"
                  >
                    <span
                      className="absolute transition-all duration-300 ease-out"
                      style={{
                        opacity: 0.35 - intensity * 0.28,
                        color: "rgba(167, 156, 135, 0.95)",
                        transform: `scale(${1 + intensity * 0.08})`,
                      }}
                    >
                      0
                    </span>
                    <span
                      className="absolute transition-all duration-300 ease-out"
                      style={{
                        opacity: intensity,
                        color: `rgba(53, 224, 201, ${0.35 + intensity * 0.65})`,
                        transform: `scale(${1 + intensity * 0.35})`,
                        textShadow: `0 0 ${intensity * 16}px rgba(53, 224, 201, ${
                          intensity * 0.85
                        })`,
                      }}
                    >
                      1
                    </span>
                  </div>
                );
              })}
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

        {/* Track Cards: 1 column on phones, 2 on tablets, 5 across from `lg` */}
        <div ref={railRef} className="relative mt-10 overflow-visible sm:mt-14 lg:mt-16">
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
                    setSelectedIndex((s) => (s === index ? null : index));
                    // the 3D ring gate behind the page flashes in this track's colour
                    firePulse(index);
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
                          <a
                            href="/tracks"
                            onClick={(e) => e.stopPropagation()}
                            className="mt-3 inline-flex min-h-10 items-center gap-2 text-[13px] font-medium text-circuit transition-colors hover:text-marigold"
                          >
                            View events in this track
                            <span aria-hidden="true">→</span>
                          </a>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Cyber dog stage */}
          <div
            ref={stageRef}
            className="relative h-24 lg:h-28 xl:h-32"
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
