import type { Metadata } from "next";
import Link from "next/link";
import { EVENTS } from "@/lib/eventsData";
import StubPage from "@/components/ui/StubPage";

export const metadata: Metadata = { title: "Event Registration — XAVITECH 2026" };

export default function RegistrationPage() {
  return <StubPage eyebrowN="00" title="Event registration">
    <p>Choose an event to see its registration requirements. Requirements marked TBA will be updated when organisers confirm the details.</p>
    <div className="mt-8 grid gap-3 sm:grid-cols-2">
      {EVENTS.map((event) => <Link key={event.id} href={`/events/${event.id}/register`} className="group flex items-center justify-between gap-4 border border-white/10 bg-white/[.03] p-4 transition hover:border-cyan-300/50">
        <span><span className="block font-oxanium text-xs uppercase tracking-widest text-cyan-300">{event.trackName}</span><span className="mt-1 block font-space text-lg font-bold text-white">{event.name}</span></span>
        <span className="shrink-0 text-xs text-slate-400 group-hover:text-white">{event.registrationConfig ? "View form →" : "Details TBA →"}</span>
      </Link>)}
    </div>
  </StubPage>;
}
