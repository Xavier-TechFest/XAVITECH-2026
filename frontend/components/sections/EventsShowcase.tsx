"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EVENTS } from "@/lib/eventsData";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import EventsMap from "./EventsMap";
import EventsList from "./EventsList";

export default function EventsShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Group of featured events or all events for the carousel
  const carouselEvents = EVENTS.slice(0, 10); // Let's use first 10 for the carousel

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselEvents.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, carouselEvents.length]);

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % carouselEvents.length);
  };

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + carouselEvents.length) % carouselEvents.length);
  };

  const currentEvent = carouselEvents[currentIndex];
  const nextEvent = carouselEvents[(currentIndex + 1) % carouselEvents.length];
  const prevEvent = carouselEvents[(currentIndex - 1 + carouselEvents.length) % carouselEvents.length];
  const currentAccent = currentEvent.id === "crucible"
    ? "#ff6848"
    : currentEvent.id === "web-craft"
      ? "#f0a15b"
      : currentEvent.accentColor || "#35e0c9";

  return (
    <div className="relative w-full min-h-screen bg-transparent flex flex-col pt-24 pb-12 overflow-hidden">
      
      {/* BACKGROUND AMBIENCE */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-20 transition-all duration-1000 ease-in-out"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${currentAccent} 0%, transparent 60%)`,
          }}
        />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
      </div>

      {/* HEADER REMOVED PER REQUEST */}

      {/* CAROUSEL SECTION */}
      <div className="relative z-10 w-full flex-1 flex flex-col justify-center max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 mt-4">
        <div className="relative w-full h-[65vh] md:h-[75vh] min-h-[500px] flex items-center justify-center">
          
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentEvent.id}
              initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 w-full h-full rounded-none overflow-hidden border border-white/10 group bg-black/50 cyber-chassis-clip"
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
            >
              {/* IMAGE BACKDROP */}
              <div className="absolute inset-0 w-full h-full">
                <img 
                  src={currentEvent.image} 
                  alt={currentEvent.name}
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-700 group-hover:scale-105 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#040810] via-[#040810]/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#040810]/90 via-[#040810]/20 to-transparent" />
              </div>
              
              {/* TECHNICAL CORNER BRACKETS */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-cyan-400/70 opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-cyan-400/70 opacity-50 group-hover:opacity-100 transition-opacity" />
              
              {/* SCANLINE */}
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#35e0c9] animate-scanline opacity-50 group-hover:opacity-100" />

              {/* CONTENT OVERLAY */}
              <div className="absolute inset-0 w-full h-full p-6 md:p-12 flex flex-col justify-end md:justify-center md:w-[60%]">
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="flex items-center gap-3 mb-4"
                >
                  <span className="font-oxanium text-xs md:text-sm font-bold uppercase tracking-widest text-white/70 px-3 py-1 border border-white/20 rounded-full backdrop-blur-md">
                    {currentEvent.trackName}
                  </span>
                  {currentEvent.isFlagship && (
                    <span className="font-oxanium text-xs md:text-sm font-bold uppercase tracking-widest text-amber-300 px-3 py-1 border border-amber-500/30 rounded-full bg-amber-900/30 backdrop-blur-md">
                      ★ Flagship
                    </span>
                  )}
                </motion.div>
                
                <motion.h2 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="font-space text-4xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-4"
                  style={{ textShadow: `0 0 40px ${currentAccent}80` }}
                >
                  {currentEvent.name}
                </motion.h2>

                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="font-space text-base md:text-lg text-slate-300 max-w-xl mb-8"
                >
                  {currentEvent.fullTitle}
                </motion.p>

                {/* METADATA STRIP */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="flex flex-wrap items-center gap-4 md:gap-8 font-oxanium text-xs md:text-sm text-slate-300 mb-8"
                >
                  <div className="flex flex-col">
                    <span className="text-white/40 uppercase tracking-widest text-[10px] mb-1">Date</span>
                    <span className="font-bold text-white">{currentEvent.date}</span>
                  </div>
                  <div className="w-px h-8 bg-white/10 hidden md:block" />
                  <div className="flex flex-col">
                    <span className="text-white/40 uppercase tracking-widest text-[10px] mb-1">Team</span>
                    <span className="font-bold text-white">{currentEvent.team}</span>
                  </div>
                  <div className="w-px h-8 bg-white/10 hidden md:block" />
                  <div className="flex flex-col">
                    <span className="text-white/40 uppercase tracking-widest text-[10px] mb-1">Prize Pool</span>
                    <span className="font-bold text-marigold text-lg">{currentEvent.prize}</span>
                  </div>
                </motion.div>

                {/* CTAs */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="flex items-center gap-4"
                >
                  <Link 
                    href={`/events/${currentEvent.id}/register`}
                    className="cyber-btn-clip px-8 py-3.5 font-oxanium text-sm font-black text-black uppercase tracking-widest hover:brightness-110 transition-all"
                    style={{ backgroundColor: currentAccent, boxShadow: `0 0 20px ${currentAccent}66` }}
                  >
                    Register Now →
                  </Link>
                  <Link 
                    href={`/events/${currentEvent.id}`}
                    className="cyber-btn-clip px-8 py-3.5 bg-white/5 border border-white/20 font-oxanium text-sm font-bold text-white uppercase tracking-widest hover:bg-white/10 transition-all backdrop-blur-md"
                  >
                    View Details
                  </Link>
                </motion.div>
              </div>

              {/* FLOATING DECORATIONS */}
              <div className="absolute top-6 right-6 font-mono text-white/20 text-xs text-right hidden md:block">
                XV-2026 // TRK-{currentEvent.trackId.toUpperCase()} <br/>
                SYS.RDY // ONLINE
              </div>

            </motion.div>
          </AnimatePresence>

          {/* NEXT / PREV PARTIALS FOR DEPTH (Desktop Only) */}
          <div className="absolute -right-32 top-1/2 -translate-y-1/2 w-64 h-[60%] rounded-2xl overflow-hidden hidden xl:block opacity-30 blur-[2px] transition-all duration-500 hover:opacity-50 hover:blur-none cursor-pointer border border-white/10" onClick={handleNext}>
            <img src={nextEvent.image} alt="Next" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute bottom-4 left-4 font-space text-white uppercase font-bold">{nextEvent.name}</div>
          </div>
          <div className="absolute -left-32 top-1/2 -translate-y-1/2 w-64 h-[60%] rounded-2xl overflow-hidden hidden xl:block opacity-30 blur-[2px] transition-all duration-500 hover:opacity-50 hover:blur-none cursor-pointer border border-white/10" onClick={handlePrev}>
            <img src={prevEvent.image} alt="Prev" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute bottom-4 left-4 font-space text-white uppercase font-bold">{prevEvent.name}</div>
          </div>

        </div>

        {/* CAROUSEL NAVIGATION (01 / 15 + ARROWS) */}
        <div className="flex items-center justify-between w-full mt-6 md:mt-8 px-2">
          <div className="flex items-center gap-4">
            <button 
              onClick={handlePrev}
              className="w-12 h-12 flex items-center justify-center border border-white/20 rounded-full bg-white/5 hover:bg-white/10 hover:border-cyan-400 transition-colors text-white backdrop-blur-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={handleNext}
              className="w-12 h-12 flex items-center justify-center border border-white/20 rounded-full bg-white/5 hover:bg-white/10 hover:border-cyan-400 transition-colors text-white backdrop-blur-md"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-3 font-oxanium">
            <span className="text-xl md:text-2xl font-bold text-white">
              {String(currentIndex + 1).padStart(2, "0")}
            </span>
            <span className="w-8 h-px bg-white/30" />
            <span className="text-lg md:text-xl font-medium text-white/50">
              {String(carouselEvents.length).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>

      {/* EVENT MAP SECTION */}
      <div className="w-full mt-24 bg-black/20 backdrop-blur-sm border-y border-white/5">
        <EventsMap />
      </div>

      {/* ALL EVENTS LIST SECTION */}
      <div className="w-full bg-transparent">
        <EventsList />
      </div>

      {/* FINAL CTA */}
      <div className="relative w-full py-24 flex items-center justify-center overflow-hidden bg-black/40 backdrop-blur-md border-t border-cyan-500/20">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-cyan-500/10 blur-[120px] rounded-full" />
        </div>
        <div className="relative z-10 text-center flex flex-col items-center">
          <h2 className="font-space text-4xl md:text-6xl font-black text-white uppercase tracking-tight mb-4">
            <span className="text-cyan-400">15</span> EVENTS. <span className="text-amber-400">5</span> TRACKS. <span className="text-emerald-400">1</span> TECH FEST.
          </h2>
          <p className="font-oxanium text-sm md:text-base text-slate-400 uppercase tracking-widest mb-8">
            The ultimate technological crucible awaits.
          </p>
          <Link
            href="/schedule"
            className="cyber-btn-clip px-10 py-4 bg-white text-black font-oxanium text-sm font-black uppercase tracking-widest hover:bg-cyan-400 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            View Full Schedule
          </Link>
        </div>
      </div>

    </div>
  );
}
