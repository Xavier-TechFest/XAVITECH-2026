"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getFanTransform } from "@/lib/fan";
import { EventsBackdrop } from "./Backdrops";
import Eyebrow from "@/components/ui/Eyebrow";
import { firePulse } from "@/lib/pulse";
import { EVENTS } from "@/lib/eventsData";

const trackLabels: Record<string, string> = {
  "track-a": "HACKATHON", "track-b": "CODING & DEVELOPMENT", "track-c": "GAMING & ADVENTURE",
  "track-d": "STAGE & CENTRAL EVENTS", "track-e": "WORKSHOPS & KNOWLEDGE",
};
const events = EVENTS.map((event) => ({
  id: event.id,
  name: event.name,
  track: trackLabels[event.trackId],
  status: event.registrationConfig ? "Requirements available" : "Details TBA",
  format: event.team,
}));

// filter chips: the same five tracks the Tracks section introduces
const FILTERS = [
  { label: "All", track: null },
  { label: "Hackathon", track: "HACKATHON" },
  { label: "Coding", track: "CODING & DEVELOPMENT" },
  { label: "Gaming", track: "GAMING & ADVENTURE" },
  { label: "Stage & Central", track: "STAGE & CENTRAL EVENTS" },
  { label: "Workshops", track: "WORKSHOPS & KNOWLEDGE" },
] as const;

export default function EventsPreview() {
  const [paused, setPaused] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState(0);
  // Touch devices (and anyone who asked for reduced motion) get a plain
  // swipeable row instead of the auto-scrolling marquee: a moving target is
  // hard to tap, and a marquee has no hover to pause it on a phone.
  const [scrollLayout, setScrollLayout] = useState(false);
  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setScrollLayout(coarse.matches || reduce.matches);
    update();
    coarse.addEventListener("change", update);
    reduce.addEventListener("change", update);
    return () => {
      coarse.removeEventListener("change", update);
      reduce.removeEventListener("change", update);
    };
  }, []);

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
              className={`min-h-11 rounded-full border px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors duration-200 sm:min-h-9 sm:px-3.5 sm:text-[11px] ${
                filter === i
                  ? "border-circuit bg-circuit/15 text-circuit shadow-[0_0_16px_rgba(53,224,201,0.25)]"
                  : "border-line/70 text-muted hover:border-circuit/50 hover:text-ink"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

{filtered.length === 1 ? (
          /* A track with exactly one event doesn't get a carousel to fan
             through — that's just an awkward sideways shuffle of one card.
             One centred card, in on a scale + fade + upward move instead. */
          <div className="flex justify-center py-14 sm:py-16">
            <motion.div
              key={filter}
              initial={{ opacity: 0, scale: 0.94, y: 22 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full max-w-sm rounded-2xl border border-circuit/70 bg-surface-raised p-6 text-left shadow-[0_0_40px_rgba(53,224,201,0.18)] sm:max-w-md sm:p-8"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted">{filtered[0].track}</p>
                <span className="font-mono text-[10px] text-muted/60">01</span>
              </div>
              <h3 className="mt-3 font-display text-2xl font-semibold text-ink sm:text-3xl">
                {filtered[0].name}
              </h3>
              <div className="mt-6 flex items-center justify-between text-xs">
                <span className="text-muted">{filtered[0].format}</span>
                <span
                  className={
                    filtered[0].status === "Registration open" ? "text-circuit" : "text-muted"
                  }
                >
                  {filtered[0].status}
                </span>
              </div>
            </motion.div>
          </div>
        ) : scrollLayout ? (
          <div
            key={filter}
            className="-mx-5 flex snap-x snap-mandatory scroll-pl-5 gap-4 overflow-x-auto px-5 pb-10 pt-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:scroll-pl-6 sm:px-6"
          >
            {filtered.map((event, index) => {
              const on = selectedIndex === index;
              return (
                <button
                  key={event.name}
                  type="button"
                  onClick={() => {
                    setSelectedIndex((v) => (v === index ? null : index));
                    firePulse(index);
                  }}
                  aria-pressed={on}
                  className={`relative flex h-52 w-[16.5rem] shrink-0 snap-start flex-col justify-between rounded-2xl border p-5 text-left transition-colors duration-300 sm:h-56 sm:w-[18rem] sm:p-6 ${
                    on
                      ? "border-circuit/70 bg-surface-raised shadow-[0_0_40px_rgba(53,224,201,0.18)]"
                      : "border-line/60 bg-surface"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted">{event.track}</p>
                      <span className="font-mono text-[10px] text-muted/60">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="mt-3 font-display text-2xl font-semibold text-ink">
                      {event.name}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted">{event.format}</span>
                    <span className={event.status === "Registration open" ? "text-circuit" : "text-muted"}>
                      {event.status}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
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
        )}

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
