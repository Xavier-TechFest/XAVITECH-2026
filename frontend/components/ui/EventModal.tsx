"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { EventItem, formatDeadlineIST } from "@/lib/eventsData";
import { useEventRegistrationStatus } from "@/lib/hooks/useEventRegistrationStatus";
import Link from "next/link";
import EventExploreSections from "@/components/sections/EventExploreSections";
import {
  X,
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Users,
  CreditCard,
  AlertCircle,
  Sparkles,
  ShieldAlert,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

interface EventModalProps {
  event: EventItem | null;
  onClose: () => void;
}

export default function EventModal({ event, onClose }: EventModalProps) {
  const [mounted, setMounted] = useState(false);
  const { status, eventData } = useEventRegistrationStatus(event?.id || "");
  const isPastLive = eventData?.registrationEndAt
    ? Date.now() > new Date(eventData.registrationEndAt).getTime()
    : false;
  const effectiveStatus = status !== null
    ? (isPastLive ? "CLOSED" : status)
    : (event?.registrationConfig ? "OPEN" : "TBA");
  const isAvailable = effectiveStatus === "OPEN";
  const displayDeadline = formatDeadlineIST(eventData?.registrationEndAt, event?.registrationConfig?.deadline ?? "TBA");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (event) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow || "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [event, onClose]);

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {event && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3.5 sm:p-6 md:p-8 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] overflow-y-auto overscroll-contain"
          role="dialog"
          aria-modal="true"
          aria-labelledby="event-modal-title"
        >
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-bg/85 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal Window Shell (Non-scrolling outer card with overflow-hidden) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 m-auto flex flex-col w-full max-w-3xl max-h-[calc(100dvh-3rem)] sm:max-h-[calc(100dvh-4.5rem)] md:max-h-[calc(100dvh-5.5rem)] rounded-2xl sm:rounded-3xl border border-line bg-surface shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden"
          >
            {/* Subtle glowing ambient accent at top */}
            <div
              className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full blur-3xl opacity-20"
              style={{ backgroundColor: event.accentColor }}
            />

            {/* Persistent Top-Right Close Button - pinned above all scrollable content */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close event details"
              title="Close event details (Esc)"
              className="absolute right-3.5 top-3.5 sm:right-5 sm:top-5 z-30 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-line/80 bg-surface-raised/95 text-slate-300 backdrop-blur-md shadow-lg transition-all duration-200 hover:border-circuit hover:text-circuit hover:bg-circuit/10 hover:shadow-[0_0_15px_rgba(53,224,201,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-circuit focus-visible:ring-offset-2 focus-visible:ring-offset-surface active:scale-95"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
              <span className="sr-only">Close event details</span>
            </button>

            {/* Scrollable Modal Content Container */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-8 md:p-10 [scrollbar-width:thin] [scrollbar-color:rgba(53,224,201,0.25)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-circuit/25 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-circuit/40">
              {/* Track & Badge Header - right padding ensures clearance for persistent close button */}
              <div className="flex flex-wrap items-center gap-2.5 pr-12 sm:pr-14">
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
              <h2
                id="event-modal-title"
                className="mt-3.5 pr-12 sm:pr-14 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl"
              >
                {event.name}
              </h2>

              <p className="mt-1 font-oxanium text-xs sm:text-sm font-semibold uppercase tracking-wider text-circuit">
                {event.shortDesc}
              </p>

              <p className="mt-3 font-space text-sm text-slate-300 leading-relaxed sm:text-base">
                {event.fullDesc}
              </p>

              {/* Key Metadata Grid */}
              <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 rounded-2xl border border-line bg-surface-raised/70 p-3.5 sm:p-4 font-oxanium text-xs">
                <div className="rounded-xl border border-line/60 bg-bg/50 p-2.5 sm:p-3">
                  <div className="flex items-center gap-1.5 text-muted text-[10px] uppercase tracking-wider">
                    <Calendar className="h-3 w-3 text-circuit" />
                    <span>Date</span>
                  </div>
                  <span className="mt-1 block font-semibold text-white">{event.date}</span>
                </div>

                <div className="rounded-xl border border-line/60 bg-bg/50 p-2.5 sm:p-3">
                  <div className="flex items-center gap-1.5 text-muted text-[10px] uppercase tracking-wider">
                    <Clock className="h-3 w-3 text-marigold" />
                    <span>Time</span>
                  </div>
                  <span className="mt-1 block font-semibold text-marigold tabular-nums">{event.time}</span>
                </div>

                <div className="rounded-xl border border-line/60 bg-bg/50 p-2.5 sm:p-3">
                  <div className="flex items-center gap-1.5 text-muted text-[10px] uppercase tracking-wider">
                    <MapPin className="h-3 w-3 text-circuit" />
                    <span>Venue</span>
                  </div>
                  <span className="mt-1 block font-semibold text-circuit truncate" title={event.venue}>
                    {event.venue}
                  </span>
                </div>

                {event.team !== "TBA" && (
                  <div className="rounded-xl border border-line/60 bg-bg/50 p-2.5 sm:p-3">
                    <div className="flex items-center gap-1.5 text-muted text-[10px] uppercase tracking-wider">
                      <Users className="h-3 w-3 text-cyan-400" />
                      <span>{event.id === "innocraft" ? "Team Size" : "Participants"}</span>
                    </div>
                    {event.id === "innocraft" ? (
                      <>
                        <span className="mt-1 block leading-tight text-white">
                          2–4 Participants
                        </span>
                        <span className="mt-1 block font-space text-[10px] leading-tight text-muted sm:text-xs">
                          No penalty for smaller teams
                        </span>
                      </>
                    ) : (
                      <span className="mt-1 block font-semibold text-white">{event.team}</span>
                    )}
                  </div>
                )}

                <div className="rounded-xl border border-line/60 bg-bg/50 p-2.5 sm:p-3">
                  <div className="flex items-center gap-1.5 text-muted text-[10px] uppercase tracking-wider">
                    <CreditCard className="h-3 w-3 text-marigold" />
                    <span>Registration Fee</span>
                  </div>
                  <span className="mt-1 block font-semibold text-white">{event.price}</span>
                </div>

                <div className="rounded-xl border border-line/60 bg-bg/50 p-2.5 sm:p-3">
                  <div className="flex items-center gap-1.5 text-muted text-[10px] uppercase tracking-wider">
                    <AlertCircle className="h-3 w-3 text-circuit" />
                    <span>Deadline</span>
                  </div>
                  <span className="mt-1 block font-semibold text-white truncate">
                    {displayDeadline}
                  </span>
                </div>
              </div>

              {/* Event information */}
              {(event.highlights.length > 0 || event.registrationConfig?.details) && (
                <div className="mt-7">
                  <h3 className="font-oxanium text-xs font-bold uppercase tracking-wider text-circuit flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-circuit" />
                    <span>{event.exploreSections?.length ? "About the Challenge" : "Event Information"}</span>
                  </h3>
                  {event.registrationConfig?.details?.committee && (
                    <p className="mt-3 rounded-xl border border-line/60 bg-surface-raised p-3 font-space text-xs text-white">
                      <strong className="text-circuit font-oxanium uppercase tracking-wider">Committee: </strong>
                      {event.registrationConfig.details.committee}
                    </p>
                  )}
                  {event.registrationConfig?.details?.agenda && (
                    <p className="mt-2 rounded-xl border border-line/60 bg-surface-raised p-3 font-space text-xs text-white">
                      <strong className="text-circuit font-oxanium uppercase tracking-wider">Agenda: </strong>
                      {event.registrationConfig.details.agenda}
                    </p>
                  )}
                  {event.registrationConfig?.details?.duration && (
                    <p className="mt-2 font-space text-xs text-muted">
                      Expected duration: {event.registrationConfig.details.duration}
                    </p>
                  )}
                  {event.registrationConfig?.details?.format && (
                    <p className="mt-2 rounded-xl border border-line/60 bg-surface-raised p-3 font-space text-xs text-white">
                      <strong className="text-circuit font-oxanium uppercase tracking-wider">Format: </strong>
                      {event.registrationConfig.details.format}
                    </p>
                  )}
                  {event.registrationConfig?.details?.game && (
                    <p className="mt-3 font-space text-xs text-white">
                      <strong className="text-marigold font-oxanium uppercase tracking-wider">Game: </strong>
                      {event.registrationConfig.details.game}
                    </p>
                  )}
                  {event.registrationConfig?.details?.maps && (
                    <p className="mt-2 font-space text-xs text-white">
                      <strong className="text-marigold font-oxanium uppercase tracking-wider">Maps: </strong>
                      {event.registrationConfig.details.maps.join(", ")}
                    </p>
                  )}
                  {event.registrationConfig?.details?.note && (
                    <p className="mt-2 rounded-xl border border-line/60 bg-surface-raised p-3 font-space text-xs text-white">
                      <strong className="text-marigold font-oxanium uppercase tracking-wider">Notice: </strong>
                      {event.registrationConfig.details.note}
                    </p>
                  )}
                  {event.highlights.length > 0 && (
                    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                      {event.highlights.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 font-space text-xs text-slate-200 bg-surface-raised p-3 rounded-xl border border-line/60"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-circuit shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {!event.exploreSections?.length && event.eligibility?.length ? (
                <ContentList title="Eligibility" items={event.eligibility} />
              ) : null}
              {!event.exploreSections?.length && event.registrationInfo?.length ? (
                <ContentList title="Registration" items={event.registrationInfo} />
              ) : null}
              {!event.exploreSections?.length && event.requirements?.length ? (
                <ContentList title="Requirements" items={event.requirements} />
              ) : null}
              {event.exploreSections?.length ? <EventExploreSections sections={event.exploreSections} /> : null}

              {event.registrationConfig?.coordinator && (
                <div className="mt-6 border-t border-line pt-5">
                  <h3 className="font-oxanium text-xs font-bold uppercase tracking-wider text-circuit flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-circuit" />
                    <span>Event Coordinators</span>
                  </h3>
                  <Contact
                    name={event.registrationConfig.coordinator.name}
                    role="Event Coordinator"
                    email={event.registrationConfig.coordinator.email}
                    phone={event.registrationConfig.coordinator.phone}
                  />
                  {event.registrationConfig.coordinator.coCoordinator && (
                    <Contact
                      name={event.registrationConfig.coordinator.coCoordinator}
                      role="Co-Coordinator"
                      email={event.registrationConfig.coordinator.coCoordinatorEmail}
                      phone={event.registrationConfig.coordinator.coCoordinatorPhone}
                    />
                  )}
                </div>
              )}

              {/* Protocol & Rules */}
              {!event.exploreSections?.length && event.rules && event.rules.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-oxanium text-xs font-bold uppercase tracking-wider text-marigold flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-marigold" />
                    <span>Rules & Protocol</span>
                  </h3>
                  <ul className="mt-3 space-y-2 font-space text-xs text-slate-300">
                    {event.rules.map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 rounded-lg border border-line/40 bg-surface-raised/40 p-2.5">
                        <span className="font-oxanium text-circuit text-[11px] font-bold shrink-0">
                          [{String(idx + 1).padStart(2, "0")}]
                        </span>
                        <span className="leading-relaxed">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Footer */}
              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-line pt-5">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-line bg-surface-raised px-5 py-2.5 font-oxanium text-xs uppercase tracking-widest text-muted transition-colors hover:border-circuit/60 hover:text-white"
                >
                  Close
                </button>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <Link
                    href={`/events/${event.id}`}
                    onClick={onClose}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-surface-raised px-4 py-2.5 font-oxanium text-xs font-semibold uppercase tracking-wider text-muted hover:text-circuit hover:border-circuit/50 transition-colors"
                  >
                    <span>Full Details</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>

                  {isAvailable ? (
                    <Link
                      href={`/events/${event.id}/register`}
                      onClick={onClose}
                      className="group inline-flex items-center justify-center gap-2 rounded-xl bg-circuit px-6 py-2.5 font-oxanium text-xs font-bold uppercase tracking-wider text-bg transition-transform duration-200 hover:scale-[1.02] hover:bg-circuit/90 shadow-[0_0_20px_rgba(53,224,201,0.25)]"
                    >
                      <span>Register Now</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-800 border border-neutral-700 px-6 py-2.5 font-oxanium text-xs font-bold uppercase tracking-wider text-slate-400 opacity-70 cursor-not-allowed"
                    >
                      <span>
                        {effectiveStatus === "COMING_SOON"
                          ? "Opens Soon"
                          : effectiveStatus === "CLOSED"
                          ? "Registration Closed"
                          : effectiveStatus === "FULL"
                          ? "Registration Full"
                          : "Unavailable"}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

function ContentList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-6">
      <h3 className="font-oxanium text-xs font-bold uppercase tracking-wider text-circuit flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-circuit" />
        <span>{title}</span>
      </h3>
      <ul className="mt-3 space-y-2 font-space text-xs text-slate-300">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 bg-surface-raised p-2.5 rounded-lg border border-line/50">
            <ChevronRight className="h-3.5 w-3.5 text-circuit shrink-0 mt-0.5" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Contact({
  name,
  role,
  email,
  phone,
}: {
  name: string;
  role: string;
  email?: string;
  phone?: string;
}) {
  return (
    <div className="mt-3 rounded-xl border border-line/60 bg-surface-raised p-3.5">
      <div className="flex flex-wrap items-baseline justify-between gap-1">
        <p className="font-space text-sm font-semibold text-white">{name}</p>
        <p className="font-oxanium text-[11px] text-muted tracking-wider uppercase">{role}</p>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 font-oxanium text-xs text-circuit">
        {email && (
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-1.5 hover:underline hover:text-circuit/80 transition-colors"
          >
            <Mail className="h-3.5 w-3.5" />
            <span>{email}</span>
          </a>
        )}
        {phone && (
          <a
            href={`tel:${phone}`}
            className="inline-flex items-center gap-1.5 hover:underline hover:text-circuit/80 transition-colors"
          >
            <Phone className="h-3.5 w-3.5" />
            <span>{phone}</span>
          </a>
        )}
      </div>
    </div>
  );
}
