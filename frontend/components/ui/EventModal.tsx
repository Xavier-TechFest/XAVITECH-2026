// "use client";

// import { useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { EventItem } from "@/lib/eventsData";
// import Link from "next/link";

// interface EventModalProps {
//   event: EventItem | null;
//   onClose: () => void;
// }

// export default function EventModal({ event, onClose }: EventModalProps) {
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//     };
//     if (event) {
//       document.body.style.overflow = "hidden";
//       window.addEventListener("keydown", handleKeyDown);
//     }
//     return () => {
//       document.body.style.overflow = "unset";
//       window.removeEventListener("keydown", handleKeyDown);
//     };
//   }, [event, onClose]);

//   if (!event) return null;

//   return (
//     <AnimatePresence>
//       <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
//         {/* Backdrop overlay */}
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//           onClick={onClose}
//           className="fixed inset-0 bg-black/80 backdrop-blur-md"
//         />

//         {/* Modal Window */}
//         <motion.div
//           initial={{ opacity: 0, scale: 0.92, y: 20 }}
//           animate={{ opacity: 1, scale: 1, y: 0 }}
//           exit={{ opacity: 0, scale: 0.95, y: 10 }}
//           transition={{ type: "spring", stiffness: 300, damping: 30 }}
//           className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-line/70 bg-[#0c101c]/95 p-6 shadow-[0_0_50px_rgba(53,224,201,0.2)] sm:p-8 md:p-10"
//           style={{ borderColor: event.borderColor }}
//         >
//           {/* Top glowing ambient light */}
//           <div
//             className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full blur-3xl opacity-30"
//             style={{ backgroundColor: event.accentColor }}
//           />

//           {/* Close button */}
//           <button
//             type="button"
//             onClick={onClose}
//             aria-label="Close modal"
//             className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-line/60 bg-surface/80 text-muted transition-colors hover:border-circuit hover:text-ink"
//           >
//             ✕
//           </button>

//           {/* Track & Badge Header */}
//           <div className="flex flex-wrap items-center gap-3">
//             <span
//               className="rounded-full px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider border"
//               style={{
//                 borderColor: event.borderColor,
//                 color: event.accentColor,
//                 backgroundColor: `${event.accentColor}15`,
//               }}
//             >
//               {event.badgeLevel}
//             </span>
//             <span className="font-mono text-xs text-muted tracking-widest uppercase">
//               // {event.trackName}
//             </span>
//           </div>

//           {/* Event Title */}
//           <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl md:text-4xl">
//             {event.fullTitle || event.name}
//           </h2>

//           <p className="mt-3 text-base text-muted/90 sm:text-lg leading-relaxed">
//             {event.fullDesc}
//           </p>

//           {/* Key Quick Metadata Grid */}
//           <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-2xl border border-line/60 bg-surface/50 p-4 font-mono text-xs">
//             <div>
//               <span className="text-muted block text-[10px] uppercase tracking-wider">Date & Time</span>
//               <span className="mt-1 block font-semibold text-ink">{event.date}</span>
//               <span className="text-[11px] text-circuit">{event.time}</span>
//             </div>
//             <div>
//               <span className="text-muted block text-[10px] uppercase tracking-wider">Prize Pool</span>
//               <span className="mt-1 block font-semibold text-marigold text-sm">{event.prize}</span>
//             </div>
//             <div>
//               <span className="text-muted block text-[10px] uppercase tracking-wider">Team Size</span>
//               <span className="mt-1 block font-semibold text-ink">{event.team}</span>
//             </div>
//             <div>
//               <span className="text-muted block text-[10px] uppercase tracking-wider">Venue</span>
//               <span className="mt-1 block font-semibold text-ink truncate">{event.venue}</span>
//             </div>
//           </div>

//           {/* Highlights */}
//           {event.highlights && event.highlights.length > 0 && (
//             <div className="mt-8">
//               <h3 className="font-display text-sm font-bold uppercase tracking-wider text-circuit flex items-center gap-2">
//                 <span>⚡</span> Arena Highlights
//               </h3>
//               <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
//                 {event.highlights.map((item, idx) => (
//                   <li key={idx} className="flex items-start gap-2 text-xs text-ink/90 bg-surface/40 p-2.5 rounded-xl border border-line/40">
//                     <span className="text-circuit font-mono font-bold">›</span>
//                     <span>{item}</span>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}

//           {/* Rules */}
//           {event.rules && event.rules.length > 0 && (
//             <div className="mt-6">
//               <h3 className="font-display text-sm font-bold uppercase tracking-wider text-marigold flex items-center gap-2">
//                 <span>📋</span> Protocol & Rules
//               </h3>
//               <ul className="mt-3 space-y-2 text-xs text-muted/90">
//                 {event.rules.map((rule, idx) => (
//                   <li key={idx} className="flex items-start gap-2.5">
//                     <span className="font-mono text-circuit text-[11px] font-bold">[{idx + 1}]</span>
//                     <span>{rule}</span>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}

//           {/* Action Footer */}
//           <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-line/60 pt-6">
//             <button
//               type="button"
//               onClick={onClose}
//               className="rounded-xl border border-line/60 px-5 py-3 font-mono text-xs uppercase tracking-widest text-muted hover:border-line hover:text-ink"
//             >
//               Close Info
//             </button>

//             <Link
//               href={`/events/${event.id}/register`}
//               onClick={onClose}
//               className="group inline-flex items-center justify-center gap-2 rounded-xl bg-circuit px-7 py-3 font-mono text-xs font-bold uppercase tracking-wider text-bg transition-transform duration-200 hover:scale-[1.02] hover:bg-circuit/90 shadow-[0_0_20px_rgba(53,224,201,0.4)]"
//             >
//               <span>Register Now for this Event</span>
//               <span className="transition-transform group-hover:translate-x-1">→</span>
//             </Link>
//           </div>
//         </motion.div>
//       </div>
//     </AnimatePresence>
//   );
// }


"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EventItem } from "@/lib/eventsData";
import Link from "next/link";

interface EventModalProps {
  event: EventItem | null;
  onClose: () => void;
}

export default function EventModal({ event, onClose }: EventModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (event) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [event, onClose]);

  if (!event) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-6 lg:p-8">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-bg/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-line bg-surface p-5 shadow-[0_0_50px_rgba(0,0,0,0.8)] sm:p-8 md:p-10"
        >
          {/* Subtle glowing ambient accent at top */}
          <div
            className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: event.accentColor }}
          />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface-raised text-muted transition-colors hover:border-circuit hover:text-ink active:scale-95"
          >
            ✕
          </button>

          {/* Track & Badge Header */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className="rounded-full px-3 py-1 font-oxanium text-xs font-semibold uppercase tracking-wider border bg-surface-raised"
              style={{
                borderColor: `${event.accentColor}50`,
                color: event.accentColor,
              }}
            >
              {event.badgeLevel}
            </span>
            <span className="font-oxanium text-xs text-muted tracking-widest uppercase">
              // {event.trackName}
            </span>
          </div>

          {/* Event Title */}
          <h2 className="mt-3.5 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl md:text-4xl">
            {event.fullTitle || event.name}
          </h2>

          <p className="mt-3 font-space text-sm text-muted leading-relaxed sm:text-base">
            {event.fullDesc}
          </p>

          {/* Key Metadata Grid */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-2xl border border-line bg-surface-raised p-4 font-oxanium text-xs">
            <div>
              <span className="text-muted block text-[10px] uppercase tracking-wider">Date & Time</span>
              <span className="mt-1 block font-semibold text-ink">{event.date}</span>
              <span className="text-[11px] text-circuit">{event.time}</span>
            </div>
            <div>
              <span className="text-muted block text-[10px] uppercase tracking-wider">Prize Pool</span>
              <span className="mt-1 block font-extrabold text-marigold text-sm">{event.prize}</span>
            </div>
            <div>
              <span className="text-muted block text-[10px] uppercase tracking-wider">Team Size</span>
              <span className="mt-1 block font-semibold text-ink">{event.team}</span>
            </div>
            <div>
              <span className="text-muted block text-[10px] uppercase tracking-wider">Venue</span>
              <span className="mt-1 block font-semibold text-ink truncate">{event.venue}</span>
            </div>
          </div>

          {/* Highlights */}
          {event.highlights && event.highlights.length > 0 && (
            <div className="mt-7">
              <h3 className="font-oxanium text-xs font-bold uppercase tracking-wider text-circuit flex items-center gap-2">
                <svg className="h-4 w-4 text-circuit" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Arena Highlights
              </h3>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {event.highlights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 font-space text-xs text-ink bg-surface-raised p-3 rounded-xl border border-line/60">
                    <span className="text-circuit font-oxanium font-bold">›</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Protocol & Rules */}
          {event.rules && event.rules.length > 0 && (
            <div className="mt-6">
              <h3 className="font-oxanium text-xs font-bold uppercase tracking-wider text-marigold flex items-center gap-2">
                <svg className="h-4 w-4 text-marigold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Protocol & Rules
              </h3>
              <ul className="mt-3 space-y-2 font-space text-xs text-muted">
                {event.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="font-oxanium text-circuit text-[11px] font-bold">[{idx + 1}]</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Footer */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-line pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-line bg-surface-raised px-5 py-2.5 font-oxanium text-xs uppercase tracking-widest text-muted transition-colors hover:border-circuit/60 hover:text-ink"
            >
              Close
            </button>

            <Link
              href={`/events/${event.id}/register`}
              onClick={onClose}
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-circuit px-7 py-3 font-oxanium text-xs font-bold uppercase tracking-wider text-bg transition-transform duration-200 hover:scale-[1.02] hover:bg-circuit/90 shadow-[0_0_20px_rgba(53,224,201,0.3)]"
            >
              <span>Register for this Event</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
