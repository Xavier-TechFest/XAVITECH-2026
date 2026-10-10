"use client";

import Link from "next/link";
import { ArrowRight, Calendar, Download, MapPin, Users, ChevronLeft } from "lucide-react";
import { EventExploreSection, EventItem, TRACKS } from "@/lib/eventsData";
import { cropStyle, useImageCrop } from "@/components/ui/ImageCropEditor";
import EventExploreSections from "@/components/sections/EventExploreSections";
import { useEventRegistrationStatus } from "@/lib/hooks/useEventRegistrationStatus";

export default function EventDetailView({ event }: { event: EventItem }) {
  const track = TRACKS.find((item) => item.id === event.trackId);
  const config = event.registrationConfig;
  const imageCrop = useImageCrop(event, "detail");
  const { status, eventData } = useEventRegistrationStatus(event.id);
  const effectiveStatus = status || (config ? "OPEN" : "TBA");

  const isAvailable = effectiveStatus === "OPEN";
  let buttonLabel = "REGISTER NOW";
  if (effectiveStatus === "COMING_SOON") {
    buttonLabel = "REGISTRATION OPENS SOON";
  } else if (effectiveStatus === "CLOSED") {
    buttonLabel = "REGISTRATION CLOSED";
  } else if (effectiveStatus === "FULL") {
    buttonLabel = "REGISTRATION FULL";
  } else if (effectiveStatus === "DISABLED") {
    buttonLabel = "REGISTRATION UNAVAILABLE";
  }

  const facts = [
    { label: "Date", value: event.date },
    { label: "Venue", value: event.venue },
    ...(event.team !== "TBA" ? [{ label: "Participants", value: event.team }] : []),
    { label: "Registration Fee", value: event.price },
    { label: "Registration Deadline", value: config?.deadline ?? "TBA" },
    ...(eventData?.capacity !== null && eventData?.capacity !== undefined
      ? [{ label: "Capacity", value: `${eventData.registeredCount} / ${eventData.capacity} (${eventData.remainingCapacity} remaining)` }]
      : []),
  ];
  const exploreSections = buildEventExploreSections(event, effectiveStatus === "CLOSED");
  const downloadBrochure = () => {
    const guideContent = event.exploreSections?.length
      ? event.exploreSections.flatMap((section) => [section.title, ...section.items.map((item) => `• ${item}`)])
      : [...(event.eligibility ?? []), ...(event.highlights ?? []), ...(event.registrationInfo ?? []), ...(event.requirements ?? []), ...(event.rules ?? [])].map((item) => `• ${item}`);
    const text = [`XAVITECH 2026 — ${event.name}`, `Category: ${track?.name ?? event.trackName}`, ...facts.map((fact) => `${fact.label}: ${fact.value}`), "", event.fullDesc, ...guideContent].join("\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${event.id}-xavitech-2026.txt`; anchor.click(); URL.revokeObjectURL(url);
  };
  return <main className="relative mx-auto min-h-screen max-w-[1360px] px-5 pb-32 pt-28 sm:px-8">
    <Link href="/events" className="mb-8 inline-flex items-center gap-2 font-oxanium text-xs uppercase tracking-widest text-slate-400 hover:text-cyan-300"><ChevronLeft size={16} />All events</Link>
    <div className="grid gap-8 lg:grid-cols-[1.1fr_480px] xl:gap-12">
      <section>
        <p className="mb-4 font-oxanium text-xs font-bold uppercase tracking-[.2em] text-cyan-300">{event.badge} <span className="px-2 text-slate-600">/</span> XAVITECH 2026</p>
        <h1 className="font-space text-4xl font-black uppercase leading-tight tracking-tight text-white sm:text-6xl">{event.name}</h1>
        <p className="mt-2 font-oxanium text-base font-bold uppercase tracking-wider text-cyan-200">{event.shortDesc}</p>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-300">{event.fullDesc}</p>
        <div className="mt-8">
          <EventExploreSections sections={exploreSections} />
        </div>
        {config?.coordinator && <section className="mt-10 rounded border border-white/10 bg-white/[.03] p-5">
          <h2 className="font-space font-bold text-white">Event Contact</h2>
          <Contact name={config.coordinator.name} role="Event Coordinator" email={config.coordinator.email} phone={config.coordinator.phone} />
          {config.coordinator.coCoordinator && <Contact name={config.coordinator.coCoordinator} role="Event Coordinator" />}
        </section>}
      </section>
      <aside className="w-full lg:sticky lg:top-24 lg:self-start">
        <div className="relative isolate min-h-[680px] w-full overflow-hidden border border-white/15 bg-[#040810] shadow-[0_18px_70px_rgba(0,0,0,.55)] sm:min-h-[800px] lg:h-[calc(100vh-7.5rem)] lg:min-h-[700px] lg:max-h-[950px]" style={{ borderColor: `${event.accentColor}88` }}>
          <img
            src={event.image}
            alt={`${event.name} event poster`}
            className="absolute inset-0 -z-30 h-full w-full object-cover opacity-85 transition-transform duration-500"
            style={cropStyle(imageCrop)} />
          <div className="absolute inset-0 -z-20" style={{ background: "linear-gradient(180deg, rgba(2,6,10,.35) 0%, rgba(2,6,10,.25) 35%, rgba(2,6,10,.82) 65%, rgba(2,6,10,.98) 100%)" }} />
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-[.14]" style={{ backgroundImage: `linear-gradient(${event.accentColor} 1px, transparent 1px), linear-gradient(to right, ${event.accentColor} 1px, transparent 1px)`, backgroundSize: "30px 30px" }} />
          <div className="relative flex min-h-[680px] flex-col p-5 sm:min-h-[800px] sm:p-7 lg:h-full lg:min-h-0 lg:justify-between">
            <div className="flex items-center justify-between gap-3 border-b border-white/20 pb-4">
              <span className="font-oxanium text-xs font-bold uppercase tracking-[.15em] text-white/85">{event.badge}</span>
              <span
                className="flex items-center gap-2 border px-3 py-1.5 font-oxanium text-[10px] font-bold uppercase tracking-widest"
                style={{
                  color: effectiveStatus === "CLOSED" ? "#fb7185" : effectiveStatus === "FULL" ? "#f59e0b" : effectiveStatus === "DISABLED" ? "#94a3b8" : event.accentColor,
                  borderColor: effectiveStatus === "CLOSED" ? "#fb7185bb" : effectiveStatus === "FULL" ? "#f59e0bbb" : effectiveStatus === "DISABLED" ? "#94a3b8bb" : `${event.accentColor}bb`,
                  backgroundColor: "rgba(2,8,13,.7)",
                }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: effectiveStatus === "CLOSED" ? "#fb7185" : effectiveStatus === "FULL" ? "#f59e0b" : effectiveStatus === "DISABLED" ? "#94a3b8" : event.accentColor,
                    boxShadow: `0 0 10px ${effectiveStatus === "CLOSED" ? "#fb7185" : effectiveStatus === "FULL" ? "#f59e0b" : effectiveStatus === "DISABLED" ? "#94a3b8" : event.accentColor}`,
                  }}
                />
                {effectiveStatus}
              </span>
            </div>
            <div className="mt-auto pt-52 sm:pt-64 lg:pt-0">
              {event.id !== "innocraft" && <div className="mb-5 flex items-end justify-between gap-4 border-b border-white/20 pb-5">
                <div><span className="mb-1 block font-oxanium text-xs font-bold uppercase tracking-[.18em]" style={{ color: event.accentColor }}>EXCITING GIFTS &amp; PRIZES</span><span className="font-space text-4xl font-black text-white sm:text-5xl" style={{ textShadow: `0 0 20px ${event.accentColor}88` }}>Exciting Gifts &amp; Prizes</span><p className="mt-2 max-w-sm text-xs leading-relaxed text-white/70">Prizes may vary depending on the number of registrations for this event.</p></div>
                <span className="mb-1 font-oxanium text-[10px] font-bold uppercase tracking-widest text-white/70">{event.name}</span>
              </div>}
              <div className="mb-5 grid grid-cols-2 gap-x-4 gap-y-4 border border-white/15 bg-[#03080d]/85 p-4 backdrop-blur-sm">
                <CardFact icon={<Calendar size={14} />} label="DATE" value={event.date} accent={event.accentColor} />
                <CardFact icon={<MapPin size={14} />} label="VENUE" value={event.venue} accent={event.accentColor} />
                {event.team !== "TBA" && <CardFact icon={<Users size={14} />} label="PARTICIPANTS" value={event.team} accent={event.accentColor} />}
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {isAvailable ? (
                  <Link
                    href={`/events/${event.id}/register`}
                    className="flex min-h-14 items-center justify-center gap-2 px-3 py-3 font-oxanium text-xs font-black uppercase tracking-wider text-[#08090b] transition hover:brightness-110"
                    style={{ backgroundColor: event.accentColor, boxShadow: `0 0 22px ${event.accentColor}55` }}
                  >
                    {buttonLabel} <ArrowRight size={17} />
                  </Link>
                ) : (
                  <button
                    disabled
                    className="flex min-h-14 items-center justify-center gap-2 px-3 py-3 font-oxanium text-xs font-black uppercase tracking-wider text-slate-400 bg-neutral-900 border border-neutral-700 opacity-70 cursor-not-allowed"
                  >
                    {buttonLabel}
                  </button>
                )}
                <button onClick={downloadBrochure} className="flex min-h-14 items-center justify-center gap-2 border border-white/40 bg-[#03080d]/75 px-3 py-3 font-oxanium text-[10px] font-bold uppercase tracking-wide text-white transition hover:border-white/80 hover:bg-[#03080d]/95"><Download size={16} />DOWNLOAD BROCHURE</button>
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute left-4 top-4 h-6 w-6 border-l-2 border-t-2" style={{ borderColor: event.accentColor }} /><div className="pointer-events-none absolute bottom-4 right-4 h-6 w-6 border-b-2 border-r-2" style={{ borderColor: event.accentColor }} />
        </div>
      </aside>
    </div>
    {isAvailable ? (
      <Link href={`/events/${event.id}/register`} className="fixed bottom-0 left-0 z-40 flex w-full items-center justify-center gap-2 border-t border-white/10 bg-[#03080e]/95 p-4 font-oxanium text-sm font-bold uppercase tracking-widest text-cyan-200 backdrop-blur lg:hidden">
        {buttonLabel} <ArrowRight size={16} />
      </Link>
    ) : (
      <div className="fixed bottom-0 left-0 z-40 flex w-full items-center justify-center gap-2 border-t border-white/10 bg-[#03080e]/95 p-4 font-oxanium text-sm font-bold uppercase tracking-widest text-slate-400 opacity-80 backdrop-blur lg:hidden">
        {buttonLabel}
      </div>
    )}
  </main>;
}


function buildEventExploreSections(event: EventItem, registrationClosed: boolean): EventExploreSection[] {
  const sections = [...(event.exploreSections ?? [])];
  const alreadyCovered = (pattern: RegExp) => sections.some((section) => pattern.test(section.title));
  const addSection = (title: string, items: Array<string | undefined>) => {
    const cleanedItems = items.map((item) => item?.trim()).filter((item): item is string => Boolean(item));
    if (cleanedItems.length) sections.push({ title, items: cleanedItems });
  };
  const details = event.registrationConfig?.details;
  const feeItems = [
    event.price ? `Registration fee: ${event.price}.` : undefined,
    ...(event.registrationConfig?.policy?.poolOptions ?? []).map((pool) => `${pool.label}: ${pool.feeDisplay}.`),
    ...(event.registrationInfo ?? []),
    event.registrationConfig?.deadline ? `Registration deadline: ${event.registrationConfig.deadline}.` : undefined,
  ];
  const eventDetails = [
    details?.committee ? `Committee: ${details.committee}` : undefined,
    details?.agenda ? `Agenda: ${details.agenda}` : undefined,
    details?.duration ? `Expected duration: ${details.duration}` : undefined,
    details?.format ? `Format: ${details.format}` : undefined,
    details?.game ? `Game: ${details.game}` : undefined,
    details?.maps?.length ? `Maps: ${details.maps.join(", ")}` : undefined,
    details?.note,
  ];

  if (!alreadyCovered(/eligib|who can participate/i)) addSection("Eligibility", event.eligibility ?? []);
  addSection("Event highlights", event.highlights ?? []);
  if (!alreadyCovered(/registration|register|fee|payment/i) || !sections.some((section) => /registration|register|fee|payment/i.test(section.title) && section.items.some((item) => item.includes("₹")))) {
    addSection("Registration & fees", feeItems);
  }
  if (!alreadyCovered(/requirements|documents|what.*bring/i)) addSection("Requirements", event.requirements ?? []);
  if (!alreadyCovered(/rules|regulations|guidelines/i)) addSection("Rules & regulations", event.rules ?? []);
  if (!alreadyCovered(/disqualif|elimination|penalt/i)) addSection("Elimination & disqualification", event.disqualificationCriteria ?? []);
  addSection("Event details", eventDetails);
  if (registrationClosed && event.id === "innocraft" && details?.schedule?.length) {
    addSection("Detailed day schedule", details.schedule.map((item) => `${item.time} — ${item.activity}`));
  }
  return sections;
}

function Contact({ name, role, email, phone }: { name: string; role: string; email?: string; phone?: string }) { return <div className="mt-4 border-t border-white/10 pt-4 first:border-0 first:pt-2"><p className="font-semibold text-white">{name}</p><p className="mt-0.5 text-sm text-slate-400">{role}</p><div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-cyan-300">{email && <a href={`mailto:${email}`}>Email: {email}</a>}{phone?.split("/").map((number) => { const cleanNumber = number.trim(); return <a key={cleanNumber} href={`tel:${cleanNumber}`}>Phone: {cleanNumber}</a>; })}</div></div>; }
function CardFact({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) { return <div className="min-w-0"><span className="flex items-center gap-2 font-oxanium text-[10px] font-bold uppercase tracking-widest text-white/60" style={{ color: `${accent}cc` }}>{icon}{label}</span><span className="mt-1 block break-words font-mono text-xs leading-relaxed text-white sm:text-sm">{value}</span></div>; }
