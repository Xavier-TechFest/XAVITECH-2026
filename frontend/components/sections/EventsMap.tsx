"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TRACKS, EVENTS } from "@/lib/eventsData";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const FILTERS = [
  { id: "all", label: "ALL", tracks: ["all"] },
  { id: "build", label: "BUILD", tracks: ["technical", "learning"] },
  { id: "think", label: "THINK", tracks: ["ideation", "mun"] },
  { id: "play", label: "PLAY", tracks: ["gaming", "adventure"] },
  { id: "create", label: "CREATE", tracks: ["technical"] } // UI/UX is under technical
];

export default function EventsMap() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [hoveredTrack, setHoveredTrack] = useState<string | null>(null);

  // Filter tracks to display based on category
  const activeTracks = TRACKS.filter(t => t.id !== "all" && t.id !== "suggested").filter(t => {
    if (activeFilter === "all") return true;
    const filterDef = FILTERS.find(f => f.id === activeFilter);
    return filterDef?.tracks.includes(t.id);
  });

  return (
    <div className="w-full bg-transparent py-20 relative overflow-hidden">
      
      {/* BACKGROUND GRAPHICS */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-0 w-full h-px bg-cyan-500/20" />
        <div className="absolute top-0 left-1/2 w-px h-full bg-cyan-500/20" />
        <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] border border-cyan-500/10 rounded-full" />
        <div className="absolute top-1/3 left-1/3 w-[33vw] h-[33vw] border border-cyan-500/20 rounded-full" />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 relative z-10">
        
        {/* HEADER & FILTERS */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <h2 className="font-space text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
              Event <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Map</span>
            </h2>
            <p className="mt-2 font-mono text-sm text-slate-400 uppercase tracking-widest">
              Navigate The Arenas // Choose Your Path
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {FILTERS.map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 font-oxanium text-xs font-bold uppercase tracking-widest rounded-sm border transition-all ${
                  activeFilter === filter.id 
                  ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(53,224,201,0.2)]" 
                  : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/30"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* MAP GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {activeTracks.map(track => {
              const trackEvents = EVENTS.filter(e => e.trackId === track.id);
              const isHovered = hoveredTrack === track.id;

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  key={track.id}
                  className="relative group"
                  onMouseEnter={() => setHoveredTrack(track.id)}
                  onMouseLeave={() => setHoveredTrack(null)}
                >
                  {/* NODE CONNECTION LINES */}
                  <div className="absolute -left-4 top-8 w-4 h-px bg-white/20 group-hover:bg-cyan-400 transition-colors hidden md:block" />
                  
                  {/* TRACK NODE CARD */}
                  <div className="border border-white/10 bg-[#040810] p-6 rounded-lg transition-all duration-300 group-hover:border-cyan-500/50 group-hover:shadow-[0_0_30px_rgba(53,224,201,0.1)] relative overflow-hidden h-full flex flex-col">
                    
                    {/* Ambient track color */}
                    <div 
                      className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity duration-500 group-hover:opacity-40"
                      style={{ backgroundColor: track.accentColor }}
                    />

                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6 relative z-10">
                      <div 
                        className="w-10 h-10 flex items-center justify-center font-oxanium font-black text-black text-lg rounded-sm"
                        style={{ backgroundColor: track.accentColor }}
                      >
                        {track.letter}
                      </div>
                      <div>
                        <h3 className="font-space text-lg font-bold text-white uppercase tracking-tight leading-tight">
                          {track.name}
                        </h3>
                        <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
                          {trackEvents.length} Arenas
                        </span>
                      </div>
                    </div>

                    {/* Event Links */}
                    <div className="space-y-3 relative z-10 flex-1">
                      {trackEvents.map(event => (
                        <Link 
                          href={`/events/${event.id}`} 
                          key={event.id}
                          className="flex items-center justify-between p-3 rounded-md bg-white/5 border border-white/5 hover:border-white/20 transition-all group/item hover:bg-white/10"
                        >
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: event.accentColor }}
                            />
                            <span className="font-space text-sm font-bold text-slate-300 group-hover/item:text-white transition-colors">
                              {event.name}
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-500 group-hover/item:text-white transition-colors" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
