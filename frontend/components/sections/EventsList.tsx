"use client";

import { useState } from "react";
import { EVENTS } from "@/lib/eventsData";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";

export default function EventsList() {
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-16">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="font-space text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
            All <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Events</span>
          </h2>
          <p className="mt-2 font-mono text-sm text-slate-400">
            COMPREHENSIVE DIRECTORY // {EVENTS.length} ACTIVE ARENAS
          </p>
        </div>
      </div>

      {/* LIST CONTAINER */}
      <div className="flex flex-col w-full relative">
        
        {/* HEADER ROW */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 font-oxanium text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">
          <div className="col-span-4 lg:col-span-5">Arena</div>
          <div className="col-span-3 lg:col-span-2">Track</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-1">Team</div>
          <div className="col-span-1">Prize</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        {/* ROWS */}
        <div className="flex flex-col">
          {EVENTS.map((event) => {
            const isHovered = hoveredEventId === event.id;
            
            return (
              <div 
                key={event.id}
                className="group relative border-b border-white/5 transition-colors"
                onMouseEnter={() => setHoveredEventId(event.id)}
                onMouseLeave={() => setHoveredEventId(null)}
              >
                {/* AMBIENT GLOW ON HOVER */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
                  style={{ backgroundColor: event.accentColor }}
                />

                <Link href={`/events/${event.id}`} className="relative z-10 block w-full">
                  <div className="flex flex-col md:grid md:grid-cols-12 gap-4 px-4 md:px-6 py-5 items-start md:items-center">
                    
                    {/* EVENT NAME & IMAGE REVEAL */}
                    <div className="col-span-4 lg:col-span-5 flex flex-col md:flex-row items-start md:items-center gap-4 w-full">
                      {/* Mobile Image (always visible) / Desktop Image (hover reveal) */}
                      <div 
                        className={`overflow-hidden rounded-md transition-all duration-500 ease-out flex-shrink-0
                          md:w-0 md:h-12 md:opacity-0 group-hover:md:w-20 group-hover:md:opacity-100
                          w-full h-32 md:hidden mb-2 md:mb-0
                        `}
                      >
                        <img 
                          src={event.image} 
                          alt={event.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div>
                        <h3 
                          className="font-space text-xl md:text-2xl font-bold text-white uppercase tracking-tight transition-colors"
                          style={{ textShadow: isHovered ? `0 0 15px ${event.accentColor}80` : 'none' }}
                        >
                          {event.name}
                        </h3>
                        {event.isFlagship && (
                          <span className="mt-1 inline-block font-oxanium text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-sm border border-amber-500/30">
                            ★ Flagship
                          </span>
                        )}
                      </div>
                    </div>

                    {/* TRACK */}
                    <div className="col-span-3 lg:col-span-2 flex items-center gap-2 font-oxanium text-xs font-bold text-slate-300 uppercase tracking-widest w-full justify-between md:justify-start">
                      <span className="md:hidden text-slate-500">Track:</span>
                      <span 
                        className="px-2 py-1 rounded-sm border bg-white/5 whitespace-nowrap"
                        style={{ borderColor: `${event.accentColor}30`, color: event.accentColor }}
                      >
                        {event.trackName.replace("TECHNICAL & CODING", "TECH & CODE")}
                      </span>
                    </div>

                    {/* DATE */}
                    <div className="col-span-2 font-space text-sm text-slate-400 flex justify-between md:block w-full">
                      <span className="md:hidden font-oxanium text-xs text-slate-500 uppercase">Date:</span>
                      {event.date}
                    </div>

                    {/* TEAM */}
                    <div className="col-span-1 font-space text-sm text-slate-400 flex justify-between md:block w-full">
                      <span className="md:hidden font-oxanium text-xs text-slate-500 uppercase">Team:</span>
                      {event.team}
                    </div>

                    {/* PRIZE */}
                    <div className="col-span-1 font-oxanium text-base font-bold text-marigold flex justify-between md:block w-full">
                      <span className="md:hidden text-xs text-slate-500 uppercase">Prize:</span>
                      {event.prize}
                    </div>

                    {/* ACTION (Desktop) */}
                    <div className="col-span-1 text-right hidden md:block">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/20 text-white/50 group-hover:border-cyan-400 group-hover:text-cyan-400 group-hover:bg-cyan-950/30 transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>

                    {/* ACTION (Mobile) */}
                    <div className="w-full mt-2 md:hidden">
                       <div className="flex items-center justify-between w-full p-3 bg-white/5 border border-white/10 rounded-sm font-oxanium text-xs font-bold text-cyan-400 uppercase tracking-widest">
                         Explore Arena <ChevronRight className="w-4 h-4" />
                       </div>
                    </div>

                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
