// "use client";

// import { motion } from "framer-motion";
// import { EventItem } from "@/lib/eventsData";
// import Link from "next/link";

// interface EventCardProps {
//   event: EventItem;
//   onOpenInfo: (event: EventItem) => void;
// }

// export default function EventCard({ event, onOpenInfo }: EventCardProps) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 25 }}
//       whileInView={{ opacity: 1, y: 0 }}
//       viewport={{ once: true }}
//       whileHover={{ y: -8, scale: 1.02 }}
//       transition={{ duration: 0.3 }}
//       className="group relative flex flex-col justify-between overflow-visible rounded-2xl border border-blue-900/80 bg-[#081024]/95 p-4 pt-6 sm:p-5 sm:pt-7 shadow-2xl transition-all duration-300 hover:border-cyan-400 hover:shadow-[0_0_40px_rgba(53,224,201,0.35)]"
//     >
//       {/* Outer Glow backdrop */}
//       <div
//         className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
//         style={{
//           background: `radial-gradient(circle at 50% 0%, ${event.accentColor}25, transparent 75%)`,
//         }}
//       />

//       {/* Cyber Corner Notches (4 corners bracket styling) */}
//       <span className="pointer-events-none absolute left-2 top-2 h-3.5 w-3.5 border-l-2 border-t-2 border-cyan-400/70 transition-colors group-hover:border-cyan-300" />
//       <span className="pointer-events-none absolute right-2 top-2 h-3.5 w-3.5 border-r-2 border-t-2 border-cyan-400/70 transition-colors group-hover:border-cyan-300" />
//       <span className="pointer-events-none absolute bottom-2 left-2 h-3.5 w-3.5 border-b-2 border-l-2 border-cyan-400/70 transition-colors group-hover:border-cyan-300" />
//       <span className="pointer-events-none absolute bottom-2 right-2 h-3.5 w-3.5 border-b-2 border-r-2 border-cyan-400/70 transition-colors group-hover:border-cyan-300" />

//       {/* Top Diamond Header Ornament (Fixed Clipping with padding) */}
//       <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 rounded-full border border-amber-400/90 bg-[#09152e] px-3.5 py-0.5 shadow-lg">
//         <span className="text-[10px] text-amber-400 font-extrabold">◆◆</span>
//         <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-amber-300">
//           {event.badgeLevel}
//         </span>
//         <span className="text-[10px] text-amber-400 font-extrabold">◆◆</span>
//       </div>

//       {/* Top Image Frame */}
//       <div className="relative overflow-hidden rounded-xl border border-blue-500/30 bg-[#050b18] aspect-[16/10]">
//         <img
//           src={event.image}
//           alt={event.name}
//           className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
//         />
//         <div className="absolute inset-0 bg-gradient-to-t from-[#081024] via-transparent to-transparent opacity-80" />

//         {/* Floating Track Pill inside image */}
//         <div className="absolute bottom-2 left-2 rounded-md bg-black/75 px-2.5 py-1 backdrop-blur-md border border-white/10 font-mono text-[10px] text-cyan-300 font-semibold uppercase tracking-wider">
//           {event.trackName}
//         </div>
//       </div>

//       {/* Event Details Section */}
//       <div className="mt-4 flex flex-1 flex-col justify-between">
//         <div>
//           {/* Main 1-Word Crisp Event Title (e.g. "HACKATHON", "WEB DEVELOPMENT") */}
//           <h3 className="font-display text-xl sm:text-2xl font-black uppercase tracking-tight text-white group-hover:text-cyan-300 transition-colors text-center">
//             {event.name}
//           </h3>

//           {/* Subtitle with full title info */}
//           <p className="mt-1.5 text-xs leading-relaxed text-blue-200/70 text-center line-clamp-2">
//             {event.shortDesc}
//           </p>

//           {/* Quick info row */}
//           <div className="mt-4 flex items-center justify-between font-mono text-[11px] text-blue-300/80 border-t border-blue-900/50 pt-3">
//             <span className="flex items-center gap-1">
//               <span className="text-cyan-400">📍</span>
//               <span className="truncate max-w-[110px]">{event.venue}</span>
//             </span>
//             <span className="flex items-center gap-1">
//               <span className="text-amber-400">👥</span>
//               <span>{event.team}</span>
//             </span>
//           </div>
//         </div>

//         {/* Action Buttons & Bottom Fee Bar */}
//         <div className="mt-5 space-y-2.5">
//           {/* Two Buttons Side-by-Side */}
//           <div className="grid grid-cols-2 gap-2">
//             <button
//               type="button"
//               onClick={() => onOpenInfo(event)}
//               className="flex h-9 items-center justify-center rounded-lg border border-blue-400/50 bg-blue-950/40 font-mono text-xs font-bold uppercase tracking-wider text-blue-200 transition-all hover:border-cyan-400 hover:bg-cyan-500/20 hover:text-white"
//             >
//               EXPLORE
//             </button>

//             <Link
//               href={`/events/${event.id}/register`}
//               className="flex h-9 items-center justify-center rounded-lg border border-cyan-400/80 bg-gradient-to-r from-blue-600 to-cyan-500 font-mono text-xs font-bold uppercase tracking-wider text-white transition-all hover:shadow-[0_0_20px_rgba(53,224,201,0.6)] hover:brightness-110"
//             >
//               REGISTER
//             </Link>
//           </div>

//           {/* Bottom Prize / Price Bar */}
//           <div className="rounded-lg bg-gradient-to-r from-blue-800 via-blue-700 to-cyan-600 py-1.5 px-3 text-center font-mono text-xs font-extrabold text-white shadow-md flex items-center justify-between">
//             <span className="text-[10px] text-blue-200 uppercase tracking-widest">PRIZE POOL</span>
//             <span className="text-amber-300 font-extrabold tracking-wider">{event.prize}</span>
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );
// }


"use client";

import { motion } from "framer-motion";
import { EventItem, TRACKS } from "@/lib/eventsData";
import Link from "next/link";

interface EventCardProps {
  event: EventItem;
  onOpenInfo?: (event: EventItem) => void;
  variant?: "flagship" | "featured" | "standard";
  index?: number;
}

export default function EventCard({ event, variant }: EventCardProps) {
  const isFlagship = event.isFlagship || event.badgeLevel === "Crucible" || variant === "flagship";
  const track = TRACKS.find((item) => item.id === event.trackId);
  const isHackathon = event.id === "crucible";
  const isWebDev = event.id === "web-craft";
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
        className="absolute inset-0 h-full w-full object-cover opacity-65 transition duration-700 group-hover:scale-[1.04] group-hover:opacity-80"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#03080d]/95 via-[#03080d]/65 via-40% to-[#03080d]/95" />
      <div className="absolute inset-[1px] border border-[var(--event-accent)]/50 transition-colors group-hover:border-[var(--event-accent)]" />
      <div className="pointer-events-none absolute left-4 top-4 h-5 w-5 border-l-2 border-t-2 border-[var(--event-accent)]" />
      <div className="pointer-events-none absolute right-4 top-4 h-5 w-5 border-r-2 border-t-2 border-[var(--event-accent)]" />
      <div className="pointer-events-none absolute bottom-4 left-4 h-5 w-5 border-b-2 border-l-2 border-[var(--event-accent)]" />
      <div className="pointer-events-none absolute bottom-4 right-4 h-5 w-5 border-b-2 border-r-2 border-[var(--event-accent)]" />

      <div className="relative flex h-full flex-col p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2 border-b border-white/15 pb-3">
          <span className="truncate font-oxanium text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300 sm:text-xs">
            {track?.name || event.trackName}
          </span>
          <span className="flex shrink-0 items-center gap-1.5 border px-2 py-1 font-oxanium text-[9px] font-bold uppercase tracking-widest text-[var(--event-accent)]" style={{ borderColor: `${accent}99`, backgroundColor: `${accent}18` }}>
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--event-accent)] shadow-[0_0_8px_var(--event-accent)]" /> Open
          </span>
        </div>

        <div className="pt-5">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {isFlagship && <span className="font-oxanium text-[9px] font-black uppercase tracking-widest text-[var(--event-accent)]">★ Featured</span>}
            <span className="font-oxanium text-[9px] font-bold uppercase tracking-widest text-slate-300">{event.badgeLevel}</span>
          </div>
          <h3 className="font-space text-3xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-4xl" style={{ textShadow: `0 0 24px ${accent}55` }}>
            {event.name}
          </h3>
          <p className="mt-3 max-w-[34ch] font-space text-xs leading-relaxed text-slate-200 sm:text-sm">{event.shortDesc}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="border px-2.5 py-1 font-oxanium text-[9px] font-bold uppercase tracking-wider text-[var(--event-accent)]" style={{ borderColor: `${accent}99`, backgroundColor: "rgba(2,8,13,.62)" }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex-1" />

        <div className="grid grid-cols-2 gap-x-3 gap-y-3 border-t border-white/20 py-4 font-space text-[10px] text-slate-100 sm:text-xs">
          <div><span className="block font-oxanium text-[9px] uppercase tracking-widest text-[var(--event-accent)]">Date & time</span><span className="mt-1 block">{event.date} · {event.time}</span></div>
          <div><span className="block font-oxanium text-[9px] uppercase tracking-widest text-[var(--event-accent)]">Team</span><span className="mt-1 block">{event.team}</span></div>
          <div className="truncate"><span className="block font-oxanium text-[9px] uppercase tracking-widest text-[var(--event-accent)]">Location</span><span className="mt-1 block truncate">{event.venue}</span></div>
          <div><span className="block font-oxanium text-[9px] uppercase tracking-widest text-[var(--event-accent)]">Entry</span><span className="mt-1 block">{event.price}</span></div>
        </div>

        <div className="mb-3 flex items-center justify-between border bg-black/50 px-3 py-2.5" style={{ borderColor: `${accent}99` }}>
          <span className="font-oxanium text-xs font-bold uppercase tracking-wider text-slate-200">Prize pool</span>
          <span className="font-oxanium text-lg font-black tracking-wide" style={{ color: accent, textShadow: `0 0 12px ${accent}66` }}>{event.prize}</span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          <Link href={`/events/${event.id}`} className="col-span-2 flex h-11 items-center justify-center border border-white/35 bg-black/55 font-oxanium text-[10px] font-extrabold uppercase tracking-wider text-white transition hover:border-[var(--event-accent)] hover:text-[var(--event-accent)]">
            Explore
          </Link>
          <Link href={`/events/${event.id}/register`} className="col-span-3 flex h-11 items-center justify-center font-oxanium text-xs font-black uppercase tracking-widest text-[#07090b] transition hover:brightness-110" style={{ backgroundColor: accent, boxShadow: `0 0 20px ${accent}55` }}>
            Register <span className="ml-2" aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
