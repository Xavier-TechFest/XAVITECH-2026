"use client";

import { motion } from "framer-motion";
import { EventItem, TRACKS } from "@/lib/eventsData";
import Link from "next/link";
import { cropStyle, useImageCrop } from "@/components/ui/ImageCropEditor";
import { useEventRegistrationStatus } from "@/lib/hooks/useEventRegistrationStatus";

interface EventCardProps {
  event: EventItem;
  onOpenInfo?: (event: EventItem) => void;
  variant?: "flagship" | "featured" | "standard";
  index?: number;
}

export default function EventCard({ event, variant }: EventCardProps) {
  const isFlagship = event.isFlagship || variant === "flagship";
  const track = TRACKS.find((item) => item.id === event.trackId);
  const imageCrop = useImageCrop(event, "card");
  const { status } = useEventRegistrationStatus(event.id);
  const effectiveStatus = status || (event.registrationConfig ? "OPEN" : "TBA");

  const isAvailable = effectiveStatus === "OPEN";
  let buttonText = "Registration →";
  if (effectiveStatus === "COMING_SOON") {
    buttonText = "Opens Soon";
  } else if (effectiveStatus === "CLOSED") {
    buttonText = "Closed";
  } else if (effectiveStatus === "FULL") {
    buttonText = "Full";
  } else if (effectiveStatus === "DISABLED") {
    buttonText = "Unavailable";
  }
  const isHackathon = event.id === "innocraft";
  const isWebDev = event.id === "webweave";
  const accent = isHackathon ? "#ff6848" : isWebDev ? "#f0a15b" : event.accentColor || "#35e0c9";
  const tags = isHackathon
    ? ["Hackathon", "Prototype", "Full-Stack"]
    : isWebDev
      ? ["Web Dev", "Frontend", "Full-Stack"]
      : [track?.name || "Tech", "Build", "Compete"];

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="group relative mx-auto aspect-[2/3] w-full max-w-[408px] select-none overflow-hidden bg-[#04090d]"
      style={{ "--event-accent": accent } as React.CSSProperties}
    >
      <img
        src={event.image}
        alt={event.name}
        loading="lazy"
        className={`absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04] ${event.id === "hack-the-skill" ? "opacity-[0.85] group-hover:opacity-100" : "opacity-75 group-hover:opacity-95"}`}
        style={cropStyle(imageCrop)}
      />
      <div className={`absolute inset-0 bg-gradient-to-b ${event.id === "hack-the-skill" ? "from-[#03080d]/55 via-[#03080d]/20 via-45% to-[#03080d]/65" : "from-[#03080d]/85 via-[#03080d]/45 via-45% to-[#03080d]/92"}`} />
      <div className="absolute inset-[1px] border border-[var(--event-accent)]/50 transition-colors group-hover:border-[var(--event-accent)]" />
      <div className="pointer-events-none absolute left-4 top-4 h-5 w-5 border-l-2 border-t-2 border-[var(--event-accent)]" />
      <div className="pointer-events-none absolute right-4 top-4 h-5 w-5 border-r-2 border-t-2 border-[var(--event-accent)]" />
      <div className="pointer-events-none absolute bottom-4 left-4 h-5 w-5 border-b-2 border-l-2 border-[var(--event-accent)]" />
      <div className="pointer-events-none absolute bottom-4 right-4 h-5 w-5 border-b-2 border-r-2 border-[var(--event-accent)]" />

      <div className="relative flex h-full flex-col p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2 border-b border-white/15 pb-3">
          <span className="truncate font-oxanium text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300 sm:text-xs">
            {event.badge}
          </span>
            <span className="flex shrink-0 items-center gap-1.5 border px-2 py-1 font-oxanium text-[9px] font-bold uppercase tracking-widest text-[var(--event-accent)]" style={{ borderColor: `${accent}99`, backgroundColor: `${accent}18` }}>
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--event-accent)] shadow-[0_0_8px_var(--event-accent)]" /> {status || (event.registrationConfig ? "DETAILS" : "TBA")}
          </span>
        </div>

        <div className="pt-5">
          <h3 className="font-space text-3xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-4xl" style={{ textShadow: `0 0 24px ${accent}55` }}>
            {event.name}
          </h3>
          <p className="mt-2 font-oxanium text-sm font-bold uppercase tracking-wider text-slate-200 sm:text-base">{event.shortDesc}</p>
          {isFlagship && <span className="mt-2 inline-block font-oxanium text-[9px] font-black uppercase tracking-widest text-[var(--event-accent)]">★ Featured</span>}
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="border px-2.5 py-1 font-oxanium text-[9px] font-bold uppercase tracking-wider text-[var(--event-accent)]" style={{ borderColor: `${accent}99`, backgroundColor: "rgba(2,8,13,.62)" }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex-1" />

        <div className="grid grid-cols-2 gap-x-3 gap-y-3 border-t border-white/20 py-4 font-space text-xs leading-snug text-slate-100 sm:text-sm">
          <div><span className="block font-oxanium text-[10px] font-bold uppercase tracking-widest text-[var(--event-accent)] sm:text-xs">Date · Time</span><span className="mt-1 block">{event.date} · {event.time}</span></div>
          {event.team !== "TBA" && <div><span className="block font-oxanium text-[10px] font-bold uppercase tracking-widest text-[var(--event-accent)] sm:text-xs">Participants</span><span className="mt-1 block">{event.team}</span></div>}
          <div className="truncate"><span className="block font-oxanium text-[10px] font-bold uppercase tracking-widest text-[var(--event-accent)] sm:text-xs">Venue</span><span className="mt-1 block truncate">{event.venue}</span></div>
          <div><span className="block font-oxanium text-[10px] font-bold uppercase tracking-widest text-[var(--event-accent)] sm:text-xs">Registration Fee</span><span className="mt-1 block">{event.price}</span></div>
        </div>

        <div className="mb-3 border bg-black/50 px-3 py-2.5 text-center" style={{ borderColor: `${accent}99` }}>
          <span className="font-oxanium text-base font-black uppercase tracking-wide sm:text-lg" style={{ color: accent, textShadow: `0 0 12px ${accent}66` }}>Exciting Gifts &amp; Prizes</span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          <Link href={`/events/${event.id}`} className="col-span-2 flex h-11 items-center justify-center border border-white/35 bg-black/55 font-oxanium text-[10px] font-extrabold uppercase tracking-wider text-white transition hover:border-[var(--event-accent)] hover:text-[var(--event-accent)]">
            Explore
          </Link>
          {isAvailable ? (
            <Link href={`/events/${event.id}/register`} className="col-span-3 flex h-11 items-center justify-center font-oxanium text-xs font-black uppercase tracking-widest text-[#07090b] transition hover:brightness-110" style={{ backgroundColor: accent, boxShadow: `0 0 20px ${accent}55` }}>
              Registration <span className="ml-2" aria-hidden="true">→</span>
            </Link>
          ) : (
            <button disabled className="col-span-3 flex h-11 items-center justify-center font-oxanium text-xs font-black uppercase tracking-widest opacity-60 cursor-not-allowed bg-neutral-900 text-neutral-400 border border-neutral-700">
              {buttonText}
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
