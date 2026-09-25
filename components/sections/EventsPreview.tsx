"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { getFanTransform } from "@/lib/fan";
import { EventsBackdrop } from "./Backdrops";
import Eyebrow from "@/components/ui/Eyebrow";
import { firePulse } from "@/lib/pulse";

const events = [
  {
    name: "Hackathon",
    track: "HACKATHON",
    status: "Registration open",
    format: "Team of 4",
  },
  {
    name: "Debugging Challenge",
    track: "CODING AND DEVELOPMENT",
    status: "Registration open",
    format: "Team of 2",
  },
  {
    name: "Web Development",
    track: "CODING AND DEVELOPMENT",
    status: "Registration open",
    format: "Team of 3",
  },
  {
    name: "Data Analytics Challenge",
    track: "CODING AND DEVELOPMENT",
    status: "Opens soon",
    format: "Team of 2",
  },
  {
    name: "Code Sprint",
    track: "CODING AND DEVELOPMENT",
    status: "Registration open",
    format: "Team of 2",
  },
  {
    name: "Gaming",
    track: "GAMING AND ADVENTURE",
    status: "Registration open",
    format: "Team of 5",
  },
  {
    name: "Tech Treasure Hunt",
    track: "GAMING AND ADVENTURE",
    status: "Registration open",
    format: "Team of 2",
  },
  {
    name: "Death Race",
    track: "GAMING AND ADVENTURE",
    status: "Opens soon",
    format: "Team of 2",
  },
  {
    name: "Tech Quiz",
    track: "CENTRAL EVENTS",
    status: "Registration open",
    format: "Team of 2",
  },
  {
    name: "AI Prompt Battle",
    track: "CENTRAL EVENTS",
    status: "Registration open",
    format: "Team of 2",
  },
  {
    name: "MUN",
    track: "CENTRAL EVENTS",
    status: "Registration open",
    format: "Team of 2",
  },
  {
    name: "Ideathon",
    track: "CENTRAL EVENTS",
    status: "Registration open",
    format: "Team of 2",
  },
  {
    name: "Workshop",
    track: "KNOWLEDGE",
    status: "Registration open",
    format: "Individual",
  },
];

// filter chips: the same five tracks the Tracks section introduces
const FILTERS = [
  { label: "All", track: null },
  { label: "Hackathon", track: "HACKATHON" },
  { label: "Coding", track: "CODING AND DEVELOPMENT" },
  { label: "Gaming", track: "GAMING AND ADVENTURE" },
  { label: "Central", track: "CENTRAL EVENTS" },
  { label: "Knowledge", track: "KNOWLEDGE" },
] as const;

export default function EventsPreview() {
  const [paused, setPaused] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState(0);

  const filtered = FILTERS[filter].track
    ? events.filter((e) => e.track === FILTERS[filter].track)
    : events;
  // a short filter (e.g. one event) still needs enough cards to fill a marquee
  const base = Array.from({ length: Math.ceil(8 / filtered.length) }).flatMap(() => filtered);
  const carouselEvents = [...base, ...base];

  const pickFilter = (i: number) => {
    setFilter(i);
    setHoveredIndex(null);
    setSelectedIndex(null);
    setPaused(false);
    firePulse(i);
  };
  const activeIndex = hoveredIndex ?? selectedIndex;
  const hasActive = activeIndex !== null;

  return (
    <section id="events" className="relative isolate overflow-hidden">
      <EventsBackdrop />

      {/* inner box keeps the marquee clipped to the content width */}
      <div className="relative mx-auto max-w-7xl overflow-hidden px-5 py-16 sm:px-6 sm:py-24 lg:py-28">
        {/* Heading */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="grid w-full gap-5 sm:grid-cols-[1fr_1.4fr] sm:gap-16">
            <Eyebrow n="03">Featured events</Eyebrow>
            <p className="max-w-prose font-display text-xl font-medium leading-snug text-ink sm:text-3xl lg:text-4xl">
              A handful of what&rsquo;s running.{" "}
              <span className="[@media(hover:none)]:hidden">Hover</span>
              <span className="hidden [@media(hover:none)]:inline">Tap</span> one
              to bring it forward — the full list is one tap further.
            </p>
          </div>
        </div>

        {/* Track filter: pick a track and the carousel reshuffles */}
        <div
          role="group"
          aria-label="Filter events by track"
          className="mt-7 flex flex-wrap gap-2 sm:mt-9"
        >
          {FILTERS.map((f, i) => (
            <button
              key={f.label}
              type="button"
              onClick={() => pickFilter(i)}
              aria-pressed={filter === i}
              className={`min-h-9 rounded-full border px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors duration-200 sm:text-[11px] ${
                filter === i
                  ? "border-circuit bg-circuit/15 text-circuit shadow-[0_0_16px_rgba(53,224,201,0.25)]"
                  : "border-line/70 text-muted hover:border-circuit/50 hover:text-ink"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Carousel. Top padding is generous on purpose: a hovered card rises
            ~34px and grows 16% from its bottom edge, and must never be clipped. */}
        <div
          className="relative overflow-visible pb-14 pt-24 sm:pt-28"
          style={{
            maskImage:
              "linear-gradient(90deg, transparent 0, black 7%, black 93%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(90deg, transparent 0, black 7%, black 93%, transparent 100%)",
          }}
          onPointerLeave={(e) => {
            if (e.pointerType !== "mouse") return;
            setPaused(false);
            setHoveredIndex(null);
          }}
        >

          <div
            key={filter}
            className="flex w-max gap-5"
            style={{
              animation: `events-scroll ${base.length * 2.7}s linear infinite`,
              animationPlayState: paused || hasActive ? "paused" : "running",
            }}
          >
            {carouselEvents.map((event, index) => {
              const isActive = activeIndex === index;
              const isSelected = selectedIndex === index;
              const fan = getFanTransform(
                index - (activeIndex ?? index),
                isActive,
                hasActive
              );

              return (
                <motion.button
                  key={`${event.name}-${index}`}
                  type="button"
                  onPointerEnter={(e) => {
                    if (e.pointerType !== "mouse") return;
                    setPaused(true);
                    setHoveredIndex(index);
                  }}
                  onPointerLeave={(e) => {
                    if (e.pointerType !== "mouse") return;
                    setHoveredIndex((h) => (h === index ? null : h));
                  }}
                  onClick={() => {
                    setSelectedIndex((s) => (s === index ? null : index));
                    firePulse(index);
                  }}
                  aria-pressed={isSelected}
                  className={`group relative flex h-52 w-[16.5rem] shrink-0 flex-col justify-between rounded-2xl border p-5 text-left sm:h-56 sm:w-[18rem] sm:p-6 transition-colors duration-300 ${
                    isActive
                      ? "border-circuit/70 bg-surface-raised shadow-[0_0_40px_rgba(53,224,201,0.18)]"
                      : "border-line/60 bg-surface hover:border-circuit/50"
                  }`}
                  style={{ transformOrigin: "bottom center" }}
                  animate={{
                    y: fan.y,
                    rotate: fan.rotate,
                    scale: fan.scale,
                    opacity: fan.opacity,
                    zIndex: fan.zIndex,
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted">{event.track}</p>
                      <span className="font-mono text-[10px] text-muted/60">
                        {String((index % filtered.length) + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <h3
                      className={`mt-3 font-display font-semibold text-ink transition-all duration-300 ${
                        isActive ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
                      }`}
                    >
                      {event.name}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted">{event.format}</span>
                    <span
                      className={
                        event.status === "Registration open"
                          ? "text-circuit"
                          : "text-muted"
                      }
                    >
                      {event.status}
                    </span>
                  </div>

                  <div
                    className={`pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_50%_0%,rgba(227,148,51,0.10),transparent_65%)] transition-opacity duration-500 ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* CTA Link to full Tracks & Events directory */}
        <div className="mt-8 flex justify-center">
          <a
            href="/tracks"
            className="inline-flex items-center gap-2 rounded-full border border-circuit/60 bg-circuit/10 px-8 py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-circuit shadow-[0_0_20px_rgba(53,224,201,0.2)] transition-all duration-300 hover:scale-105 hover:bg-circuit hover:text-bg"
          >
            <span>Explore Full Arena Directory (15 Arenas)</span>
            <span>→</span>
          </a>
        </div>

        <style jsx>{`
          @keyframes events-scroll {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(calc(-50% - 10px));
            }
          }
        `}</style>
      </div>
    </section>
  );
}
