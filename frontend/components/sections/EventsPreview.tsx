"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getFanTransform } from "@/lib/fan";
import { EventsBackdrop } from "./Backdrops";
import Eyebrow from "@/components/ui/Eyebrow";
import { firePulse } from "@/lib/pulse";

import { EVENTS, TRACKS, trackById, type FestEvent, type TrackId } from "@/lib/fest";
import { TRACK_EVENT } from "@/lib/trackBus";

type Filter = "all" | TrackId;
const FILTERS: { label: string; id: Filter }[] = [
  { label: "All", id: "all" },
  ...TRACKS.map((t) => ({ label: t.short, id: t.id as Filter })),
];

/** Card artwork: the event's poster, dimmed under a scrim — or a generated blueprint pattern when there's no poster. */
function CardArt({ event, active }: { event: FestEvent; active: boolean }) {
  const isRuntimeRush = event.name === "RUNTIME RUSH";
  return (
    <>
      {event.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={event.image}
          alt=""
          width={640}
          height={480}
          loading="lazy"
          decoding="async"
          draggable={false}
          className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-all duration-500 ${
            isRuntimeRush
              ? active ? "scale-110 opacity-40" : "scale-100 opacity-30"
              : active ? "scale-110 opacity-65" : "scale-100 opacity-40"
          }`}
        />
      ) : (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 15%, rgba(242,166,60,0.38), transparent 55%), radial-gradient(circle at 15% 90%, rgba(53,224,201,0.32), transparent 55%), linear-gradient(rgba(53,224,201,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(53,224,201,0.18) 1px, transparent 1px)",
            backgroundSize: "auto, auto, 24px 24px, 24px 24px",
          }}
        />
      )}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#07080B] via-[#07080B]/55 to-[#07080B]/20"
      />
    </>
  );
}

function CardText({ event, number, active, large = false }: { event: FestEvent; number: number; active: boolean; large?: boolean }) {
  const track = trackById(event.track);
  return (
    <>
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[10px] font-medium tracking-[0.12em] text-ink/70">{track.tag}</p>
          <span className="font-mono text-[10px] text-ink/50">{String(number).padStart(2, "0")}</span>
        </div>
        <h3
          className={`mt-3 font-display font-semibold uppercase tracking-wide text-ink [text-shadow:0_2px_14px_rgba(0,0,0,0.8)] transition-all duration-300 ${
            large ? "text-3xl sm:text-4xl" : active ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
          }`}
        >
          {event.name}
        </h3>
        {/* what the event really is */}
        <p className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full border border-circuit/50 bg-bg/70 px-3 py-1.5 font-oxanium text-xs font-semibold uppercase leading-tight tracking-wider text-circuit backdrop-blur-sm">
          <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-circuit" />
          <span className="truncate">{event.realName}</span>
        </p>
      </div>
      <div className="relative z-10 flex items-center justify-between text-xs">
        <span className="text-ink/75">{event.format}</span>
        <span className={event.status === "Registration open" ? "text-circuit" : "text-ink/60"}>{event.status}</span>
      </div>
    </>
  );
}

export default function EventsPreview() {
  const router = useRouter();
  const [paused, setPaused] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
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

  const pickFilter = (id: Filter) => {
    setFilter(id);
    setHoveredIndex(null);
    setSelectedIndex(null);
    setPaused(false);
  };

  // A tap on a track card (Tracks section) filters this carousel to that track.
  useEffect(() => {
    const onTrack = (e: Event) => {
      const id = (e as CustomEvent<{ track: TrackId }>).detail?.track;
      if (id) pickFilter(id);
    };
    window.addEventListener(TRACK_EVENT, onTrack);
    return () => window.removeEventListener(TRACK_EVENT, onTrack);
  }, []);

  const filtered = filter === "all" ? EVENTS : EVENTS.filter((e) => e.track === filter);
    // a short filter still needs enough cards to fill a marquee
  const base = Array.from({ length: Math.ceil(8 / filtered.length) }).flatMap(() => filtered);
  const carouselEvents = [...base, ...base];

  const activeIndex = hoveredIndex ?? selectedIndex;
  const hasActive = activeIndex !== null;

  return (
    <section id="events" className="relative isolate scroll-mt-14 overflow-hidden">
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
              to bring it forward — or pick a track below.
            </p>
          </div>
        </div>

        {/* Track filter: pick a track and the carousel reshuffles */}
        <div
          role="group"
          aria-label="Filter events by track"
          className="mt-7 flex flex-wrap gap-2 sm:mt-9"
        >
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                pickFilter(f.id);
                firePulse(Math.max(0, FILTERS.findIndex((x) => x.id === f.id)));
              }}
              aria-pressed={filter === f.id}
              className={`min-h-11 rounded-full border px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors duration-200 sm:min-h-9 sm:px-3.5 sm:text-[11px] ${
                filter === f.id
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
             through — one centred card, in on a scale + fade + upward move. */
          <div className="flex justify-center py-14 sm:py-16">
            <motion.div
              key={filter}
              initial={{ opacity: 0, scale: 0.94, y: 22 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              onClick={() => router.push(`/events/${filtered[0].slug}`)}
              className="relative flex h-64 w-full max-w-sm flex-col justify-between overflow-hidden rounded-2xl border border-circuit/70 bg-surface-raised p-6 text-left shadow-[0_0_40px_rgba(53,224,201,0.18)] sm:h-72 sm:max-w-md sm:p-8 cursor-pointer"
            >
              <CardArt event={filtered[0]} active />
              <CardText event={filtered[0]} number={1} active large />
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
                  onClick={() => router.push(`/events/${event.slug}`)}
                  aria-pressed={on}
                  className={`relative flex h-56 w-[16.5rem] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-2xl border p-5 text-left transition-colors duration-300 sm:h-60 sm:w-[18rem] sm:p-6 ${
                    on
                      ? "border-circuit/70 bg-surface-raised shadow-[0_0_40px_rgba(53,224,201,0.18)]"
                      : "border-line/60 bg-surface"
                  }`}
                >
                  <CardArt event={event} active={on} />
                  <CardText event={event} number={index + 1} active={on} />
                </button>
              );
            })}
          </div>
        ) : (
          <div
            className="relative overflow-visible pb-14 pt-24 sm:pt-28"
            style={{
              maskImage: "linear-gradient(90deg, transparent 0, black 7%, black 93%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(90deg, transparent 0, black 7%, black 93%, transparent 100%)",
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
                const fan = getFanTransform(index - (activeIndex ?? index), isActive, hasActive);

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
                      router.push(`/events/${event.slug}`);
                    }}
                    aria-pressed={isSelected}
                    className={`group relative flex h-56 w-[16.5rem] shrink-0 flex-col justify-between overflow-hidden rounded-2xl border p-5 text-left sm:h-60 sm:w-[18rem] sm:p-6 transition-colors duration-300 ${
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
                    <CardArt event={event} active={isActive} />
                    <CardText event={event} number={(index % filtered.length) + 1} active={isActive} />
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
