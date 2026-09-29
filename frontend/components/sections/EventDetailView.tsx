"use client";

import { useState, useEffect } from "react";
import { EventItem, TRACKS } from "@/lib/eventsData";
import Link from "next/link";
import { motion, useScroll, useSpring } from "framer-motion";
import { ChevronLeft, Download, MapPin, Calendar, Clock, Users, ArrowRight } from "lucide-react";

interface EventDetailViewProps {
  event: EventItem;
}

export default function EventDetailView({ event }: EventDetailViewProps) {
  const [copied, setCopied] = useState(false);
  const track = TRACKS.find((t) => t.id === event.trackId);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const handleDownloadBrochure = () => {
    // Generate a simple text rulebook/brochure for now
    const content = `================================================
XAVITECH 2026 — OFFICIAL EVENT DOSSIER
================================================
Event Name: ${event.fullTitle}
Track: ${track?.name || event.trackName}
Date: ${event.date}
Time: ${event.time}
Venue: ${event.venue}
Prize Pool: ${event.prize}
Team Size: ${event.team}

DESCRIPTION:
${event.fullDesc}

RULES & GUIDELINES:
${event.rules.map((r, i) => `${i + 1}. ${r}`).join("\n")}

KEY HIGHLIGHTS:
${event.highlights.map((h) => `• ${h}`).join("\n")}

Official Website: https://xavitech2026.org/events/${event.id}
Coordinator: Rohit Gupta | +91 79994 12660 | xavitech@xup.ac.in
================================================`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.id}-brochure-xavitech2026.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <>
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-cyan-400 origin-left z-50"
        style={{ scaleX }}
      />

      <div className="relative min-h-screen pt-24 pb-32 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto select-none">
        
        {/* BACK NAVIGATION */}
        <div className="mb-10">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 font-oxanium text-xs font-bold text-slate-400 hover:text-cyan-400 uppercase tracking-widest transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Arenas</span>
          </Link>
        </div>

        {/* 2-COLUMN EDITORIAL LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          
          {/* MOBILE ACTION PANEL (Shows only on mobile, at the top) */}
          <div className="w-full lg:hidden flex flex-col space-y-6">
            <ActionPanel event={event} track={track} onDownload={handleDownloadBrochure} compact={false} />
          </div>

          {/* LEFT: CONTENT (7/12) */}
          <div className="w-full lg:w-7/12 flex flex-col space-y-16">
            
            {/* HEADER CONTENT */}
            <motion.header
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={sectionVariants}
              className="flex flex-col space-y-4"
            >
              <div className="flex items-center gap-3 font-oxanium text-xs font-bold text-cyan-400 uppercase tracking-widest">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>{track?.name || event.trackName}</span>
                <span className="text-slate-600">|</span>
                <span className="text-amber-400">{event.badgeLevel} Tier</span>
              </div>

              <h1 className="font-space text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-white leading-[0.95]">
                {event.name}
              </h1>
              
              <h2 className="font-space text-xl md:text-2xl text-cyan-50 font-medium">
                {event.shortDesc}
              </h2>
            </motion.header>

            {/* SEPARATOR */}
            <div className="w-full h-px bg-gradient-to-r from-cyan-500/50 via-cyan-500/10 to-transparent" />

            {/* OVERVIEW */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={sectionVariants}
              className="relative"
            >
              <SectionHeader number="01" title="Overview" />
              <p className="font-space text-base text-slate-300 leading-relaxed max-w-2xl">
                {event.fullDesc}
              </p>
            </motion.section>

            {/* WHAT YOU'LL LEARN */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={sectionVariants}
            >
              <SectionHeader number="02" title="What You'll Learn" />
              <ul className="grid gap-4">
                {event.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span className="font-space text-base text-slate-300 leading-relaxed">
                      {highlight}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.section>

            {/* RULES & GUIDELINES */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={sectionVariants}
            >
              <SectionHeader number="03" title="Rules & Guidelines" />
              <div className="border-l border-white/10 ml-3 pl-6 space-y-6">
                {event.rules.map((rule, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[30px] top-2 h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    <p className="font-space text-base text-slate-300 leading-relaxed">
                      {rule}
                    </p>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* ELIGIBILITY & TEAM */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={sectionVariants}
            >
              <SectionHeader number="04" title="Eligibility" />
              <div className="p-6 bg-white/5 border border-white/10 rounded-sm">
                <p className="font-space text-base text-slate-300 leading-relaxed">
                  Open to all registered XaviTech 2026 attendees. Team size must strictly be <strong className="text-cyan-300">{event.team}</strong>. Cross-college teams are permitted provided all members have valid student IDs.
                </p>
              </div>
            </motion.section>

            {/* PRIZES */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={sectionVariants}
            >
              <SectionHeader number="05" title="Rewards Pool" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-amber-950/20 border border-amber-500/20 rounded-sm">
                  <div className="font-oxanium text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">Grand Prize</div>
                  <div className="font-space text-4xl font-black text-amber-400">{event.prize}</div>
                  <div className="mt-2 font-space text-sm text-amber-300/70">Distributed among top performers.</div>
                </div>
                <div className="p-6 bg-cyan-950/20 border border-cyan-500/20 rounded-sm flex flex-col justify-center">
                  <div className="font-oxanium text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2">Additional Perks</div>
                  <ul className="font-space text-sm text-cyan-200/80 space-y-1">
                    <li>• Digital Certificates for all</li>
                    <li>• Exclusive XaviTech Merch</li>
                    <li>• Industry Mentorship Access</li>
                  </ul>
                </div>
              </div>
            </motion.section>

            {/* EVENT COORDINATOR */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={sectionVariants}
            >
              <SectionHeader number="06" title="Event Coordinator" />
              <div className="flex flex-col md:flex-row md:items-center gap-6 p-6 border-l-4 border-cyan-400 bg-white/[0.02]">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center font-space text-2xl font-bold text-slate-400">
                  RG
                </div>
                <div>
                  <h4 className="font-space text-xl font-bold text-white mb-1">Rohit Gupta</h4>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 font-mono text-sm text-cyan-300">
                    <a href="mailto:xavitech@xup.ac.in" className="hover:text-cyan-100 transition-colors">xavitech@xup.ac.in</a>
                    <span className="hidden sm:block text-slate-600">|</span>
                    <a href="tel:+917999412660" className="hover:text-cyan-100 transition-colors">+91 79994 12660</a>
                  </div>
                </div>
              </div>
            </motion.section>

          </div>

          {/* RIGHT: STICKY ACTION PANEL (Desktop) */}
          <div className="hidden lg:block w-5/12 sticky top-24 self-start">
            <ActionPanel event={event} track={track} onDownload={handleDownloadBrochure} compact />
          </div>

        </div>
      </div>

      {/* FIXED MOBILE BOTTOM CTA */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-[#02050a]/90 backdrop-blur-md border-t border-white/10 z-50 lg:hidden">
        <Link
          href={`/events/${event.id}/register`}
          className="cyber-btn-clip w-full flex items-center justify-center py-4 bg-cyan-400 text-black font-oxanium text-sm font-black uppercase tracking-widest shadow-[0_0_20px_rgba(53,224,201,0.3)]"
        >
          Register Now <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </>
  );
}

// ----------------------------------------
// SUB-COMPONENTS
// ----------------------------------------

function SectionHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <span className="font-mono text-sm font-bold text-cyan-400 bg-cyan-950/40 px-2 py-1 rounded-sm border border-cyan-500/20">
        {number}
      </span>
      <h3 className="font-display text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
        {title}
      </h3>
    </div>
  );
}

function ActionPanel({ event, track, onDownload, compact }: { event: EventItem; track: any; onDownload: () => void; compact: boolean }) {
  const accent = event.id === "crucible" ? "#ff6848" : event.id === "web-craft" ? "#f0a15b" : event.accentColor || "#35e0c9";

  return (
    <div className="cyber-chassis-clip w-full p-[1px] shadow-2xl" style={{ background: `linear-gradient(145deg, ${accent}cc, ${accent}25 48%, ${accent}88)` }}>
      <div className={`cyber-chassis-clip relative isolate flex flex-col overflow-hidden bg-[#040810] ${compact ? "h-[calc(100vh-7.5rem)] min-h-[540px] max-h-[820px]" : "min-h-[660px]"}`}>
        <img src={event.image} alt={event.name} className="absolute inset-0 -z-20 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10" style={{ background: "linear-gradient(180deg, rgba(2,6,10,.26) 0%, rgba(2,6,10,.42) 35%, rgba(2,6,10,.90) 68%, rgba(2,6,10,.98) 100%)" }} />
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.08]" style={{ backgroundImage: `linear-gradient(${accent} 1px, transparent 1px), linear-gradient(to right, ${accent} 1px, transparent 1px)`, backgroundSize: "22px 22px" }} />
        <div className={`relative flex h-full flex-1 flex-col p-5 sm:p-6 ${compact ? "justify-between" : "justify-end"}`}>
          <div className="flex items-center justify-between gap-2 border-b border-white/20 pb-3">
            <span className="truncate font-oxanium text-[10px] font-bold uppercase tracking-[0.14em] text-white/80 sm:text-xs">{track?.name || event.trackName}</span>
            <span className="flex shrink-0 items-center gap-1.5 border px-2 py-1 font-oxanium text-[9px] font-bold uppercase tracking-widest" style={{ color: accent, borderColor: `${accent}bb`, backgroundColor: "rgba(2,8,13,.65)" }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }} /> Open
            </span>
          </div>

          <div className="mt-auto">
            <div className="mb-4 flex items-end justify-between gap-3 border-b border-white/20 pb-4">
              <div>
                <span className="block font-oxanium text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: accent }}>Prize Pool</span>
                <span className="font-space text-3xl font-black text-white sm:text-4xl" style={{ textShadow: `0 0 18px ${accent}99` }}>{event.prize}</span>
              </div>
              <span className="mb-1 font-oxanium text-[10px] font-bold uppercase tracking-widest text-white/70">{event.badgeLevel}</span>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-x-3 gap-y-3 rounded-sm border border-white/15 bg-[#03080d]/65 p-3 backdrop-blur-sm">
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-1.5 font-oxanium text-[9px] font-bold uppercase tracking-widest text-white/55"><Calendar className="h-3 w-3" style={{ color: accent }} /> Date</span>
                <span className="font-mono text-xs text-white">{event.date}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-1.5 font-oxanium text-[9px] font-bold uppercase tracking-widest text-white/55"><Clock className="h-3 w-3" style={{ color: accent }} /> Time</span>
                <span className="font-mono text-xs text-white">{event.time}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-1.5 font-oxanium text-[9px] font-bold uppercase tracking-widest text-white/55"><MapPin className="h-3 w-3" style={{ color: accent }} /> Venue</span>
                <span className="font-mono text-xs text-white">{event.venue}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-1.5 font-oxanium text-[9px] font-bold uppercase tracking-widest text-white/55"><Users className="h-3 w-3" style={{ color: accent }} /> Team Size</span>
                <span className="font-mono text-xs text-white">{event.team}</span>
              </div>
            </div>

            <div className={`grid gap-2 ${compact ? "grid-cols-2" : "grid-cols-1"}`}>
              <Link href={`/events/${event.id}/register`} className="cyber-btn-clip flex w-full items-center justify-center px-2 py-3 font-oxanium text-xs font-black uppercase tracking-wider text-[#08090b] transition hover:brightness-110" style={{ backgroundColor: accent, boxShadow: `0 0 20px ${accent}55` }}>
                Register Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <button onClick={onDownload} className="cyber-btn-clip flex w-full items-center justify-center border border-white/35 bg-[#03080d]/65 px-2 py-3 font-oxanium text-[10px] font-bold uppercase tracking-wide text-white transition hover:border-white/70 hover:bg-[#03080d]/85">
                <Download className="mr-2 h-4 w-4" /> Download Brochure
              </button>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute left-4 top-4 h-5 w-5 border-l-2 border-t-2" style={{ borderColor: accent }} />
        <div className="pointer-events-none absolute bottom-4 right-4 h-5 w-5 border-b-2 border-r-2" style={{ borderColor: accent }} />
      </div>
    </div>
  );
}
