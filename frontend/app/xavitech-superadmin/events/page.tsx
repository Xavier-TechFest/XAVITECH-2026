"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  AdminEventItem,
  AdminEventRegistrationSettings,
  adminGetEventsList,
  adminUpdateEventRegistrationSettings,
  EventRegistrationStatus,
} from "@/lib/api";

function formatIST(dateStr: string | null | undefined): string {
  if (!dateStr) return "Not configured";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Invalid date";
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(d) + " IST";
  } catch {
    return String(dateStr);
  }
}

function toDatetimeLocal(isoStr: string | null | undefined): string {
  if (!isoStr) return "";
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

function fromDatetimeLocal(localStr: string): string | null {
  if (!localStr || !localStr.trim()) return null;
  const d = new Date(localStr);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

function computeDerivedPreview(params: {
  isActive: boolean;
  registrationOpen: boolean;
  registrationStartAt: string | null;
  registrationEndAt: string | null;
  capacity: number | null;
  currentCount: number;
}): EventRegistrationStatus {
  if (!params.isActive) return "DISABLED";
  if (!params.registrationOpen) return "CLOSED";
  const now = Date.now();
  if (params.registrationStartAt) {
    const start = new Date(params.registrationStartAt).getTime();
    if (!isNaN(start) && now < start) return "COMING_SOON";
  }
  if (params.registrationEndAt) {
    const end = new Date(params.registrationEndAt).getTime();
    if (!isNaN(end) && now > end) return "CLOSED";
  }
  if (params.capacity !== null && params.capacity !== undefined) {
    if (params.capacity > 0 && params.currentCount >= params.capacity) return "FULL";
  }
  return "OPEN";
}

export default function AdminEventsManagementPage() {
  const [events, setEvents] = useState<AdminEventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [trackFilter, setTrackFilter] = useState<string>("ALL");

  // Modal State
  const [selectedEvent, setSelectedEvent] = useState<AdminEventItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);

  // Modal Form State
  const [formIsActive, setFormIsActive] = useState(true);
  const [formRegistrationOpen, setFormRegistrationOpen] = useState(true);
  const [formCapacityUnlimited, setFormCapacityUnlimited] = useState(true);
  const [formCapacityValue, setFormCapacityValue] = useState<string>("");
  const [formStartAtLocal, setFormStartAtLocal] = useState<string>("");
  const [formEndAtLocal, setFormEndAtLocal] = useState<string>("");

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await adminGetEventsList();
      setEvents(data);
    } catch (err: any) {
      console.error("Failed to load admin events:", err);
      setErrorMsg(err.message || "Failed to load events. Please check permissions or connection.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Derived tracks list for dropdown
  const uniqueTracks = useMemo(() => {
    const trackMap = new Map<string, string>();
    for (const ev of events) {
      if (ev.track && ev.track.name) {
        trackMap.set(ev.track.id || ev.track.name, ev.track.name);
      }
    }
    return Array.from(trackMap.entries()).map(([id, name]) => ({ id, name }));
  }, [events]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (search.trim()) {
        const query = search.trim().toLowerCase();
        const matchesName = ev.name.toLowerCase().includes(query);
        const matchesSlug = ev.slug.toLowerCase().includes(query);
        const matchesTrack = ev.track?.name.toLowerCase().includes(query);
        if (!matchesName && !matchesSlug && !matchesTrack) return false;
      }
      if (statusFilter !== "ALL" && ev.registrationStatus !== statusFilter) {
        return false;
      }
      if (trackFilter !== "ALL") {
        const evTrackId = ev.trackId || ev.track?.id;
        if (evTrackId !== trackFilter && ev.track?.name !== trackFilter) {
          return false;
        }
      }
      return true;
    });
  }, [events, search, statusFilter, trackFilter]);

  // Metrics
  const metrics = useMemo(() => {
    const total = events.length;
    let openCount = 0;
    let closedCount = 0;
    let comingSoonCount = 0;
    let fullCount = 0;
    let disabledCount = 0;
    let totalRegs = 0;

    for (const ev of events) {
      totalRegs += ev.registeredCount || 0;
      switch (ev.registrationStatus) {
        case "OPEN":
          openCount++;
          break;
        case "COMING_SOON":
          comingSoonCount++;
          break;
        case "FULL":
          fullCount++;
          break;
        case "CLOSED":
          closedCount++;
          break;
        case "DISABLED":
          disabledCount++;
          break;
      }
    }

    return {
      total,
      openCount,
      closedCount,
      comingSoonCount,
      fullCount,
      disabledCount,
      totalRegs,
    };
  }, [events]);

  const handleOpenModal = (ev: AdminEventItem) => {
    setSelectedEvent(ev);
    setFormIsActive(ev.isActive);
    setFormRegistrationOpen(ev.registrationOpen);
    if (ev.capacity !== null && ev.capacity !== undefined && ev.capacity > 0) {
      setFormCapacityUnlimited(false);
      setFormCapacityValue(String(ev.capacity));
    } else {
      setFormCapacityUnlimited(true);
      setFormCapacityValue("");
    }
    setFormStartAtLocal(toDatetimeLocal(ev.registrationStartAt));
    setFormEndAtLocal(toDatetimeLocal(ev.registrationEndAt));
    setModalError(null);
    setModalSuccess(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setSelectedEvent(null);
    setModalError(null);
    setModalSuccess(null);
  };

  // Live preview for modal
  const liveModalPreviewStatus = useMemo(() => {
    if (!selectedEvent) return "OPEN";
    const cap = formCapacityUnlimited ? null : Number(formCapacityValue) || null;
    const startIso = fromDatetimeLocal(formStartAtLocal);
    const endIso = fromDatetimeLocal(formEndAtLocal);
    return computeDerivedPreview({
      isActive: formIsActive,
      registrationOpen: formRegistrationOpen,
      registrationStartAt: startIso,
      registrationEndAt: endIso,
      capacity: cap,
      currentCount: selectedEvent.registeredCount || 0,
    });
  }, [
    selectedEvent,
    formIsActive,
    formRegistrationOpen,
    formCapacityUnlimited,
    formCapacityValue,
    formStartAtLocal,
    formEndAtLocal,
  ]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    setModalError(null);
    setModalSuccess(null);

    // Validate capacity
    let parsedCapacity: number | null = null;
    if (!formCapacityUnlimited) {
      const num = Number(formCapacityValue.trim());
      if (isNaN(num) || !Number.isInteger(num) || num <= 0) {
        setModalError("Registration capacity must be a positive integer.");
        return;
      }
      if (num < selectedEvent.registeredCount) {
        setModalError(
          `Capacity cannot be lower than current active registration count (${selectedEvent.registeredCount}).`
        );
        return;
      }
      parsedCapacity = num;
    }

    // Validate dates
    const startIso = fromDatetimeLocal(formStartAtLocal);
    const endIso = fromDatetimeLocal(formEndAtLocal);

    if (startIso && endIso) {
      if (new Date(startIso).getTime() > new Date(endIso).getTime()) {
        setModalError("Opening date/time must be before or equal to closing date/time.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const updated = await adminUpdateEventRegistrationSettings(selectedEvent.id, {
        isActive: formIsActive,
        registrationOpen: formRegistrationOpen,
        capacity: parsedCapacity,
        registrationStartAt: startIso,
        registrationEndAt: endIso,
      });

      // Update state locally
      setEvents((prev) =>
        prev.map((item) =>
          item.id === selectedEvent.id
            ? {
                ...item,
                isActive: updated.isActive,
                registrationOpen: updated.registrationOpen,
                capacity: updated.capacity,
                registrationStartAt: updated.registrationStartAt,
                registrationEndAt: updated.registrationEndAt,
                registeredCount: updated.registeredCount,
                remainingCapacity: updated.remainingCapacity,
                isFull: updated.isFull,
                registrationStatus: updated.registrationStatus,
              }
            : item
        )
      );

      setModalSuccess("Registration settings saved successfully!");
      setTimeout(() => {
        setIsModalOpen(false);
        setSelectedEvent(null);
      }, 700);
    } catch (err: any) {
      console.error("Save error:", err);
      setModalError(err.message || "Failed to update registration settings.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper for status badge rendering
  const renderStatusBadge = (status: EventRegistrationStatus) => {
    switch (status) {
      case "OPEN":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            OPEN
          </span>
        );
      case "COMING_SOON":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            COMING SOON
          </span>
        );
      case "FULL":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            FULL
          </span>
        );
      case "CLOSED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            CLOSED
          </span>
        );
      case "DISABLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider bg-neutral-800 text-neutral-400 border border-neutral-700">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
            DISABLED
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
      {/* 1. Header & Live Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#35e0c9]/30 bg-[#35e0c9]/10 text-[#35e0c9] text-xs font-mono uppercase tracking-widest mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#35e0c9]" />
            Live Controls
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-mono uppercase tracking-tight text-white">
            Event Registration Management
          </h1>
          <p className="text-xs sm:text-sm font-mono text-neutral-400 mt-1">
            Centrally manage opening/closing schedules, capacity caps, and instant registration kill switches for all events.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchEvents}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-[#35e0c9]/40 text-neutral-300 hover:text-[#35e0c9] font-mono text-xs font-bold transition cursor-pointer disabled:opacity-50"
            title="Refresh events list"
          >
            <svg
              className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#35e0c9]" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>REFRESH</span>
          </button>
        </div>
      </div>

      {/* 2. Overview Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#0e131f] border border-neutral-800/80">
          <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
            Total Events
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {metrics.total}
          </div>
          <div className="text-[10px] font-mono text-neutral-500 mt-0.5">
            13 festival events
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e131f] border border-emerald-500/20">
          <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">
            Open for Registration
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">
            {metrics.openCount}
          </div>
          <div className="text-[10px] font-mono text-neutral-500 mt-0.5">
            Active & accepting
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e131f] border border-cyan-500/20">
          <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
            Coming Soon
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">
            {metrics.comingSoonCount}
          </div>
          <div className="text-[10px] font-mono text-neutral-500 mt-0.5">
            Future window start
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e131f] border border-rose-500/20">
          <div className="text-[10px] font-mono uppercase tracking-wider text-rose-400">
            Closed / Disabled
          </div>
          <div className="text-2xl font-bold font-mono text-rose-300 mt-1">
            {metrics.closedCount + metrics.disabledCount}
          </div>
          <div className="text-[10px] font-mono text-neutral-500 mt-0.5">
            {metrics.closedCount} closed, {metrics.disabledCount} disabled
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e131f] border border-[#35e0c9]/20 col-span-2 sm:col-span-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#35e0c9]">
            Total Registrations
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {metrics.totalRegs}
          </div>
          <div className="text-[10px] font-mono text-neutral-500 mt-0.5">
            Live PostgreSQL count
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between p-3.5 rounded-2xl bg-[#0a0e17] border border-neutral-800">
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search event name, slug, track..."
            className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-[#35e0c9] transition"
          />
          <svg
            className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="w-full md:w-auto flex flex-wrap gap-2.5 items-center">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-400">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-[#35e0c9]"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">OPEN</option>
              <option value="COMING_SOON">COMING_SOON</option>
              <option value="FULL">FULL</option>
              <option value="CLOSED">CLOSED</option>
              <option value="DISABLED">DISABLED</option>
            </select>
          </div>

          {/* Track Filter */}
          <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-400">
            <span>Track:</span>
            <select
              value={trackFilter}
              onChange={(e) => setTrackFilter(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-[#35e0c9] max-w-[200px] truncate"
            >
              <option value="ALL">All Tracks</option>
              {uniqueTracks.map((trk) => (
                <option key={trk.id} value={trk.id}>
                  {trk.name}
                </option>
              ))}
            </select>
          </div>

          {(search || statusFilter !== "ALL" || trackFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
                setTrackFilter("ALL");
              }}
              className="text-[11px] font-mono text-neutral-400 hover:text-white px-2 py-1 underline transition cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={fetchEvents} className="underline hover:text-white cursor-pointer ml-3">
            Retry
          </button>
        </div>
      )}

      {/* 4. Events Listing Table */}
      <div className="rounded-2xl bg-[#0a0e17] border border-neutral-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900/60 font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                <th className="py-3.5 px-4">Event & Track</th>
                <th className="py-3.5 px-4">Type & Fee</th>
                <th className="py-3.5 px-4">Derived Status</th>
                <th className="py-3.5 px-4">Registrations / Capacity</th>
                <th className="py-3.5 px-4">Registration Window</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-mono text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500 font-mono">
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin text-[#35e0c9]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>Loading events and live capacities...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500 font-mono">
                    No events match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((ev) => {
                  const capacityDisplay = ev.capacity !== null && ev.capacity !== undefined ? ev.capacity : "∞";
                  const remainingDisplay =
                    ev.capacity !== null && ev.capacity !== undefined
                      ? `${Math.max(0, ev.capacity - ev.registeredCount)} left`
                      : "Unlimited";

                  const fillPercent =
                    ev.capacity && ev.capacity > 0
                      ? Math.min(100, Math.round((ev.registeredCount / ev.capacity) * 100))
                      : 0;

                  return (
                    <tr key={ev.id} className="hover:bg-neutral-900/40 transition">
                      {/* Event & Track */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white tracking-tight">{ev.name}</div>
                        <div className="text-[10px] text-neutral-400 flex items-center gap-1.5 mt-0.5">
                          <span className="text-[#35e0c9]">{ev.track?.name || "General"}</span>
                          <span>·</span>
                          <span className="text-neutral-500 font-mono">/{ev.slug}</span>
                        </div>
                      </td>

                      {/* Type & Fee */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">
                            {ev.registrationType}
                          </span>
                          {ev.registrationType === "TEAM" && (
                            <span className="text-[10px] text-neutral-400">
                              ({ev.minTeamSize}-{ev.maxTeamSize}p)
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-1">
                          {ev.fee === 0 ? "FREE" : `₹${ev.fee}`}
                        </div>
                      </td>

                      {/* Derived Status */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          {renderStatusBadge(ev.registrationStatus)}
                          {!ev.registrationOpen && ev.isActive && (
                            <span className="text-[9px] text-rose-400 font-mono">
                              (Master switch: OFF)
                            </span>
                          )}
                          {!ev.isActive && (
                            <span className="text-[9px] text-neutral-500 font-mono">
                              (Inactive event)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Registrations / Capacity */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-bold text-white text-sm">{ev.registeredCount}</span>
                          <span className="text-neutral-500">/</span>
                          <span className="text-neutral-300 font-bold">{capacityDisplay}</span>
                          <span className="text-[10px] text-neutral-400 ml-1">({remainingDisplay})</span>
                        </div>
                        {ev.capacity && ev.capacity > 0 && (
                          <div className="w-32 h-1.5 bg-neutral-800 rounded-full mt-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                fillPercent >= 100
                                  ? "bg-rose-500"
                                  : fillPercent >= 80
                                  ? "bg-amber-400"
                                  : "bg-[#35e0c9]"
                              }`}
                              style={{ width: `${fillPercent}%` }}
                            />
                          </div>
                        )}
                      </td>

                      {/* Registration Window */}
                      <td className="py-3.5 px-4 text-[11px] text-neutral-300">
                        <div>
                          <span className="text-neutral-500 text-[10px]">OPENS:</span>{" "}
                          {ev.registrationStartAt ? formatIST(ev.registrationStartAt) : "Immediate / Always"}
                        </div>
                        <div className="mt-0.5">
                          <span className="text-neutral-500 text-[10px]">CLOSES:</span>{" "}
                          {ev.registrationEndAt ? formatIST(ev.registrationEndAt) : "Indefinite / Festival"}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenModal(ev)}
                          className="px-3 py-1.5 rounded-lg bg-[#35e0c9]/10 hover:bg-[#35e0c9]/20 text-[#35e0c9] border border-[#35e0c9]/30 hover:border-[#35e0c9]/60 font-mono text-xs font-semibold tracking-wide transition cursor-pointer"
                        >
                          MANAGE
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Manage Registration Modal */}
      {isModalOpen && selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto"
          onClick={handleCloseModal}
        >
          <div
            className="w-full max-w-xl rounded-2xl bg-[#0e131f] border border-neutral-800 p-6 shadow-2xl space-y-5 my-8"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
              <div>
                <div className="text-[10px] font-mono text-[#35e0c9] uppercase tracking-wider">
                  Registration Settings
                </div>
                <h2 className="text-lg font-bold font-space text-white uppercase mt-0.5">
                  {selectedEvent.name}
                </h2>
                <div className="text-xs font-mono text-neutral-400 mt-0.5">
                  Track: {selectedEvent.track?.name || "General"} · Current registrations:{" "}
                  <strong className="text-white">{selectedEvent.registeredCount}</strong>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Status Live Preview Box */}
            <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-400">
                Effective Derived Registration Status:
              </span>
              <div>{renderStatusBadge(liveModalPreviewStatus)}</div>
            </div>

            {/* Error & Success Banners */}
            {modalError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs">
                {modalError}
              </div>
            )}
            {modalSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs">
                {modalSuccess}
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSaveSettings} className="space-y-4">
              {/* Master Registration Switch */}
              <div className="p-3.5 rounded-xl bg-neutral-900/50 border border-neutral-800 flex items-center justify-between">
                <div>
                  <label className="text-xs font-mono font-bold text-white block">
                    Registration Master Switch
                  </label>
                  <span className="text-[11px] font-mono text-neutral-400 block mt-0.5">
                    {formRegistrationOpen
                      ? "Registrations are allowed according to window & capacity schedule."
                      : "Registrations are immediately CLOSED (overrides date window)."}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormRegistrationOpen(!formRegistrationOpen)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${
                    formRegistrationOpen ? "bg-[#35e0c9] justify-end" : "bg-neutral-700 justify-start"
                  }`}
                >
                  <div className="bg-black w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>

              {/* Event Active Switch */}
              <div className="p-3.5 rounded-xl bg-neutral-900/50 border border-neutral-800 flex items-center justify-between">
                <div>
                  <label className="text-xs font-mono font-bold text-white block">
                    Event Active Status
                  </label>
                  <span className="text-[11px] font-mono text-neutral-400 block mt-0.5">
                    {formIsActive
                      ? "Event is visible and active on the festival platform."
                      : "Event is DISABLED administratively."}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormIsActive(!formIsActive)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${
                    formIsActive ? "bg-emerald-500 justify-end" : "bg-neutral-700 justify-start"
                  }`}
                >
                  <div className="bg-black w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>

              {/* Capacity Controls */}
              <div className="p-3.5 rounded-xl bg-neutral-900/50 border border-neutral-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-white">
                    Maximum Capacity
                  </label>
                  <label className="flex items-center gap-2 text-xs font-mono text-neutral-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formCapacityUnlimited}
                      onChange={(e) => {
                        setFormCapacityUnlimited(e.target.checked);
                        if (e.target.checked) setFormCapacityValue("");
                        else setFormCapacityValue(String(Math.max(selectedEvent.registeredCount, 50)));
                      }}
                      className="rounded border-neutral-700 text-[#35e0c9] focus:ring-0"
                    />
                    <span>Unlimited Capacity</span>
                  </label>
                </div>

                {!formCapacityUnlimited && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={selectedEvent.registeredCount}
                        value={formCapacityValue}
                        onChange={(e) => setFormCapacityValue(e.target.value)}
                        placeholder="e.g. 50"
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#35e0c9]"
                      />
                      <span className="text-xs font-mono text-neutral-400 shrink-0">slots</span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500 block">
                      Must be at least {selectedEvent.registeredCount} (current active registrations).
                    </span>
                  </div>
                )}
              </div>

              {/* Window Controls: Start & End */}
              <div className="p-3.5 rounded-xl bg-neutral-900/50 border border-neutral-800 space-y-3">
                <div className="text-xs font-mono font-bold text-white">
                  Registration Window Schedule (IST)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Start Date */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-mono text-neutral-400 uppercase">
                        Opening Date & Time
                      </label>
                      {formStartAtLocal && (
                        <button
                          type="button"
                          onClick={() => setFormStartAtLocal("")}
                          className="text-[10px] font-mono text-cyan-400 hover:underline"
                        >
                          Clear (Immediate)
                        </button>
                      )}
                    </div>
                    <input
                      type="datetime-local"
                      value={formStartAtLocal}
                      onChange={(e) => setFormStartAtLocal(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#35e0c9]"
                    />
                  </div>

                  {/* End Date */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-mono text-neutral-400 uppercase">
                        Closing Date & Time
                      </label>
                      {formEndAtLocal && (
                        <button
                          type="button"
                          onClick={() => setFormEndAtLocal("")}
                          className="text-[10px] font-mono text-cyan-400 hover:underline"
                        >
                          Clear (Indefinite)
                        </button>
                      )}
                    </div>
                    <input
                      type="datetime-local"
                      value={formEndAtLocal}
                      onChange={(e) => setFormEndAtLocal(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#35e0c9]"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#35e0c9] hover:bg-[#35e0c9]/90 text-black text-xs font-mono font-bold uppercase tracking-wider transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>SAVING...</span>
                    </>
                  ) : (
                    <span>SAVE SETTINGS</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
