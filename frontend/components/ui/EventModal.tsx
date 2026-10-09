"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EventItem } from "@/lib/eventsData";
import Link from "next/link";
import EventExploreSections from "@/components/sections/EventExploreSections";

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
              {event.badge}
            </span>
            <span className="font-oxanium text-xs text-muted tracking-widest uppercase">
              // {event.trackName}
            </span>
          </div>

          {/* Event Title */}
          <h2 className="mt-3.5 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl md:text-4xl">
            {event.name}
          </h2>

          <p className="mt-1 font-oxanium text-sm font-semibold uppercase tracking-wider text-circuit">{event.shortDesc}</p>

          <p className="mt-3 font-space text-sm text-muted leading-relaxed sm:text-base">
            {event.fullDesc}
          </p>

          {/* Key Metadata Grid */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 rounded-2xl border border-line bg-surface-raised p-4 font-oxanium text-xs">
            <div>
              <span className="text-muted block text-[10px] uppercase tracking-wider">Date & Time</span>
              <span className="mt-1 block font-semibold text-ink">{event.date}</span>
              <span className="text-[11px] text-circuit">{event.time}</span>
            </div>
            <div>
              <span className="text-muted block text-[10px] uppercase tracking-wider">Exciting Gifts &amp; Prizes</span>
              <span className="mt-1 block font-extrabold text-marigold text-sm">Exciting Gifts &amp; Prizes</span>
            </div>
            {event.team !== "TBA" && <div>
              <span className="text-muted block text-[10px] uppercase tracking-wider">Participants</span>
              <span className="mt-1 block font-semibold text-ink">{event.team}</span>
            </div>}
            <div>
              <span className="text-muted block text-[10px] uppercase tracking-wider">Venue</span>
              <span className="mt-1 block font-semibold text-ink truncate">{event.venue}</span>
            </div>
            <div><span className="text-muted block text-[10px] uppercase tracking-wider">Registration Fee</span><span className="mt-1 block font-semibold text-ink">{event.price}</span></div>
            <div><span className="text-muted block text-[10px] uppercase tracking-wider">Registration Deadline</span><span className="mt-1 block font-semibold text-ink">{event.registrationConfig?.deadline ?? "TBA"}</span></div>
          </div>

          {/* Event information */}
          {(event.highlights.length > 0 || event.registrationConfig?.details) && (
            <div className="mt-7">
              <h3 className="font-oxanium text-xs font-bold uppercase tracking-wider text-circuit flex items-center gap-2">
                <svg className="h-4 w-4 text-circuit" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {event.exploreSections?.length ? "About the challenge" : "Event Information"}
              </h3>
              {event.registrationConfig?.details?.committee && <p className="mt-3 rounded-xl border border-line/60 bg-surface-raised p-3 font-space text-xs text-ink"><strong>Committee: </strong>{event.registrationConfig.details.committee}</p>}
              {event.registrationConfig?.details?.agenda && <p className="mt-2 rounded-xl border border-line/60 bg-surface-raised p-3 font-space text-xs text-ink"><strong>Agenda: </strong>{event.registrationConfig.details.agenda}</p>}
              {event.registrationConfig?.details?.duration && <p className="mt-2 font-space text-xs text-muted">Expected duration: {event.registrationConfig.details.duration}</p>}
              {event.registrationConfig?.details?.game && <p className="mt-3 font-space text-xs text-ink">Game: {event.registrationConfig.details.game}</p>}
              {event.registrationConfig?.details?.maps && <p className="mt-2 font-space text-xs text-ink">Maps: {event.registrationConfig.details.maps.join(", ")}</p>}
              {event.highlights.length > 0 && <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {event.highlights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 font-space text-xs text-ink bg-surface-raised p-3 rounded-xl border border-line/60">
                    <span className="text-circuit font-oxanium font-bold">›</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>}
            </div>
          )}

          {!event.exploreSections?.length && event.eligibility?.length ? <ContentList title="Eligibility" items={event.eligibility} /> : null}
          {!event.exploreSections?.length && event.registrationInfo?.length ? <ContentList title="Registration" items={event.registrationInfo} /> : null}
          {!event.exploreSections?.length && event.requirements?.length ? <ContentList title="Requirements" items={event.requirements} /> : null}
          {event.exploreSections?.length ? <EventExploreSections sections={event.exploreSections} /> : null}

          {event.registrationConfig?.coordinator && <div className="mt-6 border-t border-line pt-5"><h3 className="font-oxanium text-xs font-bold uppercase tracking-wider text-circuit">Event Contact</h3><Contact name={event.registrationConfig.coordinator.name} role="Event Coordinator" email={event.registrationConfig.coordinator.email} phone={event.registrationConfig.coordinator.phone}/>{event.registrationConfig.coordinator.coCoordinator && <Contact name={event.registrationConfig.coordinator.coCoordinator} role="Event Coordinator"/>}</div>}

          {/* Protocol & Rules */}
          {!event.exploreSections?.length && event.rules && event.rules.length > 0 && (
            <div className="mt-6">
              <h3 className="font-oxanium text-xs font-bold uppercase tracking-wider text-marigold flex items-center gap-2">
                <svg className="h-4 w-4 text-marigold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Rules
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
              <span>Registration</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function ContentList({ title, items }: { title: string; items: string[] }) {
  return <div className="mt-6"><h3 className="font-oxanium text-xs font-bold uppercase tracking-wider text-circuit">{title}</h3><ul className="mt-3 space-y-2 font-space text-xs text-muted">{items.map((item) => <li key={item} className="flex items-start gap-2"><span className="text-circuit">›</span><span>{item}</span></li>)}</ul></div>;
}
function Contact({ name, role, email, phone }: { name: string; role: string; email?: string; phone?: string }) {
  return <div className="mt-3"><p className="font-space text-sm font-semibold text-ink">{name}</p><p className="text-xs text-muted">{role}</p><div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-circuit">{email && <a href={`mailto:${email}`}>Email: {email}</a>}{phone && <a href={`tel:${phone}`}>Phone: {phone}</a>}</div></div>;
}
