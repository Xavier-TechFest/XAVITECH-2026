"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import ModalPortal from "@/components/ui/ModalPortal";
import {
  api,
  ExportFormat,
  ExportScope,
  ExportRequestPayload,
  ExportPreviewResponse,
  EXPORT_FIELD_OPTIONS,
  ExportFieldOption,
  downloadBlob,
} from "@/lib/api";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: "admin" | "track-leader";
  theme?: "dark" | "light";
  activeFilters: {
    search?: string;
    trackId?: string;
    eventId?: string;
    registrationType?: string;
    status?: string;
    paymentStatus?: string;
  };
  tracks?: Array<{ id: string; name: string; slug: string }>;
  assignedTrack?: { id: string; name: string; slug: string } | null;
  events?: Array<{ id: string; name?: string; slug?: string; trackId?: string; [key: string]: any }>;
  onExportSuccess?: (filename: string) => void;
}

export default function ExportModal({
  isOpen,
  onClose,
  role,
  theme = "dark",
  activeFilters,
  tracks = [],
  assignedTrack = null,
  events = [],
  onExportSuccess,
}: ExportModalProps) {
  const isLight = theme === "light";
  const isTrackLeader = role === "track-leader";

  // Scope selection
  const [scope, setScope] = useState<ExportScope>(
    isTrackLeader ? "my_track" : "all"
  );
  const [customTrackId, setCustomTrackId] = useState(activeFilters.trackId || "");
  const [customEventId, setCustomEventId] = useState(activeFilters.eventId || "");

  // Format selection
  const [format, setFormat] = useState<ExportFormat>("xlsx");

  // Field selection
  const [selectedFieldKeys, setSelectedFieldKeys] = useState<string[]>(() =>
    EXPORT_FIELD_OPTIONS.filter((f) => f.default).map((f) => f.key)
  );
  const [fieldSearch, setFieldSearch] = useState("");

  // Preview & Exporting states
  const [previewData, setPreviewData] = useState<ExportPreviewResponse | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  // Group options by category
  const categories = useMemo(() => {
    const map = new Map<string, ExportFieldOption[]>();
    for (const opt of EXPORT_FIELD_OPTIONS) {
      if (!map.has(opt.category)) {
        map.set(opt.category, []);
      }
      map.get(opt.category)!.push(opt);
    }
    return Array.from(map.entries()).map(([category, items]) => ({
      category,
      items,
    }));
  }, []);

  // Filtered field options based on search input
  const filteredCategories = useMemo(() => {
    const q = fieldSearch.toLowerCase().trim();
    if (!q) return categories;

    return categories
      .map(({ category, items }) => ({
        category,
        items: items.filter(
          (item) =>
            item.label.toLowerCase().includes(q) ||
            item.key.toLowerCase().includes(q) ||
            category.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [categories, fieldSearch]);

  // Available events for cascading dropdown based on selected track
  const selectableEvents = useMemo(() => {
    if (isTrackLeader && assignedTrack) {
      return events.filter(
        (ev) =>
          ev.trackId === assignedTrack.id ||
          (ev as any).track_id === assignedTrack.id ||
          (ev as any).track?.id === assignedTrack.id
      );
    }

    if (!customTrackId) return events;

    return events.filter(
      (ev) =>
        ev.trackId === customTrackId ||
        (ev as any).track_id === customTrackId ||
        (ev as any).track?.id === customTrackId
    );
  }, [events, customTrackId, isTrackLeader, assignedTrack]);

  // Construct current effective payload
  const currentPayload = useMemo((): ExportRequestPayload => {
    let effectiveFilters = { ...activeFilters };

    if (scope === "all") {
      effectiveFilters = {};
    } else if (scope === "my_track" && assignedTrack) {
      effectiveFilters = { trackId: assignedTrack.id };
    } else if (scope === "track") {
      effectiveFilters = { trackId: customTrackId };
    } else if (scope === "event") {
      effectiveFilters = {
        ...(isTrackLeader && assignedTrack ? { trackId: assignedTrack.id } : {}),
        eventId: customEventId,
      };
    }

    return {
      format,
      scope,
      filters: effectiveFilters,
      fields: selectedFieldKeys,
      trackId: isTrackLeader ? assignedTrack?.id : customTrackId || undefined,
      eventId: scope === "event" ? customEventId : undefined,
    };
  }, [
    scope,
    format,
    selectedFieldKeys,
    activeFilters,
    customTrackId,
    customEventId,
    isTrackLeader,
    assignedTrack,
  ]);

  // Fetch export preview summary from backend
  const fetchPreview = useCallback(async () => {
    if (selectedFieldKeys.length === 0) {
      setPreviewData(null);
      setPreviewError("At least one field must be selected for export.");
      return;
    }

    setIsLoadingPreview(true);
    setPreviewError(null);
    try {
      let data: ExportPreviewResponse;
      if (isTrackLeader) {
        data = await api.trackLeaderExportRegistrationsPreview(currentPayload);
      } else {
        data = await api.adminExportRegistrationsPreview(currentPayload);
      }
      setPreviewData(data);
    } catch (err: any) {
      console.error("Error generating export preview:", err);
      setPreviewError(err.message || "Failed to calculate preview metadata.");
    } finally {
      setIsLoadingPreview(false);
    }
  }, [currentPayload, isTrackLeader, selectedFieldKeys]);

  // Refresh preview on configuration change
  useEffect(() => {
    if (isOpen) {
      fetchPreview();
    }
  }, [fetchPreview, isOpen]);

  // Selection actions
  const handleToggleField = (key: string, disabled?: boolean) => {
    if (disabled) return;
    setSelectedFieldKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSelectAll = () => {
    const selectableKeys = EXPORT_FIELD_OPTIONS.filter((f) => !f.disabled).map(
      (f) => f.key
    );
    setSelectedFieldKeys(selectableKeys);
  };

  const handleClearAll = () => {
    setSelectedFieldKeys([]);
  };

  const handleResetDefaults = () => {
    setSelectedFieldKeys(
      EXPORT_FIELD_OPTIONS.filter((f) => f.default && !f.disabled).map((f) => f.key)
    );
  };

  const handleToggleCategory = (categoryItems: ExportFieldOption[]) => {
    const availableItems = categoryItems.filter((i) => !i.disabled);
    const availableKeys = availableItems.map((i) => i.key);
    const allSelected = availableKeys.every((k) => selectedFieldKeys.includes(k));

    if (allSelected) {
      // Deselect all in category
      setSelectedFieldKeys((prev) => prev.filter((k) => !availableKeys.includes(k)));
    } else {
      // Select all in category
      setSelectedFieldKeys((prev) => Array.from(new Set([...prev, ...availableKeys])));
    }
  };

  // Perform full export download
  const handleExecuteExport = async () => {
    if (selectedFieldKeys.length === 0) {
      setExportError("Please select at least one field to export.");
      return;
    }

    setIsExporting(true);
    setExportError(null);
    setExportSuccessMsg(null);

    try {
      let result: { blob: Blob; filename: string };
      if (isTrackLeader) {
        result = await api.trackLeaderExportRegistrations(currentPayload);
      } else {
        result = await api.adminExportRegistrations(currentPayload);
      }

      downloadBlob(result.blob, result.filename);
      setExportSuccessMsg(`Successfully exported ${result.filename}`);
      if (onExportSuccess) {
        onExportSuccess(result.filename);
      }

      // Auto-dismiss success message after 4s
      setTimeout(() => {
        setExportSuccessMsg(null);
      }, 4000);
    } catch (err: any) {
      console.error("Export execution failed:", err);
      setExportError(err.message || "Failed to generate and download export file.");
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalPortal onClose={onClose}>
      <div
        className="fixed inset-0 z-[100] w-screen h-screen flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-modal-title"
      >
        {/* Backdrop Overlay */}
        <div
          className="fixed inset-0 w-screen h-screen bg-black/85 backdrop-blur-md transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        />

        {/* Modal Container */}
        <div
          className={`relative z-10 w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-all ${
            isLight
              ? "bg-white border-slate-200 text-slate-900 shadow-slate-900/20"
              : "bg-[#0b101b] border-neutral-800 text-white shadow-black/60"
          }`}
        >
          {/* 1. Modal Header */}
          <div
            className={`p-5 sm:p-6 border-b flex items-start justify-between gap-4 shrink-0 ${
              isLight ? "border-slate-200 bg-slate-50/80" : "border-neutral-800 bg-[#0e1422]/90"
            }`}
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-[#35e0c9] animate-pulse" />
                <span
                  className={`text-[11px] font-mono uppercase tracking-widest font-bold ${
                    isLight ? "text-teal-700" : "text-[#35e0c9]"
                  }`}
                >
                  {isTrackLeader ? "Track Leader Export Service" : "Administrator Export Service"}
                </span>
              </div>
              <h2
                id="export-modal-title"
                className="text-xl sm:text-2xl font-black font-mono uppercase tracking-tight"
              >
                Export Registrations
              </h2>
              <p
                className={`text-xs mt-1 ${
                  isLight ? "text-slate-500" : "text-neutral-400"
                }`}
              >
                {isTrackLeader
                  ? `Generate report strictly for ${assignedTrack?.name || "your assigned track"}.`
                  : "Filter scope, choose data columns, and export directly to Excel or CSV."}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isLight
                  ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700"
                  : "bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300 hover:text-white"
              }`}
              title="Close Export Modal (Esc)"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 2. Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* SECTION 1: EXPORT SCOPE */}
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-[#35e0c9] mb-3 flex items-center gap-2">
                <span>01</span>
                <span>Select Export Scope</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Admin: All Registrations */}
                {!isTrackLeader && (
                  <button
                    type="button"
                    onClick={() => setScope("all")}
                    className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      scope === "all"
                        ? isLight
                          ? "bg-teal-50 border-teal-500 text-teal-900 ring-1 ring-teal-500"
                          : "bg-[#35e0c9]/10 border-[#35e0c9] text-white ring-1 ring-[#35e0c9]"
                        : isLight
                        ? "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                        : "bg-[#131929] border-neutral-800 hover:border-neutral-700 text-neutral-300"
                    }`}
                  >
                    <div className="font-mono text-xs font-bold uppercase mb-1">
                      All Registrations
                    </div>
                    <div className="text-[11px] opacity-70">
                      Entire festival database across all tracks and events
                    </div>
                  </button>
                )}

                {/* Track Leader: My Track Registrations */}
                {isTrackLeader && (
                  <button
                    type="button"
                    onClick={() => setScope("my_track")}
                    className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      scope === "my_track"
                        ? isLight
                          ? "bg-teal-50 border-teal-500 text-teal-900 ring-1 ring-teal-500"
                          : "bg-[#35e0c9]/10 border-[#35e0c9] text-white ring-1 ring-[#35e0c9]"
                        : isLight
                        ? "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                        : "bg-[#131929] border-neutral-800 hover:border-neutral-700 text-neutral-300"
                    }`}
                  >
                    <div className="font-mono text-xs font-bold uppercase mb-1">
                      My Track Registrations
                    </div>
                    <div className="text-[11px] opacity-70">
                      All registrations for {assignedTrack?.name || "your track"}
                    </div>
                  </button>
                )}

                {/* Current Filtered Results */}
                <button
                  type="button"
                  onClick={() => setScope("filtered")}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    scope === "filtered"
                      ? isLight
                        ? "bg-teal-50 border-teal-500 text-teal-900 ring-1 ring-teal-500"
                        : "bg-[#35e0c9]/10 border-[#35e0c9] text-white ring-1 ring-[#35e0c9]"
                      : isLight
                      ? "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                      : "bg-[#131929] border-neutral-800 hover:border-neutral-700 text-neutral-300"
                  }`}
                >
                  <div className="font-mono text-xs font-bold uppercase mb-1">
                    Current Filtered Results
                  </div>
                  <div className="text-[11px] opacity-70">
                    Matches current page search & active filters
                  </div>
                </button>

                {/* Admin: Selected Track */}
                {!isTrackLeader && (
                  <button
                    type="button"
                    onClick={() => {
                      setScope("track");
                      if (!customTrackId && tracks.length > 0) {
                        setCustomTrackId(tracks[0].id);
                      }
                    }}
                    className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      scope === "track"
                        ? isLight
                          ? "bg-teal-50 border-teal-500 text-teal-900 ring-1 ring-teal-500"
                          : "bg-[#35e0c9]/10 border-[#35e0c9] text-white ring-1 ring-[#35e0c9]"
                        : isLight
                        ? "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                        : "bg-[#131929] border-neutral-800 hover:border-neutral-700 text-neutral-300"
                    }`}
                  >
                    <div className="font-mono text-xs font-bold uppercase mb-1">
                      Selected Track
                    </div>
                    <div className="text-[11px] opacity-70">
                      Export all records under one specific track
                    </div>
                  </button>
                )}

                {/* Selected Event */}
                <button
                  type="button"
                  onClick={() => {
                    setScope("event");
                    if (!customEventId && selectableEvents.length > 0) {
                      setCustomEventId(selectableEvents[0].id);
                    }
                  }}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    scope === "event"
                      ? isLight
                        ? "bg-teal-50 border-teal-500 text-teal-900 ring-1 ring-teal-500"
                        : "bg-[#35e0c9]/10 border-[#35e0c9] text-white ring-1 ring-[#35e0c9]"
                      : isLight
                      ? "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                      : "bg-[#131929] border-neutral-800 hover:border-neutral-700 text-neutral-300"
                  }`}
                >
                  <div className="font-mono text-xs font-bold uppercase mb-1">
                    {isTrackLeader ? "Selected Event from My Track" : "Selected Event"}
                  </div>
                  <div className="text-[11px] opacity-70">
                    Export all records for a single event arena
                  </div>
                </button>
              </div>

              {/* Sub-selectors for Scope (Track or Event) */}
              {scope === "track" && !isTrackLeader && (
                <div className="mt-3 p-3.5 rounded-xl border border-neutral-800 bg-[#131929]/50">
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5 font-bold">
                    Choose Track to Export:
                  </label>
                  <select
                    value={customTrackId}
                    onChange={(e) => setCustomTrackId(e.target.value)}
                    className="w-full sm:w-80 px-3 py-2 bg-[#0e131f] border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#35e0c9]"
                  >
                    {tracks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {scope === "event" && (
                <div className="mt-3 p-3.5 rounded-xl border border-neutral-800 bg-[#131929]/50">
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5 font-bold">
                    Choose Event Arena to Export:
                  </label>
                  <select
                    value={customEventId}
                    onChange={(e) => setCustomEventId(e.target.value)}
                    className="w-full sm:w-80 px-3 py-2 bg-[#0e131f] border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#35e0c9]"
                  >
                    {selectableEvents.length === 0 ? (
                      <option value="">No events available</option>
                    ) : (
                      selectableEvents.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              )}

              {scope === "filtered" && (
                <div
                  className={`mt-3 p-3 rounded-xl border text-xs font-mono ${
                    isLight ? "bg-slate-100 border-slate-300 text-slate-700" : "bg-[#131929]/40 border-neutral-800 text-neutral-400"
                  }`}
                >
                  <span className="font-bold text-[#35e0c9]">Active Filter Constraints: </span>
                  {activeFilters.search && <span>Search: &ldquo;{activeFilters.search}&rdquo; • </span>}
                  {activeFilters.trackId && <span>Track: {tracks.find((t) => t.id === activeFilters.trackId)?.name || activeFilters.trackId} • </span>}
                  {activeFilters.eventId && <span>Event: {events.find((e) => e.id === activeFilters.eventId)?.name || activeFilters.eventId} • </span>}
                  {activeFilters.registrationType && <span>Type: {activeFilters.registrationType} • </span>}
                  {activeFilters.status && <span>Status: {activeFilters.status} • </span>}
                  {!activeFilters.search && !activeFilters.trackId && !activeFilters.eventId && !activeFilters.registrationType && !activeFilters.status && (
                    <span>No active filters (matches full dataset)</span>
                  )}
                </div>
              )}
            </div>

            {/* SECTION 2: SELECT DATA FIELDS */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-[#35e0c9] flex items-center gap-2">
                  <span>02</span>
                  <span>Select Data Columns</span>
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      selectedFieldKeys.length > 0
                        ? "bg-[#35e0c9]/20 text-[#35e0c9] border border-[#35e0c9]/40"
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                    }`}
                  >
                    {selectedFieldKeys.length} Columns Selected
                  </span>
                </h3>

                {/* Field Control Actions */}
                <div className="flex items-center gap-2 text-xs font-mono">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                      isLight
                        ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700"
                        : "bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300"
                    }`}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                      isLight
                        ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700"
                        : "bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300"
                    }`}
                  >
                    Clear All
                  </button>
                  <button
                    type="button"
                    onClick={handleResetDefaults}
                    className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                      isLight
                        ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700"
                        : "bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300"
                    }`}
                  >
                    Reset Defaults
                  </button>
                </div>
              </div>

              {/* Field Search Input */}
              <div className="relative mb-3">
                <input
                  type="text"
                  placeholder="Search field columns (e.g. email, phone, team, track)..."
                  value={fieldSearch}
                  onChange={(e) => setFieldSearch(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs font-mono border focus:outline-none transition ${
                    isLight
                      ? "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-teal-600"
                      : "bg-[#131929] border-neutral-700/80 text-white placeholder-neutral-500 focus:border-[#35e0c9]"
                  }`}
                />
                {fieldSearch && (
                  <button
                    type="button"
                    onClick={() => setFieldSearch("")}
                    className="absolute right-3 top-2 text-xs font-mono text-neutral-400 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Grouped Field Checkboxes */}
              <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                {filteredCategories.map(({ category, items }) => {
                  const availableItems = items.filter((i) => !i.disabled);
                  const allCatSelected =
                    availableItems.length > 0 &&
                    availableItems.every((i) => selectedFieldKeys.includes(i.key));

                  return (
                    <div
                      key={category}
                      className={`p-3.5 rounded-xl border ${
                        isLight ? "bg-slate-50/70 border-slate-200" : "bg-[#131929]/50 border-neutral-800/80"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-neutral-800/50">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#35e0c9]">
                          {category}
                        </span>
                        {availableItems.length > 0 && (
                          <button
                            type="button"
                            onClick={() => handleToggleCategory(items)}
                            className="text-[10px] font-mono uppercase text-neutral-400 hover:text-white transition cursor-pointer"
                          >
                            {allCatSelected ? "Deselect Group" : "Select Group"}
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {items.map((item) => {
                          const isChecked = selectedFieldKeys.includes(item.key);
                          const isDisabled = item.disabled;

                          return (
                            <label
                              key={item.key}
                              className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs transition select-none ${
                                isDisabled
                                  ? "opacity-50 cursor-not-allowed bg-neutral-900/40 border-neutral-800/40 text-neutral-500"
                                  : isChecked
                                  ? isLight
                                    ? "bg-teal-50 border-teal-400 text-teal-900 cursor-pointer"
                                    : "bg-[#35e0c9]/10 border-[#35e0c9]/50 text-white cursor-pointer"
                                  : isLight
                                  ? "bg-white border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
                                  : "bg-[#0e131f] border-neutral-800 hover:border-neutral-700 text-neutral-300 cursor-pointer"
                              }`}
                              title={isDisabled ? item.disabledReason : item.label}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked && !isDisabled}
                                disabled={isDisabled}
                                onChange={() => handleToggleField(item.key, isDisabled)}
                                className="mt-0.5 rounded text-[#35e0c9] focus:ring-0 cursor-pointer accent-[#35e0c9]"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="font-mono text-xs font-semibold leading-tight truncate">
                                  {item.label}
                                </div>
                                {isDisabled && item.disabledReason && (
                                  <div className="text-[10px] text-amber-500/80 font-mono mt-0.5">
                                    {item.disabledReason}
                                  </div>
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION 3: FORMAT SELECTION */}
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-[#35e0c9] mb-3 flex items-center gap-2">
                <span>03</span>
                <span>Select Export Format</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
                {/* Excel Option */}
                <button
                  type="button"
                  onClick={() => setFormat("xlsx")}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                    format === "xlsx"
                      ? isLight
                        ? "bg-teal-50 border-teal-500 text-teal-900 ring-1 ring-teal-500"
                        : "bg-[#35e0c9]/10 border-[#35e0c9] text-white ring-1 ring-[#35e0c9]"
                      : isLight
                      ? "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                      : "bg-[#131929] border-neutral-800 hover:border-neutral-700 text-neutral-300"
                  }`}
                >
                  <div>
                    <div className="font-mono text-xs font-bold uppercase flex items-center gap-2">
                      <span>Excel (.xlsx)</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#35e0c9] text-black">
                        RECOMMENDED
                      </span>
                    </div>
                    <div className="text-[11px] opacity-70 mt-1">
                      Formatted spreadsheet with dynamic column auto-sizing
                    </div>
                  </div>
                </button>

                {/* CSV Option */}
                <button
                  type="button"
                  onClick={() => setFormat("csv")}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                    format === "csv"
                      ? isLight
                        ? "bg-teal-50 border-teal-500 text-teal-900 ring-1 ring-teal-500"
                        : "bg-[#35e0c9]/10 border-[#35e0c9] text-white ring-1 ring-[#35e0c9]"
                      : isLight
                      ? "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                      : "bg-[#131929] border-neutral-800 hover:border-neutral-700 text-neutral-300"
                  }`}
                >
                  <div>
                    <div className="font-mono text-xs font-bold uppercase">
                      CSV (.csv)
                    </div>
                    <div className="text-[11px] opacity-70 mt-1">
                      Universal UTF-8 text with BOM for Excel & database import
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* SECTION 4: EXPORT PREVIEW SUMMARY */}
            <div
              className={`p-4 rounded-xl border ${
                isLight ? "bg-slate-50 border-slate-200" : "bg-[#0e1422] border-neutral-800"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#35e0c9]">
                  Export Summary Preview
                </span>
                {isLoadingPreview && (
                  <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1.5">
                    <svg className="animate-spin h-3.5 w-3.5 text-[#35e0c9]" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Calculating records...</span>
                  </span>
                )}
              </div>

              {previewError ? (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
                  {previewError}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase">Matching Records</span>
                      <span className="text-lg font-bold text-[#35e0c9]">
                        {previewData ? previewData.totalRecords : "—"}
                      </span>
                    </div>

                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase">Selected Columns</span>
                      <span className="text-lg font-bold text-white">
                        {selectedFieldKeys.length}
                      </span>
                    </div>

                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase">Scope Target</span>
                      <span className="font-semibold text-neutral-300 truncate block">
                        {previewData?.eventName !== "All Events"
                          ? previewData?.eventName
                          : previewData?.trackName || "All Tracks"}
                      </span>
                    </div>

                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase">File Format</span>
                      <span className="font-semibold text-neutral-300 uppercase">
                        {format}
                      </span>
                    </div>
                  </div>

                  {/* Selected Columns Chips */}
                  {previewData?.columns && previewData.columns.length > 0 && (
                    <div>
                      <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-1.5">
                        Columns to be Exported (in order):
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                        {previewData.columns.map((col, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-300 border border-neutral-700/80"
                          >
                            {col}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {previewData?.filename && (
                    <div className="text-[11px] font-mono text-neutral-400 pt-1 border-t border-neutral-800/60">
                      <span className="text-neutral-500">Output File: </span>
                      <span className="text-[#35e0c9] font-bold">{previewData.filename}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Error or Success feedback banners */}
            {exportError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-mono">
                {exportError}
              </div>
            )}

            {exportSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{exportSuccessMsg}</span>
              </div>
            )}
          </div>

          {/* 3. Action Footer Bar */}
          <div
            className={`p-4 sm:p-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 ${
              isLight ? "border-slate-200 bg-slate-50/80" : "border-neutral-800 bg-[#0e1422]/90"
            }`}
          >
            <div className="text-xs font-mono text-neutral-400 text-center sm:text-left">
              {selectedFieldKeys.length === 0 ? (
                <span className="text-red-400">Select at least one column to export</span>
              ) : (
                <span>
                  Ready to export{" "}
                  <strong className="text-white">{previewData?.totalRecords ?? "..."}</strong> records
                  with <strong className="text-[#35e0c9]">{selectedFieldKeys.length}</strong> columns
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isExporting}
                className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl border text-xs font-mono transition cursor-pointer disabled:opacity-50 ${
                  isLight
                    ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700"
                    : "bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300"
                }`}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleExecuteExport}
                disabled={isExporting || selectedFieldKeys.length === 0}
                className="flex-1 sm:flex-initial px-6 py-2.5 bg-[#35e0c9] hover:bg-[#2bc4b0] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-xl text-xs font-mono uppercase tracking-wider transition cursor-pointer shadow-lg shadow-[#35e0c9]/20 flex items-center justify-center gap-2"
              >
                {isExporting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-black" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Preparing export...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Export {format.toUpperCase()}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
