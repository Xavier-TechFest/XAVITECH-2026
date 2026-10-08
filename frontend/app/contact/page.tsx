import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StaticSky from "@/components/effects/StaticSky";
import Eyebrow from "@/components/ui/Eyebrow";
import PersonCard from "@/components/sections/contact/PersonCard";
import { patron, convenor, overallCoordinators, tracks, webTeam } from "@/components/sections/contact/data";

const eventCount = tracks.reduce((n, t) => n + t.events.length + (t.eventName ? 1 : 0), 0);
const peopleCount =
  2 + overallCoordinators.length + tracks.reduce((n, t) => n + t.leads.length + t.events.reduce((m, e) => m + e.leads.length, 0), 0);
const STATS: [string, string][] = [
  [String(peopleCount), "Organisers"],
  [String(tracks.length), "Tracks"],
  [String(eventCount), "Events"],
];

export const metadata: Metadata = {
  title: "Committee & Contact",
  description: "The people organising XAVITECH 2026 — leadership, coordinators, track and event leads, and the web team.",
};

export default function ContactPage() {
  return (
    <>
      <StaticSky />
      <Navbar />

      <div className="relative z-10">
        <main className="mx-auto max-w-6xl px-5 pb-20 pt-28 sm:px-6 sm:pt-36 lg:pt-40">
          {/* ---------------------------------------------------------- */}
          {/* Header                                                     */}
          {/* ---------------------------------------------------------- */}
          <header className="mx-auto max-w-3xl text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-circuit/80 sm:text-xs">
              // Contact
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold leading-[1.05] text-ink sm:text-6xl">
              The people behind{" "}
              <span className="bg-gradient-to-r from-circuit via-circuit to-marigold bg-clip-text text-transparent">
                XAVITECH 2026
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-prose text-muted sm:text-lg">
              Every track and event has a dedicated team on point. Reach out to whoever's
              closest to what you need — general queries can go to the festival
              email in the footer.
            </p>
            <dl className="mt-8 flex flex-wrap justify-center gap-3 sm:gap-4">
              {STATS.map(([n, label]) => (
                <div
                  key={label}
                  className="min-w-[6.5rem] rounded-xl border border-circuit/25 bg-surface/70 px-4 py-3"
                >
                  <dd className="font-accent text-2xl font-bold text-marigold sm:text-3xl">{n}</dd>
                  <dt className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{label}</dt>
                </div>
              ))}
            </dl>
          </header>

          {/* ---------------------------------------------------------- */}
          {/* 01 — Leadership                                            */}
          {/* ---------------------------------------------------------- */}
          <section className="mt-16 sm:mt-24">
            <Eyebrow n="01" className="justify-center">Leadership</Eyebrow>
            <div className="mt-6 flex flex-wrap justify-center gap-5 sm:mt-8 sm:gap-8">
              <PersonCard person={patron} role="Patron" accent="marigold" />
              <PersonCard person={convenor} role="Convenor" accent="marigold" />
            </div>
          </section>

          {/* ---------------------------------------------------------- */}
          {/* 02 — Overall coordinators                                  */}
          {/* ---------------------------------------------------------- */}
          <section className="mt-14 sm:mt-20">
            <Eyebrow n="02" className="justify-center">Overall Coordinators</Eyebrow>
            <div className="mt-6 flex flex-wrap justify-center gap-5 sm:mt-8 sm:gap-8">
              {overallCoordinators.map((person) => (
                <PersonCard key={person.name} person={person} role="Overall Coordinator" accent="circuit" />
              ))}
            </div>
          </section>

          {/* ---------------------------------------------------------- */}
          {/* 03 — Tracks: track leads, then each event's leads          */}
          {/* ---------------------------------------------------------- */}
          <section className="mt-14 sm:mt-20">
            <Eyebrow n="03" className="justify-center">Track Leaders &amp; Event Coordinators</Eyebrow>

            <div className="mt-8 space-y-12 sm:mt-10 sm:space-y-16">
              {tracks.map((track, ti) => (
                <div key={track.name} className="track-block relative rounded-3xl border border-circuit/15 bg-surface/30 px-3 py-8 text-center sm:px-6 sm:py-10">
                  <span aria-hidden="true" className="pointer-events-none absolute right-0 top-0 select-none font-accent text-6xl font-black leading-none text-circuit/[0.06] sm:text-8xl">{String(ti + 1).padStart(2, "0")}</span>
                  <span
                    aria-hidden="true"
                    className="mx-auto mb-3 block h-2.5 w-2.5 rounded-full bg-circuit shadow-[0_0_10px_rgba(53,224,201,0.6)]"
                  />
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-circuit/70">
                    Track {String(ti + 1).padStart(2, "0")}
                  </p>
                  <h2 className="mt-1 font-display text-xl font-semibold text-ink sm:text-2xl">
                    {track.name}
                  </h2>
                  {track.eventName && (
                    <p className="mt-1 text-sm font-medium text-marigold">{track.eventName}</p>
                  )}

                  {/* track leads */}
                  <div className="mt-6 flex flex-wrap justify-center gap-x-3 gap-y-6 sm:gap-x-6">
                    {track.leads.map((person, i) => (
                      <PersonCard key={i} person={person} role="Track Leader" accent="circuit" compact showContact />
                    ))}
                  </div>

                  {/* this track's events — skipped when the track has no event coordinators */}
                  {track.events && track.events.length > 0 && (
                  <div className="mt-6 space-y-5 sm:mt-8 sm:space-y-6">
                    {track.events.map((event) => (
                      <div key={event.name}>
                        <p className="mb-4 flex items-center justify-center gap-2 text-sm font-semibold text-ink"><span aria-hidden="true" className="h-3 w-1 rounded-full bg-marigold" />{event.name}<span aria-hidden="true" className="h-3 w-1 rounded-full bg-marigold" /></p>
                        <div className="flex flex-wrap justify-center gap-x-3 gap-y-6 sm:gap-x-6">
                          {event.leads.map((person, i) => (
                            <PersonCard key={i} person={person} role="Event Coordinator" accent="marigold" compact showContact />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ---------------------------------------------------------- */}
          {/* 04 — Web development team                                  */}
          {/* ---------------------------------------------------------- */}
          <section className="mt-16 sm:mt-24">
            <Eyebrow n="04" className="justify-center">Web Development Team</Eyebrow>
            <div className="mt-6 flex flex-wrap justify-center gap-5 sm:mt-8 sm:gap-8">
              {webTeam.map((person) => (
                <PersonCard key={person.name} person={person} role="Web Team" accent="circuit" />
              ))}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
